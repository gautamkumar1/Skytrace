"""Engine Health panel: metrics and AI findings for selected case."""
from dash import html, dcc
import dash_bootstrap_components as dbc


def engine_layout(case_options: list[dict], default_case: str | None) -> html.Div:
    return html.Div(
        [
            dbc.Row(
                [
                    dbc.Col(
                        [
                            html.Label("Case", className="fw-bold"),
                            dcc.Dropdown(
                                id="engine-case-dropdown",
                                options=case_options,
                                value=default_case,
                                placeholder="Select a case",
                                clearable=False,
                            ),
                        ],
                        width=4,
                    ),
                ],
                className="mb-3",
            ),
            dbc.Row(
                [
                    dbc.Col(html.Div(id="engine-metrics-row"), width=12),
                ],
                className="mb-3",
            ),
            dbc.Row(
                [
                    dbc.Col(
                        [
                            html.H5("AI Findings — this case", className="mt-2"),
                            html.Div(id="engine-findings-cards", children=[]),
                        ],
                        width=12,
                    ),
                ],
            ),
        ],
        id="engine-view-container",
    )
