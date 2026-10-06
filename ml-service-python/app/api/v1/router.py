from fastapi import APIRouter, Depends
from app.core.security import verify_internal_secret
from app.api.v1.endpoints import (
    health_router,
    enhance_router,
    theme_router,
    resume_router,
)

api_v1_router = APIRouter()

# 1. Health check - PUBLIC (polled by cron-job.org and platform heartbeat)
api_v1_router.include_router(health_router)

# 2. ML Domain endpoints - Protected by X-Internal-Secret
ml_protected_router = APIRouter(dependencies=[Depends(verify_internal_secret)])
ml_protected_router.include_router(enhance_router, prefix="/api/ml")
ml_protected_router.include_router(theme_router, prefix="/api/ml")
ml_protected_router.include_router(resume_router, prefix="/api/ml")

api_v1_router.include_router(ml_protected_router)
