"""Auto-discover and load agents from agents module. Use when use_agent_registry=True."""
from __future__ import annotations

import importlib
import logging
from pathlib import Path
from typing import TYPE_CHECKING

from src.agents.base import BaseAgent

if TYPE_CHECKING:
    pass

logger = logging.getLogger(__name__)


def discover_agents(agents_package: str = "src.agents") -> list[BaseAgent]:
    """
    Discover all BaseAgent subclasses in the agents package (e.g. technical_airworthiness).
    Excludes base class and returns instances.
    """
    agents: list[BaseAgent] = []
    try:
        pkg = importlib.import_module(agents_package)
        package_path = Path(pkg.__file__).parent if getattr(pkg, "__file__", None) else None
    except ImportError:
        logger.warning("agents package not found: %s", agents_package)
        return agents

    for name in sorted(dir(pkg)):
        if name.startswith("_"):
            continue
        obj = getattr(pkg, name)
        if (
            isinstance(obj, type)
            and issubclass(obj, BaseAgent)
            and obj is not BaseAgent
        ):
            try:
                instance = obj()
                if not isinstance(instance, BaseAgent):
                    continue
                agents.append(instance)
                logger.info("agent_registered", name=instance.name)
            except Exception as e:
                logger.error("agent_load_failed", module=name, error=str(e))
                raise

    agents.sort(key=lambda a: a.name)
    return agents
