"""Plotly Dash app — Engine Health + Fleet Overview. Run: python -m dashboard.app"""
from __future__ import annotations

import os

import dash
from dash import dcc, html
import dash_bootstrap_components as dbc

from dashboard.callbacks import register_callbacks
from dashboard.layouts import engine_layout, fleet_layout

# Load env and wire database (no Anthropic required for dashboard)
from dotenv import load_dotenv
load_dotenv()

from src.config import load_settings
from src.backends import PostgresDatabaseBackend

settings = load_settings()
# Only validate DB and ledger paths; do not require API key
if settings.ledger_backend == "file":
    from pathlib import Path
    Path(settings.ledger_file_path).parent.mkdir(parents=True, exist_ok=True)

database = PostgresDatabaseBackend(settings.database_url)
database.ensure_schema()

# Build initial tab content (engine tab default)
fleet = database.fleet_summary()
case_options = [{"label": f"{r['registration']} ({r['case_id']})", "value": r["case_id"]} for r in fleet]
default_case = fleet[0]["case_id"] if fleet else None
initial_engine = engine_layout(case_options, default_case)

app = dash.Dash(
    __name__,
    external_stylesheets=[dbc.themes.FLATLY],
    suppress_callback_exceptions=True,
    title="Aviation AI — Technical Due Diligence",
)

app.layout = dbc.Container(
    [
        dbc.NavbarSimple(
            brand="Aviation AI | Technical Due Diligence",
            color="dark",
            dark=True,
            className="mb-4",
        ),
        dcc.Tabs(
            id="main-tabs",
            value="engine",
            children=[
                dcc.Tab(label="Engine Health", value="engine"),
                dcc.Tab(label="Fleet Overview", value="fleet"),
            ],
        ),
        html.Div(id="tab-content", className="mt-3", children=initial_engine),
        dcc.Interval(id="refresh", interval=30_000, n_intervals=0),
    ],
    fluid=True,
)

register_callbacks(app, database)

if __name__ == "__main__":
    debug = os.getenv("DASH_DEBUG", "false").lower() == "true"
    host = getattr(settings, "dashboard_host", "0.0.0.0")
    port = getattr(settings, "dashboard_port", 8050)
    app.run(debug=debug, host=host, port=port)
