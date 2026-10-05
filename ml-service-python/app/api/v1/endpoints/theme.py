from fastapi import APIRouter
from app.schemas.theme import ThemeRecommendationRequest, ThemeRecommendationResponse
from app.services.theme_service import recommend_portfolio_theme

router = APIRouter()

@router.post("/recommend-theme", response_model=ThemeRecommendationResponse, tags=["Theme Recommendation"])
def recommend_theme_endpoint(payload: ThemeRecommendationRequest):
    """
    Analyzes user profession and skill vectors, recommending matching page layouts
    and visual variables.
    """
    return recommend_portfolio_theme(payload.industry, payload.skills)
