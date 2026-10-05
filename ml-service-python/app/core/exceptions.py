from fastapi import Request, status
from fastapi.responses import JSONResponse
from app.core.logging import logger

class BaseAppException(Exception):
    """Base class for all domain application exceptions."""
    def __init__(self, message: str, status_code: int = status.HTTP_500_INTERNAL_SERVER_ERROR):
        self.message = message
        self.status_code = status_code
        super().__init__(self.message)

class PDFProcessingError(BaseAppException):
    def __init__(self, message: str = "Failed to parse or extract text from PDF document"):
        super().__init__(message=message, status_code=status.HTTP_400_BAD_REQUEST)

class LLMServiceError(BaseAppException):
    def __init__(self, message: str = "External AI service failed to process request"):
        super().__init__(message=message, status_code=status.HTTP_502_BAD_GATEWAY)

async def app_exception_handler(request: Request, exc: BaseAppException) -> JSONResponse:
    """Handles all domain exceptions with structured error responses."""
    logger.error(f"Application error on {request.method} {request.url.path}: {exc.message}")
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.message, "error_type": exc.__class__.__name__},
    )

async def global_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    """Catches unhandled errors and prevents raw stack traces leaking to clients."""
    logger.exception(f"Unhandled error on {request.method} {request.url.path}: {str(exc)}")
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "An internal server error occurred.", "error_type": "InternalServerError"},
    )
