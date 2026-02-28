"""Claude LLM service — streams responses from the Anthropic API."""

from __future__ import annotations

import json
import re
from dataclasses import dataclass, field
from typing import AsyncIterator

import anthropic

from app.core.config import settings


@dataclass
class ParsedResponse:
    """Parsed result from Claude's streamed response."""
    text: str = ""
    operations: list[dict] = field(default_factory=list)


def extract_operations(text: str) -> tuple[str, list[dict]]:
    """Extract operations JSON block from the response text.

    Returns (clean_text, operations_list).
    """
    # Find the last ```json ... ``` block
    pattern = r"```json\s*(\{[\s\S]*?\})\s*```"
    matches = list(re.finditer(pattern, text))
    if not matches:
        return text.strip(), []

    last_match = matches[-1]
    try:
        parsed = json.loads(last_match.group(1))
        operations = parsed.get("operations", [])
    except (json.JSONDecodeError, AttributeError):
        return text.strip(), []

    # Remove the JSON block from the text shown to the user
    clean_text = text[: last_match.start()].strip()
    return clean_text, operations


class ClaudeService:
    """Streams responses from the Anthropic Claude API."""

    def __init__(self) -> None:
        self.client = anthropic.AsyncAnthropic(api_key=settings.ANTHROPIC_API_KEY)
        self.model = settings.LLM_MODEL

    async def stream(
        self,
        system_prompt: str,
        messages: list[dict],
        max_tokens: int = 8192,
    ) -> AsyncIterator[str]:
        """Stream text deltas from Claude.

        Yields raw text chunks as they arrive. The caller is responsible for
        collecting the full text and extracting operations after streaming ends.
        """
        async with self.client.messages.stream(
            model=self.model,
            max_tokens=max_tokens,
            system=system_prompt,
            messages=messages,
        ) as stream:
            async for text in stream.text_stream:
                yield text
