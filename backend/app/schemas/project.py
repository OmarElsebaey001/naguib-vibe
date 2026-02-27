from __future__ import annotations

from typing import Any

from pydantic import BaseModel


class CreateProjectRequest(BaseModel):
    name: str


class UpdateProjectRequest(BaseModel):
    config: dict[str, Any] | None = None
    conversation_history: list[dict[str, Any]] | None = None
    name: str | None = None


class ProjectSummary(BaseModel):
    id: str
    name: str
    thumbnail_url: str | None = None
    created_at: str
    updated_at: str


class ProjectDetail(BaseModel):
    id: str
    name: str
    config: dict[str, Any] | None = None
    conversation_history: list[dict[str, Any]] = []
    created_at: str
    updated_at: str
