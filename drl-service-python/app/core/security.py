"""
Inter-Service Security & Authorization Middleware.
Enforces x-internal-secret header verification across all microservice endpoints.
"""

from fastapi import Header, HTTPException, status
from app.config import settings


async def verify_internal_secret(
    x_internal_secret: str = Header(None, alias="x-internal-secret")
):
    """
    Validates cryptographic internal secret sent by API Gateway or Portfolio Backend.
    Rejects unauthorized external requests with 403 Forbidden.
    """
    configured_secret = settings.INTERNAL_SECRET

    # If secret is configured and in production or test enforcement, validate strictly
    if configured_secret and configured_secret != "dev-internal-secret-change-in-production":
        if not x_internal_secret or x_internal_secret != configured_secret:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Forbidden: Invalid or missing inter-service secret header"
            )

    return True
