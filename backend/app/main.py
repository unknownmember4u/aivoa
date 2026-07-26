import logging
import time
from contextlib import asynccontextmanager
from fastapi import FastAPI, Depends, Request
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.ext.asyncio import AsyncSession

from app.config.settings import settings
from app.api.v1.router import api_router
from app.db.session import get_db
from app.utils.logger import setup_logging

# Configure structured logging
setup_logging()
logger = logging.getLogger("backend_timing_audit")

@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Startup and shutdown lifespan events.
    """
    logger.info("Application starting up...", extra={"environment": settings.ENVIRONMENT, "version": settings.APP_VERSION})
    yield
    logger.info("Application shutting down...")

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.APP_VERSION,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    lifespan=lifespan,
)

# Custom Request Timing Audit Middleware
@app.middleware("http")
async def request_timing_middleware(request: Request, call_next):
    start_time = time.perf_counter()
    req_timestamp = time.strftime("%Y-%m-%dT%H:%M:%S", time.localtime())
    
    # Process request
    response = await call_next(request)
    
    end_time = time.perf_counter()
    duration_ms = round((end_time - start_time) * 1000, 2)
    
    logger.info(
        f"[BACKEND TIMING AUDIT] [{req_timestamp}] "
        f"Method: {request.method} | Path: {request.url.path} | Status: {response.status_code} | Duration: {duration_ms}ms"
    )
    response.headers["X-Response-Time-Ms"] = str(duration_ms)
    return response

# Set up CORS configuration
if settings.BACKEND_CORS_ORIGINS:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=[str(origin) for origin in settings.BACKEND_CORS_ORIGINS],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

# Include v1 API Router
app.include_router(api_router, prefix=settings.API_V1_STR)

@app.get("/health", tags=["System"])
async def health_check(db: AsyncSession = Depends(get_db)):
    """
    Health check endpoint to verify API version, environment, and DB connectivity.
    """
    return {
        "status": "healthy",
        "version": settings.APP_VERSION,
        "environment": settings.ENVIRONMENT,
        "database": "connected"
    }
