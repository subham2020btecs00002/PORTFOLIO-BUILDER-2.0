from fastapi import APIRouter
from app.schemas.enhance import EnhanceRequest, EnhanceResponse
from app.services.text_service import enhance_portfolio_text

router = APIRouter()

@router.post("/enhance", response_model=EnhanceResponse, tags=["Enhance"])
def enhance_text_endpoint(payload: EnhanceRequest):
    """
    Polishes and rephrases resume draft sentences or descriptions to make them sound
    industry-grade and professional.
    """
    enhanced = enhance_portfolio_text(payload.text)
    return EnhanceResponse(original=payload.text, enhanced=enhanced)
