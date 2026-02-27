from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os

from app.core.config import settings
from app.routers import agent, auth, billing, projects, uploads

app = FastAPI(title="Naguib API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_URL],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(projects.router)
app.include_router(agent.router)
app.include_router(uploads.router)
app.include_router(billing.router)

# Serve local uploads in dev (when no S3 bucket configured)
uploads_dir = os.path.join(os.path.dirname(__file__), "..", "uploads")
if not settings.AWS_S3_BUCKET and os.path.isdir(uploads_dir):
    app.mount("/uploads", StaticFiles(directory=uploads_dir), name="uploads")


@app.get("/health")
async def health():
    return {"status": "ok"}
