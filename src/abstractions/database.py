"""Abstract database backend. Application never calls driver directly."""
from __future__ import annotations

from abc import ABC, abstractmethod
from typing import Any, Sequence


class DatabaseBackend(ABC):
    """Database abstraction. Implementations: PostgreSQL, Snowflake."""

    @abstractmethod
    def ensure_schema(self) -> None:
        """Create tables if they do not exist."""
        ...

    @abstractmethod
    def insert_case(self, case_id: str, registration: str, aircraft_type: str, engine_type: str) -> None:
        """Insert or replace case metadata."""
        ...

    @abstractmethod
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
        """Insert document record."""
        ...

    @abstractmethod
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
        """Insert finding record."""
        ...

    @abstractmethod
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
        """Insert engine health metric row."""
        ...

    def insert_llp_part(
        self,
        id: str,
        case_id: str,
        registration: str,
        aircraft_type: str,
        part_number: str,
        part_name: str,
        serial_number: str,
        position: str,
        life_unit: str,
        current_used: float,
        life_limit: float,
        btb_status: str = "pending_review",
        next_inspection_date: str | None = None,
        last_btb_verified_at: str | None = None,
        notes: str | None = None,
    ) -> None:
        """Insert or replace one Life Limited Part row (e.g. from document extraction). Optional; default no-op."""
        ...

    @abstractmethod
    def get_case(self, case_id: str) -> dict[str, Any] | None:
        """Get case by id."""
        ...

    @abstractmethod
    def get_documents(self, case_id: str) -> list[dict[str, Any]]:
        """List documents for a case."""
        ...

    @abstractmethod
    def get_findings(self, case_id: str) -> list[dict[str, Any]]:
        """List findings for a case."""
        ...

    @abstractmethod
    def get_engine_data(self, case_id: str) -> list[dict[str, Any]]:
        """List engine data rows for a case."""
        ...

    @abstractmethod
    def fleet_summary(self) -> list[dict[str, Any]]:
        """Fleet-level summary query (all cases)."""
        ...

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
        """Store human feedback on a finding (thumbs up/down). Optional override."""
        pass

    @abstractmethod
    def get_connection(self) -> Any:
        """Return a connection or session for raw use if needed. Caller must close."""
        ...
