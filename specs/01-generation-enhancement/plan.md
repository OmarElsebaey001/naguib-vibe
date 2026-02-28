# 01 — Generation Enhancement: Implementation Plan

> Reference: `specs/01-generation-enhancement/requirements.md`

---

## Execution Order

```
Task 1 (Backend)  →  Task 2 (Frontend hook)  →  Task 3 (Operations block)  →  Task 4 (Chat panel wiring)
                                                                                         ↓
                                              Task 5 (Generation skeleton)  →  Task 6 (Preview panel wiring)
```

Tasks 1-4 = R1 (live collapsible ops block). Tasks 5-6 = R2 (animated skeleton).
Tasks 3 and 5 are independent of each other and can be done in parallel once Task 2 is done.

---

## Task 1 — Backend: Emit operations as Tool Call events

**File:** `backend/app/routers/agent.py`

### What changes

Currently, `_run_agent()` does this after the text stream ends:

```python
_clean_text, operations = extract_operations(full_text)
if operations:
    if first_op.get("type") == "replace_all":
        yield encoder.encode(StateSnapshotEvent(snapshot=new_config))
    else:
        patches = operations_to_patches(operations, current_config)
        yield encoder.encode(StateDeltaEvent(delta=patches))
```

The operations JSON is embedded *inside* the LLM's text response, extracted post-hoc with regex. The text message already streamed to the frontend — including the raw JSON the user shouldn't see.

### New flow

1. **Stream the text message as before** — the LLM still produces text with embedded JSON. No change to the LLM services (Claude/Gemini).

2. **After `TEXT_MESSAGE_END`**, run `extract_operations(full_text)` as today.

3. **If operations exist**, emit a tool call sequence *before* the state events:

```python
from ag_ui.core import ToolCallStartEvent, ToolCallArgsEvent, ToolCallEndEvent

tc_id = str(uuid.uuid4())

# 3a. TOOL_CALL_START
yield encoder.encode(ToolCallStartEvent(
    tool_call_id=tc_id,
    tool_call_name="apply_operations",
    parent_message_id=msg_id,
))

# 3b. TOOL_CALL_ARGS — chunk the JSON
ops_json = json.dumps({"operations": operations}, indent=2)
CHUNK_SIZE = 200
for i in range(0, len(ops_json), CHUNK_SIZE):
    yield encoder.encode(ToolCallArgsEvent(
        tool_call_id=tc_id,
        delta=ops_json[i:i + CHUNK_SIZE],
    ))

# 3c. TOOL_CALL_END
yield encoder.encode(ToolCallEndEvent(tool_call_id=tc_id))
```

4. **Then emit STATE_SNAPSHOT / STATE_DELTA** as before (unchanged).

5. **Strip the JSON from the streamed text.**
   Currently the text is streamed chunk-by-chunk to the frontend, and the JSON block appears during streaming. We need to strip it *before* emitting `TEXT_MESSAGE_CONTENT` events, not after.

   **Approach — buffer-and-detect during streaming:**

   The LLM text stream is currently:
   ```python
   full_text = ""
   async for chunk in llm.stream(system_prompt, messages):
       full_text += chunk
       yield encoder.encode(TextMessageContentEvent(message_id=msg_id, delta=chunk))
   ```

   Change to a **fence-aware streaming filter**:

   ```python
   full_text = ""
   text_buffer = ""
   in_json_fence = False
   json_block = ""

   async for chunk in llm.stream(system_prompt, messages):
       full_text += chunk
       text_buffer += chunk

       while text_buffer:
           if not in_json_fence:
               # Look for opening ```json
               fence_pos = text_buffer.find("```json")
               if fence_pos == -1:
                   # No fence starting — but keep last 6 chars in buffer
                   # in case "```jso" is a partial match at the boundary
                   safe = text_buffer[:-6] if len(text_buffer) > 6 else ""
                   if safe:
                       yield encoder.encode(TextMessageContentEvent(
                           message_id=msg_id, delta=safe
                       ))
                       text_buffer = text_buffer[len(safe):]
                   break
               else:
                   # Emit text before the fence
                   if fence_pos > 0:
                       yield encoder.encode(TextMessageContentEvent(
                           message_id=msg_id, delta=text_buffer[:fence_pos]
                       ))
                   in_json_fence = True
                   text_buffer = text_buffer[fence_pos + 7:]  # skip "```json"
                   json_block = ""
           else:
               # Inside fence — look for closing ```
               close_pos = text_buffer.find("```")
               if close_pos == -1:
                   json_block += text_buffer
                   text_buffer = ""
                   break
               else:
                   json_block += text_buffer[:close_pos]
                   text_buffer = text_buffer[close_pos + 3:]  # skip "```"
                   in_json_fence = False
                   # json_block now has the raw JSON — we'll use it in the
                   # tool call step later. Don't emit it as text.

   # Flush remaining safe buffer (if we ended outside a fence)
   if text_buffer and not in_json_fence:
       yield encoder.encode(TextMessageContentEvent(
           message_id=msg_id, delta=text_buffer
       ))
   ```

   This ensures the user **never** sees the JSON block in the chat — it's silently captured during streaming.

### Imports to add

```python
from ag_ui.core import ToolCallStartEvent, ToolCallArgsEvent, ToolCallEndEvent
```

These already exist in the `ag_ui.core` package (confirmed via `ag-ui-protocol>=0.1.0` in `pyproject.toml`).

### No changes to

- `backend/app/services/llm/claude_service.py` — still streams raw text
- `backend/app/services/llm/gemini_service.py` — still streams raw text
- `backend/app/services/prompt.py` — system prompt unchanged
- `backend/app/schemas/operations.py` — operations_to_patches unchanged

---

## Task 2 — Frontend hook: Subscribe to Tool Call events

**File:** `frontend/src/lib/agent/use-agent.ts`

### New state

Add a `toolCalls` map to track tool call state per assistant message:

```typescript
export interface ToolCallState {
  id: string;
  name: string;
  buffer: string;          // accumulated JSON from TOOL_CALL_ARGS deltas
  isComplete: boolean;     // true after TOOL_CALL_END
  parentMessageId: string | null;
}

// In useAgent():
const [toolCalls, setToolCalls] = useState<Map<string, ToolCallState>>(new Map());
```

### New subscriber callbacks

Add to the `subscriber` object:

```typescript
onToolCallStartEvent: ({ event }) => {
  setToolCalls((prev) => {
    const next = new Map(prev);
    next.set(event.toolCallId, {
      id: event.toolCallId,
      name: event.toolCallName,
      buffer: "",
      isComplete: false,
      parentMessageId: event.parentMessageId ?? assistantMsgIdRef.current,
    });
    return next;
  });
},

onToolCallArgsEvent: ({ event }) => {
  setToolCalls((prev) => {
    const next = new Map(prev);
    const tc = next.get(event.toolCallId);
    if (tc) {
      next.set(event.toolCallId, { ...tc, buffer: tc.buffer + event.delta });
    }
    return next;
  });
},

onToolCallEndEvent: ({ event }) => {
  setToolCalls((prev) => {
    const next = new Map(prev);
    const tc = next.get(event.toolCallId);
    if (tc) {
      next.set(event.toolCallId, { ...tc, isComplete: true });
    }
    return next;
  });
},
```

### Expose in return value

```typescript
return {
  messages,
  isLoading,
  error,
  currentStep,
  sendMessage,
  clearError,
  setInitialMessages,
  toolCalls,              // NEW
};
```

### Keep the fallback regex strip

The existing `onTextMessageEndEvent` regex that strips ```json blocks should remain as a **fallback** — it catches cases where the backend didn't emit tool call events (e.g. old sessions, error paths). But since Task 1 now strips JSON during streaming, this regex will mostly be a no-op.

### ChatMessage type — no change

The `ChatMessage` type stays `{ id, role, content }`. The tool call state is keyed separately by `toolCallId` and linked to the message via `parentMessageId`.

---

## Task 3 — New component: `OperationsBlock`

**File:** `frontend/src/components/console/operations-block.tsx` (new)

### Props

```typescript
interface OperationsBlockProps {
  toolCall: ToolCallState;
}
```

### Behavior

1. **Collapsed state (default):**
   - A compact pill/badge row below the assistant message.
   - While `!toolCall.isComplete`: pulsing violet dot + `"Applying changes..."` in zinc-400 text. Small, unobtrusive.
   - After `toolCall.isComplete`: parse `toolCall.buffer` as JSON, derive a summary string (see summary logic below), show as `▸ {summary}`. Clickable.

2. **Expanded state (on click):**
   - A dark code block (`bg-zinc-900`, `font-mono`, `text-xs`, `text-zinc-300`) with `overflow-x-auto` and `max-h-[300px] overflow-y-auto`.
   - Shows `toolCall.buffer` — this updates live as `TOOL_CALL_ARGS` deltas arrive. The user sees JSON filling in chunk by chunk.
   - The block should auto-scroll to bottom while streaming (like a terminal). Stop auto-scroll after `isComplete`.
   - Toggle button: `▾ {summary}` when expanded.

3. **Expand/collapse animation:**
   - Use a CSS transition on `max-height` + `opacity` (or `grid-template-rows: 0fr → 1fr` trick for smooth height animation).
   - Duration: `200ms ease-out`.

### Summary derivation logic

```typescript
function deriveOperationsSummary(jsonStr: string): string {
  try {
    const parsed = JSON.parse(jsonStr);
    const ops: { type: string; [key: string]: unknown }[] = parsed.operations || [];
    if (ops.length === 0) return "No changes";

    const parts: string[] = [];

    // Check for replace_all first
    const replaceAll = ops.find((o) => o.type === "replace_all");
    if (replaceAll) {
      const config = replaceAll.config as { sections?: unknown[] };
      const count = config?.sections?.length ?? 0;
      parts.push(`Page created with ${count} section${count !== 1 ? "s" : ""}`);
    }

    // Count other ops by type
    const counts: Record<string, number> = {};
    for (const op of ops) {
      if (op.type === "replace_all") continue;
      counts[op.type] = (counts[op.type] || 0) + 1;
    }

    const LABELS: Record<string, string> = {
      add_section: "section added",
      remove_section: "section removed",
      update_content: "content updated",
      swap_variant: "variant swapped",
      set_theme: "theme updated",
      reorder_sections: "sections reordered",
      move_section: "section moved",
      set_mode: "mode changed",
    };

    for (const [type, count] of Object.entries(counts)) {
      const label = LABELS[type] || type;
      parts.push(count > 1 ? `${count}× ${label}` : label);
    }

    return parts.join(" · ");
  } catch {
    return "Changes applied";
  }
}
```

### Styling

- Pill: `inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] bg-zinc-800/60 text-zinc-400 hover:bg-zinc-700/60 cursor-pointer transition-colors`
- Pulsing dot: `w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse`
- Static chevron: `▸` (collapsed) / `▾` (expanded) — no icon import needed, just text.
- Code block: `mt-2 rounded-lg bg-zinc-900 border border-zinc-800 p-3 font-mono text-xs text-zinc-300 whitespace-pre overflow-x-auto max-h-[300px] overflow-y-auto`

---

## Task 4 — Wire OperationsBlock into ChatPanel

**File:** `frontend/src/components/console/chat-panel.tsx`

### Props change

Add `toolCalls` to `ChatPanelProps`:

```typescript
import { type ToolCallState } from "@/lib/agent/use-agent";

interface ChatPanelProps {
  messages: ChatMessage[];
  isLoading: boolean;
  error: string | null;
  currentStep: string | null;
  onSendMessage: (text: string) => void;
  onClearError: () => void;
  toolCalls: Map<string, ToolCallState>;  // NEW
}
```

### Render change

After each assistant message, check if there's a tool call linked to it and render `<OperationsBlock>`:

```tsx
{messages.map((msg) => (
  <div key={msg.id} className="flex gap-3">
    {/* ... existing message rendering ... */}
    <div className="flex-1 min-w-0">
      <p className="text-xs font-medium text-zinc-400 mb-1">
        {msg.role === "user" ? "You" : "Naguib"}
      </p>
      <div className="text-sm text-zinc-200 whitespace-pre-wrap break-words leading-relaxed">
        {msg.content || <span className="text-zinc-500 italic">...</span>}
      </div>

      {/* NEW: Operations block for this message */}
      {msg.role === "assistant" && (() => {
        const tc = Array.from(toolCalls.values()).find(
          (t) => t.parentMessageId === msg.id
        );
        return tc ? <OperationsBlock toolCall={tc} /> : null;
      })()}
    </div>
  </div>
))}
```

### Console page wiring

**File:** `frontend/src/app/console/[projectId]/page.tsx`

Pass `toolCalls` from `useAgent()` to `ChatPanel`:

```tsx
const { messages, isLoading, error, currentStep, sendMessage, clearError, setInitialMessages, toolCalls } = useAgent();

// ...

<ChatPanel
  messages={messages}
  isLoading={isLoading}
  error={error}
  currentStep={currentStep}
  onSendMessage={sendMessage}
  onClearError={clearError}
  toolCalls={toolCalls}
/>
```

---

## Task 5 — New component: `GenerationSkeleton`

**File:** `frontend/src/components/console/generation-skeleton.tsx` (new)

### Structure

A vertical stack of skeleton blocks that mimic a landing page layout. 6 skeleton sections with staggered entrance:

```tsx
const SKELETON_SECTIONS = [
  { name: "header",       height: "h-16",  delay: "0ms" },
  { name: "hero",         height: "h-80",  delay: "200ms" },
  { name: "features",     height: "h-64",  delay: "400ms" },
  { name: "testimonials", height: "h-52",  delay: "600ms" },
  { name: "cta",          height: "h-40",  delay: "800ms" },
  { name: "footer",       height: "h-32",  delay: "1000ms" },
];
```

### Per-section skeleton layouts

Each skeleton section should have internal shapes that hint at the section type:

- **Header:** A horizontal bar. Left: rectangle (logo). Right: 3 small rectangles (nav links) + 1 rounded rectangle (CTA button).
- **Hero:** Two columns on desktop. Left: 2 long rectangles (headline lines) + short rectangle (subheadline) + 2 small rounded rects (buttons). Right: large rounded rectangle (image placeholder).
- **Features:** Heading rectangle centered on top. 3-column grid below with 3 cards, each containing: small square (icon) + rectangle (title) + 2 thin rectangles (description).
- **Testimonials:** Heading rectangle. 3 cards in a row, each: tall rectangle (quote) + small circle (avatar) + short rectangle (name).
- **CTA:** Centered: large rectangle (headline) + medium rectangle (description) + rounded rectangle (button).
- **Footer:** 4 columns of thin rectangles (links). Bottom: thin full-width line (copyright).

### Animation

1. **Shimmer:** Custom CSS shimmer gradient that sweeps left-to-right across all skeleton blocks. Add this as a Tailwind keyframe or inline `@keyframes`:

```css
@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}
```

Each skeleton block: `bg-gradient-to-r from-zinc-200 via-zinc-100 to-zinc-200 bg-[length:200%_100%] animate-[shimmer_1.5s_ease-in-out_infinite]`

2. **Staggered entrance:** Each section wrapper uses:

```css
opacity: 0;
animation: fadeSlideIn 500ms ease-out forwards;
animation-delay: var(--delay);

@keyframes fadeSlideIn {
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
}
```

The `--delay` is set per section (0ms, 200ms, 400ms, etc.).

### Playful text

A `div` positioned at the top of the skeleton area (or floating center) that cycles through messages:

```typescript
const LOADING_MESSAGES = [
  "Picking the perfect layout...",
  "Choosing components...",
  "Writing your copy...",
  "Applying the theme...",
  "Almost there...",
  "Making it beautiful...",
  "Assembling your page...",
  "Fine-tuning the details...",
];
```

Use a `useEffect` with `setInterval(3000)` to cycle through messages. Each message fades in/out with a CSS transition (`opacity` + `translateY`).

Styling: `text-sm font-medium text-zinc-400` centered above the skeletons, with a subtle fade transition.

### Transition out

The component accepts a `visible` prop. When `visible` changes from `true` to `false`:
- Apply `opacity-0 scale-[0.98] transition-all duration-500` to the entire skeleton wrapper.
- The parent (`PreviewPanel`) should keep the skeleton mounted for 500ms after config arrives to let the fade-out complete, then unmount.

---

## Task 6 — Wire skeleton into PreviewPanel

**File:** `frontend/src/components/console/preview-panel.tsx`

### Props change

```typescript
interface PreviewPanelProps {
  config: PageConfig | null;
  isLoading: boolean;  // NEW
}
```

### Render logic

```tsx
{/* Preview area */}
<div className="flex-1 overflow-auto flex justify-center p-4">
  <div className="bg-white shadow-lg transition-[width] duration-300 overflow-auto" style={{ ... }}>

    {/* State: generating first page */}
    {!config && isLoading && (
      <GenerationSkeleton />
    )}

    {/* State: idle, no page */}
    {!config && !isLoading && (
      <div className="flex items-center justify-center min-h-[60vh] text-zinc-400">
        {/* existing placeholder */}
      </div>
    )}

    {/* State: page exists (loading or not) */}
    {config && (
      <div className="animate-in fade-in duration-500">
        <PageRenderer config={config} />
      </div>
    )}

  </div>
</div>
```

### Crossfade

When `config` transitions from null to non-null:
- The `GenerationSkeleton` fades out (handled internally via its `visible` prop or by simply unmounting — the conditional rendering handles this).
- The `PageRenderer` wrapper has `animate-in fade-in duration-500` (Tailwind animate utility or custom keyframe).

A simpler approach that avoids mounting complexity: just let React unmount the skeleton and mount the PageRenderer. The PageRenderer wrapper gets a CSS `animation: fadeIn 500ms ease-out`:

```css
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
```

### Console page wiring

**File:** `frontend/src/app/console/[projectId]/page.tsx`

Pass `isLoading` to `PreviewPanel`:

```tsx
<PreviewPanel config={config} isLoading={isLoading} />
```

---

## Testing Checklist

### R1 — Operations Block
- [ ] Send a prompt that generates a new page → text streams without JSON visible → after text ends, a pulsing "Applying changes..." pill appears → JSON fills in if expanded → pill becomes static summary "Page created with N sections" → preview updates
- [ ] Send an edit prompt ("change the headline") → same flow, summary shows "content updated"
- [ ] Send an informational prompt ("what sections do I have?") → no operations block, just text
- [ ] Click pill to expand → see full JSON → click again to collapse → smooth animation
- [ ] Expand during streaming → see JSON filling in live → auto-scrolls → stops scrolling on complete
- [ ] Fallback: if backend embeds JSON in text (old behavior), regex still strips it from message

### R2 — Generation Skeleton
- [ ] Open a new empty project → see "No page yet" placeholder
- [ ] Send first prompt → placeholder replaced by animated skeleton → sections stagger in one by one
- [ ] Playful text rotates every 3 seconds
- [ ] Shimmer animation runs on all skeleton blocks
- [ ] Page generated → skeleton fades out, real page fades in
- [ ] Send a second prompt (editing) → preview shows the real page (no skeleton), since config exists
- [ ] Desktop/tablet/mobile viewport toggles work during skeleton display
