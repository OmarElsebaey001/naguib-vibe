# Implementation Log — 01-generation-enhancement

> **Spec:** specs/01-generation-enhancement/
> **Started:** 2026-02-28
> **Status:** Complete

---

## Progress

| # | Task | Status | Notes |
|---|------|--------|-------|
| 1 | Backend: Emit operations as Tool Call events | Done | Fence-aware streaming filter + tool call emission |
| 2 | Frontend hook: Subscribe to Tool Call events | Done | ToolCallState map + 3 new subscriber callbacks |
| 3 | New component: OperationsBlock | Done | Collapsible pill with live JSON streaming |
| 4 | Wire OperationsBlock into ChatPanel | Done | Linked via parentMessageId |
| 5 | New component: GenerationSkeleton | Done | 6 skeleton sections with staggered entrance |
| 6 | Wire skeleton into PreviewPanel | Done | 3-state conditional rendering |

---

## Task 1: Backend — Emit operations as Tool Call events

**Status:** Done
**Scope:** Backend

### Changes Made

**Backend:**
- `backend/app/routers/agent.py` — Rewrote `_run_agent()` streaming logic:
  1. Added imports for `ToolCallStartEvent`, `ToolCallArgsEvent`, `ToolCallEndEvent`
  2. Replaced naive chunk-by-chunk text streaming with a **fence-aware streaming filter** that detects ` ```json ` fences and silently captures JSON blocks instead of emitting them as `TEXT_MESSAGE_CONTENT`. Uses a 6-char lookback buffer to handle partial fence markers at chunk boundaries.
  3. After text streaming ends, if operations exist, emits them as `TOOL_CALL_START` → chunked `TOOL_CALL_ARGS` (200-char chunks) → `TOOL_CALL_END` before the existing `STATE_SNAPSHOT`/`STATE_DELTA` events.
  4. `parent_message_id` on the tool call links it to the assistant message for frontend association.

### Decisions & Notes

- **Decision:** Kept `extract_operations(full_text)` as the canonical operation parser — the fence filter only suppresses JSON from the text stream, the full_text still contains it for extraction.
  **Reason:** Changing the extraction logic would be a separate concern. The fence filter and extraction work on different copies of the text.

---

## Task 2: Frontend hook — Subscribe to Tool Call events

**Status:** Done
**Scope:** Frontend

### Changes Made

**Frontend:**
- `frontend/src/lib/agent/use-agent.ts` — Added:
  1. `ToolCallState` interface (exported) with `id`, `name`, `buffer`, `isComplete`, `parentMessageId`
  2. `toolCalls` state as `Map<string, ToolCallState>`
  3. Three new subscriber callbacks: `onToolCallStartEvent`, `onToolCallArgsEvent`, `onToolCallEndEvent`
  4. `toolCalls` added to the return value and `UseAgentReturn` interface
  5. Kept the existing regex fallback in `onTextMessageEndEvent` for backward compatibility

---

## Task 3: New component — OperationsBlock

**Status:** Done
**Scope:** Frontend

### Changes Made

**Frontend:**
- `frontend/src/components/console/operations-block.tsx` — New component:
  - **Collapsed pill**: Shows pulsing violet dot + "Applying changes..." while streaming, then a static summary derived from parsing the completed JSON
  - **Expanded code block**: Dark monospace block showing live JSON fill-in with auto-scroll during streaming
  - **Animation**: Uses CSS `grid-template-rows: 0fr/1fr` trick for smooth height transitions
  - **Summary derivation**: `deriveOperationsSummary()` parses the JSON and produces human-readable text (e.g. "Page created with 7 sections", "content updated · theme updated")

---

## Task 4: Wire OperationsBlock into ChatPanel

**Status:** Done
**Scope:** Frontend

### Changes Made

**Frontend:**
- `frontend/src/components/console/chat-panel.tsx` — Added `toolCalls` to props interface, imported `OperationsBlock`, renders it below each assistant message by finding the tool call with matching `parentMessageId`
- `frontend/src/app/console/[projectId]/page.tsx` — Destructures `toolCalls` from `useAgent()` and passes it to `ChatPanel`

---

## Task 5: New component — GenerationSkeleton

**Status:** Done
**Scope:** Frontend

### Changes Made

**Frontend:**
- `frontend/src/components/console/generation-skeleton.tsx` — New component with:
  - 6 skeleton section types (header, hero, features, testimonials, CTA, footer) each with internal shapes mimicking real section layouts
  - **Shimmer animation**: Custom `shimmer` keyframe with gradient sweep
  - **Staggered entrance**: Each section fades+slides in with 200ms delay increments using CSS `animation-delay`
  - **Playful text overlay**: Cycles through 8 messages every 3 seconds with a fade transition (300ms fade-out, then swap and fade-in)
  - All keyframes defined via inline `<style>` tag to keep them co-located with the component

### Decisions & Notes

- **Decision:** Used inline `<style>` for `shimmer` and `fadeSlideIn` keyframes instead of adding them to `globals.css`.
  **Reason:** These keyframes are only used by this component. Co-locating them avoids polluting the global CSS and makes the component self-contained.

---

## Task 6: Wire skeleton into PreviewPanel

**Status:** Done
**Scope:** Frontend

### Changes Made

**Frontend:**
- `frontend/src/components/console/preview-panel.tsx` — Added `isLoading` prop (optional, defaults to `false`). Changed the rendering to a 3-state conditional:
  1. `!config && isLoading` → `<GenerationSkeleton />`
  2. `!config && !isLoading` → existing static placeholder
  3. `config` → `<PageRenderer>` wrapped in a `fadeIn` animation
- `frontend/src/app/globals.css` — Added `@keyframes fadeIn` for the page renderer entrance animation
- `frontend/src/app/console/[projectId]/page.tsx` — Passes `isLoading` to `<PreviewPanel>`

---

## Summary

**Status:** Complete
**Completed:** 2026-02-28

### Files Changed

| File | Action | Task |
|------|--------|------|
| `backend/app/routers/agent.py` | Modified | Task 1 |
| `frontend/src/lib/agent/use-agent.ts` | Modified | Task 2 |
| `frontend/src/components/console/operations-block.tsx` | Created | Task 3 |
| `frontend/src/components/console/chat-panel.tsx` | Modified | Task 4 |
| `frontend/src/components/console/generation-skeleton.tsx` | Created | Task 5 |
| `frontend/src/components/console/preview-panel.tsx` | Modified | Task 6 |
| `frontend/src/app/console/[projectId]/page.tsx` | Modified | Tasks 4, 6 |
| `frontend/src/app/globals.css` | Modified | Task 6 |

### Key Decisions

1. **Fence-aware streaming filter** — Instead of stripping JSON post-hoc (which shows raw JSON during streaming), the backend now detects ```` ```json ```` fences in real-time and silently captures the content while streaming the rest as normal text. The user never sees JSON in the chat.

2. **Tool call events for operations** — Operations are emitted as AG-UI `TOOL_CALL_*` events (not embedded in text), giving the frontend a clean channel to render them in a dedicated UI (collapsible block) without interfering with the chat message.

3. **Inline `<style>` for skeleton keyframes** — Kept animation keyframes co-located with the `GenerationSkeleton` component instead of globals to maintain self-containment.

4. **Backward-compatible fallback** — The existing regex strip in `onTextMessageEndEvent` remains as a fallback for any edge case where JSON leaks into the text stream.

### Testing Notes

1. Start backend: `cd backend && source .venv/bin/activate && uvicorn app.main:app --reload --port 8002`
2. Start frontend: `cd frontend && npm run dev`
3. Open a new project in the console
4. Send a page generation prompt → verify:
   - No raw JSON in chat text during streaming
   - Pulsing "Applying changes..." pill appears below assistant message
   - Click pill to expand → see JSON filling in live
   - After completion, pill shows summary (e.g. "Page created with 7 sections")
   - Preview shows animated skeleton during first generation
   - Skeleton fades out, real page fades in when config arrives
5. Send an edit prompt → verify operations block shows relevant summary
6. Send an informational prompt → verify no operations block appears
