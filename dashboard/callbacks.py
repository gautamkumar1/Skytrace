"""Dash callbacks — read from database backend."""
from __future__ import annotations

from dash import Input, Output, State, callback_context, no_update, html
import dash_bootstrap_components as dbc


def _severity_color(severity: str) -> str:
    return {"STOP": "danger", "FLAG": "warning", "ADVISORY": "info", "CLEAR": "success"}.get(
        severity, "secondary"
    )


def register_callbacks(app, database):
    """Register all Dash callbacks. Requires database backend with get_case, get_findings, get_engine_data, fleet_summary."""

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
        [Output("engine-metrics-row", "children"), Output("engine-findings-cards", "children")],
        Input("engine-case-dropdown", "value"),
        Input("refresh", "n_intervals"),
        prevent_initial_call=False,
    )
    def engine_case_loaded(case_id, _n):
        if not case_id:
            return [], []
        engine_rows = database.get_engine_data(case_id)
        findings = database.get_findings(case_id)
        case_info = database.get_case(case_id) or {}

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
        for f in findings:
            severity = f.get("severity") or "ADVISORY"
            cards.append(
                dbc.Card(
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
                            ]
                        ),
                    ],
                    className="mb-2",
                )
            )
        findings_div = html.Div(cards) if cards else html.P("No findings for this case.", className="text-muted")
        return metrics_row, findings_div

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
            return html.P("No cases yet. Run: python main.py --case demo_001 --reg EI-SYN --type A320-214 --engine CFM56-5B4/2P --docs ./sample_docs/")
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
