"""Orchestrator: multi-round agent loop with confidence threshold and STOP escalation."""
from __future__ import annotations

import logging
from typing import TYPE_CHECKING

from src.schemas.models import CaseReport, FindingOut, FindingSeverity

if TYPE_CHECKING:
    from src.agents.base import BaseAgent

logger = logging.getLogger(__name__)

MAX_ITERATIONS = 3
CONFIDENCE_FLOOR = 0.80


def _derive_overall_status(findings: list[FindingOut]) -> str:
    if not findings:
        return "CLEAR"
    severities = {f.severity.value for f in findings}
    for level in ("STOP", "FLAG", "ADVISORY", "CLEAR"):
        if level in severities:
            return level
    return "CLEAR"


class Orchestrator:
    """Runs agents in a loop until confidence threshold met or STOP or max iterations."""

    def __init__(self, agents: list[BaseAgent]) -> None:
        self._agents = list(agents)

    def run_case(
        self,
        case_id: str,
        aircraft_reg: str,
        documents: list[dict],
        aircraft_type: str = "",
        engine_type: str = "",
    ) -> CaseReport:
        from datetime import datetime, timezone

        all_findings: list[FindingOut] = []
        context: dict = {}
        iteration = 1

        for iteration in range(1, MAX_ITERATIONS + 1):
            logger.info("orchestrator.iteration case_id=%s iteration=%s", case_id, iteration)
            round_findings: list[FindingOut] = []
            for agent in self._agents:
                findings = agent.analyze(
                    case_id, aircraft_reg, aircraft_type, engine_type, documents
                )
                for f in findings:
                    f.iteration = iteration
                round_findings.extend(findings)

            stop_items = [f for f in round_findings if f.severity == FindingSeverity.STOP]
            if stop_items:
                logger.warning("orchestrator.stop_finding case_id=%s count=%s", case_id, len(stop_items))
                all_findings = round_findings
                break

            min_conf = min((f.confidence for f in round_findings), default=0.0)
            if min_conf >= CONFIDENCE_FLOOR:
                logger.info("orchestrator.confidence_met case_id=%s min_confidence=%.3f", case_id, min_conf)
                all_findings = round_findings
                break

            low_conf = [f for f in round_findings if f.confidence < CONFIDENCE_FLOOR]
            context["gap_findings"] = [f.model_dump() for f in low_conf]
            logger.info("orchestrator.re_prompting case_id=%s low_confidence_count=%s", case_id, len(low_conf))
        else:
            logger.warning("orchestrator.max_iterations_reached case_id=%s", case_id)
            all_findings = round_findings

        overall = _derive_overall_status(all_findings)
        return CaseReport(
            case_id=case_id,
            aircraft_reg=aircraft_reg,
            aircraft_type=aircraft_type or None,
            engine_type=engine_type or None,
            overall_status=overall,
            findings=all_findings,
            iterations=iteration,
            generated_at=datetime.now(timezone.utc).isoformat(),
        )
