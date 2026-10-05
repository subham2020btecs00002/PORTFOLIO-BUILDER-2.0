from fastapi import APIRouter
from app.api.v1.endpoints import (
    health_router,
    enhance_router,
    theme_router,
    resume_router,
)

api_v1_router = APIRouter()

# Health check
api_v1_router.include_router(health_router)

# ML Domain endpoints (prefixed with /api/ml to ensure 100% backward compatibility)
api_v1_router.include_router(enhance_router, prefix="/api/ml")
api_v1_router.include_router(theme_router, prefix="/api/ml")
api_v1_router.include_router(resume_router, prefix="/api/ml")
