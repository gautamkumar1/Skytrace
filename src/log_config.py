"""Structured logging (structlog). JSON output for production, console for dev."""
from __future__ import annotations

import logging
import sys

import structlog


def configure_structlog(log_level: str = "INFO", json_logs: bool = False) -> None:
    level = getattr(logging, log_level.upper(), logging.INFO)
    shared = [
        structlog.processors.add_log_level,
        structlog.processors.TimeStamper(fmt="iso"),
        structlog.processors.StackInfoRenderer(),
    ]
    if json_logs:
        processors = shared + [structlog.processors.JSONRenderer()]
    else:
        processors = shared + [structlog.dev.ConsoleRenderer(colors=sys.stderr.isatty())]
    structlog.configure(
        processors=processors,
        wrapper_class=structlog.make_filtering_bound_logger(level),
        context_class=dict,
        logger_factory=structlog.PrintLoggerFactory(),
        cache_logger_on_first_use=True,
    )


def get_logger(name: str):
    """Return a structlog logger. Call configure_structlog() once at app startup."""
    return structlog.get_logger(name)
