"""
LLM Service package exposing cascade client and utilities.
"""
from app.services.llm.base import BaseLLMProvider
from app.services.llm.json_parser import extract_json_from_text
from app.services.llm.cascade import LLMCascadeManager

# Singleton cascade instance
llm_client = LLMCascadeManager()
LLMClient = LLMCascadeManager

__all__ = [
    "llm_client",
    "LLMClient",
    "LLMCascadeManager",
    "BaseLLMProvider",
    "extract_json_from_text",
]
