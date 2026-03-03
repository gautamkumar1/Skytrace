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
    snowflake_region: str = ""  # optional; if you get 404 on login, set e.g. us-east-1
    snowflake_totp_passcode: str = ""  # optional; if your user has MFA/TOTP, set current 6-digit code (or use a user without MFA)
    snowflake_private_key_path: str = ""  # optional; path to RSA private key (.p8/.pem) for key-pair auth (no password/MFA needed)
    snowflake_private_key_passphrase: str = ""  # optional; passphrase for encrypted private key

    # AWS S3 (optional: use local storage if not set)
    force_local_storage: str = ""  # set to "true" or "1" to use local storage even when AWS keys are set (avoids NoSuchBucket)
    aws_access_key_id: str = ""
    aws_secret_access_key: str = ""
    aws_region: str = "us-east-1"
    s3_bucket: str = "aircraft-poc-documents"

    # Ledger: postgres | file | qldb
    ledger_backend: str = "postgres"
    ledger_file_path: str = "./data/ledger.jsonl"
    qldb_ledger_name: str = "aviation-audit"

    # Agent: openai | anthropic (which LLM to use for Technical Airworthiness)
    agent_provider: str = "anthropic"

    # Anthropic Claude (required when agent_provider=anthropic)
    anthropic_api_key: str = ""

    # OpenAI (required when agent_provider=openai)
    openai_api_key: str = ""

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
        if (self.force_local_storage or "").strip().lower() in ("true", "1", "yes", "on"):
            return False
        return bool(self.aws_access_key_id and self.aws_secret_access_key)

    def validate_at_startup(self) -> None:
        """Call once at app startup. Raises if required config invalid."""
        provider = (self.agent_provider or "anthropic").strip().lower()
        if provider == "openai":
            if not (self.openai_api_key and self.openai_api_key.strip()):
                raise ValueError("OPENAI_API_KEY is required when AGENT_PROVIDER=openai. Set it in .env.")
        else:
            if not (self.anthropic_api_key and self.anthropic_api_key.strip()):
                raise ValueError("ANTHROPIC_API_KEY is required when AGENT_PROVIDER=anthropic. Set it in .env.")
        if self.database_backend == "postgres" and not (self.database_url and self.database_url.strip()):
            raise ValueError("DATABASE_URL is required when database_backend=postgres")
        if self.database_backend == "snowflake":
            has_key_pair = bool(self.snowflake_private_key_path and self.snowflake_private_key_path.strip())
            if not (self.snowflake_account and self.snowflake_user):
                raise ValueError("SNOWFLAKE_ACCOUNT and SNOWFLAKE_USER are required when database_backend=snowflake")
            if not has_key_pair and not (self.snowflake_password and self.snowflake_password.strip()):
                raise ValueError("SNOWFLAKE_PASSWORD is required when database_backend=snowflake (or set SNOWFLAKE_PRIVATE_KEY_PATH for key-pair auth)")
            if has_key_pair:
                key_path = Path(self.snowflake_private_key_path.strip())
                if not key_path.is_file():
                    raise ValueError("SNOWFLAKE_PRIVATE_KEY_PATH must point to an existing private key file")
        if self.ledger_backend == "qldb" and not (self.aws_access_key_id and self.aws_secret_access_key):
            raise ValueError("AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY are required when LEDGER_BACKEND=qldb")
        if self.ledger_backend == "file":
            Path(self.ledger_file_path).parent.mkdir(parents=True, exist_ok=True)


def load_settings() -> Settings:
    """Load and validate settings. Use after loading .env."""
    return Settings()
