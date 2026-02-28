"""Per-user rate limiting using slowapi."""

from __future__ import annotations

from fastapi import Request
from slowapi import Limiter

from app.core.config import settings


def _get_user_id(request: Request) -> str:
    """Extract user_id from the request state (set by auth dependency).

    Falls back to client IP for unauthenticated endpoints.
    """
    # After get_current_user runs, we stash user.id on request state
    user = getattr(request.state, "current_user", None)
    if user:
        return str(user.id)
    # Fallback to IP for unauthenticated routes
    return request.client.host if request.client else "unknown"


limiter = Limiter(key_func=_get_user_id)


AGENT_RATE_LIMIT = f"{settings.FREE_MESSAGES_PER_DAY}/day"
