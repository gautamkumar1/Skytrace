"""Unit tests for Pydantic schemas."""
import pytest
from pydantic import ValidationError

from src.schemas.models import CaseInput, FindingOut, FindingSeverity, IngestedDocument


def test_finding_severity_values():
    assert FindingSeverity.CLEAR.value == "CLEAR"
    assert FindingSeverity.STOP.value == "STOP"


def test_case_input_valid():
    c = CaseInput(case_id="case_001", registration="EI-SYN", aircraft_type="A320-214", engine_type="CFM56-5B4/2P")
    assert c.case_id == "case_001"
    assert c.registration == "EI-SYN"


def test_case_input_empty_case_id_rejected():
    with pytest.raises(ValidationError):
        CaseInput(case_id="", registration="EI-SYN", aircraft_type="A320", engine_type="CFM56")


def test_ingested_document_minimal():
    doc = IngestedDocument(
        doc_id="abc123",
        case_id="case_001",
        filename="test.pdf",
        content_hash="a" * 64,
        storage_key="cases/case_001/docs/abc123_test.pdf",
        page_count=1,
    )
    assert doc.doc_id == "abc123"
    assert doc.text_preview == ""


def test_finding_out_confidence_bounds():
    f = FindingOut(
        finding_id="f1",
        agent_name="technical_airworthiness",
        severity=FindingSeverity.ADVISORY,
        category="EGT_MARGIN",
        title="Margin acceptable",
        evidence="EGT margin 18°C.",
        confidence=0.85,
    )
    assert 0 <= f.confidence <= 1
    with pytest.raises(ValidationError):
        FindingOut(
            finding_id="f2",
            agent_name="tech",
            severity=FindingSeverity.CLEAR,
            category="X",
            title="T",
            evidence="E",
            confidence=1.5,
        )
