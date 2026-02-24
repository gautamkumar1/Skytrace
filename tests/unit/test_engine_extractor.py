"""Unit tests for engine metrics extraction from text."""
import pytest
from src.ingestion.engine_extractor import extract_engine_metrics_from_text, extract_engine_metrics_from_docs


def test_extract_egt_margin():
    text = "Engine status: EGT margin 18.5 °C. Within limits."
    out = extract_engine_metrics_from_text(text)
    names = [x[0] for x in out]
    assert "EGT_MARGIN_C" in names
    val = next(x for x in out if x[0] == "EGT_MARGIN_C")
    assert val[1] == 18.5
    assert val[3] in ("ok", "advisory", "flag")


def test_extract_csn_tsn():
    text = "Cycles since new: 14200. Time since new: 28500 hrs."
    out = extract_engine_metrics_from_text(text)
    names = [x[0] for x in out]
    assert "CSN" in names
    assert "TSN" in names


def test_extract_empty():
    assert extract_engine_metrics_from_text("") == []
    assert extract_engine_metrics_from_text("No numbers here.") == []


def test_extract_from_docs():
    docs = [{"text_preview": "EGT margin: 12 °C. CSN: 10000."}]
    out = extract_engine_metrics_from_docs(docs, "c1", "EI-X", "A320", "CFM56")
    assert len(out) >= 1
    names = [x[0] for x in out]
    assert "EGT_MARGIN_C" in names or "CSN" in names
