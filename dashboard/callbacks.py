"""Dash callbacks — read from database backend; in-dashboard feedback (thumbs up/down)."""
from __future__ import annotations

import uuid
from dash import Input, Output, State, callback_context, no_update, html
from dash.dependencies import ALL
import dash_bootstrap_components as dbc


def _severity_color(severity: str) -> str:
    return {"STOP": "danger", "FLAG": "warning", "ADVISORY": "info", "CLEAR": "success"}.get(
        severity, "secondary"
    )


def register_callbacks(app, database, ledger=None):
    """Register all Dash callbacks. database: get_findings, get_engine_data, fleet_summary, insert_finding_feedback. ledger: optional, for HUMAN_ACTION on feedback."""

    @app.callback(
        Output("tab-content", "children"),
        Input("main-tabs", "value"),
        State("engine-case-dropdown", "value"),
        prevent_initial_call=False,
    )
    def render_tab(tab_value, engine_case):
        from dashboard.layouts import engine_layout, fleet_layout

        if tab_value == "fleet":
            return fleet_layout()
        fleet = database.fleet_summary()
        case_options = [{"label": f"{r['registration']} ({r['case_id']})", "value": r["case_id"]} for r in fleet]
        default_case = engine_case or (fleet[0]["case_id"] if fleet else None)
        return engine_layout(case_options, default_case)

    @app.callback(
        [
            Output("engine-metrics-row", "children"),
            Output("engine-findings-cards", "children"),
            Output("current-finding-ids", "data"),
        ],
        Input("engine-case-dropdown", "value"),
        Input("refresh", "n_intervals"),
        prevent_initial_call=False,
    )
    def engine_case_loaded(case_id, _n):
        if not case_id:
            return [], [], []
        engine_rows = database.get_engine_data(case_id)
        findings = database.get_findings(case_id)

        metrics = []
        for row in engine_rows:
            name = row.get("metric_name") or "?"
            val = row.get("metric_value")
            unit = row.get("unit") or ""
            status = row.get("status") or "ok"
            color = "success" if status == "ok" else "warning" if status == "advisory" else "danger"
            metrics.append(
                dbc.Col(
                    dbc.Card(
                        [
                            dbc.CardBody(
                                [
                                    html.Div(name.replace("_", " "), className="text-muted small"),
                                    html.H4(f"{val}{unit}", className=f"text-{color} mb-0"),
                                ]
                            )
                        ],
                        className="mb-2",
                    ),
                    width=3,
                )
            )
        metrics_row = dbc.Row(metrics, className="g-2") if metrics else dbc.Row(dbc.Col(html.P("No engine metrics for this case.", className="text-muted")))

        cards = []
        finding_ids = []
        for f in findings:
            fid = f.get("id") or str(uuid.uuid4())
            finding_ids.append(fid)
            severity = f.get("severity") or "ADVISORY"
            card = dbc.Card(
                [
                    dbc.CardHeader(
                        html.Span(f"{severity} — {f.get('category', '')}", className=f"badge bg-{_severity_color(severity)}"),
                        className="py-2",
                    ),
                    dbc.CardBody(
                        [
                            html.H6(f.get("title") or "", className="card-title"),
                            html.P(f.get("evidence") or "", className="card-text small text-muted"),
                            html.Div(f"Confidence: {f.get('confidence', 0):.2f}", className="small"),
                            html.Hr(),
                            html.Div("Feedback:", className="small fw-bold mt-1"),
                            dbc.ButtonGroup(
                                [
                                    dbc.Button("Approve", id={"type": "finding-feedback", "finding_id": fid, "case_id": case_id, "feedback": "approve"}, color="success", size="sm"),
                                    dbc.Button("Flag", id={"type": "finding-feedback", "finding_id": fid, "case_id": case_id, "feedback": "flag"}, color="warning", size="sm"),
                                    dbc.Button("Reject", id={"type": "finding-feedback", "finding_id": fid, "case_id": case_id, "feedback": "reject"}, color="danger", size="sm"),
                                ],
                                className="mt-1",
                            ),
                            dbc.Input(id={"type": "finding-comment", "finding_id": fid}, placeholder="Comment (optional)", size="sm", className="mt-1"),
                        ]
                    ),
                ],
                className="mb-2",
            )
            cards.append(card)
        findings_div = html.Div(cards) if cards else html.P("No findings for this case.", className="text-muted")
        return metrics_row, findings_div, finding_ids

    @app.callback(
        Output("feedback-status", "children"),
        Input({"type": "finding-feedback", "finding_id": ALL, "case_id": ALL, "feedback": ALL}, "n_clicks"),
        State({"type": "finding-comment", "finding_id": ALL}, "value"),
        State("current-finding-ids", "data"),
        prevent_initial_call=True,
    )
    def capture_finding_feedback(n_clicks_list, comment_list, current_finding_ids):
        if not callback_context.triggered or not current_finding_ids:
            return no_update
        prop = callback_context.triggered[0]["prop_id"]
        if not prop or ".n_clicks" not in prop:
            return no_update
        import json
        try:
            id_str = prop.split(".")[0]
            trigger_id = json.loads(id_str)
        except Exception:
            return no_update
        finding_id = trigger_id.get("finding_id")
        case_id = trigger_id.get("case_id")
        feedback = trigger_id.get("feedback", "approve")
        comment = ""
        if comment_list is not None and isinstance(comment_list, list):
            try:
                idx = current_finding_ids.index(finding_id)
                comment = (comment_list[idx] or "") if idx < len(comment_list) else ""
            except (ValueError, TypeError):
                pass
        elif isinstance(comment_list, str):
            comment = comment_list
        feedback_id = str(uuid.uuid4()).replace("-", "")[:24]
        ledger_id = None
        if ledger:
            from src.abstractions.ledger import LedgerEventType
            ledger_id = ledger.append(
                LedgerEventType.HUMAN_ACTION.value,
                {"finding_id": finding_id, "case_id": case_id, "feedback": feedback, "comment": (comment or "")[:500]},
                entity_id=finding_id,
            )
        if hasattr(database, "insert_finding_feedback"):
            database.insert_finding_feedback(
                feedback_id=feedback_id,
                finding_id=finding_id,
                case_id=case_id,
                actor="dashboard",
                feedback=feedback,
                comment=comment or None,
                ledger_id=ledger_id,
            )
        return html.Div("Feedback recorded.", className="text-success small")

    @app.callback(
        Output("fleet-summary-table", "children"),
        Input("main-tabs", "value"),
        Input("fleet-refresh", "n_intervals"),
        prevent_initial_call=False,
    )
    def fleet_summary_table(tab_value, _n):
        if tab_value != "fleet":
            return no_update
        rows = database.fleet_summary()
        if not rows:
            return html.P("No cases yet. Run a case: python main.py --case <case_id> --reg <registration> --type <aircraft_type> --engine <engine_type> --docs <path_to_pdfs>")
        table_header = [html.Thead(html.Tr([html.Th("Case"), html.Th("Registration"), html.Th("Aircraft"), html.Th("Engine"), html.Th("Docs"), html.Th("Findings"), html.Th("Engine metrics")]))]
        table_body = [
            html.Tbody(
                [
                    html.Tr(
                        [
                            html.Td(r["case_id"]),
                            html.Td(r["registration"]),
                            html.Td(r["aircraft_type"]),
                            html.Td(r["engine_type"]),
                            html.Td(r["doc_count"]),
                            html.Td(r["finding_count"]),
                            html.Td(r["engine_metric_count"]),
                        ]
                    )
                    for r in rows
                ]
            )
        ]
        return dbc.Table(table_header + table_body, bordered=True, size="sm", responsive=True)
