"""Project CRUD endpoints."""

from __future__ import annotations

from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.database import get_db
from app.core.deps import get_current_user
from app.core.rate_limit import limiter
from app.models.project import Project
from app.models.user import User
from app.schemas.project import (
    CreateProjectRequest,
    ProjectDetail,
    ProjectSummary,
    UpdateProjectRequest,
)

router = APIRouter(prefix="/api/projects", tags=["projects"])


@router.post("", response_model=ProjectSummary, status_code=status.HTTP_201_CREATED)
@limiter.limit("10/minute")
async def create_project(
    request: Request,
    body: CreateProjectRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    # Enforce project limit for free tier
    if user.tier == "free":
        count_result = await db.execute(
            select(func.count()).select_from(Project).where(Project.user_id == user.id)
        )
        project_count = count_result.scalar_one()
        if project_count >= settings.FREE_PROJECT_LIMIT:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Free plan allows {settings.FREE_PROJECT_LIMIT} project(s). Upgrade to Pro for unlimited projects.",
            )

    project = Project(user_id=user.id, name=body.name)
    db.add(project)
    await db.commit()
    await db.refresh(project)

    return ProjectSummary(
        id=str(project.id),
        name=project.name,
        thumbnail_url=project.thumbnail_url,
        created_at=project.created_at.isoformat(),
        updated_at=project.updated_at.isoformat(),
    )


@router.get("", response_model=list[ProjectSummary])
async def list_projects(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Project)
        .where(Project.user_id == user.id)
        .order_by(Project.updated_at.desc())
    )
    projects = result.scalars().all()

    return [
        ProjectSummary(
            id=str(p.id),
            name=p.name,
            thumbnail_url=p.thumbnail_url,
            created_at=p.created_at.isoformat(),
            updated_at=p.updated_at.isoformat(),
        )
        for p in projects
    ]


@router.get("/{project_id}", response_model=ProjectDetail)
async def get_project(
    project_id: str,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    project = await _get_owned_project(project_id, user, db)

    return ProjectDetail(
        id=str(project.id),
        name=project.name,
        config=project.config,
        conversation_history=project.conversation_history or [],
        created_at=project.created_at.isoformat(),
        updated_at=project.updated_at.isoformat(),
    )


@router.put("/{project_id}", response_model=ProjectDetail)
async def update_project(
    project_id: str,
    body: UpdateProjectRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    project = await _get_owned_project(project_id, user, db)

    if body.name is not None:
        project.name = body.name
    if body.config is not None:
        project.config = body.config
    if body.conversation_history is not None:
        project.conversation_history = body.conversation_history

    project.updated_at = datetime.utcnow()
    await db.commit()
    await db.refresh(project)

    return ProjectDetail(
        id=str(project.id),
        name=project.name,
        config=project.config,
        conversation_history=project.conversation_history or [],
        created_at=project.created_at.isoformat(),
        updated_at=project.updated_at.isoformat(),
    )


@router.delete("/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_project(
    project_id: str,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    project = await _get_owned_project(project_id, user, db)
    await db.delete(project)
    await db.commit()


async def _get_owned_project(project_id: str, user: User, db: AsyncSession) -> Project:
    """Fetch project and verify ownership."""
    result = await db.execute(select(Project).where(Project.id == project_id))
    project = result.scalar_one_or_none()

    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")
    if project.user_id != user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not your project")

    return project
