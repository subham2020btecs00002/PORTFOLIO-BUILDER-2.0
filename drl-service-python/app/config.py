"""
Application Configuration Module.
Loads environment variables using Pydantic Settings with robust defaults.
"""

import os
from pathlib import Path
from pydantic_settings import BaseSettings, SettingsConfigDict

CURRENT_DIR = Path(__file__).resolve().parent
SERVICE_DIR = CURRENT_DIR.parent
ROOT_DIR = SERVICE_DIR.parent


class Settings(BaseSettings):
    # Server Networking
    PORT: int = 8001
    HOST: str = "0.0.0.0"
    NODE_ENV: str = "development"

    # Inter-Service Security
    INTERNAL_SECRET: str = "dev-internal-secret-change-in-production"

    # Hugging Face Model Hub Configuration
    HF_TOKEN: str = ""
    HF_MODEL_REPO_ID: str = "sk22082001/portfolio-intelligence-engine"

    # Local Artifacts Cache Directory
    ARTIFACTS_DIR: str = str(SERVICE_DIR / "artifacts")

    # MongoDB Atlas (Optional persistent store for online bandit weights)
    MONGO_URI: str = ""

    model_config = SettingsConfigDict(
        env_file=(str(SERVICE_DIR / ".env"), str(ROOT_DIR / ".env")),
        env_file_encoding="utf-8",
        extra="ignore"
    )

    @property
    def clean_repo_id(self) -> str:
        """Strips https://huggingface.co/ prefix if provided in URL format."""
        raw = self.HF_MODEL_REPO_ID.strip()
        if raw.startswith("http"):
            return raw.replace("https://huggingface.co/", "").replace("http://huggingface.co/", "").strip("/")
        return raw


settings = Settings()
