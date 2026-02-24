"""Unit tests for Orchestrator and CaseReport."""
import pytest
from src.agents.orchestrator import Orchestrator, _derive_overall_status
from src.agents.mock_agent import MockTechnicalAgent
from src.schemas.models import CaseReport, FindingOut, FindingSeverity


def test_derive_overall_status():
    f_clear = FindingOut(finding_id="1", agent_name="x", severity=FindingSeverity.CLEAR, category="c", title="t", evidence="e", confidence=0.9)
    f_flag = FindingOut(finding_id="2", agent_name="x", severity=FindingSeverity.FLAG, category="c", title="t", evidence="e", confidence=0.9)
    assert _derive_overall_status([]) == "CLEAR"
    assert _derive_overall_status([f_clear]) == "CLEAR"
    assert _derive_overall_status([f_flag, f_clear]) == "FLAG"
    assert _derive_overall_status([f_clear, f_flag]) == "FLAG"


def test_orchestrator_with_mock_agent():
    agent = MockTechnicalAgent()
    orch = Orchestrator(agents=[agent])
    report = orch.run_case(
        case_id="test_001",
        aircraft_reg="EI-TEST",
        documents=[],
        aircraft_type="A320",
        engine_type="CFM56-5B",
    )
    assert isinstance(report, CaseReport)
    assert report.case_id == "test_001"
    assert report.aircraft_reg == "EI-TEST"
    assert report.overall_status == "FLAG"
    assert len(report.findings) == 4
    assert report.iterations == 1
    assert report.flag_findings
    assert report.generated_at


def test_case_report_stop_findings():
    f_stop = FindingOut(finding_id="1", agent_name="x", severity=FindingSeverity.STOP, category="c", title="t", evidence="e", confidence=0.5)
    report = CaseReport(case_id="c", aircraft_reg="R", overall_status="STOP", findings=[f_stop], iterations=1)
    assert len(report.stop_findings) == 1
    assert report.stop_findings[0].severity == FindingSeverity.STOP
