import logging
import os
import traceback

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from sqlalchemy import text

from app.core.config import settings
from app.core.database import async_session
from app.core.rate_limit import limiter
from app.routers import agent, auth, billing, projects, uploads

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(name)s: %(message)s")
logger = logging.getLogger("naguib")

app = FastAPI(title="Naguib API", version="0.1.0")

# --- Rate limiter ---
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# --- CORS ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_URL],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# --- Global error handlers ---
@app.exception_handler(RequestValidationError)
async def validation_error_handler(request: Request, exc: RequestValidationError):
    errors = exc.errors()
    details = [{"field": ".".join(str(l) for l in e.get("loc", [])), "message": e.get("msg", "")} for e in errors]
    return JSONResponse(status_code=422, content={"detail": "Validation error", "errors": details})


@app.exception_handler(Exception)
async def unhandled_error_handler(request: Request, exc: Exception):
    logger.error("Unhandled error on %s %s: %s", request.method, request.url.path, exc)
    logger.debug(traceback.format_exc())
    return JSONResponse(status_code=500, content={"detail": "Internal server error"})


# --- Routers ---
app.include_router(auth.router)
app.include_router(projects.router)
app.include_router(agent.router)
app.include_router(uploads.router)
app.include_router(billing.router)

# Serve local uploads in dev (when no S3 bucket configured)
uploads_dir = os.path.join(os.path.dirname(__file__), "..", "uploads")
if not settings.AWS_S3_BUCKET:
    os.makedirs(uploads_dir, exist_ok=True)
    app.mount("/uploads", StaticFiles(directory=uploads_dir), name="uploads")


@app.get("/health")
async def health():
    """Health check with database connectivity test."""
    try:
        async with async_session() as session:
            await session.execute(text("SELECT 1"))
        return {"status": "ok", "database": "connected"}
    except Exception as exc:
        logger.error("Health check failed: %s", exc)
        return JSONResponse(status_code=503, content={"status": "unhealthy", "database": "disconnected"})
