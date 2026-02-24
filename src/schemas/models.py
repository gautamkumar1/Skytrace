"""Pydantic contracts for agent I/O and API. Invalid payloads never reach DB/storage/ledger."""
from __future__ import annotations

from enum import Enum
from typing import Any

from pydantic import BaseModel, Field


class FindingSeverity(str, Enum):
    CLEAR = "CLEAR"
    ADVISORY = "ADVISORY"
    FLAG = "FLAG"
    STOP = "STOP"


class CaseInput(BaseModel):
    case_id: str = Field(..., min_length=1, max_length=128)
    registration: str = Field(..., min_length=1, max_length=32)
    aircraft_type: str = Field(..., min_length=1, max_length=64)
    engine_type: str = Field(..., min_length=1, max_length=128)


class IngestedDocument(BaseModel):
    doc_id: str = Field(..., min_length=1, max_length=128)
    case_id: str = Field(..., min_length=1, max_length=128)
    filename: str = Field(..., min_length=1, max_length=512)
    content_hash: str = Field(..., min_length=64, max_length=64)
    storage_key: str = Field(..., min_length=1, max_length=1024)
    page_count: int = Field(..., ge=0)
    text_preview: str = Field("", max_length=10000)
    metadata: dict[str, Any] = Field(default_factory=dict)


class FindingOut(BaseModel):
    finding_id: str = Field(..., min_length=1, max_length=128)
    agent_name: str = Field(..., min_length=1, max_length=64)
    severity: FindingSeverity
    category: str = Field(..., min_length=1, max_length=128)
    title: str = Field(..., min_length=1, max_length=512)
    evidence: str = Field(..., min_length=1)
    confidence: float = Field(..., ge=0.0, le=1.0)
    source_doc_id: str | None = None
    source_page: str | None = None
    iteration: int = Field(0, ge=0)
    metadata: dict[str, Any] = Field(default_factory=dict)


class OrchestratorGap(BaseModel):
    description: str
    suggested_prompt: str | None = None


class OrchestratorResult(BaseModel):
    accepted: bool = Field(..., description="True if confidence threshold met and no STOP")
    findings: list[FindingOut] = Field(default_factory=list)
    gaps: list[OrchestratorGap] = Field(default_factory=list)
    iteration: int = Field(0, ge=0)
    stop_triggered: bool = False
    message: str = ""


class CaseReport(BaseModel):
    """Final case report after orchestrator run."""
    case_id: str = Field(..., min_length=1, max_length=128)
    aircraft_reg: str = Field(..., min_length=1, max_length=32)
    aircraft_type: str | None = None
    engine_type: str | None = None
    overall_status: str = Field(..., pattern="^(CLEAR|ADVISORY|FLAG|STOP)$")
    findings: list[FindingOut] = Field(default_factory=list)
    iterations: int = Field(1, ge=1)
    generated_at: str = ""

    @property
    def stop_findings(self) -> list[FindingOut]:
        return [f for f in self.findings if f.severity == FindingSeverity.STOP]

    @property
    def flag_findings(self) -> list[FindingOut]:
        return [f for f in self.findings if f.severity == FindingSeverity.FLAG]
