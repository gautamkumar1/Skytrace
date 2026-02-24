#!/usr/bin/env bash
# Create virtualenv, install deps, run unit tests. Use from project root.
set -e
cd "$(dirname "$0")/.."
python3 -m venv .venv
.venv/bin/pip install -q --upgrade pip
.venv/bin/pip install -q -r requirements.txt
export PYTHONPATH=.
.venv/bin/python -m pytest tests/unit/ -v --ignore=tests/integration/
echo "Setup and unit tests OK. Run integration tests with: PYTHONPATH=. .venv/bin/python -m pytest tests/integration/ -v (requires DATABASE_URL)"
