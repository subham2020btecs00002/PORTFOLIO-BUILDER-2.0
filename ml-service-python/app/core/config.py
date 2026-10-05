from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field
from functools import lru_cache

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

    # AI / LLM configuration
    GEMINI_API_KEY: str = ""
    PRIMARY_LLM_MODEL: str = "gemini-3.5-flash-lite"
    FALLBACK_LLM_MODEL: str = "gemini-2.5-flash"

    # PDF Processing limits
    MAX_PDF_PAGES: int = 8
    MAX_PROMPT_CHARS: int = 12000

@lru_cache()
def get_settings() -> Settings:
    """Returns cached settings instance."""
    return Settings()

settings = get_settings()
