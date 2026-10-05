import time
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.logging import logger
from app.core.exceptions import (
    BaseAppException,
    app_exception_handler,
    global_exception_handler,
)
from app.api.router import root_router

def create_app() -> FastAPI:
    """
    Application factory initializing middleware, routes, and exception handlers.
    """
    app = FastAPI(
        title=settings.PROJECT_NAME,
        version=settings.PROJECT_VERSION,
        description="Production FastAPI service providing LLM resume parsing, text polishing, and theme generation.",
        docs_url="/docs",
        redoc_url="/redoc",
    )

    # 1. Timing & Request Logging Middleware
    @app.middleware("http")
    async def add_process_time_header(request: Request, call_next):
        start_time = time.time()
        response = await call_next(request)
        process_time = time.time() - start_time
        response.headers["X-Process-Time"] = f"{process_time:.4f}s"
        logger.info(f"{request.method} {request.url.path} - completed in {process_time:.3f}s [status={response.status_code}]")
        return response

    # 2. CORS Middleware
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # 3. Exception Handlers
    app.add_exception_handler(BaseAppException, app_exception_handler)
    app.add_exception_handler(Exception, global_exception_handler)

    # 4. API Routes
    app.include_router(root_router)

    logger.info(f"Initialized {settings.PROJECT_NAME} (environment: {settings.ENVIRONMENT})")
    return app

app = create_app()
