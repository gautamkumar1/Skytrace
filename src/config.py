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

    # Database: postgres | snowflake
    database_backend: str = "postgres"
    database_url: str = "postgresql://postgres:postgres@localhost:5432/postgres"  # required when database_backend=postgres
    # Snowflake (when database_backend=snowflake)
    snowflake_account: str = ""
    snowflake_user: str = ""
    snowflake_password: str = ""
    snowflake_database: str = "AVIATION_AI"
    snowflake_schema: str = "POC"
    snowflake_warehouse: str = "COMPUTE_WH"
    snowflake_role: str = ""

    # AWS S3 (optional: use local storage if not set)
    aws_access_key_id: str = ""
    aws_secret_access_key: str = ""
    aws_region: str = "us-east-1"
    s3_bucket: str = "aircraft-poc-documents"

    # Ledger: postgres | file | qldb
    ledger_backend: str = "postgres"
    ledger_file_path: str = "./data/ledger.jsonl"
    qldb_ledger_name: str = "aviation-audit"

    # Anthropic Claude (required for Technical Airworthiness agent)
    anthropic_api_key: str = ""

    # App
    log_level: str = "INFO"
    json_logs: bool = False
    dashboard_host: str = "0.0.0.0"
    dashboard_port: int = 8050
    use_agent_registry: bool = False

    @field_validator("database_url")
    @classmethod
    def validate_database_url(cls, v: str) -> str:
        return (v or "").strip()

    @property
    def use_s3(self) -> bool:
        return bool(self.aws_access_key_id and self.aws_secret_access_key)

    def validate_at_startup(self) -> None:
        """Call once at app startup. Raises if required config invalid."""
        if not (self.anthropic_api_key and self.anthropic_api_key.strip()):
            raise ValueError("ANTHROPIC_API_KEY is required. Set it in .env.")
        if self.database_backend == "postgres" and not (self.database_url and self.database_url.strip()):
            raise ValueError("DATABASE_URL is required when database_backend=postgres")
        if self.database_backend == "snowflake":
            if not (self.snowflake_account and self.snowflake_user and self.snowflake_password):
                raise ValueError("SNOWFLAKE_ACCOUNT, SNOWFLAKE_USER, SNOWFLAKE_PASSWORD are required when database_backend=snowflake")
        if self.ledger_backend == "qldb" and not (self.aws_access_key_id and self.aws_secret_access_key):
            raise ValueError("AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY are required when LEDGER_BACKEND=qldb")
        if self.ledger_backend == "file":
            Path(self.ledger_file_path).parent.mkdir(parents=True, exist_ok=True)


def load_settings() -> Settings:
    """Load and validate settings. Use after loading .env."""
    return Settings()
