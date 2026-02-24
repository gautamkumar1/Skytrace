"""Integration test: full pipeline with mock agent. Requires DATABASE_URL (Postgres)."""
import os
import tempfile
from pathlib import Path

import pytest

# Skip if no database configured (e.g. CI without services)
pytest.importorskip("psycopg2")
DATABASE_URL = os.getenv("DATABASE_URL")
pytestmark = pytest.mark.skipif(
    not DATABASE_URL or "postgres" not in (DATABASE_URL or ""),
    reason="DATABASE_URL (Postgres) required for integration test",
)


def test_run_main_with_mock_agent():
    """Run main CLI with mock agent and empty docs dir; check no crash and case/findings in DB."""
    from dotenv import load_dotenv
    load_dotenv()
    from src.config import load_settings
    from src.backends import PostgresDatabaseBackend, LocalStorageBackend, PostgresLedgerBackend
    from src.ingestion.pipeline import ingest_documents
    from src.agents.mock_agent import MockTechnicalAgent
    from src.agents.orchestrator import Orchestrator
    from src.abstractions.ledger import LedgerEventType

    settings = load_settings()
    database = PostgresDatabaseBackend(settings.database_url)
    database.ensure_schema()
    storage = LocalStorageBackend(root=tempfile.mkdtemp())
    ledger = PostgresLedgerBackend(settings.database_url)

    case_id = "e2e_test_001"
    registration = "EI-E2E"
    aircraft_type = "A320"
    engine_type = "CFM56"

    database.insert_case(case_id, registration, aircraft_type, engine_type)
    with tempfile.TemporaryDirectory() as docs_dir:
        Path(docs_dir).joinpath("dummy.txt").write_text("not a pdf")
        docs = ingest_documents(case_id, docs_dir, storage, database, ledger)
    assert len(docs) == 0

    agent = MockTechnicalAgent()
    orchestrator = Orchestrator(agents=[agent])
    report = orchestrator.run_case(
        case_id=case_id,
        aircraft_reg=registration,
        documents=[],
        aircraft_type=aircraft_type,
        engine_type=engine_type,
    )
    assert report.overall_status == "FLAG"
    assert len(report.findings) == 4

    for f in report.findings:
        database.insert_finding(
            case_id=case_id,
            finding_id=f.finding_id,
            agent_name=f.agent_name,
            severity=f.severity.value,
            category=f.category,
            title=f.title,
            evidence=f.evidence,
            confidence=f.confidence,
            source_doc_id=f.source_doc_id,
            source_page=f.source_page,
            iteration=f.iteration,
            metadata_json=None,
        )

    rows = database.get_findings(case_id)
    assert len(rows) == 4
    case_row = database.get_case(case_id)
    assert case_row["registration"] == registration
