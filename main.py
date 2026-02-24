"""CLI entry point: run a due-diligence case (ingest PDFs, orchestrator + agents, write findings)."""
from __future__ import annotations

from pathlib import Path

import click
from dotenv import load_dotenv
import structlog

from src.abstractions.ledger import LedgerEventType
from src.agents.orchestrator import Orchestrator
from src.agents.technical_airworthiness import TechnicalAirworthinessAgent
from src.backends import (
    FileLedgerBackend,
    LocalStorageBackend,
    PostgresDatabaseBackend,
    PostgresLedgerBackend,
    QLDBLedgerBackend,
    S3StorageBackend,
    SnowflakeDatabaseBackend,
)
from src.config import load_settings
from src.ingestion.pipeline import ingest_documents

load_dotenv()


def _wire_storage(settings):
    if settings.use_s3:
        return S3StorageBackend(
            bucket=settings.s3_bucket,
            region=settings.aws_region,
            aws_access_key_id=settings.aws_access_key_id or None,
            aws_secret_access_key=settings.aws_secret_access_key or None,
        )
    return LocalStorageBackend(root="./data/storage")


def _wire_database(settings):
    if getattr(settings, "database_backend", "postgres") == "snowflake":
        return SnowflakeDatabaseBackend(
            account=settings.snowflake_account,
            user=settings.snowflake_user,
            password=settings.snowflake_password,
            database=settings.snowflake_database,
            schema=settings.snowflake_schema,
            warehouse=settings.snowflake_warehouse,
            role=settings.snowflake_role or None,
        )
    return PostgresDatabaseBackend(settings.database_url)


def _wire_ledger(settings):
    if settings.ledger_backend == "file":
        Path(settings.ledger_file_path).parent.mkdir(parents=True, exist_ok=True)
        return FileLedgerBackend(settings.ledger_file_path)
    if settings.ledger_backend == "qldb":
        return QLDBLedgerBackend(
            ledger_name=getattr(settings, "qldb_ledger_name", "aviation-audit"),
            region=settings.aws_region,
        )
    return PostgresLedgerBackend(settings.database_url)


def _severity_counts(report):
    counts = {}
    for f in report.findings:
        counts[f.severity.value] = counts.get(f.severity.value, 0) + 1
    order = ("STOP", "FLAG", "ADVISORY", "CLEAR")
    return " ".join(f"{c} {s}" for s, c in sorted(counts.items(), key=lambda x: order.index(x[0])))


def _print_report(report):
    lines = [
        "",
        "╔══════════════════════════════════════════════════════════╗",
        f"║ CASE REPORT {report.case_id} — {report.aircraft_reg} {report.aircraft_type or ''} {report.engine_type or ''} ".ljust(58) + "║",
        "╠══════════════════════════════════════════════════════════╣",
        f"║ Overall Status : {report.overall_status}".ljust(58) + "║",
        f"║ Findings : {len(report.findings)} ({_severity_counts(report)})".ljust(58) + "║",
        f"║ Iterations : {report.iterations}".ljust(58) + "║",
        "╠══════════════════════════════════════════════════════════╣",
    ]
    for f in report.findings:
        lines.append(f"║ {f.severity.value} {f.category} confidence: {f.confidence:.2f} ".ljust(58) + "║")
        title_short = (f.title[:44] + "…") if len(f.title) > 45 else f.title
        lines.append(f"║   {title_short}".ljust(58) + "║")
        if f.evidence:
            ev_short = (f.evidence[:48] + "…") if len(f.evidence) > 49 else f.evidence
            lines.append(f"║   Evidence: {ev_short}".ljust(58) + "║")
        lines.append("╠══════════════════════════════════════════════════════════╣")
    lines[-1] = "╚══════════════════════════════════════════════════════════╝"
    click.echo("\n".join(lines))


def _insert_engine_data_from_docs(database, doc_dicts, case_id, registration, aircraft_type, engine_type):
    """Extract engine metrics from ingested document text and insert into DB. No synthetic data."""
    from src.ingestion.engine_extractor import extract_engine_metrics_from_docs
    extracted = extract_engine_metrics_from_docs(
        doc_dicts, case_id, registration, aircraft_type, engine_type
    )
    for metric_name, metric_value, unit, status in extracted:
        database.insert_engine_data(
            case_id=case_id,
            registration=registration,
            aircraft_type=aircraft_type,
            engine_type=engine_type,
            metric_name=metric_name,
            metric_value=metric_value,
            unit=unit,
            status=status,
        )


@click.command()
@click.option("--case", "case_id", required=True, help="Case ID")
@click.option("--reg", "registration", required=True, help="Aircraft registration")
@click.option("--type", "aircraft_type", required=True, help="Aircraft type")
@click.option("--engine", "engine_type", required=True, help="Engine type")
@click.option("--docs", "docs_dir", type=click.Path(exists=True, file_okay=False), required=True, help="Directory of PDFs")
def run(case_id: str, registration: str, aircraft_type: str, engine_type: str, docs_dir: str) -> None:
    """Run technical due diligence: ingest PDFs, run orchestrator and Technical Agent, write findings to DB."""
    settings = load_settings()
    settings.validate_at_startup()

    from src.log_config import configure_structlog
    configure_structlog(log_level=getattr(settings, "log_level", "INFO"), json_logs=getattr(settings, "json_logs", False))
    logger = structlog.get_logger(__name__)

    storage = _wire_storage(settings)
    database = _wire_database(settings)
    database.ensure_schema()
    ledger = _wire_ledger(settings)

    logger.info("case_opened", case_id=case_id)
    database.insert_case(case_id, registration, aircraft_type, engine_type)

    docs = ingest_documents(case_id, docs_dir, storage, database, ledger)
    if not docs:
        logger.warning("no_pdfs_ingested", docs_dir=docs_dir)
        doc_dicts = []
    else:
        doc_dicts = [d.model_dump() for d in docs]
        _insert_engine_data_from_docs(database, doc_dicts, case_id, registration, aircraft_type, engine_type)

    if getattr(settings, "use_agent_registry", False):
        from src.agents.registry import discover_agents
        agents = discover_agents()
        if not agents:
            agents = [TechnicalAirworthinessAgent(api_key=settings.anthropic_api_key)]
    else:
        agents = [TechnicalAirworthinessAgent(api_key=settings.anthropic_api_key)]
    orchestrator = Orchestrator(agents=agents)
    report = orchestrator.run_case(
        case_id=case_id,
        aircraft_reg=registration,
        documents=doc_dicts,
        aircraft_type=aircraft_type,
        engine_type=engine_type,
    )

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
        ledger.append(
            LedgerEventType.FINDING_RECORDED.value,
            {"finding_id": f.finding_id, "case_id": case_id, "severity": f.severity.value},
            entity_id=f.finding_id,
        )

    logger.info("findings_written", case_id=case_id, count=len(report.findings))
    _print_report(report)
    click.echo("\nDashboard: python -m dashboard.app (or docker compose up)")


if __name__ == "__main__":
    run()
