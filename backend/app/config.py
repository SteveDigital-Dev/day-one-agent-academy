from pydantic_settings import BaseSettings
from typing import Literal


class Settings(BaseSettings):
    app_name: str = "Agent Academy"
    debug: bool = False

    database_url: str = "sqlite+aiosqlite:///./agent_academy.db"
    database_echo: bool = False

    secret_key: str = "change-me-in-production"
    access_token_expire_minutes: int = 1440

    qdrant_url: str = "http://localhost:6333"
    qdrant_collection: str = "concepts"

    ai_provider: Literal["openai", "anthropic", "ollama"] = "ollama"
    openai_api_key: str = ""
    anthropic_api_key: str = ""
    ollama_base_url: str = "http://localhost:11434"
    ollama_model: str = "qwen3:4b"

    compliance_pdf_output_dir: str = "generated/reports"
    school_year_start_month: int = 7
    school_year_start_day: int = 1

    model_config = {"env_prefix": "AA_", "env_file": ".env"}


settings = Settings()
