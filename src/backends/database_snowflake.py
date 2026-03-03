"""Snowflake implementation of DatabaseBackend. Same interface as Postgres."""
from __future__ import annotations

import json
import logging
from typing import Any

import snowflake.connector
from snowflake.connector import DictCursor

from src.abstractions.database import DatabaseBackend

logger = logging.getLogger(__name__)

# Snowflake DDL — VARIANT for JSON; no ON CONFLICT, use MERGE where needed
SCHEMA_SQL = """
CREATE TABLE IF NOT EXISTS cases (
    case_id VARCHAR(128) PRIMARY KEY,
    registration VARCHAR(32) NOT NULL,
    aircraft_type VARCHAR(64) NOT NULL,
    engine_type VARCHAR(128) NOT NULL,
    created_at TIMESTAMP_NTZ DEFAULT CURRENT_TIMESTAMP()
);

CREATE TABLE IF NOT EXISTS documents (
    id VARCHAR(128) PRIMARY KEY,
    case_id VARCHAR(128) NOT NULL REFERENCES cases(case_id),
    filename VARCHAR(512) NOT NULL,
    content_hash VARCHAR(64) NOT NULL,
    storage_key VARCHAR(1024) NOT NULL,
    page_count INTEGER NOT NULL,
    metadata_json VARIANT,
    created_at TIMESTAMP_NTZ DEFAULT CURRENT_TIMESTAMP()
);

CREATE TABLE IF NOT EXISTS findings (
    id VARCHAR(128) PRIMARY KEY,
    case_id VARCHAR(128) NOT NULL REFERENCES cases(case_id),
    agent_name VARCHAR(64) NOT NULL,
    severity VARCHAR(32) NOT NULL,
    category VARCHAR(128) NOT NULL,
    title VARCHAR(512) NOT NULL,
    evidence VARCHAR(2000) NOT NULL,
    confidence FLOAT NOT NULL,
    source_doc_id VARCHAR(128),
    source_page VARCHAR(64),
    iteration INTEGER NOT NULL DEFAULT 0,
    metadata_json VARIANT,
    created_at TIMESTAMP_NTZ DEFAULT CURRENT_TIMESTAMP()
);

CREATE TABLE IF NOT EXISTS engine_data (
    id INTEGER AUTOINCREMENT PRIMARY KEY,
    case_id VARCHAR(128) NOT NULL REFERENCES cases(case_id),
    registration VARCHAR(32) NOT NULL,
    aircraft_type VARCHAR(64) NOT NULL,
    engine_type VARCHAR(128) NOT NULL,
    metric_name VARCHAR(128) NOT NULL,
    metric_value VARCHAR(256),
    metric_value_numeric FLOAT,
    unit VARCHAR(32),
    status VARCHAR(32) NOT NULL,
    metadata_json VARIANT,
    created_at TIMESTAMP_NTZ DEFAULT CURRENT_TIMESTAMP()
);

CREATE TABLE IF NOT EXISTS finding_feedback (
    id VARCHAR(64) PRIMARY KEY,
    finding_id VARCHAR(128) NOT NULL,
    case_id VARCHAR(128) NOT NULL,
    actor VARCHAR(100) NOT NULL,
    feedback VARCHAR(20) NOT NULL,
    comment VARCHAR(1000),
    ledger_id VARCHAR(200),
    created_at TIMESTAMP_NTZ DEFAULT CURRENT_TIMESTAMP()
);
"""


class SnowflakeDatabaseBackend(DatabaseBackend):
    """Snowflake implementation. Auth: password (optional passcode for MFA) or key-pair (private_key_path)."""

    def __init__(
        self,
        account: str,
        user: str,
        password: str,
        database: str = "AVIATION_AI",
        schema: str = "POC",
        warehouse: str = "COMPUTE_WH",
        role: str | None = None,
        passcode: str | None = None,
        private_key_path: str | None = None,
        private_key_passphrase: str | None = None,
    ) -> None:
        self._account = account
        self._user = user
        self._password = password
        self._database = database
        self._schema = schema
        self._warehouse = warehouse
        self._role = role
        self._passcode = (passcode or "").strip() or None
        self._private_key_path = (private_key_path or "").strip() or None
        self._private_key_passphrase = (private_key_passphrase or "").strip() or None

    def _conn(self):
        use_key_pair = bool(self._private_key_path)
        kwargs = dict(
            account=self._account,
            user=self._user,
            database=self._database,
            schema=self._schema,
            warehouse=self._warehouse,
        )
        if self._role:
            kwargs["role"] = self._role
        if use_key_pair:
            kwargs["authenticator"] = "SNOWFLAKE_JWT"
            kwargs["private_key_file"] = self._private_key_path
            if self._private_key_passphrase:
                kwargs["private_key_file_pwd"] = self._private_key_passphrase
        else:
            kwargs["password"] = self._password
            if self._passcode:
                kwargs["passcode"] = self._passcode
        return snowflake.connector.connect(**kwargs)

    @staticmethod
    def _quote_id(name: str) -> str:
        """Quote Snowflake identifier so names with spaces or mixed case work."""
        return '"' + str(name).replace('"', '""') + '"'

    def _qual(self, table: str) -> str:
        """Fully qualified table name (database.schema.table) so session context doesn't matter."""
        return f"{self._quote_id(self._database)}.{self._quote_id(self._schema)}.{table}"

    def ensure_schema(self) -> None:
        conn = self._conn()
        try:
            cur = conn.cursor()
            cur.execute(f"USE DATABASE {self._quote_id(self._database)}")
            cur.execute(f"USE SCHEMA {self._quote_id(self._schema)}")
            for stmt in SCHEMA_SQL.strip().split(";"):
                stmt = stmt.strip()
                if stmt:
                    cur.execute(stmt)
            conn.commit()
            logger.info("Snowflake schema ensured.")
        finally:
            conn.close()

    def insert_case(self, case_id: str, registration: str, aircraft_type: str, engine_type: str) -> None:
        conn = self._conn()
        try:
            conn.cursor(DictCursor).execute(
                f"""
                MERGE INTO {self._qual("cases")} t USING (SELECT %(case_id)s AS case_id, %(registration)s AS registration, %(aircraft_type)s AS aircraft_type, %(engine_type)s AS engine_type) s
                ON t.case_id = s.case_id
                WHEN MATCHED THEN UPDATE SET t.registration = s.registration, t.aircraft_type = s.aircraft_type, t.engine_type = s.engine_type
                WHEN NOT MATCHED THEN INSERT (case_id, registration, aircraft_type, engine_type) VALUES (s.case_id, s.registration, s.aircraft_type, s.engine_type)
                """,
                {"case_id": case_id, "registration": registration, "aircraft_type": aircraft_type, "engine_type": engine_type},
            )
            conn.commit()
        finally:
            conn.close()

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
        conn = self._conn()
        try:
            conn.cursor(DictCursor).execute(
                f"""
                MERGE INTO {self._qual("documents")} t USING (SELECT %(id)s AS id, %(case_id)s AS case_id, %(filename)s AS filename, %(content_hash)s AS content_hash, %(storage_key)s AS storage_key, %(page_count)s AS page_count, PARSE_JSON(%(metadata_json)s) AS metadata_json) s
                ON t.id = s.id
                WHEN MATCHED THEN UPDATE SET t.filename = s.filename, t.content_hash = s.content_hash, t.storage_key = s.storage_key, t.page_count = s.page_count, t.metadata_json = s.metadata_json
                WHEN NOT MATCHED THEN INSERT (id, case_id, filename, content_hash, storage_key, page_count, metadata_json) VALUES (s.id, s.case_id, s.filename, s.content_hash, s.storage_key, s.page_count, s.metadata_json)
                """,
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
            conn.commit()
        finally:
            conn.close()

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
        conn = self._conn()
        try:
            conn.cursor(DictCursor).execute(
                f"""
                MERGE INTO {self._qual("findings")} t USING (SELECT %(id)s AS id, %(case_id)s AS case_id, %(agent_name)s AS agent_name, %(severity)s AS severity, %(category)s AS category, %(title)s AS title, %(evidence)s AS evidence, %(confidence)s AS confidence, %(source_doc_id)s AS source_doc_id, %(source_page)s AS source_page, %(iteration)s AS iteration, PARSE_JSON(%(metadata_json)s) AS metadata_json) s
                ON t.id = s.id
                WHEN MATCHED THEN UPDATE SET t.agent_name = s.agent_name, t.severity = s.severity, t.category = s.category, t.title = s.title, t.evidence = s.evidence, t.confidence = s.confidence, t.source_doc_id = s.source_doc_id, t.source_page = s.source_page, t.iteration = s.iteration, t.metadata_json = s.metadata_json
                WHEN NOT MATCHED THEN INSERT (id, case_id, agent_name, severity, category, title, evidence, confidence, source_doc_id, source_page, iteration, metadata_json) VALUES (s.id, s.case_id, s.agent_name, s.severity, s.category, s.title, s.evidence, s.confidence, s.source_doc_id, s.source_page, s.iteration, s.metadata_json)
                """,
                {
                    "id": finding_id,
                    "case_id": case_id,
                    "agent_name": agent_name,
                    "severity": severity,
                    "category": category,
                    "title": title,
                    "evidence": evidence[:2000],
                    "confidence": confidence,
                    "source_doc_id": source_doc_id,
                    "source_page": source_page,
                    "iteration": iteration,
                    "metadata_json": metadata_json or "{}",
                },
            )
            conn.commit()
        finally:
            conn.close()

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
        conn = self._conn()
        try:
            conn.cursor(DictCursor).execute(
                f"""
                INSERT INTO {self._qual("engine_data")} (case_id, registration, aircraft_type, engine_type, metric_name, metric_value, metric_value_numeric, unit, status, metadata_json)
                VALUES (%(case_id)s, %(registration)s, %(aircraft_type)s, %(engine_type)s, %(metric_name)s, %(metric_value)s, %(metric_value_numeric)s, %(unit)s, %(status)s, PARSE_JSON(%(metadata_json)s))
                """,
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
            conn.commit()
        finally:
            conn.close()

    def insert_finding_feedback(
        self,
        feedback_id: str,
        finding_id: str,
        case_id: str,
        actor: str,
        feedback: str,
        comment: str | None = None,
        ledger_id: str | None = None,
    ) -> None:
        conn = self._conn()
        try:
            conn.cursor(DictCursor).execute(
                f"""
                INSERT INTO {self._qual("finding_feedback")} (id, finding_id, case_id, actor, feedback, comment, ledger_id)
                VALUES (%(id)s, %(finding_id)s, %(case_id)s, %(actor)s, %(feedback)s, %(comment)s, %(ledger_id)s)
                """,
                {"id": feedback_id, "finding_id": finding_id, "case_id": case_id, "actor": actor, "feedback": feedback, "comment": comment, "ledger_id": ledger_id},
            )
            conn.commit()
        finally:
            conn.close()

    def get_case(self, case_id: str) -> dict[str, Any] | None:
        conn = self._conn()
        try:
            cur = conn.cursor(DictCursor)
            cur.execute(f"SELECT case_id, registration, aircraft_type, engine_type, created_at FROM {self._qual('cases')} WHERE case_id = %(id)s", {"id": case_id})
            row = cur.fetchone()
        finally:
            conn.close()
        if not row:
            return None
        return {k: (v.isoformat() if hasattr(v, "isoformat") else v) for k, v in row.items()}

    def get_documents(self, case_id: str) -> list[dict[str, Any]]:
        conn = self._conn()
        try:
            cur = conn.cursor(DictCursor)
            cur.execute(f"SELECT id, case_id, filename, content_hash, storage_key, page_count, metadata_json, created_at FROM {self._qual('documents')} WHERE case_id = %(id)s ORDER BY created_at", {"id": case_id})
            rows = cur.fetchall()
        finally:
            conn.close()
        return [_row_to_dict(r) for r in rows]

    def get_findings(self, case_id: str) -> list[dict[str, Any]]:
        conn = self._conn()
        try:
            cur = conn.cursor(DictCursor)
            cur.execute(
                f"SELECT id, case_id, agent_name, severity, category, title, evidence, confidence, source_doc_id, source_page, iteration, metadata_json, created_at FROM {self._qual('findings')} WHERE case_id = %(id)s ORDER BY created_at",
                {"id": case_id},
            )
            rows = cur.fetchall()
        finally:
            conn.close()
        return [_row_to_dict(r) for r in rows]

    def get_engine_data(self, case_id: str) -> list[dict[str, Any]]:
        conn = self._conn()
        try:
            cur = conn.cursor(DictCursor)
            cur.execute(
                f"SELECT id, case_id, registration, aircraft_type, engine_type, metric_name, metric_value, metric_value_numeric, unit, status, metadata_json, created_at FROM {self._qual('engine_data')} WHERE case_id = %(id)s ORDER BY metric_name",
                {"id": case_id},
            )
            rows = cur.fetchall()
        finally:
            conn.close()
        return [
            {**{k: (v.isoformat() if hasattr(v, "isoformat") else v) for k, v in r.items()}, "metric_value": r.get("metric_value") or r.get("metric_value_numeric")}
            for r in rows
        ]

    def fleet_summary(self) -> list[dict[str, Any]]:
        conn = self._conn()
        try:
            cur = conn.cursor(DictCursor)
            cur.execute(f"""
                SELECT c.case_id, c.registration, c.aircraft_type, c.engine_type,
                    COUNT(DISTINCT d.id) AS doc_count,
                    COUNT(DISTINCT f.id) AS finding_count,
                    COUNT(DISTINCT e.id) AS engine_metric_count
                FROM {self._qual("cases")} c
                LEFT JOIN {self._qual("documents")} d ON d.case_id = c.case_id
                LEFT JOIN {self._qual("findings")} f ON f.case_id = c.case_id
                LEFT JOIN {self._qual("engine_data")} e ON e.case_id = c.case_id
                GROUP BY c.case_id, c.registration, c.aircraft_type, c.engine_type
                ORDER BY c.case_id
            """)
            rows = cur.fetchall()
        finally:
            conn.close()
        return [_row_to_dict(r) for r in rows]

    def get_connection(self) -> Any:
        return self._conn()


def _row_to_dict(row: dict) -> dict:
    out = {}
    for k, v in row.items():
        if hasattr(v, "isoformat"):
            out[k] = v.isoformat()
        elif isinstance(v, (dict, list)) and v is not None:
            out[k] = json.loads(json.dumps(v)) if hasattr(v, "__iter__") and not isinstance(v, (str, bytes)) else v
        else:
            out[k] = v
    return out
