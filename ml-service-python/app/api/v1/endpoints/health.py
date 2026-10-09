from fastapi import APIRouter
from app.schemas.common import HealthResponse
from app.services.llm_client import llm_client

router = APIRouter()

@router.get("/", response_model=HealthResponse, tags=["Health"])
@router.get("/health", response_model=HealthResponse, tags=["Health"])
def health_check():
    """
    Service health verification endpoint reporting active cascade providers.
    """
    active = llm_client.get_active_providers()
    primary = active[0] if active else "none"
    return HealthResponse(
        status="healthy",
        service="portfolio-ml-service",
        version="1.0.0",
        active_providers=active,
        primary_provider=primary,
    )
