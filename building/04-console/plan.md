# Plan 04 — Console (AG-UI Client)

> Status: `NOT STARTED`

---

## Goal

Build the web application UI — the Lovable-style interface where users chat with the AI and see their page update in real time. The console uses **`@ag-ui/client` HttpAgent** to connect to the AG-UI agent backend (Plan 03), subscribing to an Observable event stream for real-time text streaming, state sync, tool execution, and activity tracking.

### Why AG-UI Client

The original plan used a custom fetch-and-parse approach to handle AI responses. AG-UI replaces this with:

- **`HttpAgent`** — Pre-built client that connects to the agent backend via SSE
- **Observable subscription** — `agent.runAgent().subscribe()` handles all event types
- **Automatic state sync** — `STATE_SNAPSHOT` / `STATE_DELTA` events update page config without custom parsing
- **Frontend tool execution** — Agent can invoke tools that the frontend defines and runs (validation, confirmation dialogs, section pickers)
- **Structured lifecycle** — `RUN_STARTED` / `RUN_FINISHED` / `RUN_ERROR` for clean loading/error states
- **Activity visibility** — Show what the agent is doing between chat messages

---

## Architecture

### AG-UI Client Setup

```typescript
import { HttpAgent, EventType } from "@ag-ui/client";

const agent = new HttpAgent({
  url: process.env.NEXT_PUBLIC_AGENT_URL,  // FastAPI backend (e.g. http://localhost:8000/api/agent)
  agentId: "naguib-agent",
  threadId: projectId,                      // One conversation per project
});
```

### Event Handling (Core Loop)

```typescript
agent.runAgent({
  tools: frontendTools,        // Tools the agent can invoke
  context: [],                 // Additional context
  state: currentPageConfig,    // Current page config
}).subscribe({
  next: (event) => {
    switch (event.type) {
      // Lifecycle
      case EventType.RUN_STARTED:    → setIsLoading(true)
      case EventType.RUN_FINISHED:   → setIsLoading(false)
      case EventType.RUN_ERROR:      → showError(event.message)

      // Text streaming → chat messages
      case EventType.TEXT_MESSAGE_START:   → createMessageBubble(event.messageId)
      case EventType.TEXT_MESSAGE_CONTENT: → appendToMessage(event.messageId, event.delta)
      case EventType.TEXT_MESSAGE_END:     → finalizeMessage(event.messageId)

      // State sync → page config updates
      case EventType.STATE_SNAPSHOT:  → replacePageConfig(event.snapshot)
      case EventType.STATE_DELTA:     → applyJsonPatches(event.delta)

      // Tool calls → frontend executes
      case EventType.TOOL_CALL_START: → beginToolExecution(event.toolCallId, event.toolCallName)
      case EventType.TOOL_CALL_ARGS:  → collectToolArgs(event.toolCallId, event.delta)
      case EventType.TOOL_CALL_END:   → executeToolAndSendResult(event.toolCallId)

      // Activity → progress indicators
      case EventType.ACTIVITY_SNAPSHOT: → showActivity(event.content)

      // Steps → granular progress
      case EventType.STEP_STARTED:  → showStep(event.stepName)
      case EventType.STEP_FINISHED: → clearStep(event.stepName)
    }
  },
  error: (err) => handleConnectionError(err),
  complete: () => runComplete(),
});
```

### Frontend-Defined Tools

These tools are passed to `agent.runAgent({ tools })` and executed by the frontend when the agent calls them:

| Tool | Description | Frontend Behavior |
|------|-------------|-------------------|
| `validate_config` | Validate page config against Zod | Run Zod validation, return errors or "valid" |
| `get_current_config` | Get the live page config | Return `JSON.stringify(pageConfig)` |
| `confirm_destructive_change` | Confirm before replacing entire page | Show confirmation dialog, return user's choice |
| `pick_section` | Let user choose a section type to add | Open section picker UI, return selected type+variant |

**Tool execution flow:**
1. Agent emits `TOOL_CALL_START` → `TOOL_CALL_ARGS` → `TOOL_CALL_END`
2. Frontend parses tool name + args
3. Frontend executes (may involve user interaction — e.g., confirmation dialog)
4. Frontend sends `TOOL_CALL_RESULT` back to agent
5. Agent continues with result

### State Management

```
                    AG-UI Events
                         │
    ┌────────────────────┼───────────────────┐
    │                    │                   │
    ▼                    ▼                   ▼
STATE_SNAPSHOT      STATE_DELTA         User direct
(replace all)     (JSON Patch)        manipulation
    │                    │              (section panel,
    ▼                    ▼              theme controls)
    └────────┬───────────┘                   │
             ▼                               │
      ┌──────────────┐                       │
      │  Page Config  │◄──────────────────────┘
      │   (Zustand)   │
      └──────┬───────┘
             │
             ▼
      ┌──────────────┐      ┌──────────────┐
      │  Undo/Redo   │      │  Auto-save   │
      │    Stack      │      │  to Server   │
      └──────────────┘      └──────────────┘
             │
             ▼
      ┌──────────────┐
      │ PageRenderer  │
      │  (Preview)    │
      └──────────────┘
```

- **From agent**: `STATE_SNAPSHOT` replaces config, `STATE_DELTA` applies JSON Patches (RFC 6902)
- **From user**: Direct manipulation (drag sections, change theme) updates config directly
- **Both paths**: Push to undo stack, trigger preview re-render, schedule auto-save
- **Concurrency rule**: During an active agent run (`RUN_STARTED` → `RUN_FINISHED`), user direct manipulation is **queued** and applied after `RUN_FINISHED` to prevent race conditions. Agent events are always applied in order received.

---

## Tasks

### 4.1 AG-UI Client Integration
- [ ] Configure `NEXT_PUBLIC_AGENT_URL` env var pointing to FastAPI backend (`http://localhost:8000/api/agent` in dev)
- [ ] Initialize `HttpAgent` with FastAPI backend URL and project-based `threadId`
- [ ] Create `useAgent()` React hook that:
  - Manages the HttpAgent instance
  - Exposes `sendMessage(text)` that:
    - Gets current page config from `usePageConfig()`
    - Builds full `RunAgentInput` with messages array, frontend tools, state
    - Calls `agent.runAgent(input)` and subscribes to Observable
  - Handles all AG-UI event types via Observable subscription
  - Handles SSE connection errors: show error toast, allow retry, preserve chat history + page config
  - Returns: `{ messages, isLoading, error, activity, sendMessage }`
- [ ] Create `usePageConfig()` Zustand store that:
  - Holds current `PageConfig` state
  - Exposes `replaceConfig(config)` for `STATE_SNAPSHOT`
  - Exposes `applyPatches(patches)` for `STATE_DELTA` (using `fast-json-patch` or similar)
  - Maintains undo/redo stack
  - Exposes `updateSection()`, `addSection()`, `removeSection()`, etc. for direct manipulation
- [ ] Wire up: agent events → page config store → preview re-render

### 4.2 Frontend Tool Definitions & Execution
- [ ] Define tool schemas (JSON Schema format) for AG-UI:
  - `validate_config`: params `{ config: PageConfig }`
  - `get_current_config`: no params
  - `confirm_destructive_change`: params `{ description: string }`
  - `pick_section`: params `{ availableTypes: string[] }`
- [ ] Build tool executor that dispatches by tool name:
  - `validate_config` → run Zod validation, return result
  - `get_current_config` → return serialized page config
  - `confirm_destructive_change` → show modal dialog, await user response
  - `pick_section` → show section picker, await user selection
- [ ] Send `TOOL_CALL_RESULT` back to agent after execution

### 4.3 Layout Shell
- [ ] Two-panel layout: chat (left, ~35%) + preview (right, ~65%)
- [ ] Top bar: logo, project name (editable), theme button, export button
- [ ] Responsive: on mobile, chat and preview are separate tabs
- [ ] Resizable panel divider (nice to have)

### 4.4 Chat Panel
- [ ] Message list rendering from `useAgent().messages`
- [ ] Input box at bottom (textarea, submit on Enter, shift+Enter for newline)
- [ ] On submit: call `useAgent().sendMessage(text)`
- [ ] AI messages stream in real-time (character by character from `TEXT_MESSAGE_CONTENT` events)
- [ ] Show activity indicators from `ACTIVITY_SNAPSHOT` events (e.g., "Selecting components...", "Applying changes...")
- [ ] Show step progress from `STEP_STARTED` / `STEP_FINISHED` events
- [ ] Loading state from `RUN_STARTED` → `RUN_FINISHED` lifecycle
- [ ] Error display from `RUN_ERROR` events
- [ ] Auto-scroll to latest message
- [ ] Tool call UI:
  - When `confirm_destructive_change` is called → show inline confirmation card
  - When `pick_section` is called → show inline section picker
  - Results automatically sent back to agent
- [ ] Conversation persisted per project

### 4.5 Live Preview
- [ ] iframe (or sandboxed React root) rendering PageRenderer
- [ ] Subscribes to `usePageConfig()` store
- [ ] Re-renders on every config change (from agent state events OR direct manipulation)
- [ ] Updates within 1 second of config change (target 500ms on modern hardware)
- [ ] Viewport toggle: Desktop (1280px) / Tablet (768px) / Mobile (375px)
- [ ] Zoom/fit-to-width controls
- [ ] Scrollable (full page)

### 4.6 Section Panel
- [ ] Overlay or sidebar showing list of current sections
- [ ] Each section shows: type icon, type label, variant name, mode indicator
- [ ] Drag handle for reorder
- [ ] Per-section actions:
  - Toggle mode (light/dark)
  - Swap variant (dropdown with descriptions)
  - Delete section
- [ ] "Add section" button → opens section picker
- [ ] Section picker: categorized list of types → variants with descriptions + thumbnails
- [ ] Direct manipulation updates go through `usePageConfig()` store (same undo/redo stack as agent changes)

### 4.7 Theme Controls
- [ ] Theme preset picker (grid of preset cards with preview swatches)
- [ ] Individual controls:
  - Primary color picker
  - Secondary color picker
  - Background + foreground
  - Font heading + body (dropdown of curated fonts)
  - Border radius (preset buttons: none/sm/md/lg/pill)
- [ ] Changes apply to preview instantly via `usePageConfig()` store
- [ ] Theme state synced with page config

### 4.8 Undo/Redo
- [ ] Every config change (from agent state events or direct manipulation) pushes to undo stack as a single unit
- [ ] Concurrent user ops during an active agent run are queued, then applied as a post-run batch (single undo unit)
- [ ] Ctrl+Z / Cmd+Z → undo (pop from undo stack, push to redo stack)
- [ ] Ctrl+Shift+Z / Cmd+Shift+Z → redo
- [ ] Undo button in UI
- [ ] Stack depth: last 50 states

### 4.9 Click-to-Select (Nice to Have for V1)
- [ ] Clicking a section in the preview highlights it
- [ ] Shows quick action toolbar (move up/down, mode toggle, swap variant, delete)
- [ ] Requires iframe ↔ parent communication (postMessage)
- [ ] **If skipped in V1**: users modify sections only via Section Panel (4.6), not by clicking preview

---

## Exit Criteria

- [ ] User types message → `HttpAgent.runAgent()` fires → AG-UI events stream in → text appears in chat + preview updates
- [ ] Full AG-UI event loop works: `RUN_STARTED → TEXT_MESSAGE_* → STATE_DELTA/SNAPSHOT → RUN_FINISHED`
- [ ] Text streams character-by-character (not buffered)
- [ ] `STATE_SNAPSHOT` replaces page config entirely (new page generation)
- [ ] `STATE_DELTA` applies JSON Patches to page config (incremental edits)
- [ ] Frontend tool calls work: agent calls `confirm_destructive_change` → dialog appears → user confirms → agent continues
- [ ] Activity indicators show between chat messages ("Selecting components...")
- [ ] Viewport toggle works (desktop/tablet/mobile)
- [ ] Sections can be reordered, deleted, mode-toggled via section panel
- [ ] Theme can be changed via presets and individual controls
- [ ] Undo works (at least "revert last change") — covers both agent changes and direct manipulation
- [ ] Error handling: `RUN_ERROR` shows user-friendly error message, SSE connection drops show retry option
- [ ] Full tool loop: agent calls `pick_section` → frontend shows picker → user selects → tool result sent in new `runAgent()` → agent resumes with selection

---

## Dependencies

- Plan 01 (Foundation): PageRenderer, theme engine, `@ag-ui/client` + `rxjs` installed
- Plan 03 (AI Configurator): FastAPI AG-UI agent backend (separate service)
- **Message format**: All messages serialized using AG-UI `Message` type from `@ag-ui/client` — must match what Plan 03 backend expects
- **Tool contract**: Tool names and schemas must match Plan 03 exactly: `validate_config`, `get_current_config`, `confirm_destructive_change`, `pick_section`

## Blocks

- 05 Export Pipeline
