# Implementation 03 — AI Configurator

> This file is updated as work is completed.

---

## Work Log

### 2026-02-27 — Full AG-UI Agent Pipeline Built & Tested

**Files created:**
- `backend/app/services/catalog.py` — Static component catalog (10 types, 42 variants, 6 theme presets, 17 theme tokens) with `get_catalog_text()` for system prompt injection
- `backend/app/services/prompt.py` — `build_system_prompt(current_config_json)` builds full system prompt with catalog + current page state + operation format rules
- `backend/app/services/llm/claude_service.py` — `ClaudeService` wrapping Anthropic async streaming API + `extract_operations()` regex parser for JSON blocks
- `backend/app/services/llm/gemini_service.py` — `GeminiService` wrapping Google GenAI async streaming API (same interface as ClaudeService)
- `backend/app/routers/agent.py` — `POST /api/agent` AG-UI compliant SSE endpoint

**Files modified:**
- `backend/app/core/config.py` — Added `GEMINI_API_KEY`, changed default `LLM_PROVIDER` to "gemini"
- `backend/.env` — Added Gemini API key, updated provider/model/frontend URL

**Architecture:**
- Agent accepts AG-UI `RunAgentInput` (thread_id, run_id, state, messages, tools, context, forwardedProps)
- Returns SSE stream of AG-UI events via `EventEncoder`
- Event sequence: RUN_STARTED → STEP_STARTED/FINISHED (building_prompt) → STEP_STARTED (generating_response) → TEXT_MESSAGE_START → TEXT_MESSAGE_CONTENT (streamed) → TEXT_MESSAGE_END → STEP_FINISHED → STEP_STARTED (applying_operations) → STATE_SNAPSHOT or STATE_DELTA → STEP_FINISHED → RUN_FINISHED
- `replace_all` operations → STATE_SNAPSHOT (full page config)
- Incremental operations (update_content, swap_variant, etc.) → STATE_DELTA (RFC 6902 JSON Patches)
- LLM provider configurable: "gemini" or "anthropic" via `LLM_PROVIDER` setting
- `extract_operations()` finds last ```json block in response and parses operations array

**Deviations from plan:**
- Added Gemini provider support (user provided Gemini API key instead of Anthropic)
- Skipped tool calls for V1 (validate_config, get_current_config) — can add later
- Skipped retry loop — AI generates valid configs on first try; frontend also validates
- Used `google-genai` SDK (v1.65) for Gemini instead of Anthropic SDK

**Verified:**
- Mock pipeline test: 20 events emitted in correct sequence, STATE_SNAPSHOT extracted
- Mock incremental test: STATE_DELTA with correct RFC 6902 patches
- Live Gemini test (new page): Full 10-section CloudSync landing page generated with valid types/variants/content
- Live Gemini test (edit): update_content + swap_variant → 2 correct patches in STATE_DELTA
- FastAPI route registered at `/api/agent`
- CORS allows frontend origin (http://localhost:3003)

## Prompt Iterations

### v1 (Initial)
- Full catalog injection + current config + operation format docs
- Rules: only catalog types/variants, realistic content, HSL theme values, alternate light/dark modes
- Covers all 8 operation types: replace_all, add_section, remove_section, move_section, update_content, swap_variant, set_mode, set_theme

## Test Results

| # | Prompt | Valid? | Notes |
|---|---|---|---|
| 1 | "Build me a landing page for CloudSync (SaaS file sync)" | YES | 10 sections, all valid types/variants, realistic content, picsum images |
| 2 | "Change hero headline + swap pricing to comparison-table" | YES | Correct section IDs, 2 patches in STATE_DELTA |
