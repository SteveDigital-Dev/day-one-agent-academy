from pydantic_settings import BaseSettings
from typing import Literal

# Placeholder secret_key values that have appeared in this repo's own
# config default and .env.example - both are public knowledge (the default
# lives in source, the .env.example one is committed), so if either is
# still in use, anyone can forge a JWT for any user id and skip login/
# registration entirely.
INSECURE_SECRET_KEYS = {
    "change-me-in-production",
    "change-me-to-a-random-secret",
    "change-me-to-a-real-random-secret-value-please",
}

# RFC 7518 3.2: HS256 keys shorter than the hash output size (32 bytes)
# are weaker than the algorithm intends. PyJWT warns on this at decode
# time (InsecureKeyLengthWarning); enforce it once at startup instead of
# letting it fire as noise on every single request.
MIN_SECRET_KEY_LENGTH = 32


class Settings(BaseSettings):
    app_name: str = "Agent Academy"
    debug: bool = False

    database_url: str = "sqlite+aiosqlite:///./agent_academy.db"
    database_echo: bool = False

    secret_key: str = "change-me-in-production"
    access_token_expire_minutes: int = 1440

    # Comma-separated list of allowed frontend origins for CORS. The
    # dev default matches the documented Vite dev server port; production
    # deployments must override this via AA_CORS_ORIGINS.
    cors_origins: str = "http://localhost:5173"

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

    @property
    def cors_origins_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]


settings = Settings()

# debug=True (the documented local-dev setting, set by .env.example) is the
# only case where running with a known placeholder secret is acceptable.
# debug=False is both the bare class default (no .env at all) and the
# expected production posture, so that's exactly when this must be enforced.
if not settings.debug and settings.secret_key in INSECURE_SECRET_KEYS:
    raise RuntimeError(
        "AA_SECRET_KEY is still set to a known placeholder value. This signs "
        "every JWT in the app - anyone who reads this repo's source can forge "
        "a valid token for any user id. Set AA_SECRET_KEY to a real random "
        "value (e.g. `python -c \"import secrets; print(secrets.token_urlsafe(32))\"`) "
        "before running outside of local development (AA_DEBUG=true)."
    )

if not settings.debug and len(settings.secret_key) < MIN_SECRET_KEY_LENGTH:
    raise RuntimeError(
        f"AA_SECRET_KEY is only {len(settings.secret_key)} characters - RFC 7518 "
        f"recommends at least {MIN_SECRET_KEY_LENGTH} for HS256 (PyJWT will warn on "
        "every decode otherwise, since a short key is weaker than the algorithm "
        "intends). Set AA_SECRET_KEY to a real random value (e.g. "
        "`python -c \"import secrets; print(secrets.token_urlsafe(32))\"`)."
    )
