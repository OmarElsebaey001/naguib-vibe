"""Image upload endpoint."""

from __future__ import annotations

import os
import uuid

from fastapi import APIRouter, Depends, HTTPException, Request, UploadFile, status

from app.core.config import settings
from app.core.deps import get_current_user
from app.core.rate_limit import limiter
from app.models.user import User

router = APIRouter(prefix="/api", tags=["uploads"])

ALLOWED_TYPES = {"image/jpeg", "image/png", "image/webp", "image/svg+xml"}
MAX_SIZE = 5 * 1024 * 1024  # 5MB

UPLOADS_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "uploads")


@router.post("/upload")
@limiter.limit("30/minute")
async def upload_file(
    request: Request,
    file: UploadFile,
    user: User = Depends(get_current_user),
):
    # Validate content type
    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File type not allowed. Accepted: jpg, png, webp, svg",
        )

    # Read and validate size
    data = await file.read()
    if len(data) > MAX_SIZE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File too large. Maximum 5MB.",
        )

    # Generate unique filename
    ext = _ext_from_content_type(file.content_type)
    filename = f"{uuid.uuid4()}{ext}"

    # For now: local filesystem only (S3 support can be added later)
    os.makedirs(UPLOADS_DIR, exist_ok=True)
    filepath = os.path.join(UPLOADS_DIR, filename)

    with open(filepath, "wb") as f:
        f.write(data)

    url = f"{settings.FRONTEND_URL.replace('3003', '8002')}/uploads/{filename}"
    return {"url": url}


def _ext_from_content_type(ct: str) -> str:
    return {
        "image/jpeg": ".jpg",
        "image/png": ".png",
        "image/webp": ".webp",
        "image/svg+xml": ".svg",
    }.get(ct, ".bin")
