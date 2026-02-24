"""File-based append-only ledger for POC without DB ledger."""
from __future__ import annotations

import hashlib
import json
import logging
from pathlib import Path
from typing import Any

from src.abstractions.ledger import LedgerBackend

logger = logging.getLogger(__name__)


class FileLedgerBackend(LedgerBackend):
    """Append one JSON line per event. Optional previous_hash in payload for chain."""

    def __init__(self, path: str | Path) -> None:
        self._path = Path(path)
        self._path.parent.mkdir(parents=True, exist_ok=True)
        self._last_hash: str | None = None

    def append(
        self,
        event_type: str,
        payload: dict[str, Any],
        entity_id: str | None = None,
        previous_hash: str | None = None,
    ) -> str:
        prev = previous_hash or self._last_hash
        record = {
            "event_type": event_type,
            "entity_id": entity_id,
            "payload": payload,
            "previous_hash": prev,
        }
        line = json.dumps(record, sort_keys=False) + "\n"
        block_hash = hashlib.sha256(line.encode("utf-8")).hexdigest()
        record["block_hash"] = block_hash
        line = json.dumps(record, sort_keys=False) + "\n"
        self._path.open("a").write(line)
        self._last_hash = block_hash
        return block_hash

    def verify_chain(self) -> bool:
        if not self._path.exists():
            return True
        prev = None
        for line in self._path.open():
            line = line.strip()
            if not line:
                continue
            record = json.loads(line)
            expected = record.get("block_hash")
            prev_in_record = record.get("previous_hash")
            if prev_in_record != prev:
                return False
            content = json.dumps({k: v for k, v in record.items() if k != "block_hash"}, sort_keys=True)
            computed = hashlib.sha256(content.encode("utf-8")).hexdigest()
            if computed != expected:
                return False
            prev = expected
        return True
