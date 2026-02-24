"""Abstract immutable ledger. Implementations: PostgreSQL table, file, QLDB."""
from __future__ import annotations

from abc import ABC, abstractmethod
from enum import Enum
from typing import Any


class LedgerEventType(str, Enum):
    DOCUMENT_INGESTED = "DOCUMENT_INGESTED"
    FINDING_RECORDED = "FINDING_RECORDED"
    HUMAN_ACTION = "HUMAN_ACTION"
    REPORT_EXPORTED = "REPORT_EXPORTED"


class LedgerBackend(ABC):
    """Append-only audit log. Each record can include previous_hash for chain."""

    @abstractmethod
    def append(
        self,
        event_type: str,
        payload: dict[str, Any],
        entity_id: str | None = None,
        previous_hash: str | None = None,
    ) -> str:
        """Append event. Returns hash/id of this record."""
        ...

    @abstractmethod
    def verify_chain(self) -> bool:
        """Verify hash chain integrity. Returns True if valid."""
        ...
