"""Gemini LLM service — streams responses from the Google GenAI API."""

from __future__ import annotations

from typing import AsyncIterator

from google import genai
from google.genai import types

from app.core.config import settings


class GeminiService:
    """Streams responses from the Google Gemini API."""

    def __init__(self) -> None:
        self.client = genai.Client(api_key=settings.GEMINI_API_KEY)
        self.model = settings.LLM_MODEL

    async def stream(
        self,
        system_prompt: str,
        messages: list[dict],
        max_tokens: int = 8192,
    ) -> AsyncIterator[str]:
        """Stream text deltas from Gemini.

        Yields raw text chunks as they arrive.
        """
        # Convert messages to Gemini format
        contents: list[types.Content] = []
        for msg in messages:
            role = "model" if msg["role"] == "assistant" else "user"
            contents.append(
                types.Content(
                    role=role,
                    parts=[types.Part(text=msg["content"])],
                )
            )

        config = types.GenerateContentConfig(
            system_instruction=system_prompt,
            max_output_tokens=max_tokens,
        )

        response = await self.client.aio.models.generate_content_stream(
            model=self.model,
            contents=contents,
            config=config,
        )
        async for chunk in response:
            if chunk.text:
                yield chunk.text
