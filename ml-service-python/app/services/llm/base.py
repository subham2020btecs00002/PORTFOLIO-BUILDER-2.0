"""
Abstract base class for all LLM providers in the cascade system.
"""
from abc import ABC, abstractmethod


class BaseLLMProvider(ABC):
    """
    Contract that every LLM provider adapter must implement.
    """

    @property
    @abstractmethod
    def name(self) -> str:
        """Unique provider identifier (e.g. 'groq', 'openrouter', 'gemini')."""
        pass

    @abstractmethod
    def is_configured(self) -> bool:
        """Returns True if the provider has valid credentials configured."""
        pass

    @abstractmethod
    def generate(
        self,
        model: str,
        prompt: str,
        json_mode: bool = False,
        temperature: float = 0.2,
    ) -> str:
        """
        Executes a prompt against the specific provider model.
        Must return the response text or raise an exception on failure.
        """
        pass
