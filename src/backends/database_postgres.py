"""PostgreSQL implementation of DatabaseBackend. Connection pooling for production."""
from __future__ import annotations

import json
import logging
from contextlib import contextmanager
from typing import Any

from sqlalchemy import create_engine, text
from sqlalchemy.engine import Engine
from sqlalchemy.orm import Session, sessionmaker

from src.abstractions.database import DatabaseBackend

logger = logging.getLogger(__name__)

SCHEMA_SQL = """
CREATE TABLE IF NOT EXISTS cases (
    case_id VARCHAR(128) PRIMARY KEY,
    registration VARCHAR(32) NOT NULL,
    aircraft_type VARCHAR(64) NOT NULL,
    engine_type VARCHAR(128) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS documents (
    id VARCHAR(128) PRIMARY KEY,
    case_id VARCHAR(128) NOT NULL REFERENCES cases(case_id) ON DELETE CASCADE,
    filename VARCHAR(512) NOT NULL,
    content_hash VARCHAR(64) NOT NULL,
    storage_key VARCHAR(1024) NOT NULL,
    page_count INT NOT NULL,
    metadata_json JSONB,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_documents_case_id ON documents(case_id);

CREATE TABLE IF NOT EXISTS findings (
    id VARCHAR(128) PRIMARY KEY,
    case_id VARCHAR(128) NOT NULL REFERENCES cases(case_id) ON DELETE CASCADE,
    agent_name VARCHAR(64) NOT NULL,
    severity VARCHAR(32) NOT NULL,
    category VARCHAR(128) NOT NULL,
    title VARCHAR(512) NOT NULL,
    evidence TEXT NOT NULL,
    confidence FLOAT NOT NULL,
    source_doc_id VARCHAR(128),
    source_page VARCHAR(64),
    iteration INT NOT NULL DEFAULT 0,
    metadata_json JSONB,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_findings_case_id ON findings(case_id);
CREATE INDEX IF NOT EXISTS idx_findings_severity ON findings(severity);

CREATE TABLE IF NOT EXISTS engine_data (
    id SERIAL PRIMARY KEY,
    case_id VARCHAR(128) NOT NULL REFERENCES cases(case_id) ON DELETE CASCADE,
    registration VARCHAR(32) NOT NULL,
    aircraft_type VARCHAR(64) NOT NULL,
    engine_type VARCHAR(128) NOT NULL,
    metric_name VARCHAR(128) NOT NULL,
    metric_value VARCHAR(256),
    metric_value_numeric FLOAT,
    unit VARCHAR(32),
    status VARCHAR(32) NOT NULL,
    metadata_json JSONB,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_engine_data_case_id ON engine_data(case_id);
"""


class PostgresDatabaseBackend(DatabaseBackend):
    """Production-grade PostgreSQL backend with connection pooling."""

    def __init__(self, database_url: str, pool_size: int = 10, max_overflow: int = 20) -> None:
        self._engine: Engine = create_engine(
            database_url,
            pool_size=pool_size,
            max_overflow=max_overflow,
            pool_pre_ping=True,
            pool_recycle=3600,
            echo=False,
        )
        self._session_factory = sessionmaker(
            bind=self._engine,
            autocommit=False,
            autoflush=False,
            expire_on_commit=False,
        )

    def ensure_schema(self) -> None:
        with self._engine.connect() as conn:
            for stmt in SCHEMA_SQL.strip().split(";"):
                stmt = stmt.strip()
                if stmt:
                    conn.execute(text(stmt))
                    conn.commit()
        logger.info("PostgreSQL schema ensured.")

    @contextmanager
    def _session(self) -> Session:
        session = self._session_factory()
        try:
            yield session
            session.commit()
        except Exception:
            session.rollback()
            raise
        finally:
            session.close()

    def insert_case(self, case_id: str, registration: str, aircraft_type: str, engine_type: str) -> None:
        with self._session() as s:
            s.execute(
                text("""
                INSERT INTO cases (case_id, registration, aircraft_type, engine_type)
                VALUES (:case_id, :registration, :aircraft_type, :engine_type)
                ON CONFLICT (case_id) DO UPDATE SET
                    registration = EXCLUDED.registration,
                    aircraft_type = EXCLUDED.aircraft_type,
                    engine_type = EXCLUDED.engine_type
                """),
                {
                    "case_id": case_id,
                    "registration": registration,
                    "aircraft_type": aircraft_type,
                    "engine_type": engine_type,
                },
            )

    def insert_document(
        self,
        case_id: str,
        doc_id: str,
        filename: str,
        content_hash: str,
        storage_key: str,
        page_count: int,
        metadata_json: str | None = None,
    ) -> None:
        with self._session() as s:
            s.execute(
                text("""
                INSERT INTO documents (id, case_id, filename, content_hash, storage_key, page_count, metadata_json)
                VALUES (:id, :case_id, :filename, :content_hash, :storage_key, :page_count, :metadata_json::jsonb)
                ON CONFLICT (id) DO UPDATE SET
                    filename = EXCLUDED.filename,
                    content_hash = EXCLUDED.content_hash,
                    storage_key = EXCLUDED.storage_key,
                    page_count = EXCLUDED.page_count,
                    metadata_json = EXCLUDED.metadata_json
                """),
                {
                    "id": doc_id,
                    "case_id": case_id,
                    "filename": filename,
                    "content_hash": content_hash,
                    "storage_key": storage_key,
                    "page_count": page_count,
                    "metadata_json": metadata_json or "{}",
                },
            )

    def insert_finding(
        self,
        case_id: str,
        finding_id: str,
        agent_name: str,
        severity: str,
        category: str,
        title: str,
        evidence: str,
        confidence: float,
        source_doc_id: str | None,
        source_page: str | None,
        iteration: int,
        metadata_json: str | None = None,
    ) -> None:
        with self._session() as s:
            s.execute(
                text("""
                INSERT INTO findings (id, case_id, agent_name, severity, category, title, evidence, confidence,
                    source_doc_id, source_page, iteration, metadata_json)
                VALUES (:id, :case_id, :agent_name, :severity, :category, :title, :evidence, :confidence,
                    :source_doc_id, :source_page, :iteration, :metadata_json::jsonb)
                ON CONFLICT (id) DO UPDATE SET
                    agent_name = EXCLUDED.agent_name,
                    severity = EXCLUDED.severity,
                    category = EXCLUDED.category,
                    title = EXCLUDED.title,
                    evidence = EXCLUDED.evidence,
                    confidence = EXCLUDED.confidence,
                    source_doc_id = EXCLUDED.source_doc_id,
                    source_page = EXCLUDED.source_page,
                    iteration = EXCLUDED.iteration,
                    metadata_json = EXCLUDED.metadata_json
                """),
                {
                    "id": finding_id,
                    "case_id": case_id,
                    "agent_name": agent_name,
                    "severity": severity,
                    "category": category,
                    "title": title,
                    "evidence": evidence,
                    "confidence": confidence,
                    "source_doc_id": source_doc_id,
                    "source_page": source_page,
                    "iteration": iteration,
                    "metadata_json": metadata_json or "{}",
                },
            )

    def insert_engine_data(
        self,
        case_id: str,
        registration: str,
        aircraft_type: str,
        engine_type: str,
        metric_name: str,
        metric_value: str | float,
        unit: str | None,
        status: str,
        metadata_json: str | None = None,
    ) -> None:
        numeric_val = metric_value if isinstance(metric_value, (int, float)) else None
        str_val = str(metric_value) if metric_value is not None else None
        with self._session() as s:
            s.execute(
                text("""
                INSERT INTO engine_data (case_id, registration, aircraft_type, engine_type, metric_name,
                    metric_value, metric_value_numeric, unit, status, metadata_json)
                VALUES (:case_id, :registration, :aircraft_type, :engine_type, :metric_name,
                    :metric_value, :metric_value_numeric, :unit, :status, :metadata_json::jsonb)
                """),
                {
                    "case_id": case_id,
                    "registration": registration,
                    "aircraft_type": aircraft_type,
                    "engine_type": engine_type,
                    "metric_name": metric_name,
                    "metric_value": str_val,
                    "metric_value_numeric": numeric_val,
                    "unit": unit,
                    "status": status,
                    "metadata_json": metadata_json or "{}",
                },
            )

    def get_case(self, case_id: str) -> dict[str, Any] | None:
        with self._engine.connect() as conn:
            row = conn.execute(
                text("SELECT case_id, registration, aircraft_type, engine_type, created_at FROM cases WHERE case_id = :id"),
                {"id": case_id},
            ).fetchone()
        if not row:
            return None
        return {
            "case_id": row[0],
            "registration": row[1],
            "aircraft_type": row[2],
            "engine_type": row[3],
            "created_at": row[4].isoformat() if row[4] else None,
        }

    def get_documents(self, case_id: str) -> list[dict[str, Any]]:
        with self._engine.connect() as conn:
            rows = conn.execute(
                text("SELECT id, case_id, filename, content_hash, storage_key, page_count, metadata_json, created_at FROM documents WHERE case_id = :id ORDER BY created_at"),
                {"id": case_id},
            ).fetchall()
        return [
            {
                "id": r[0],
                "case_id": r[1],
                "filename": r[2],
                "content_hash": r[3],
                "storage_key": r[4],
                "page_count": r[5],
                "metadata_json": r[6],
                "created_at": r[7].isoformat() if r[7] else None,
            }
            for r in rows
        ]

    def get_findings(self, case_id: str) -> list[dict[str, Any]]:
        with self._engine.connect() as conn:
            rows = conn.execute(
                text("""
                SELECT id, case_id, agent_name, severity, category, title, evidence, confidence,
                    source_doc_id, source_page, iteration, metadata_json, created_at
                FROM findings WHERE case_id = :id ORDER BY created_at
                """),
                {"id": case_id},
            ).fetchall()
        return [
            {
                "id": r[0],
                "case_id": r[1],
                "agent_name": r[2],
                "severity": r[3],
                "category": r[4],
                "title": r[5],
                "evidence": r[6],
                "confidence": r[7],
                "source_doc_id": r[8],
                "source_page": r[9],
                "iteration": r[10],
                "metadata_json": r[11],
                "created_at": r[12].isoformat() if r[12] else None,
            }
            for r in rows
        ]

    def get_engine_data(self, case_id: str) -> list[dict[str, Any]]:
        with self._engine.connect() as conn:
            rows = conn.execute(
                text("""
                SELECT id, case_id, registration, aircraft_type, engine_type, metric_name,
                    metric_value, metric_value_numeric, unit, status, metadata_json, created_at
                FROM engine_data WHERE case_id = :id ORDER BY metric_name
                """),
                {"id": case_id},
            ).fetchall()
        return [
            {
                "id": r[0],
                "case_id": r[1],
                "registration": r[2],
                "aircraft_type": r[3],
                "engine_type": r[4],
                "metric_name": r[5],
                "metric_value": r[6] or r[7],
                "unit": r[8],
                "status": r[9],
                "metadata_json": r[10],
                "created_at": r[11].isoformat() if r[11] else None,
            }
            for r in rows
        ]

    def fleet_summary(self) -> list[dict[str, Any]]:
        with self._engine.connect() as conn:
            rows = conn.execute(
                text("""
                SELECT c.case_id, c.registration, c.aircraft_type, c.engine_type,
                    COUNT(DISTINCT d.id) AS doc_count,
                    COUNT(DISTINCT f.id) AS finding_count,
                    COUNT(DISTINCT e.id) AS engine_metric_count
                FROM cases c
                LEFT JOIN documents d ON d.case_id = c.case_id
                LEFT JOIN findings f ON f.case_id = c.case_id
                LEFT JOIN engine_data e ON e.case_id = c.case_id
                GROUP BY c.case_id, c.registration, c.aircraft_type, c.engine_type
                ORDER BY c.case_id
                """),
            ).fetchall()
        return [
            {
                "case_id": r[0],
                "registration": r[1],
                "aircraft_type": r[2],
                "engine_type": r[3],
                "doc_count": r[4],
                "finding_count": r[5],
                "engine_metric_count": r[6],
            }
            for r in rows
        ]

    def get_connection(self) -> Any:
        return self._engine.connect()
