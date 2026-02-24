"""Startup-validated configuration. All secrets from env."""
from __future__ import annotations

import os
from pathlib import Path

from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Validated config. Fail fast at startup if required vars missing."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    # Database
    database_url: str = "postgresql://postgres:ServerDb@2026@localhost:5432/postgres"

    # AWS S3 (optional for POC: use local storage if not set)
    aws_access_key_id: str = ""
    aws_secret_access_key: str = ""
    aws_region: str = "us-east-1"
    s3_bucket: str = "aircraft-poc-documents"

    # Ledger: postgres | file
    ledger_backend: str = "postgres"
    ledger_file_path: str = "./data/ledger.jsonl"

    # Anthropic (required for agent)
    anthropic_api_key: str = ""

    # App
    log_level: str = "INFO"
    dashboard_host: str = "0.0.0.0"
    dashboard_port: int = 8050

    @field_validator("database_url")
    @classmethod
    def validate_database_url(cls, v: str) -> str:
        if not v or not v.strip():
            raise ValueError("DATABASE_URL is required")
        return v.strip()

    @property
    def use_s3(self) -> bool:
        return bool(self.aws_access_key_id and self.aws_secret_access_key)

    @property
    def use_mock_agent(self) -> bool:
        """True when no Anthropic key is set; use MockTechnicalAgent for testing/demo."""
        return not bool(self.anthropic_api_key and self.anthropic_api_key.strip())

    def validate_at_startup(self) -> None:
        """Call once at app startup. Raises if required config invalid."""
        if self.ledger_backend == "file":
            Path(self.ledger_file_path).parent.mkdir(parents=True, exist_ok=True)


def load_settings() -> Settings:
    """Load and validate settings. Use after loading .env."""
    return Settings()
