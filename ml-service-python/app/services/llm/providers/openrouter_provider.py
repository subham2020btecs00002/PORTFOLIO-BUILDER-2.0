"""
OpenRouter Provider Adapter.
"""
from typing import Any, Dict, Optional
from openai import OpenAI

from app.core.config import settings
from app.core.logging import logger
from app.core.constants import (
    LLMProviderName,
    OPENROUTER_BASE_URL,
    OPENROUTER_TIMEOUT_SECONDS,
    OPENROUTER_HTTP_REFERER,
    OPENROUTER_APP_TITLE,
    JSON_SYSTEM_INSTRUCTION,
)
from app.services.llm.base import BaseLLMProvider


class OpenRouterProvider(BaseLLMProvider):
    """
    Adapter for OpenRouter aggregator API via OpenAI-compatible spec.
    """

    def __init__(self):
        self._client: Optional[OpenAI] = None
        self._initialize()

    def _initialize(self):
        if settings.OPENROUTER_API_KEY:
            try:
                self._client = OpenAI(
                    base_url=OPENROUTER_BASE_URL,
                    api_key=settings.OPENROUTER_API_KEY,
                    default_headers={
                        "HTTP-Referer": OPENROUTER_HTTP_REFERER,
                        "X-Title": OPENROUTER_APP_TITLE,
                    },
                    timeout=OPENROUTER_TIMEOUT_SECONDS,
                )
                logger.info("Initialized OpenRouter provider adapter.")
            except Exception as err:
                logger.warning(f"Failed to initialize OpenRouter provider: {err}")

    @property
    def name(self) -> str:
        return LLMProviderName.OPENROUTER.value

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
            raise ValueError("OpenRouter provider is not configured.")

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
