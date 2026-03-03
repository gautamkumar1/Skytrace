"""PostgreSQL append-only ledger with hash chain."""
from __future__ import annotations

import hashlib
import json
import logging
import uuid
from typing import Any

from sqlalchemy import create_engine, text
from sqlalchemy.engine import Engine

from src.abstractions.ledger import LedgerBackend

logger = logging.getLogger(__name__)

LEDGER_SCHEMA = """
CREATE TABLE IF NOT EXISTS ledger_events (
    id VARCHAR(64) PRIMARY KEY,
    event_type VARCHAR(64) NOT NULL,
    entity_id VARCHAR(256),
    payload JSONB NOT NULL,
    previous_hash VARCHAR(64),
    block_hash VARCHAR(64) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_ledger_events_type ON ledger_events(event_type);
CREATE INDEX IF NOT EXISTS idx_ledger_events_entity ON ledger_events(entity_id);
"""


class PostgresLedgerBackend(LedgerBackend):
    """Append-only ledger in PostgreSQL. Each row has block_hash = SHA256(prev_hash + payload)."""

    def __init__(self, database_url: str) -> None:
        self._engine: Engine = create_engine(
            database_url,
            pool_size=2,
            max_overflow=5,
            pool_pre_ping=True,
        )

    def _ensure_schema(self) -> None:
        with self._engine.connect() as conn:
            for stmt in LEDGER_SCHEMA.strip().split(";"):
                stmt = stmt.strip()
                if stmt:
                    conn.execute(text(stmt))
                    conn.commit()

    def _compute_hash(self, previous_hash: str | None, payload_str: str) -> str:
        content = (previous_hash or "") + payload_str
        return hashlib.sha256(content.encode("utf-8")).hexdigest()

    def append(
        self,
        event_type: str,
        payload: dict[str, Any],
        entity_id: str | None = None,
        previous_hash: str | None = None,
    ) -> str:
        self._ensure_schema()
        payload_str = json.dumps(payload, sort_keys=True)
        # Get previous block hash if not provided
        if previous_hash is None:
            with self._engine.connect() as conn:
                row = conn.execute(
                    text("SELECT block_hash FROM ledger_events ORDER BY created_at DESC LIMIT 1")
                ).fetchone()
                previous_hash = row[0] if row else None
        block_hash = self._compute_hash(previous_hash, payload_str)
        event_id = str(uuid.uuid4()).replace("-", "")[:24]
        with self._engine.connect() as conn:
            conn.execute(
                text("""
                INSERT INTO ledger_events (id, event_type, entity_id, payload, previous_hash, block_hash)
                VALUES (:id, :event_type, :entity_id, CAST(:payload AS jsonb), :previous_hash, :block_hash)
                """),
                {
                    "id": event_id,
                    "event_type": event_type,
                    "entity_id": entity_id,
                    "payload": payload_str,
                    "previous_hash": previous_hash,
                    "block_hash": block_hash,
                },
            )
            conn.commit()
        return block_hash

    def verify_chain(self) -> bool:
        self._ensure_schema()
        with self._engine.connect() as conn:
            rows = conn.execute(
                text("SELECT id, previous_hash, payload, block_hash FROM ledger_events ORDER BY created_at")
            ).fetchall()
        prev_hash = None
        for row in rows:
            _, pprev, payload, expected_hash = row
            if pprev != prev_hash:
                return False
            computed = self._compute_hash(pprev, payload) if isinstance(payload, str) else self._compute_hash(pprev, json.dumps(payload, sort_keys=True))
            if computed != expected_hash:
                return False
            prev_hash = expected_hash
        return True
