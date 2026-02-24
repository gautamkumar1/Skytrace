# Aircraft Leasing AI POC

**What this project is:** A proof-of-concept for **AI-assisted aircraft technical due diligence** in leasing. It ingests PDFs (e.g. AD lists, engine status, ARC), runs an **Orchestrator** with a **Technical Airworthiness** agent (Claude or mock) to produce findings (severity, evidence, confidence), and stores cases, documents, and findings in PostgreSQL with an optional **immutable ledger**. A **Plotly Dash** dashboard provides Engine Health and Fleet Overview. Storage and database are behind abstractions for cloud portability.

---

## Quick start

### 1. Virtualenv and install

```bash
cd aircraft-leasing-poc
python3 -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
export PYTHONPATH=.
```

Or use the setup script (runs unit tests after install):

```bash
bash scripts/setup_venv.sh
```

### 2. Configure

- Copy `.env.example` to `.env`
- Set `DATABASE_URL` to your PostgreSQL connection string (required). If your password contains `@` or `#`, URL-encode them as `%40` or `%23` (e.g. `postgresql://user:pass%402026@host:5432/db`).
- **Optional:** Set `ANTHROPIC_API_KEY` for the real Claude agent. If unset, the app uses **MockTechnicalAgent** (demo findings, no API calls) so you can run and test without keys.
- Optional: `LEDGER_BACKEND=file` and `LEDGER_FILE_PATH=./data/ledger.jsonl` for file-based ledger
- Optional: AWS keys + `S3_BUCKET` for S3 storage; otherwise local `./data/storage` is used

### 3. Run a case

From project root:

```bash
mkdir -p sample_docs
# Add PDFs to sample_docs/ if you have any (optional for mock agent)
export PYTHONPATH=.
python main.py --case demo_001 --reg EI-SYN --type A320-214 --engine CFM56-5B4/2P --docs ./sample_docs/
```

This creates the case, ingests any PDFs in `./sample_docs/`, runs the orchestrator (mock or Claude), writes findings and placeholder engine metrics to the DB and ledger, and prints a formatted case report.

### 4. Dashboard

```bash
export PYTHONPATH=.
python -m dashboard.app
```

Open http://localhost:8050 — **Engine Health** (per-case metrics + AI findings) and **Fleet Overview** (summary table).

### 5. Docker (optional)

```bash
docker compose -f docker-compose.yaml up --build
```

- Postgres: `localhost:5432`, DB `aviation_poc`, user/pass `postgres/postgres`
- App (dashboard): http://localhost:8050  
- To run a case inside Docker (mount a folder with PDFs):

  ```bash
  docker compose -f docker-compose.yaml run --rm -v "$(pwd)/sample_docs:/app/sample_docs" app \
    python main.py --case demo_001 --reg EI-SYN --type A320-214 --engine CFM56-5B4/2P --docs /app/sample_docs
  ```

---

## Testing

- **Unit tests (no DB, no API):**
  ```bash
  export PYTHONPATH=.
  python -m pytest tests/unit/ -v
  ```

- **All tests (integration tests require `DATABASE_URL` pointing to Postgres):**
  ```bash
  export PYTHONPATH=.
  python -m pytest tests/ -v
  ```

Integration tests are skipped if `DATABASE_URL` is not set or does not contain `postgres`.

---

## Project layout

| Area | Purpose |
|------|--------|
| `src/agents/` | Base agent, Technical Airworthiness (Claude), Mock agent, Orchestrator |
| `src/ingestion/` | PDF ingestion pipeline |
| `src/schemas/` | Pydantic models (CaseReport, FindingOut, IngestedDocument, etc.) |
| `src/abstractions/` | Storage, database, ledger ABCs |
| `src/backends/` | Local/S3 storage; PostgreSQL DB; file/Postgres ledger |
| `src/config.py` | Env-based settings |
| `main.py` | CLI entry point |
| `dashboard/` | Plotly Dash app (Engine Health + Fleet Overview) |
| `tests/unit/`, `tests/integration/` | Unit and integration tests |
| `Dockerfile`, `docker-compose.yaml` | Container and local Postgres stack |

---

## Config summary

| Env var | Purpose |
|--------|--------|
| `DATABASE_URL` | PostgreSQL connection string (required). |
| `ANTHROPIC_API_KEY` | Claude API key. If unset, MockTechnicalAgent is used. |
| `LEDGER_BACKEND` | `postgres` or `file`. |
| `LEDGER_FILE_PATH` | Path for file ledger when `LEDGER_BACKEND=file`. |
| `AWS_*` / `S3_BUCKET` | If set, S3 is used for document storage. |
| `DASHBOARD_HOST`, `DASHBOARD_PORT` | Dashboard bind address and port (default 0.0.0.0:8050). |
