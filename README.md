# Aircraft Leasing AI — Technical Due Diligence

AI-assisted aircraft technical due diligence: ingest PDFs (AD lists, engine status, ARC), run a **Technical Airworthiness** agent (Claude) via an **Orchestrator**, store cases, documents, and findings in PostgreSQL or Snowflake with an immutable ledger (Postgres, file, or AWS QLDB). Plotly Dash dashboard for Engine Health and Fleet Overview.

---

## Requirements

- Python 3.12+
- PostgreSQL or Snowflake (for database)
- Anthropic API key (Claude)
- Optional: AWS (S3 for documents, QLDB for ledger)

---

## Setup

### 1. Install

```bash
cd aircraft-leasing-poc
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
export PYTHONPATH=.
```

### 2. Configure

Copy `.env.example` to `.env` and set:

- **`ANTHROPIC_API_KEY`** — Required. Claude API key for the Technical Airworthiness agent.
- **`DATABASE_URL`** — Required when `DATABASE_BACKEND=postgres`. PostgreSQL connection string. If the password contains `@` or `#`, use `%40` or `%23`.
- **`DATABASE_BACKEND`** — `postgres` (default) or `snowflake`. If `snowflake`, set `SNOWFLAKE_ACCOUNT`, `SNOWFLAKE_USER`, and either `SNOWFLAKE_PASSWORD` or `SNOWFLAKE_PRIVATE_KEY_PATH` (key-pair auth; no MFA needed).
- **`LEDGER_BACKEND`** — `postgres`, `file`, or `qldb`. For `qldb`, create the ledger and table `audit_ledger` in AWS.
- **AWS** — Set `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `S3_BUCKET` for S3 document storage; set for QLDB if using `LEDGER_BACKEND=qldb`.

### 3. Run a case

Place PDFs in a directory, then:

```bash
export PYTHONPATH=.
python main.py --case <case_id> --reg <registration> --type <aircraft_type> --engine <engine_type> --docs <path_to_pdfs>
```

Example:

```bash
python main.py --case case_001 --reg EI-SYN --type A320-214 --engine CFM56-5B4/2P --docs ./docs/
```

The pipeline ingests PDFs, extracts engine metrics from document text, runs the orchestrator and Technical Agent, writes findings and engine data to the database and ledger, and prints a case report.

### 4. Dashboard

```bash
export PYTHONPATH=.
python -m dashboard.app
```

Open http://localhost:8050 for Engine Health (per-case metrics and findings) and Fleet Overview. Use Approve/Flag/Reject on findings to record feedback (stored in DB and ledger).

### 5. Docker

```bash
docker compose -f docker-compose.yaml up --build
```

Ensure `.env` contains `ANTHROPIC_API_KEY` and `DATABASE_URL` (or Snowflake vars). The app and dashboard use these. To run a case inside the container, mount a directory of PDFs and run the same `main.py` command.

---

## Tests

```bash
export PYTHONPATH=.
python -m pytest tests/unit/ -v
```

---

## Project layout

| Area | Purpose |
|------|--------|
| `src/agents/` | Base agent, Technical Airworthiness (Claude), Orchestrator, registry |
| `src/ingestion/` | PDF ingestion (pdfplumber + pypdf), engine metrics extraction |
| `src/schemas/` | Pydantic models |
| `src/abstractions/` | Storage, database, ledger ABCs |
| `src/backends/` | Postgres, Snowflake, S3, local storage, Postgres/file/QLDB ledger |
| `main.py` | CLI entry point |
| `dashboard/` | Plotly Dash (Engine Health, Fleet Overview, finding feedback) |
| `tests/unit/` | Unit tests |
| `Dockerfile`, `docker-compose.yaml` | Container and Postgres stack |

---

## Config summary

| Env var | Purpose |
|--------|--------|
| `ANTHROPIC_API_KEY` | Required. Claude API key. |
| `DATABASE_BACKEND` | `postgres` or `snowflake`. |
| `DATABASE_URL` | Required when `DATABASE_BACKEND=postgres`. |
| `SNOWFLAKE_*` | Required when `DATABASE_BACKEND=snowflake`. Use `SNOWFLAKE_PRIVATE_KEY_PATH` (and optional `SNOWFLAKE_PRIVATE_KEY_PASSPHRASE`) for key-pair auth instead of password. |
| `LEDGER_BACKEND` | `postgres`, `file`, or `qldb`. |
| `AWS_*`, `S3_BUCKET` | S3 document storage; required for QLDB. |
| `DASHBOARD_HOST`, `DASHBOARD_PORT` | Dashboard bind (default 0.0.0.0:8050). |
