"""AWS QLDB implementation of LedgerBackend. Append-only, hash chain."""
from __future__ import annotations

import hashlib
import json
import logging
from datetime import datetime, timezone
from typing import Any

from src.abstractions.ledger import LedgerBackend

logger = logging.getLogger(__name__)


class LedgerIntegrityError(Exception):
    """Raised when ledger hash chain verification fails."""


class QLDBLedgerBackend(LedgerBackend):
    """AWS QLDB append-only ledger. Requires pyqldb and ledger created in AWS."""

    def __init__(self, ledger_name: str, region: str | None = None) -> None:
        self._ledger_name = ledger_name
        self._region = region or "us-east-1"
        self._driver = None

    def _get_driver(self):
        if self._driver is None:
            from pyqldb.driver.qldb_driver import QldbDriver
            self._driver = QldbDriver(ledger_name=self._ledger_name, region_name=self._region)
        return self._driver

    @staticmethod
    def _compute_hash(event_type: str, entity_id: str | None, ts: str, payload: dict) -> str:
        raw = json.dumps(
            {"event_type": event_type, "entity_id": entity_id, "timestamp": ts, "payload": payload},
            sort_keys=True,
        )
        return hashlib.sha256(raw.encode()).hexdigest()

    def append(
        self,
        event_type: str,
        payload: dict[str, Any],
        entity_id: str | None = None,
        previous_hash: str | None = None,
    ) -> str:
        driver = self._get_driver()
        ts = datetime.now(timezone.utc).isoformat()
        digest = self._compute_hash(event_type, entity_id, ts, payload)
        record_id = None

        def _write(txn):
            nonlocal record_id
            cursor = txn.execute_statement(
                "INSERT INTO audit_ledger ?",
                {
                    "event_type": event_type,
                    "entity_id": entity_id,
                    "timestamp": ts,
                    "payload": payload,
                    "sha256": digest,
                    "previous_hash": previous_hash,
                },
            )
            for doc in cursor:
                record_id = doc.get("documentId")
                break

        driver.execute_lambda(_write)
        return record_id or digest

    def verify_chain(self) -> bool:
        driver = self._get_driver()
        results = []

        def _read(txn):
            cursor = txn.execute_statement("SELECT * FROM audit_ledger ORDER BY timestamp")
            results.extend(list(cursor))

        driver.execute_lambda(_read)
        prev_hash = None
        for record in results:
            expected = self._compute_hash(
                record.get("event_type"),
                record.get("entity_id"),
                record.get("timestamp"),
                record.get("payload") or {},
            )
            if expected != record.get("sha256"):
                raise LedgerIntegrityError("Hash mismatch: data may have been tampered with.")
            if prev_hash is not None and record.get("previous_hash") != prev_hash:
                raise LedgerIntegrityError("Chain link broken.")
            prev_hash = record.get("sha256")
        return True
