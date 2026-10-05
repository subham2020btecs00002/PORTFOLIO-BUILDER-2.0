from fastapi import APIRouter
from app.schemas.common import HealthResponse

router = APIRouter()

@router.get("/health", response_model=HealthResponse, tags=["Health"])
def health_check():
    """
    Service health verification endpoint.
    """
    return HealthResponse()
