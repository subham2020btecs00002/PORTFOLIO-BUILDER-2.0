"""
Google Gemini Provider Adapter.
"""
from typing import Any, Dict
import google.generativeai as genai

from app.core.config import settings
from app.core.logging import logger
from app.core.constants import LLMProviderName
from app.services.llm.base import BaseLLMProvider


class GeminiProvider(BaseLLMProvider):
    """
    Adapter for Google Gemini API.
    """

    def __init__(self):
        self._configured: bool = False
        self._initialize()

    def _initialize(self):
        if settings.GEMINI_API_KEY:
            try:
                genai.configure(api_key=settings.GEMINI_API_KEY)
                self._configured = True
                logger.info("Initialized Google Gemini provider adapter.")
            except Exception as err:
                logger.warning(f"Failed to configure Google Gemini provider: {err}")

    @property
    def name(self) -> str:
        return LLMProviderName.GEMINI.value

    def is_configured(self) -> bool:
        return self._configured

    def generate(
        self,
        model: str,
        prompt: str,
        json_mode: bool = False,
        temperature: float = 0.2,
    ) -> str:
        if not self.is_configured():
            raise ValueError("Gemini provider is not configured.")

        gen_config: Dict[str, Any] = {"temperature": temperature}
        if json_mode:
            gen_config["response_mime_type"] = "application/json"

        model_instance = genai.GenerativeModel(model, generation_config=gen_config)
        response = model_instance.generate_content(prompt)
        return response.text.strip()
