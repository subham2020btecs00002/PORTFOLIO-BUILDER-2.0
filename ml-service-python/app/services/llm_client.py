import time
import json
from typing import Any, Dict, List
import google.generativeai as genai
from app.core.config import settings
from app.core.logging import logger
from app.core.exceptions import LLMServiceError

class LLMClient:
    """
    Production-grade Gemini LLM client supporting primary/fallback models,
    native JSON schema mode, and latency monitoring.
    """
    def __init__(self):
        self.api_key = settings.GEMINI_API_KEY
        if self.api_key:
            genai.configure(api_key=self.api_key)
            logger.info("Configured Google Gemini API client.")
        else:
            logger.warning("GEMINI_API_KEY is not set in environment variables.")

        self.models_cascade: List[str] = [
            settings.PRIMARY_LLM_MODEL,
            settings.FALLBACK_LLM_MODEL,
        ]

    def is_configured(self) -> bool:
        return bool(self.api_key)

    def generate_content(
        self,
        prompt: str,
        json_mode: bool = False,
        temperature: float = 0.2,
    ) -> str:
        """
        Executes prompt generation across cascade models, returning the raw text string.
        """
        if not self.is_configured():
            raise LLMServiceError("Gemini API key is not configured on the server.")

        gen_config = {"temperature": temperature}
        if json_mode:
            gen_config["response_mime_type"] = "application/json"

        last_error = None
        for model_name in self.models_cascade:
            t0 = time.time()
            try:
                model = genai.GenerativeModel(model_name, generation_config=gen_config)
                response = model.generate_content(prompt)
                elapsed = round(time.time() - t0, 2)
                logger.info(f"Generated response using '{model_name}' in {elapsed}s (json_mode={json_mode})")
                return response.text.strip()
            except Exception as err:
                elapsed = round(time.time() - t0, 2)
                last_error = err
                logger.warning(f"Model '{model_name}' failed after {elapsed}s: {err}. Attempting fallback...")
                continue

        logger.error(f"All LLM models in cascade failed: {last_error}")
        raise LLMServiceError(f"AI generation failed across all models: {str(last_error)}")

    def generate_json(self, prompt: str, temperature: float = 0.1) -> Dict[str, Any]:
        """
        Executes a prompt guaranteed to return a parsed Python dictionary.
        """
        raw_text = self.generate_content(prompt, json_mode=True, temperature=temperature)
        
        # Defensive cleanup in case markdown block is included
        cleaned_text = raw_text
        if cleaned_text.startswith("```"):
            lines = cleaned_text.split("\n")
            if lines[0].startswith("```"):
                lines = lines[1:]
            if lines[-1].startswith("```"):
                lines = lines[:-1]
            cleaned_text = "\n".join(lines).strip()

        try:
            return json.loads(cleaned_text)
        except json.JSONDecodeError as err:
            logger.error(f"Failed to parse LLM JSON response: {err} | Raw output: {raw_text[:200]}")
            raise LLMServiceError("Model did not return valid JSON.")

llm_client = LLMClient()
