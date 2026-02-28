"""AG-UI compliant agent endpoint. Streams SSE events to the frontend."""

from __future__ import annotations

import json
import uuid

from fastapi import APIRouter, Depends, Request
from fastapi.responses import StreamingResponse

from app.core.deps import get_current_user
from app.core.rate_limit import AGENT_RATE_LIMIT, limiter
from app.models.user import User

from ag_ui.core import (
    RunAgentInput,
    RunErrorEvent,
    RunFinishedEvent,
    RunStartedEvent,
    StateDeltaEvent,
    StateSnapshotEvent,
    StepFinishedEvent,
    StepStartedEvent,
    TextMessageContentEvent,
    TextMessageEndEvent,
    TextMessageStartEvent,
)
from ag_ui.encoder import EventEncoder

from app.core.config import settings
from app.schemas.operations import operations_to_patches
from app.schemas.page_config import validate_page_config
from app.services.llm.claude_service import ClaudeService, extract_operations
from app.services.llm.gemini_service import GeminiService
from app.services.prompt import build_system_prompt

router = APIRouter(prefix="/api", tags=["agent"])

encoder = EventEncoder()


def _get_llm():
    if settings.LLM_PROVIDER == "gemini":
        return GeminiService()
    return ClaudeService()


llm = _get_llm()


def _convert_messages(ag_messages: list) -> list[dict]:
    """Convert AG-UI messages to Anthropic API format."""
    result: list[dict] = []
    for msg in ag_messages:
        # AG-UI messages are pydantic models with .role and .content
        role = msg.role if hasattr(msg, "role") else msg.get("role", "user")
        content = msg.content if hasattr(msg, "content") else msg.get("content", "")
        if role in ("user", "assistant"):
            result.append({"role": role, "content": content})
        elif role in ("system", "developer"):
            # Fold system/developer messages into the next user message
            result.append({"role": "user", "content": f"[System note]: {content}"})
    return result


async def _run_agent(body: RunAgentInput):
    """Generator that yields SSE-encoded AG-UI events."""
    thread_id = body.thread_id
    run_id = body.run_id
    msg_id = str(uuid.uuid4())

    # --- RUN_STARTED ---
    yield encoder.encode(RunStartedEvent(thread_id=thread_id, run_id=run_id))

    try:
        # --- Build prompt ---
        yield encoder.encode(StepStartedEvent(step_name="building_prompt"))

        current_config = body.state or {}
        config_json = json.dumps(current_config, indent=2) if current_config else "{}"
        system_prompt = build_system_prompt(config_json)
        messages = _convert_messages(body.messages)

        yield encoder.encode(StepFinishedEvent(step_name="building_prompt"))

        # --- Stream LLM response as plain text ---
        yield encoder.encode(StepStartedEvent(step_name="generating_response"))
        yield encoder.encode(TextMessageStartEvent(message_id=msg_id, role="assistant"))

        full_text = ""
        async for chunk in llm.stream(system_prompt, messages):
            full_text += chunk
            yield encoder.encode(
                TextMessageContentEvent(message_id=msg_id, delta=chunk)
            )

        yield encoder.encode(TextMessageEndEvent(message_id=msg_id))
        yield encoder.encode(StepFinishedEvent(step_name="generating_response"))

        # --- Parse operations from full response ---
        yield encoder.encode(StepStartedEvent(step_name="applying_operations"))

        _clean_text, operations = extract_operations(full_text)

        if operations:
            first_op = operations[0]

            if first_op.get("type") == "replace_all":
                new_config = first_op.get("config", {})
                try:
                    validate_page_config(new_config)
                except Exception:
                    pass  # Best-effort; frontend also validates
                yield encoder.encode(StateSnapshotEvent(snapshot=new_config))
            else:
                patches = operations_to_patches(operations, current_config)
                if patches:
                    yield encoder.encode(StateDeltaEvent(delta=patches))

        yield encoder.encode(StepFinishedEvent(step_name="applying_operations"))

        # --- RUN_FINISHED ---
        yield encoder.encode(RunFinishedEvent(thread_id=thread_id, run_id=run_id))

    except Exception as exc:
        yield encoder.encode(
            RunErrorEvent(message=str(exc), code="AGENT_ERROR")
        )


@router.post("/agent")
@limiter.limit(AGENT_RATE_LIMIT)
async def agent_endpoint(request: Request, user: User = Depends(get_current_user)):
    """AG-UI agent endpoint. Accepts RunAgentInput, returns SSE stream."""
    raw = await request.json()
    # Fill in required AG-UI fields the frontend may omit
    raw.setdefault("tools", [])
    raw.setdefault("context", [])
    raw.setdefault("forwardedProps", {})
    body = RunAgentInput.model_validate(raw)

    return StreamingResponse(
        _run_agent(body),
        media_type=encoder.get_content_type(),
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
        },
    )
