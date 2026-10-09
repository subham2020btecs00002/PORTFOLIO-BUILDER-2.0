from typing import List, Dict, Any
from app.prompts.theme_prompts import THEME_RECOMMENDATION_PROMPT
from app.schemas.theme import ThemeRecommendationResponse
from app.services.llm_client import llm_client
from app.core.logging import logger

DEFAULT_THEME_CONFIG: Dict[str, Any] = {
    "template": "Minimalist",
    "themeColor": "ocean",
    "fontFamily": "inter",
    "borderRadius": "rounded",
    "sectionOrder": ["about", "skills", "experience", "projects", "contact"],
}

def recommend_portfolio_theme(industry: str, skills: List[str]) -> ThemeRecommendationResponse:
    """
    Analyzes user profession and skill vectors, recommending matching page layouts
    and visual variables.
    """
    if not llm_client.is_configured():
        logger.warning("Gemini API key not configured, returning default theme recommendation.")
        return ThemeRecommendationResponse(**DEFAULT_THEME_CONFIG)

    logger.info(f"Generating theme recommendation for industry: '{industry}' with {len(skills)} skills...")
    prompt = THEME_RECOMMENDATION_PROMPT.format(
        industry=industry,
        skills=", ".join(skills) if skills else "General Software Development",
    )

    try:
        raw_json = llm_client.generate_json(prompt, temperature=0.2)
        # Fill any missing required keys from default config
        for key, default_val in DEFAULT_THEME_CONFIG.items():
            if key not in raw_json:
                raw_json[key] = default_val

        logger.info(
            f"Successfully generated theme recommendation using model='{llm_client.last_model}' "
            f"({llm_client.last_provider}) in {llm_client.last_elapsed_seconds}s."
        )
        return ThemeRecommendationResponse(**raw_json)
    except Exception as err:
        logger.error(f"Error in recommend_portfolio_theme: {err}. Returning default theme.")
        return ThemeRecommendationResponse(**DEFAULT_THEME_CONFIG)

