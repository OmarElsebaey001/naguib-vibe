# 01 — Generation Enhancement

## Problem

Two UX issues degrade the page generation experience:

1. **Raw JSON leaks into chat.** During streaming, the LLM's response includes a JSON operations block (e.g. `replace_all` with full config). The `useAgent` hook strips it *after* the message ends (`onTextMessageEndEvent`), but while streaming, the user sees raw JSON scrolling through the chat. This looks broken and technical — not the polished experience we want.

2. **Blank preview is dead space.** When a project is new (no config), the preview panel shows a static "No page yet" message. The user sends their first prompt and then stares at this dead panel for 3-5 seconds while the AI works. There's no delight, no feedback, no sense that something impressive is about to happen.

---

## Requirements

### R1 — Live Collapsible Operations Block

**Current behavior:** JSON operations stream visibly into the assistant message bubble as raw text. After the message ends, regex strips the JSON — but the user already saw the mess.

**Target behavior:** The user never sees raw JSON inline. Instead, operations are streamed into a **live, animated, collapsible block** below the assistant message — the user can click to expand and watch the JSON fill in character by character in real time.

#### Architecture: Use AG-UI Tool Call Events

The AG-UI protocol already has the perfect mechanism for this: **Tool Call Events** (`TOOL_CALL_START` → `TOOL_CALL_ARGS` → `TOOL_CALL_END`). The spec says:

> *"This streaming approach allows frontends to show tool executions in real-time, making the agent's actions transparent."*
> *"Frontends can progressively reveal these arguments to users, providing insight into exactly what parameters are being passed to tools."*

**Backend change:** Instead of embedding the JSON operations block inside the text message, the backend should emit the operations as a **tool call stream**:

1. After the text message ends, emit `TOOL_CALL_START` with `toolCallName: "apply_operations"` and a unique `toolCallId`.
2. Stream the JSON operations content via `TOOL_CALL_ARGS` events (delta chunks) — the same way the LLM streams text, but into the tool call channel.
3. Emit `TOOL_CALL_END` when done.
4. Continue with `STATE_SNAPSHOT` / `STATE_DELTA` as before.

This cleanly separates the conversational text (which the user reads) from the operations data (which powers the preview update).

#### Frontend: Live Collapsible UI

The `useAgent` hook subscribes to `onToolCallStartEvent`, `onToolCallArgsEvent`, `onToolCallEndEvent`. The chat panel renders a collapsible block per tool call:

- **Collapsed (default):** A compact animated pill below the assistant message:
  - While streaming: pulsing dot + `"Applying changes..."` — the user knows something is happening.
  - After complete: static summary, e.g. `▸ Page created with 7 sections · theme applied` — derived from parsing the final JSON.
- **Expanded (on click):** A styled code block (monospace, dark background, scrollable) that shows the JSON **filling in live** as `TOOL_CALL_ARGS` deltas arrive. The text appears character by character / chunk by chunk, like watching code being typed. After the tool call ends, the full JSON is shown.
- **Smooth expand/collapse animation:** Height transition with `overflow: hidden` + `max-height` or similar. Not an abrupt show/hide.

#### Summary text derivation (from the completed JSON)

Once `TOOL_CALL_END` fires and the full JSON is assembled, parse the operations and derive a human-readable summary for the collapsed pill:

| Operation | Summary text |
|-----------|-------------|
| `replace_all` | "Page created with N sections" |
| `add_section` | "Added [type] section" |
| `remove_section` | "Removed section" |
| `update_content` | "Updated content" |
| `swap_variant` | "Swapped variant" |
| `set_theme` | "Theme updated" |
| `reorder_sections` | "Reordered sections" |
| Multiple ops | Combine, e.g. "Page created with 7 sections · theme applied" |

If no tool call was emitted (informational response, no operations), show nothing extra — just the text message.

#### Fallback

If for any reason the backend still embeds JSON in the text (e.g. older sessions, error paths), the frontend should still strip it from the displayed message on `onTextMessageEndEvent` as it does today — but this becomes the fallback, not the primary path.

**Scope:**
- `backend/app/routers/agent.py` — emit operations as `TOOL_CALL_START` → `TOOL_CALL_ARGS` → `TOOL_CALL_END` events instead of embedding in text. The JSON can be chunked into reasonable deltas (e.g. line-by-line or ~200 char chunks).
- `frontend/src/lib/agent/use-agent.ts` — subscribe to `onToolCallStartEvent`, `onToolCallArgsEvent`, `onToolCallEndEvent`. Buffer the streaming JSON. Expose tool call state (id, name, streaming content, isComplete) per assistant message.
- `frontend/src/components/console/chat-panel.tsx` — render the live collapsible operations block below assistant messages that have an associated tool call.
- New component: `frontend/src/components/console/operations-block.tsx` — the collapsible block with live JSON streaming display + summary pill.

### R2 — Animated Skeleton Preview (First Generation)

**Current behavior:** `preview-panel.tsx` shows a centered "No page yet / Send a message" placeholder when `config` is null.

**Target behavior:** When the AI is actively generating the first page (config is null AND `isLoading` is true), replace the dead placeholder with an **animated skeleton preview** that mimics a real landing page being assembled:

- **Layout:** A vertical stack of skeleton blocks that mirror real section shapes:
  - Header skeleton: horizontal bar at top (logo left, nav items right)
  - Hero skeleton: large block with headline lines + CTA button shape + image placeholder
  - Features skeleton: 3-column grid of cards
  - Testimonials skeleton: row of quote cards
  - CTA skeleton: centered block with headline + button
  - Footer skeleton: multi-column grid
- **Animation:**
  - Shimmer/pulse animation on all skeleton blocks (Tailwind's `animate-pulse` or a custom shimmer gradient).
  - Sections should **stagger in** — appear one by one with a slight delay (200-400ms between each), as if the page is being assembled in real time. Use CSS animations, not JS timers.
- **Playful text overlay:** While skeletons animate, show rotating text messages in a semi-transparent overlay or integrated into the skeleton area. Messages cycle every 2-3 seconds:
  - "Picking the perfect layout..."
  - "Choosing components..."
  - "Writing your copy..."
  - "Applying the theme..."
  - "Almost there..."
  - "Making it beautiful..."
  - "Assembling your page..."
  - "Fine-tuning the details..."
- **Transition out:** When `config` becomes non-null (page generated), the skeletons should fade/dissolve away and the real page fades in. A smooth crossfade, not an abrupt swap.

**States summary for preview panel:**
| `config` | `isLoading` | What to show |
|----------|-------------|--------------|
| `null` | `false` | Static placeholder ("No page yet") — keep current |
| `null` | `true` | Animated skeleton + playful text |
| exists | `true` | Real page (PageRenderer) — AI is editing, not generating |
| exists | `false` | Real page (PageRenderer) — idle state |

**Scope:**
- `preview-panel.tsx` — add the skeleton state and pass `isLoading` as a prop.
- New component: `generation-skeleton.tsx` in `components/console/` — the animated skeleton layout.
- Console page (`console/[projectId]/page.tsx`) — pass `isLoading` down to `PreviewPanel`.

---

## Out of Scope

- Markdown rendering in chat messages (future enhancement).
- Progress bar or percentage indicator (too fake — we don't know actual progress).
- Sound effects or haptic feedback.
- JSON syntax highlighting with color tokens (plain monospace is fine for V1; can add a lightweight highlighter later).
- Multi-turn tool calls or `TOOL_CALL_RESULT` from the frontend — R1 is a display-only tool call (backend emits it, frontend renders it, no round-trip needed).

---

## Files Affected

| File | Change |
|------|--------|
| `backend/app/routers/agent.py` | Emit operations as `TOOL_CALL_START` → `TOOL_CALL_ARGS` → `TOOL_CALL_END` instead of embedding JSON in text |
| `frontend/src/lib/agent/use-agent.ts` | Subscribe to tool call events; buffer streaming JSON; expose tool call state per message |
| `frontend/src/components/console/chat-panel.tsx` | Render `OperationsBlock` below assistant messages with tool calls |
| `frontend/src/components/console/operations-block.tsx` | New — live collapsible block: animated pill + streaming JSON code view |
| `frontend/src/components/console/preview-panel.tsx` | Accept `isLoading` prop; render skeleton state |
| `frontend/src/components/console/generation-skeleton.tsx` | New — animated skeleton component |
| `frontend/src/app/console/[projectId]/page.tsx` | Pass `isLoading` to PreviewPanel |
