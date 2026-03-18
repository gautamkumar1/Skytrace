"""Technical Airworthiness agent: OpenAI (GPT)."""
import json
import logging
import uuid
from openai import OpenAI
from src.agents.base import BaseAgent
from src.schemas.models import FindingOut, FindingSeverity

logger = logging.getLogger(__name__)
SYSTEM = """You are an expert technical airworthiness analyst and MRO auditor.
Analyze the provided aviation technical records (PDFs, logs, etc.) and output ONLY a valid JSON array of findings.

CRITICAL SEVERITY RULES:
- STOP: Safety-critical failures, LLP life limit exceedances, back-to-birth traceability gaps, mandatory Airworthiness Directive (AD) non-compliance, clear falsification, or structural integrity threats.
- FLAG: Fleet mismatches (e.g. wrong engine part on aircraft), temporal anomalies (TSN/CSN time reversal), impossible ratio violations (e.g. cycles exceed hours for widebody), suspected data integrity issues, or performance trend deviations (e.g. sudden EGT margin loss).
- ADVISORY: Missing non-critical serial numbers, minor documentation gaps, non-safety-impacting compliance concerns.
- CLEAR: Data passes validation with no anomalies found.

TITLE FORMATTING:
Use aviation-standard domain language (e.g., "Engine Part/Type Mismatch (CFM56 part on V2500)", "Cycle Count Inconsistency vs Flight Hours").

REQUIRED JSON STRUCTURE PER FINDING:
{
  "severity": "CLEAR" | "ADVISORY" | "FLAG" | "STOP",
  "category": "string",
  "title": "string",
  "evidence": "Detailed quote from the source document used as the basis for this finding",
  "confidence": 0.0 to 1.0,
  "source_doc_id": "optional string",
  "source_page": "optional string",
  "reasoning": "COMPULSORY: 3-4 sentences of rigorous technical reasoning. Cite the specific aviation domain logic, engineering principles, or regulatory standards (e.g., EASA/FAA) that make this an anomaly. Explain the potential risk to continued airworthiness.",
  "correlation_group": "optional string linking related anomalies",
  "aviation_reference": "optional string (e.g., 'ATA 72', 'EASA Part-145', 'AMM 12-13-11')"
}"""


class TechnicalAirworthinessOpenAIAgent(BaseAgent):
    """Same behavior as Claude agent but using OpenAI API."""

    def __init__(self, api_key: str, model: str = "gpt-4o-mini"):
        self._client = OpenAI(api_key=api_key)
        self._model = model

    @property
    def name(self):
        return "technical_airworthiness"

    def analyze(self, case_id, registration, aircraft_type, engine_type, documents):
        doc_blobs = []
        for d in documents:
            preview = (d.get("text_preview") or d.get("text", ""))[:8000]
            doc_blobs.append("[%s (id: %s)]\n%s" % (d.get("filename", "?"), d.get("doc_id", ""), preview))
        user = "Case: %s | %s | Engine: %s\n\nDocs:\n%s\n\nOutput JSON array of findings." % (
            registration,
            aircraft_type,
            engine_type,
            "\n---\n".join(doc_blobs),
        )
        try:
            resp = self._client.chat.completions.create(
                model=self._model,
                messages=[
                    {"role": "system", "content": SYSTEM},
                    {"role": "user", "content": user},
                ],
                max_tokens=4096,
            )
            text = (resp.choices[0].message.content or "").strip()
        except Exception as e:
            logger.exception("OpenAI error: %s", e)
            return [
                FindingOut(
                    finding_id=uuid.uuid4().hex[:24],
                    agent_name=self.name,
                    severity=FindingSeverity.FLAG,
                    category="SYSTEM",
                    title="Agent failed",
                    evidence=str(e),
                    confidence=0.0,
                    iteration=0,
                )
            ]
        if "[" in text and "]" in text:
            start, end = text.index("["), text.rindex("]") + 1
            text = text[start:end]
        try:
            raw = json.loads(text)
        except Exception:
            return []
        if not isinstance(raw, list):
            return []
        out = []
        for item in raw:
            if not isinstance(item, dict):
                continue
            sev = item.get("severity", "ADVISORY")
            if isinstance(sev, str) and sev.upper() in ("CLEAR", "ADVISORY", "FLAG", "STOP"):
                sev = FindingSeverity(sev.upper())
            else:
                sev = FindingSeverity.ADVISORY
            out.append(
                FindingOut(
                    finding_id=uuid.uuid4().hex[:24],
                    agent_name=self.name,
                    severity=sev,
                    category=str(item.get("category", ""))[:128],
                    title=str(item.get("title", ""))[:512],
                    evidence=str(item.get("evidence", "")) or "N/A",
                    confidence=min(1.0, max(0.0, float(item.get("confidence", 0.5)))),
                    source_doc_id=item.get("source_doc_id"),
                    source_page=str(item.get("source_page", ""))[:64] or None,
                    iteration=0,
                    reasoning=str(item.get("reasoning", "")),
                    correlation_group=str(item.get("correlation_group", "")) if item.get("correlation_group") else None,
                    aviation_reference=str(item.get("aviation_reference", "")) if item.get("aviation_reference") else None,
                    metadata={},
                )
            )
        return out
