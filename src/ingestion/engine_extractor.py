"""Extract engine health metrics from ingested PDF text (engine status sheets)."""
from __future__ import annotations

import re
import logging
from typing import Any

logger = logging.getLogger(__name__)

# Patterns for common engine sheet metrics (case-insensitive, numbers with optional units)
PATTERNS = [
    (r"EGT\s*margin\s*[:\s]*([-\d.]+)\s*°?C?", "EGT_MARGIN_C", "°C", lambda v: float(v) if v else None),
    (r"EGTM\s*[:\s]*([-\d.]+)", "EGT_MARGIN_C", "°C", lambda v: float(v) if v else None),
    (r"cycles?\s*since\s*new\s*[:\s]*(\d+)", "CSN", None, lambda v: int(v) if v else None),
    (r"CSN\s*[:\s]*(\d+)", "CSN", None, lambda v: int(v) if v else None),
    (r"time\s*since\s*new\s*[:\s]*(\d+)\s*(?:hrs?|hours?)?", "TSN", "hrs", lambda v: int(v) if v else None),
    (r"TSN\s*[:\s]*(\d+)", "TSN", "hrs", lambda v: int(v) if v else None),
    (r"LLP\s*min(?:imum)?\s*remaining\s*[:\s]*(\d+)", "LLP_MIN_REMAINING", "cycles", lambda v: int(v) if v else None),
    (r"min(?:imum)?\s*LLP\s*remaining\s*[:\s]*(\d+)", "LLP_MIN_REMAINING", "cycles", lambda v: int(v) if v else None),
    (r"cycles?\s*since\s*last\s*(?:shop\s*)?visit\s*[:\s]*(\d+)", "CSLSV", None, lambda v: int(v) if v else None),
    (r"CSLSV\s*[:\s]*(\d+)", "CSLSV", None, lambda v: int(v) if v else None),
    (r"time\s*since\s*last\s*(?:shop\s*)?visit\s*[:\s]*(\d+)", "TSLSV", "hrs", lambda v: int(v) if v else None),
    (r"TSLSV\s*[:\s]*(\d+)", "TSLSV", "hrs", lambda v: int(v) if v else None),
]


def extract_engine_metrics_from_text(text: str) -> list[tuple[str, str | float, str | None, str]]:
    """
    Parse text (from engine status sheet or similar) and return list of
    (metric_name, metric_value, unit, status).
    status is 'ok' if value looks normal, 'advisory' or 'flag' for thresholds (simplified).
    """
    if not text or not text.strip():
        return []
    text_lower = text.replace("\n", " ").replace("\r", " ")
    results = []
    seen = set()
    for pattern, name, unit, coerce in PATTERNS:
        if name in seen:
            continue
        m = re.search(pattern, text_lower, re.IGNORECASE)
        if m:
            raw = m.group(1).strip()
            try:
                val = coerce(raw)
            except (ValueError, TypeError):
                val = raw
            if val is not None:
                status = _infer_status(name, val)
                results.append((name, val, unit, status))
                seen.add(name)
    return results


def _infer_status(metric_name: str, value: float | int) -> str:
    if metric_name == "EGT_MARGIN_C" and isinstance(value, (int, float)):
        if value < 10:
            return "flag"
        if value < 15:
            return "advisory"
    if metric_name == "LLP_MIN_REMAINING" and isinstance(value, (int, float)):
        if value < 1000:
            return "flag"
        if value < 3000:
            return "advisory"
    return "ok"


def extract_engine_metrics_from_docs(
    documents: list[dict],
    case_id: str,
    registration: str,
    aircraft_type: str,
    engine_type: str,
) -> list[tuple[str, str | float, str | None, str]]:
    """
    Run extraction over all doc text previews; merge and dedupe by metric name (first wins).
    Returns same list of tuples as extract_engine_metrics_from_text.
    """
    all_metrics: dict[str, tuple[str | float, str | None, str]] = {}
    for doc in documents:
        text = doc.get("text_preview") or doc.get("text", "")
        if not text:
            continue
        for name, value, unit, status in extract_engine_metrics_from_text(text):
            if name not in all_metrics:
                all_metrics[name] = (value, unit, status)
    return [(name, v[0], v[1], v[2]) for name, v in all_metrics.items()]
