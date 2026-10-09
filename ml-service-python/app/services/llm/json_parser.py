"""
Resilient JSON extraction utilities for heterogeneous LLM outputs.
"""
import json
import re
from typing import Any, Dict


def extract_json_from_text(raw_text: str) -> Dict[str, Any]:
    """
    Parses and sanitizes LLM output into a Python dictionary.
    Handles:
      1. Reasoning models (<think>...</think> tags)
      2. Markdown code fences (```json ... ``` or ``` ... ```)
      3. Conversational prefixes / suffixes
      4. Balanced brace object extraction
    """
    if not raw_text or not raw_text.strip():
        raise json.JSONDecodeError("Empty text received for JSON parsing.", "", 0)

    # 1. Strip reasoning / thought blocks
    cleaned = re.sub(r"<think>.*?</think>", "", raw_text, flags=re.DOTALL).strip()

    # 2. Strip standard markdown code blocks
    if cleaned.startswith("```"):
        lines = cleaned.split("\n")
        if lines[0].startswith("```"):
            lines = lines[1:]
        if lines and lines[-1].startswith("```"):
            lines = lines[:-1]
        cleaned = "\n".join(lines).strip()
    elif "```json" in cleaned:
        cleaned = cleaned.split("```json", 1)[1].split("```", 1)[0].strip()
    elif "```" in cleaned:
        cleaned = cleaned.split("```", 1)[1].split("```", 1)[0].strip()

    # 3. Direct JSON parse
    try:
        return json.loads(cleaned)
    except json.JSONDecodeError:
        pass

    # 4. Outermost balanced brace extraction
    first_brace = cleaned.find("{")
    last_brace = cleaned.rfind("}")
    if first_brace != -1 and last_brace != -1 and last_brace > first_brace:
        candidate = cleaned[first_brace : last_brace + 1]
        try:
            return json.loads(candidate)
        except json.JSONDecodeError:
            pass

    raise json.JSONDecodeError("Could not extract valid JSON object from response.", cleaned, 0)
