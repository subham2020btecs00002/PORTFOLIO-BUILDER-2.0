from app.prompts.enhance_prompts import ENHANCE_TEXT_PROMPT
from app.services.llm_client import llm_client
from app.core.logging import logger

def enhance_portfolio_text(text: str) -> str:
    """
    Polishes and rephrases user-written portfolio descriptions, bios, and bullet points.
    """
    if not llm_client.is_configured():
        return f"[Simulated Enhance] {text} (API Key not configured)"

    logger.info(f"Enhancing text snippet ({len(text)} chars)...")
    prompt = ENHANCE_TEXT_PROMPT.format(text=text)
    enhanced = llm_client.generate_content(prompt, json_mode=False, temperature=0.7)
    logger.info(
        f"Successfully enhanced text using model='{llm_client.last_model}' "
        f"({llm_client.last_provider}) in {llm_client.last_elapsed_seconds}s."
    )
    return enhanced

