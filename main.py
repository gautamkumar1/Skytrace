"""CLI entry point: run a due-diligence case (ingest PDFs, orchestrator + agents, write findings)."""
from __future__ import annotations

import json
import logging
from pathlib import Path

import click

logger = logging.getLogger(__name__)
from dotenv import load_dotenv
import structlog

from src.abstractions.ledger import LedgerEventType
from src.agents.orchestrator import Orchestrator
from src.agents.technical_airworthiness import TechnicalAirworthinessAgent
from src.agents.technical_airworthiness_openai import TechnicalAirworthinessOpenAIAgent
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
        account = settings.snowflake_account
        region = getattr(settings, "snowflake_region", "") or ""
        if region and region.strip():
            account = f"{account.strip()}.{region.strip()}"
        passcode = getattr(settings, "snowflake_totp_passcode", "") or ""
        passcode = passcode.strip() or None
        private_key_path = getattr(settings, "snowflake_private_key_path", "") or ""
        private_key_path = private_key_path.strip() or None
        private_key_passphrase = getattr(settings, "snowflake_private_key_passphrase", "") or ""
        private_key_passphrase = private_key_passphrase.strip() or None
        return SnowflakeDatabaseBackend(
            account=account,
            user=settings.snowflake_user,
            password=settings.snowflake_password or "",
            database=settings.snowflake_database,
            schema=settings.snowflake_schema,
            warehouse=settings.snowflake_warehouse,
            role=settings.snowflake_role or None,
            passcode=passcode,
            private_key_path=private_key_path,
            private_key_passphrase=private_key_passphrase,
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
    """Extract engine metrics from ingested document text and insert into DB. Also upserts one LLP row when LLP_MIN_REMAINING is present."""
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
    # When document contains "LLP min remaining" (cycles), add one row to llp_parts so the LLP page shows it
    for metric_name, metric_value, unit, _ in extracted:
        if metric_name == "LLP_MIN_REMAINING" and isinstance(metric_value, (int, float)) and metric_value >= 0:
            llp_id = f"llp-{case_id}-doc"
            database.insert_llp_part(
                id=llp_id,
                case_id=case_id,
                registration=registration,
                aircraft_type=aircraft_type,
                part_number="LLP (from document)",
                part_name="Min remaining cycles from engine sheet",
                serial_number=case_id,
                position="—",
                life_unit="FC",
                current_used=0,
                life_limit=float(metric_value),
                btb_status="pending_review",
                next_inspection_date=None,
                last_btb_verified_at=None,
                notes="Derived from uploaded engine / flight document (LLP min remaining).",
            )
            break


def _insert_flight_json_llp_and_engine(
    database,
    docs_dir: str,
    case_id: str,
    registration: str,
    aircraft_type: str,
    engine_type: str,
) -> None:
    """If docs_dir contains JSON file(s) with flight/LLP structure (array of {aircraft_reg, llp: {engine1, engine2}, maintenance_due}), insert llp_parts and engine_data for the matching registration."""
    path = Path(docs_dir)
    if not path.is_dir():
        return
    reg_upper = (registration or "").strip().upper()
    if not reg_upper:
        return
    for json_path in path.rglob("*.json"):
        if not json_path.is_file():
            continue
        try:
            raw = json_path.read_bytes().decode("utf-8", errors="replace")
            data = json.loads(raw)
        except (json.JSONDecodeError, OSError) as e:
            logger.warning("Flight JSON parse failed %s: %s", json_path.name, e)
            continue
        if not isinstance(data, list):
            continue
        engine_metrics_inserted_for_file = False
        for record in data:
            if not isinstance(record, dict):
                continue
            rec_reg = (record.get("aircraft_reg") or "").strip().upper()
            if rec_reg != reg_upper:
                continue
            llp_data = record.get("llp") or {}
            maintenance_due = record.get("maintenance_due") or {}
            for position, key in [("ENG1", "engine1"), ("ENG2", "engine2")]:
                parts = llp_data.get(key) or []
                if not isinstance(parts, list):
                    continue
                for part in parts:
                    if not isinstance(part, dict):
                        continue
                    part_name = (part.get("part_name") or "").strip() or "—"
                    part_number = (part.get("part_number") or "").strip() or "—"
                    serial_number = (part.get("serial_number") or "").strip() or "—"
                    csn = part.get("cycles_since_new")
                    crem = part.get("cycles_remaining")
                    if csn is None and crem is not None:
                        try:
                            csn = int(crem)
                        except (TypeError, ValueError):
                            csn = 0
                    if crem is None and csn is not None:
                        try:
                            crem = int(csn)
                        except (TypeError, ValueError):
                            crem = 0
                    
                    # Refine engine type if part number matches known types (V2500 vs CFM56)
                    if engine_type == "Unknown" or engine_type == "auto":
                        if "V2500" in part_number.upper():
                            engine_type = "V2500"
                        elif "CFM56" in part_number.upper():
                            engine_type = "CFM56-7B" # Default assumption
                        if engine_type != "Unknown":
                            database.insert_case(case_id, registration, aircraft_type, engine_type)
                    try:
                        current_used = int(csn) if csn is not None else 0
                        remaining = int(crem) if crem is not None else 0
                        life_limit = current_used + remaining
                    except (TypeError, ValueError):
                        current_used = 0
                        life_limit = 0
                    last_sv = part.get("last_shop_visit")
                    last_btb = str(last_sv)[:10] if last_sv else None
                    if last_btb and len(last_btb) != 10:
                        last_btb = None
                    llp_id = f"llp-{case_id}-{position}-{serial_number}".replace(" ", "-")
                    database.insert_llp_part(
                        id=llp_id,
                        case_id=case_id,
                        registration=registration,
                        aircraft_type=aircraft_type,
                        part_number=part_number,
                        part_name=part_name,
                        serial_number=serial_number,
                        position=position,
                        life_unit="FC",
                        current_used=float(current_used),
                        life_limit=float(life_limit),
                        btb_status="verified",
                        next_inspection_date=None,
                        last_btb_verified_at=last_btb,
                        notes="From flight/LLP JSON upload.",
                    )
            if not engine_metrics_inserted_for_file:
                e1_rem = maintenance_due.get("engine1_llp_cycles_remaining")
                e2_rem = maintenance_due.get("engine2_llp_cycles_remaining")
                a_fh = maintenance_due.get("a_check_due_fh")
                c_fh = maintenance_due.get("c_check_due_fh")
                for metric_name, value in [
                    ("ENGINE1_LLP_CYCLES_REMAINING", e1_rem),
                    ("ENGINE2_LLP_CYCLES_REMAINING", e2_rem),
                    ("A_CHECK_DUE_FH", a_fh),
                    ("C_CHECK_DUE_FH", c_fh),
                ]:
                    if value is not None:
                        try:
                            num_val = int(value) if isinstance(value, (int, float)) else int(value)
                        except (TypeError, ValueError):
                            continue
                        database.insert_engine_data(
                            case_id=case_id,
                            registration=registration,
                            aircraft_type=aircraft_type,
                            engine_type=engine_type,
                            metric_name=metric_name,
                            metric_value=num_val,
                            unit="FC" if "LLP" in metric_name else "FH",
                            status="ok",
                        )
                engine_metrics_inserted_for_file = True


# ─── Auto-detection helpers ──────────────────────────────────────────────────

_AIRCRAFT_PATTERNS = {
    "A319": "A319-100", "A320": "A320-200", "A321": "A321-200",
    "A320NEO": "A320-200NEO", "A321NEO": "A321-200NEO",
    "A330": "A330-200", "A340": "A340-300", "A350": "A350-900",
    "B737": "B737-800", "737MAX": "737-MAX8", "737-MAX": "737-MAX8",
    "B777": "B777-300ER", "B787": "B787-9", "B747": "B747-400",
    "737-800": "B737-800", "737-700": "B737-700",
}

_ENGINE_PATTERNS = [
    "LEAP-1A", "LEAP-1B", "PW1100G",
    "CFM56-5B", "CFM56-5C", "CFM56-7B", "CFM56",
    "V2500", "V2527", "V2533",
    "CF6-80E1", "CF6-80C2", "GE90-115B", "GE90",
    "GEnx-1B", "Trent 700", "Trent 800", "Trent XWB",
    "PW4000", "RB211-524",
]

_AIRCRAFT_TO_ENGINE = {
    "A319-100": "CFM56-5B", "A320-200": "V2500", "A321-200": "V2500",
    "A320-200NEO": "LEAP-1A", "A321-200NEO": "LEAP-1A",
    "A330-200": "CF6-80E1", "A340-300": "CFM56-5C", "A350-900": "Trent XWB",
    "B737-800": "CFM56-7B", "B737-700": "CFM56-7B", "737-MAX8": "LEAP-1B",
    "B777-300ER": "GE90-115B", "B787-9": "GEnx-1B", "B747-400": "CF6-80C2",
}

_ENGINE_TO_AIRCRAFT = {
    "LEAP-1A": "A320-200NEO",
    "LEAP-1B": "737-MAX8",
    "PW1100G": "A320-200NEO",
    "CFM56-5B": "A320-200",
    "CFM56-5C": "A340-300",
    "CFM56-7B": "B737-800",
    "CFM56": "B737-800",
    "V2500": "A320-200",
    "CF6-80E1": "A330-200",
    "CF6-80C2": "B747-400",
    "GE90-115B": "B777-300ER",
    "GEnx-1B": "B787-9",
    "Trent 700": "A330-200",
    "Trent XWB": "A350-900",
}


def _auto_detect_aircraft(sources: list[str]) -> tuple[str, str]:
    """Scan text sources for known aircraft/engine patterns. Returns (aircraft_type, engine_type)."""
    combined = " ".join(str(s) for s in sources if s).upper()
    aircraft_type = "Unknown"
    engine_type = "Unknown"

    # 1. Detect engine type (often more specific in filenames or technical logs)
    for ep in _ENGINE_PATTERNS:
        if ep.upper() in combined:
            engine_type = ep
            break

    # 2. Detect aircraft type from patterns
    for pattern, ac_type in sorted(_AIRCRAFT_PATTERNS.items(), key=lambda x: len(x[0]), reverse=True):
        if pattern.upper() in combined:
            aircraft_type = ac_type
            break

    # 3. Cross-reference: infer aircraft from engine if still unknown
    if aircraft_type == "Unknown" and engine_type != "Unknown":
        aircraft_type = _ENGINE_TO_AIRCRAFT.get(engine_type, "Unknown")

    # 4. Cross-reference: infer engine from aircraft if still unknown
    if engine_type == "Unknown" and aircraft_type != "Unknown":
        engine_type = _AIRCRAFT_TO_ENGINE.get(aircraft_type, "Unknown")

    return aircraft_type, engine_type


@click.command()
@click.option("--case", "case_id", required=True, help="Case ID")
@click.option("--reg", "registration", required=True, help="Aircraft registration")
@click.option("--type", "aircraft_type", default="auto", help="Aircraft type (or 'auto' to detect)")
@click.option("--engine", "engine_type", default="auto", help="Engine type (or 'auto' to detect)")
@click.option("--docs", "docs_dir", type=click.Path(exists=True, file_okay=False), required=True, help="Directory of PDFs")
def run(case_id: str, registration: str, aircraft_type: str, engine_type: str, docs_dir: str) -> None:
    """Run technical due diligence: ingest PDFs, run orchestrator and Technical Agent, write findings to DB."""
    settings = load_settings()
    settings.validate_at_startup()

    from src.log_config import configure_structlog
    configure_structlog(log_level=getattr(settings, "log_level", "INFO"), json_logs=getattr(settings, "json_logs", False))
    logger = structlog.get_logger(__name__)

    # ── Stage 1: Auto-detect from filenames/metadata ──
    if aircraft_type.lower() == "auto" or engine_type.lower() == "auto":
        sources = [case_id, registration]
        docs_path = Path(docs_dir)
        if docs_path.is_dir():
            sources.extend(f.name for f in docs_path.iterdir() if f.is_file())
        detected_ac, detected_eng = _auto_detect_aircraft(sources)
        if aircraft_type.lower() == "auto":
            aircraft_type = detected_ac
        if engine_type.lower() == "auto":
            engine_type = detected_eng
        logger.info("stage1_auto_detect", aircraft_type=aircraft_type, engine_type=engine_type)

    storage = _wire_storage(settings)
    database = _wire_database(settings)
    database.ensure_schema()
    ledger = _wire_ledger(settings)

    logger.info("case_opened", case_id=case_id)
    database.insert_case(case_id, registration, aircraft_type, engine_type)

    docs = ingest_documents(case_id, docs_dir, storage, database, ledger)
    if not docs:
        logger.warning("no_docs_ingested", docs_dir=docs_dir)
        doc_dicts = []
    else:
        doc_dicts = [d.model_dump() for d in docs]
        
        # ── Stage 2: Refine Detection from Document Content ──
        if aircraft_type == "Unknown" or engine_type == "Unknown":
            content_sources = [d.text_preview for d in docs]
            refined_ac, refined_eng = _auto_detect_aircraft(content_sources)
            if aircraft_type == "Unknown" and refined_ac != "Unknown":
                aircraft_type = refined_ac
            if engine_type == "Unknown" and refined_eng != "Unknown":
                engine_type = refined_eng
            if refined_ac != "Unknown" or refined_eng != "Unknown":
                logger.info("stage2_refined_detection", aircraft_type=aircraft_type, engine_type=engine_type)
                # Update the case record with refined types
                database.insert_case(case_id, registration, aircraft_type, engine_type)

        _insert_engine_data_from_docs(database, doc_dicts, case_id, registration, aircraft_type, engine_type)

    _insert_flight_json_llp_and_engine(
        database, docs_dir, case_id, registration, aircraft_type, engine_type
    )

    provider = getattr(settings, "agent_provider", "anthropic") or "anthropic"
    provider = str(provider).strip().lower()

    if getattr(settings, "use_agent_registry", False):
        from src.agents.registry import discover_agents
        agents = discover_agents()
        if not agents:
            if provider == "openai":
                agents = [TechnicalAirworthinessOpenAIAgent(api_key=settings.openai_api_key)]
            else:
                agents = [TechnicalAirworthinessAgent(api_key=settings.anthropic_api_key)]
    else:
        if provider == "openai":
            agents = [TechnicalAirworthinessOpenAIAgent(api_key=settings.openai_api_key)]
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
            metadata_json=json.dumps({
                "reasoning": f.reasoning,
                "correlation_group": f.correlation_group,
                "aviation_reference": f.aviation_reference,
                **f.metadata
            }),
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
