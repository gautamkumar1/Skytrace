"""Unit tests for Orchestrator and CaseReport (no external API)."""
import pytest
from src.agents.orchestrator import _derive_overall_status
from src.schemas.models import CaseReport, FindingOut, FindingSeverity


def test_derive_overall_status():
    f_clear = FindingOut(finding_id="1", agent_name="x", severity=FindingSeverity.CLEAR, category="c", title="t", evidence="e", confidence=0.9)
    f_flag = FindingOut(finding_id="2", agent_name="x", severity=FindingSeverity.FLAG, category="c", title="t", evidence="e", confidence=0.9)
    assert _derive_overall_status([]) == "CLEAR"
    assert _derive_overall_status([f_clear]) == "CLEAR"
    assert _derive_overall_status([f_flag, f_clear]) == "FLAG"
    assert _derive_overall_status([f_clear, f_flag]) == "FLAG"


def test_case_report_stop_findings():
    f_stop = FindingOut(finding_id="1", agent_name="x", severity=FindingSeverity.STOP, category="c", title="t", evidence="e", confidence=0.5)
    report = CaseReport(case_id="c", aircraft_reg="R", overall_status="STOP", findings=[f_stop], iterations=1)
    assert len(report.stop_findings) == 1
    assert report.stop_findings[0].severity == FindingSeverity.STOP
