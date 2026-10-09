from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field
from functools import lru_cache

from app.core.constants import (
    DEFAULT_GROQ_PRIMARY_MODEL,
    DEFAULT_GROQ_FALLBACK_MODEL,
    DEFAULT_OPENROUTER_PRIMARY_MODEL,
    DEFAULT_OPENROUTER_FALLBACK_MODEL,
    DEFAULT_GEMINI_PRIMARY_MODEL,
    DEFAULT_GEMINI_FALLBACK_MODEL,
    DEFAULT_LLM_PROVIDER_CASCADE,
    DEFAULT_MAX_PDF_PAGES,
    DEFAULT_MAX_PROMPT_CHARS,
)

class Settings(BaseSettings):
    """
    Centralized application configuration loaded from environment variables and .env file.
    """
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    # Service details
    PROJECT_NAME: str = "Portfolio Builder ML Service"
    PROJECT_VERSION: str = "1.0.0"
    NODE_ENV: str = "development"
    ENVIRONMENT: str = "development"
    PORT: int = 8000
    HOST: str = "0.0.0.0"

    # Security
    INTERNAL_SECRET: str = Field(default="", description="Shared secret for inter-service communication")

    # AI / Multi-Provider LLM Configuration
    GROQ_API_KEY: str = ""
    GROQ_PRIMARY_MODEL: str = DEFAULT_GROQ_PRIMARY_MODEL
    GROQ_FALLBACK_MODEL: str = DEFAULT_GROQ_FALLBACK_MODEL

    OPENROUTER_API_KEY: str = ""
    OPENROUTER_PRIMARY_MODEL: str = DEFAULT_OPENROUTER_PRIMARY_MODEL
    OPENROUTER_FALLBACK_MODEL: str = DEFAULT_OPENROUTER_FALLBACK_MODEL

    GEMINI_API_KEY: str = ""
    GEMINI_PRIMARY_MODEL: str = DEFAULT_GEMINI_PRIMARY_MODEL
    GEMINI_FALLBACK_MODEL: str = DEFAULT_GEMINI_FALLBACK_MODEL

    # Cascade order: comma-separated priority
    LLM_PROVIDER_CASCADE: str = DEFAULT_LLM_PROVIDER_CASCADE

    # Legacy compatibility fields
    PRIMARY_LLM_MODEL: str = DEFAULT_GROQ_PRIMARY_MODEL
    FALLBACK_LLM_MODEL: str = DEFAULT_GEMINI_PRIMARY_MODEL

    # PDF Processing limits
    MAX_PDF_PAGES: int = DEFAULT_MAX_PDF_PAGES
    MAX_PROMPT_CHARS: int = DEFAULT_MAX_PROMPT_CHARS


@lru_cache()
def get_settings() -> Settings:
    """Returns cached settings instance."""
    return Settings()

settings = get_settings()
