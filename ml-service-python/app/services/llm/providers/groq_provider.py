"""
Groq LPU Provider Adapter.
"""
from typing import Any, Dict, Optional
from openai import OpenAI

from app.core.config import settings
from app.core.logging import logger
from app.core.constants import (
    LLMProviderName,
    GROQ_BASE_URL,
    GROQ_TIMEOUT_SECONDS,
    JSON_SYSTEM_INSTRUCTION,
)
from app.services.llm.base import BaseLLMProvider


class GroqProvider(BaseLLMProvider):
    """
    Adapter for Groq Cloud ultra-fast LPU inference via OpenAI-compatible API.
    """

    def __init__(self):
        self._client: Optional[OpenAI] = None
        self._initialize()

    def _initialize(self):
        if settings.GROQ_API_KEY:
            try:
                self._client = OpenAI(
                    base_url=GROQ_BASE_URL,
                    api_key=settings.GROQ_API_KEY,
                    timeout=GROQ_TIMEOUT_SECONDS,
                )
                logger.info("Initialized Groq LPU provider adapter.")
            except Exception as err:
                logger.warning(f"Failed to initialize Groq provider: {err}")

    @property
    def name(self) -> str:
        return LLMProviderName.GROQ.value

    def is_configured(self) -> bool:
        return self._client is not None

    def generate(
        self,
        model: str,
        prompt: str,
        json_mode: bool = False,
        temperature: float = 0.2,
    ) -> str:
        if not self.is_configured():
            raise ValueError("Groq provider is not configured.")

        messages = []
        if json_mode:
            messages.append({"role": "system", "content": JSON_SYSTEM_INSTRUCTION})
        messages.append({"role": "user", "content": prompt})

        kwargs: Dict[str, Any] = {
            "model": model,
            "messages": messages,
            "temperature": temperature,
        }
        if json_mode:
            kwargs["response_format"] = {"type": "json_object"}

        response = self._client.chat.completions.create(**kwargs)
        return response.choices[0].message.content or ""
