# Skytrace

AI-assisted technical due diligence for aircraft leasing.

Skytrace ingests aviation documents (AD lists, engine status reports, ARCs) and runs a Technical Airworthiness agent (Claude or OpenAI) through a multi-round Orchestrator. Cases, findings, and an immutable audit ledger are stored in PostgreSQL or Snowflake. A Next.js web dashboard and React Native mobile app sit on top.

---

## What it does

- **Document ingestion.** PDF, DOCX, XLSX, CSV, and JSON files are parsed and structured; engine metrics are extracted automatically.
- **AI analysis.** The Technical Airworthiness agent iterates up to three rounds until confidence exceeds 0.80, cross-referencing EASA/FAA standards.
- **Finding classification.** Each finding is tagged `CLEAR`, `ADVISORY`, `FLAG`, or `STOP` with source page references and correlated anomaly groups.
- **Audit ledger.** All findings, approvals, flags, and rejections go to an immutable ledger (Postgres, flat file, or AWS QLDB).
- **Web dashboard.** Case management, fleet tracking, engine health, LLP tracking, ADS-B integration, and compliance views.
- **Mobile app.** iOS and Android app for real-time dashboard, issues, case details, and document uploads.

---

## Tech stack

| Layer | Technology |
|---|---|
| **Backend** | Python 3.12, FastAPI, SQLAlchemy (async), Click |
| **AI agents** | Claude (Anthropic) or OpenAI; pluggable via `AGENT_PROVIDER` |
| **Document parsing** | pdfplumber, pypdf, openpyxl, python-docx |
| **Database** | PostgreSQL or Snowflake |
| **Storage** | AWS S3 or local filesystem |
| **Audit ledger** | PostgreSQL, JSONL flat file, or AWS QLDB |
| **Web frontend** | Next.js 16, React 19, Tailwind CSS v4, Recharts, Leaflet, Three.js |
| **Mobile app** | React Native 0.84, React Navigation, Reanimated |
| **Analytics dashboard** | Plotly Dash |
| **Infrastructure** | Docker, docker-compose, PM2 |
| **Logging** | structlog (structured JSON logs) |

---

## Architecture

```
┌─────────────────────────────────────────────────┐
│  Inputs: PDF / DOCX / XLSX / CSV / JSON         │
└───────────────────┬─────────────────────────────┘
                    │
            ┌───────▼────────┐
            │  Ingestion      │  pdfplumber + pypdf
            │  Pipeline       │  engine metrics extraction
            └───────┬────────┘
                    │
            ┌───────▼────────┐
            │  Orchestrator   │  up to 3 rounds, confidence >= 0.80
            │                 │
            │  ┌───────────┐  │
            │  │ Technical  │  │  Claude (Anthropic) or OpenAI
            │  │  Agent     │  │
            │  └───────────┘  │
            └───────┬────────┘
                    │
       ┌────────────┼────────────┐
       │            │            │
  ┌────▼───┐  ┌─────▼────┐  ┌───▼────┐
  │Database │  │ Storage  │  │ Ledger │
  │Postgres │  │  S3 /    │  │Postgres│
  │Snowflake│  │  Local   │  │File/   │
  └────┬────┘  └──────────┘  │QLDB    │
       │                      └────────┘
  ┌────▼─────────────────────────────┐
  │  Next.js Web  +  React Native    │
  └──────────────────────────────────┘
```

---

## Requirements

- Python 3.12+
- Node.js 22.11.0+
- PostgreSQL or Snowflake
- Anthropic API key (Claude) or OpenAI API key
- Optional: AWS credentials (S3 for storage, QLDB for ledger)

---

## Quickstart

### 1. Backend

```bash
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
export PYTHONPATH=.
cp .env.example .env
# Edit .env: set ANTHROPIC_API_KEY and DATABASE_URL at minimum
```

Run a case:

```bash
python main.py \
  --case case_001 \
  --reg EI-SYN \
  --type A320-214 \
  --engine CFM56-5B4/2P \
  --docs ./sample_docs/
```

The pipeline ingests documents, extracts engine metrics, iterates the agent, writes findings to the database and ledger, and prints a case report.

### 2. Plotly Dash dashboard

```bash
export PYTHONPATH=.
python -m dashboard.app
# http://localhost:8050
```

Use Approve / Flag / Reject on findings to record analyst decisions. Every action is written to the audit ledger.

### 3. Next.js web app

```bash
cd frontend
npm install
npm run dev
# http://localhost:3591
```

### 4. React Native mobile app

```bash
cd AircraftLeasingApp
npm install
npm run ios      # or: npm run android
# First-time iOS setup only:
npm run pods
```

### 5. Docker (full stack)

```bash
docker compose -f docker-compose.yaml up --build
```

> [!NOTE]
> Make sure `.env` has `ANTHROPIC_API_KEY` and `DATABASE_URL` (or Snowflake vars) before running Docker. Mount a PDF directory and call `main.py` inside the container to run cases.

---

## Configuration

Copy `.env.example` to `.env` and fill in the variables below.

| Variable | Required | Description |
|---|---|---|
| `ANTHROPIC_API_KEY` | When using Claude | Claude API key |
| `OPENAI_API_KEY` | When using OpenAI | OpenAI API key |
| `AGENT_PROVIDER` | Yes | `anthropic` or `openai` |
| `DATABASE_BACKEND` | Yes | `postgres` (default) or `snowflake` |
| `DATABASE_URL` | Postgres | PostgreSQL connection string |
| `SNOWFLAKE_ACCOUNT` | Snowflake | Snowflake account identifier |
| `SNOWFLAKE_USER` | Snowflake | Snowflake username |
| `SNOWFLAKE_PASSWORD` | Snowflake | Password (or use key-pair; see below) |
| `LEDGER_BACKEND` | Yes | `postgres`, `file`, or `qldb` |
| `AWS_ACCESS_KEY_ID` | S3 / QLDB | AWS credentials |
| `AWS_SECRET_ACCESS_KEY` | S3 / QLDB | AWS credentials |
| `S3_BUCKET` | S3 storage | Target bucket name |
| `FORCE_LOCAL_STORAGE` | No | `true` to use `./data/storage` instead of S3 |
| `DASHBOARD_HOST` | No | Default `0.0.0.0` |
| `DASHBOARD_PORT` | No | Default `8050` |

> [!TIP]
> For Snowflake without MFA, use key-pair auth: set `SNOWFLAKE_PRIVATE_KEY_PATH` to your `.p8` or `.pem` RSA key, and optionally `SNOWFLAKE_PRIVATE_KEY_PASSPHRASE`.

---

## Project layout

| Path | Purpose |
|---|---|
| `src/agents/` | Technical Airworthiness agent, Orchestrator, agent registry |
| `src/ingestion/` | Document parsing, engine metrics extraction |
| `src/schemas/` | Pydantic models (`CaseInput`, `FindingOut`, `CaseReport`) |
| `src/abstractions/` | Database, storage, and ledger ABCs |
| `src/backends/` | Postgres, Snowflake, S3, local storage, Postgres/file/QLDB ledger |
| `main.py` | CLI entry point |
| `dashboard/` | Plotly Dash (Engine Health, Fleet Overview, finding feedback) |
| `frontend/` | Next.js web app |
| `AircraftLeasingApp/` | React Native iOS/Android app |
| `tests/unit/` | Unit tests |
| `Dockerfile`, `docker-compose.yaml` | Container and Postgres stack |

---

## Tests

```bash
export PYTHONPATH=.
python -m pytest tests/unit/ -v
```

---

## Finding severity levels

| Severity | Meaning |
|---|---|
| `CLEAR` | No issues found |
| `ADVISORY` | Informational, worth monitoring |
| `FLAG` | Requires review before proceeding |
| `STOP` | Blocks the transaction; immediate attention needed |
