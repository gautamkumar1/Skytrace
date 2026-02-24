"""Fleet Overview: summary table of all cases with doc/finding counts."""
from dash import html, dcc
import dash_bootstrap_components as dbc


def fleet_layout() -> html.Div:
    return html.Div(
        [
            dbc.Row(
                dbc.Col(
                    [
                        html.H5("Fleet summary", className="mb-2"),
                        html.Div(id="fleet-summary-table", children=[]),
                    ],
                    width=12,
                ),
                className="mb-3",
            ),
            dcc.Interval(id="fleet-refresh", interval=30_000, n_intervals=0),
        ],
        id="fleet-view-container",
    )
