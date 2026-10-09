"""
Enterprise-grade Multi-Provider Cascade LLM Manager.
"""
import time
import json
from typing import Any, Dict, List, Optional, Tuple

from app.core.config import settings
from app.core.logging import logger
from app.core.exceptions import LLMServiceError
from app.core.constants import (
    LLMProviderName,
    PROVIDER_NUMBERS,
    DEFAULT_LLM_TEMPERATURE,
    DEFAULT_JSON_TEMPERATURE,
)
from app.services.llm.base import BaseLLMProvider
from app.services.llm.providers.groq_provider import GroqProvider
from app.services.llm.providers.openrouter_provider import OpenRouterProvider
from app.services.llm.providers.gemini_provider import GeminiProvider
from app.services.llm.json_parser import extract_json_from_text


class LLMCascadeManager:
    """
    Coordinates multi-provider failover across Groq, OpenRouter, and Gemini.
    """

    def __init__(self):
        self._providers: Dict[str, BaseLLMProvider] = {
            LLMProviderName.GROQ.value: GroqProvider(),
            LLMProviderName.OPENROUTER.value: OpenRouterProvider(),
            LLMProviderName.GEMINI.value: GeminiProvider(),
        }

        # Last execution telemetry
        self.last_provider: str = ""
        self.last_model: str = ""
        self.last_elapsed_seconds: float = 0.0

        active = self.get_active_providers()
        logger.info(f"Initialized LLMCascadeManager. Active providers: {active}")

    def _resolve_cascade_names(self) -> List[str]:
        """
        Parses cascade configuration. Supports both numbers (1, 2, 3) and names ("groq", "openrouter").
        """
        raw_items = [
            p.strip().lower()
            for p in settings.LLM_PROVIDER_CASCADE.split(",")
            if p.strip()
        ]
        resolved = []
        for item in raw_items:
            if item.isdigit():
                num = int(item)
                if num in PROVIDER_NUMBERS:
                    resolved.append(PROVIDER_NUMBERS[num])
            elif item in self._providers:
                resolved.append(item)
        return resolved

    def get_provider(self, name: str) -> Optional[BaseLLMProvider]:
        """Returns the provider adapter by name if registered."""
        return self._providers.get(name.lower())

    def get_active_providers(self) -> List[str]:
        """
        Returns configured providers sorted by priority order.
        The first element represents the primary provider.
        """
        ordered_names = self._resolve_cascade_names()
        active = [
            name for name in ordered_names
            if self._providers.get(name) and self._providers[name].is_configured()
        ]
        # Append any remaining configured providers not explicitly in the cascade
        for name, provider in self._providers.items():
            if provider.is_configured() and name not in active:
                active.append(name)
        return active

    def is_configured(self) -> bool:
        """Returns True if at least one LLM provider is active."""
        return len(self.get_active_providers()) > 0

    @property
    def primary_provider(self) -> str:
        """Returns the primary active provider name, or 'none'."""
        active = self.get_active_providers()
        return active[0] if active else "none"

    def _build_execution_pipeline(self) -> List[Tuple[str, str, BaseLLMProvider]]:
        """
        Builds the sequential failover pipeline of (provider_name, model_name, provider_instance)
        according to the configured cascade priority order.
        """
        cascade_names = self._resolve_cascade_names()

        pipeline: List[Tuple[str, str, BaseLLMProvider]] = []

        for provider_name in cascade_names:
            provider = self._providers.get(provider_name)
            if not provider or not provider.is_configured():
                continue

            if provider_name == LLMProviderName.GROQ.value:
                pipeline.append((provider_name, settings.GROQ_PRIMARY_MODEL, provider))
                if (
                    settings.GROQ_FALLBACK_MODEL
                    and settings.GROQ_FALLBACK_MODEL != settings.GROQ_PRIMARY_MODEL
                ):
                    pipeline.append((provider_name, settings.GROQ_FALLBACK_MODEL, provider))

            elif provider_name == LLMProviderName.OPENROUTER.value:
                pipeline.append((provider_name, settings.OPENROUTER_PRIMARY_MODEL, provider))
                if (
                    settings.OPENROUTER_FALLBACK_MODEL
                    and settings.OPENROUTER_FALLBACK_MODEL != settings.OPENROUTER_PRIMARY_MODEL
                ):
                    pipeline.append((provider_name, settings.OPENROUTER_FALLBACK_MODEL, provider))

            elif provider_name == LLMProviderName.GEMINI.value:
                pipeline.append((provider_name, settings.GEMINI_PRIMARY_MODEL, provider))
                if (
                    settings.GEMINI_FALLBACK_MODEL
                    and settings.GEMINI_FALLBACK_MODEL != settings.GEMINI_PRIMARY_MODEL
                ):
                    pipeline.append((provider_name, settings.GEMINI_FALLBACK_MODEL, provider))

        return pipeline

    def generate_content(
        self,
        prompt: str,
        json_mode: bool = False,
        temperature: float = DEFAULT_LLM_TEMPERATURE,
    ) -> str:
        """
        Executes prompt generation across configured providers in cascade order.
        Automatically falls back to subsequent models/providers on 429, timeouts, or errors.
        """
        if not self.is_configured():
            raise LLMServiceError("No LLM provider keys configured on the server.")

        pipeline = self._build_execution_pipeline()
        if not pipeline:
            raise LLMServiceError("No active provider models found in cascade pipeline.")

        last_error: Optional[Exception] = None

        for provider_name, model_name, provider in pipeline:
            t0 = time.time()
            logger.info(
                f"[{provider_name.upper()}] Invoking model='{model_name}' (json_mode={json_mode})..."
            )
            try:
                result = provider.generate(
                    model=model_name,
                    prompt=prompt,
                    json_mode=json_mode,
                    temperature=temperature,
                )
                elapsed = round(time.time() - t0, 2)
                if result and result.strip():
                    self.last_provider = provider_name
                    self.last_model = model_name
                    self.last_elapsed_seconds = elapsed
                    logger.info(
                        f"[{provider_name.upper()}] SUCCESS | Model: '{model_name}' | Time Taken: {elapsed}s ({int(elapsed * 1000)}ms) | json_mode={json_mode}"
                    )
                    return result.strip()
                else:
                    logger.warning(
                        f"[{provider_name.upper()}] EMPTY RESPONSE | Model: '{model_name}' in {elapsed}s. Cascading to next candidate..."
                    )
            except Exception as err:
                elapsed = round(time.time() - t0, 2)
                last_error = err
                logger.warning(
                    f"[{provider_name.upper()}] FAILED | Model: '{model_name}' | Time Taken before error: {elapsed}s | Error: {err}. Cascading..."
                )
                continue

        logger.error(f"All LLM models in cascade failed: {last_error}")
        raise LLMServiceError(f"AI generation failed across all cascade providers: {str(last_error)}")

    def generate_json(
        self,
        prompt: str,
        temperature: float = DEFAULT_JSON_TEMPERATURE,
    ) -> Dict[str, Any]:
        """
        Executes a prompt guaranteed to return a validated Python dictionary.
        """
        raw_text = self.generate_content(
            prompt,
            json_mode=True,
            temperature=temperature,
        )

        try:
            parsed = extract_json_from_text(raw_text)
            logger.info(
                f"[{self.last_provider.upper()}] JSON PARSED | Model: '{self.last_model}' | Time Taken: {self.last_elapsed_seconds}s | Extracted {len(parsed)} keys"
            )
            return parsed
        except json.JSONDecodeError as err:
            logger.error(
                f"[{self.last_provider.upper()}] JSON PARSE ERROR | Model: '{self.last_model}' | Error: {err} | Raw preview: {raw_text[:250]}"
            )
            raise LLMServiceError("Model did not return valid JSON.")

