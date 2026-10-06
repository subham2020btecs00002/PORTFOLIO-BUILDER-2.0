from fastapi import Header, HTTPException, status
from app.core.config import settings
from app.core.logging import logger

def verify_internal_secret(x_internal_secret: str = Header(default=None)):
    """
    Validates X-Internal-Secret on internal ML service endpoints.

    Production Zero-Downtime Behavior:
    - If INTERNAL_SECRET is set, strictly validates the incoming header.
    - If INTERNAL_SECRET is not yet configured on this instance, allows request with warning.
    - Public endpoints like /health bypass this entirely.
    """
    expected_secret = settings.INTERNAL_SECRET.strip().strip("'\"") if settings.INTERNAL_SECRET else ""
    if not expected_secret:
        return True

    incoming_secret = x_internal_secret.strip().strip("'\"") if x_internal_secret else ""
    if not incoming_secret or incoming_secret != expected_secret:
        logger.warning("Rejected unauthorized call to ML service: invalid or missing X-Internal-Secret")
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Direct access to this service is forbidden. Must use authorized internal service.",
        )
    return True
