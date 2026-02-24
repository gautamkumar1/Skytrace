"""Mock Technical Agent: returns deterministic demo findings when ANTHROPIC_API_KEY is not set."""
from __future__ import annotations

import logging
import uuid

from src.agents.base import BaseAgent
from src.schemas.models import FindingOut, FindingSeverity

logger = logging.getLogger(__name__)


class MockTechnicalAgent(BaseAgent):
    """Returns fixed demo findings for testing and CI. No API calls."""

    @property
    def name(self) -> str:
        return "technical_airworthiness"

    def analyze(
        self,
        case_id: str,
        registration: str,
        aircraft_type: str,
        engine_type: str,
        documents: list,
    ) -> list[FindingOut]:
        logger.info("mock_agent.analyze case_id=%s doc_count=%s", case_id, len(documents))
        return [
            FindingOut(
                finding_id=uuid.uuid4().hex[:24],
                agent_name=self.name,
                severity=FindingSeverity.FLAG,
                category="AD_COMPLIANCE",
                title="AD 2019-0129 CFM56-5B — compliance status absent from supplied records",
                evidence="Manual verification required before lease execution.",
                confidence=0.91,
                source_doc_id=None,
                source_page=None,
                iteration=0,
                metadata={},
            ),
            FindingOut(
                finding_id=uuid.uuid4().hex[:24],
                agent_name=self.name,
                severity=FindingSeverity.ADVISORY,
                category="LLP_STATUS",
                title="Fan disk: 14,200 / 20,000 cycles consumed. Within limits.",
                evidence="Note for lease term planning.",
                confidence=0.85,
                iteration=0,
                metadata={},
            ),
            FindingOut(
                finding_id=uuid.uuid4().hex[:24],
                agent_name=self.name,
                severity=FindingSeverity.ADVISORY,
                category="EGT_MARGIN",
                title="EGT margin 18°C (threshold 15°C). Acceptable.",
                evidence="Trend monitoring recommended beyond 12-month lease.",
                confidence=0.88,
                iteration=0,
                metadata={},
            ),
            FindingOut(
                finding_id=uuid.uuid4().hex[:24],
                agent_name=self.name,
                severity=FindingSeverity.CLEAR,
                category="ARC_STATUS",
                title="Airworthiness Review Certificate valid. Expiry 14 mo.",
                evidence="ARC_STATUS CLEAR.",
                confidence=0.95,
                iteration=0,
                metadata={},
            ),
        ]
