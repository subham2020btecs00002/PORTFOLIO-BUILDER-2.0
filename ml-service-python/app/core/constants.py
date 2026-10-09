"""
Centralized application and LLM constants.
"""
from enum import Enum


class LLMProviderName(str, Enum):
    GROQ = "groq"
    OPENROUTER = "openrouter"
    GEMINI = "gemini"


# --- Provider API Endpoints & Headers ---
GROQ_BASE_URL: str = "https://api.groq.com/openai/v1"
OPENROUTER_BASE_URL: str = "https://openrouter.ai/api/v1"

OPENROUTER_HTTP_REFERER: str = "https://portfoliobuilder.dev"
OPENROUTER_APP_TITLE: str = "PortfolioBuilder 2.0"

# --- Provider Timeouts (seconds) ---
GROQ_TIMEOUT_SECONDS: float = 120.0
OPENROUTER_TIMEOUT_SECONDS: float = 120.0
GEMINI_TIMEOUT_SECONDS: float = 120.0

# --- Default Models ---
DEFAULT_GROQ_PRIMARY_MODEL: str = "qwen/qwen3.8-27b"
DEFAULT_GROQ_FALLBACK_MODEL: str = "openai/gpt-oss-120b"

DEFAULT_OPENROUTER_PRIMARY_MODEL: str = "nvidia/nemotron-3-super-120b-a12b:free"
DEFAULT_OPENROUTER_FALLBACK_MODEL: str = "liquid/lfm-2.5-2.6b:free"

DEFAULT_GEMINI_PRIMARY_MODEL: str = "gemini-2.5-flash"
DEFAULT_GEMINI_FALLBACK_MODEL: str = "gemini-3.8-flash"


# --- Provider Numeric Identifiers ---
# 1 = Groq (Ultra-fast LPU, Free)
# 2 = OpenRouter (Free community models)
# 3 = Gemini (Google AI Studio Free)
PROVIDER_NUMBERS = {
    1: LLMProviderName.GROQ.value,
    2: LLMProviderName.OPENROUTER.value,
    3: LLMProviderName.GEMINI.value,
}

# PREFERENCE ORDER:
# To change priority, simply rearrange the numbers below!
# e.g. [1, 2, 3] -> Groq is #1, OpenRouter #2, Gemini #3
# e.g. [2, 1, 3] -> OpenRouter is #1, Groq #2, Gemini #3
# e.g. [3, 1, 2] -> Gemini is #1, Groq #2, OpenRouter #3
PREFERRED_ORDER = [1, 2, 3]

DEFAULT_LLM_PROVIDER_CASCADE: str = ",".join(str(n) for n in PREFERRED_ORDER)




# --- System Prompts & JSON Instructions ---
JSON_SYSTEM_INSTRUCTION: str = (
    "You are a specialized AI assistant. You must output ONLY a valid JSON object "
    "matching the requested schema. Do not include markdown commentary or reasoning outside the JSON."
)

# --- General Defaults ---
DEFAULT_LLM_TEMPERATURE: float = 0.2
DEFAULT_JSON_TEMPERATURE: float = 0.1
DEFAULT_MAX_PDF_PAGES: int = 8
DEFAULT_MAX_PROMPT_CHARS: int = 12000
