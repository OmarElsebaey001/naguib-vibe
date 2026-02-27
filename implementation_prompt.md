# Naguib V1 — Full Implementation Prompt

> Copy and paste this entire prompt to the implementing agent.

---

## Role

You are a senior full-stack engineer. Your job is to implement the complete V1 of **Naguib** — a web application where users describe a landing page in natural language, and the system assembles a complete, responsive, working page in seconds by selecting from a pre-built component library. The AI never generates code — it selects from a finite, tested catalog and fills content schemas. Every output is guaranteed to work.

The experience: chat on the left, live preview on the right. User describes what they want → AI picks components, arranges them, applies a theme, fills in content → a full landing page appears in seconds. User iterates via chat or direct manipulation. When satisfied, they download it as a standalone React project.

---

## Reference Documents

Before writing any code, read these files in order. They are your source of truth:

| File | What It Contains | Priority |
|------|-----------------|----------|
| `system_docs/manifesto.md` | Core mental model — universal contract, two phases, principles | Read first |
| `system_docs/requirements.md` | Engineering spec — stack, schemas, AI flow, component system, export, non-functional requirements | Read second |
| `system_docs/ag-ui.md` | AG-UI protocol spec — the agent↔frontend communication protocol (events, streaming, tools, state sync) | Read third |
| `system_docs/user_stories.md` | All 99 user stories for V1, organized by journey phase | Read fourth |
| `system_docs/apis.md` | All 11 backend API endpoints with request/response details | Read fifth |
| `system_docs/user_stories_to_apis_map.md` | Bidirectional mapping: every story ↔ every endpoint, proving 100% coverage | Reference |
| `building/master_plan.md` | Plan of plans, dependency graph, conventions, tech stack details | Reference |
| `building/01-foundation/plan.md` | Foundation tasks (project setup, schemas, registry, theme, renderer) | Implementation guide |
| `building/02-component-library/plan.md` | Component library tasks (~40 components across 10 types) | Implementation guide |
| `building/03-ai-configurator/plan.md` | AI agent backend tasks (AG-UI SSE, Claude, state sync, tool calls) | Implementation guide |
| `building/04-console/plan.md` | Console frontend tasks (chat, preview, section panel, theme controls) | Implementation guide |
| `building/05-export-pipeline/plan.md` | Export tasks (config → standalone Vite + React project download) | Implementation guide |
| `building/06-auth-persistence/plan.md` | Auth + persistence tasks (JWT, Postgres, CRUD, uploads, dashboard) | Implementation guide |
| `building/07-polish-launch/plan.md` | Polish tasks (billing, rate limiting, landing page, performance) | Implementation guide |

**Rule**: Where `requirements.md` (the original vision) conflicts with the building plans, the building plans win. The plans reflect updated architecture decisions (FastAPI backend, AG-UI protocol, JWT auth, etc.).

---

## Architecture

Two separate services communicating via AG-UI protocol (SSE) + REST:

```
┌─────────────────────────────┐    AG-UI (SSE) + REST    ┌─────────────────────────────┐
│       FRONTEND (Next.js)    │ ◄──────────────────────► │     BACKEND (FastAPI)        │
│                             │                          │                              │
│  Console UI                 │  HttpAgent ↔ /api/agent  │  AG-UI Agent Endpoint        │
│  Chat Panel                 │  REST ↔ /api/auth/*      │  Auth (JWT + bcrypt)         │
│  Live Preview (PageRenderer)│  REST ↔ /api/projects/*  │  Project CRUD                │
│  Section Panel              │  REST ↔ /api/upload      │  Image Uploads (S3/local)    │
│  Theme Controls             │  REST ↔ /api/billing/*   │  Billing (Stripe)            │
│  Export (client-side zip)   │                          │  LLM Abstraction Layer       │
│  @ag-ui/client (HttpAgent)  │                          │  SQLAlchemy + Postgres       │
└─────────────────────────────┘                          └─────────────────────────────┘
```

**FastAPI** owns all server-side concerns: auth, database, AI agent, image storage, billing.
**Next.js** is a pure frontend: UI, preview rendering, export (client-side zip generation).

---

## Tech Stack

### Frontend (Next.js)

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS v4 |
| Variant management | class-variance-authority (cva) |
| Class composition | clsx + tailwind-merge |
| Console UI primitives | shadcn/ui |
| Schema validation | Zod |
| Agent↔Frontend protocol | @ag-ui/client (HttpAgent) |
| Streaming | RxJS (Observable) |
| Export target | Vite + React |
| Deployment | Vercel |

### Backend (FastAPI)

| Layer | Technology |
|-------|-----------|
| Framework | FastAPI |
| Language | Python 3.12+ |
| Schema validation | Pydantic v2 |
| ORM | SQLAlchemy 2.0 (async) |
| DB driver | asyncpg |
| Migrations | Alembic |
| Database | PostgreSQL (local dev + AWS RDS prod) |
| Auth | python-jose[cryptography] (JWT) + passlib[bcrypt] |
| AI provider | anthropic Python SDK (default), openai SDK (pluggable) |
| AG-UI SDK | ag-ui-core + ag-ui-encoder |
| JSON Patch | jsonpatch (RFC 6902) |
| Image storage | boto3 (S3) or local filesystem |
| Billing | stripe |
| Server | uvicorn |

---

## Directory Structure

Create exactly this structure:

```
naguib/
├── backend/
│   ├── app/
│   │   ├── main.py                     # FastAPI app, CORS, mount routers
│   │   ├── routers/
│   │   │   ├── agent.py                # POST /api/agent (SSE stream)
│   │   │   ├── auth.py                 # POST register, login; GET me
│   │   │   ├── projects.py             # GET/POST/PUT/DELETE /api/projects
│   │   │   ├── uploads.py              # POST /api/upload
│   │   │   └── billing.py              # Stripe checkout, webhook, portal
│   │   ├── models/                     # SQLAlchemy ORM
│   │   │   ├── user.py
│   │   │   └── project.py              # Project + ProjectVersion
│   │   ├── schemas/                    # Pydantic request/response
│   │   │   ├── auth.py
│   │   │   ├── project.py
│   │   │   ├── page_config.py          # PageConfig, Theme, Section (mirrors Zod)
│   │   │   └── operations.py           # Operation types + JSON Patch mapping
│   │   ├── services/
│   │   │   ├── llm/                    # LLM abstraction layer
│   │   │   │   ├── base.py             # LLMChunk, LLMProvider protocol
│   │   │   │   ├── anthropic.py        # Claude implementation
│   │   │   │   └── openai.py           # GPT implementation
│   │   │   ├── agent.py                # Agentic loop (async event generator)
│   │   │   ├── catalog.py              # Load + parse component catalog
│   │   │   └── prompt.py               # System prompt builder
│   │   ├── core/
│   │   │   ├── config.py               # Pydantic BaseSettings (.env)
│   │   │   ├── database.py             # Async engine + session
│   │   │   ├── security.py             # JWT + password hashing
│   │   │   └── dependencies.py         # get_current_user, get_db, get_llm_provider
│   │   └── migrations/
│   │       ├── versions/
│   │       └── env.py
│   ├── tests/
│   ├── pyproject.toml
│   ├── alembic.ini
│   ├── .env.example
│   └── .gitignore
│
├── frontend/
│   ├── src/
│   │   ├── app/                        # Next.js App Router
│   │   │   ├── layout.tsx
│   │   │   ├── globals.css
│   │   │   ├── page.tsx                # Landing page (public)
│   │   │   ├── login/page.tsx
│   │   │   ├── register/page.tsx
│   │   │   ├── dashboard/page.tsx
│   │   │   └── console/[projectId]/page.tsx
│   │   ├── components/
│   │   │   ├── ui/                     # shadcn/ui (console only)
│   │   │   ├── sections/              # THE PRODUCT — landing page components
│   │   │   │   ├── header/
│   │   │   │   │   ├── schema.ts
│   │   │   │   │   ├── index.ts
│   │   │   │   │   └── [variants].tsx
│   │   │   │   ├── hero/
│   │   │   │   ├── logos/
│   │   │   │   ├── features/
│   │   │   │   ├── social-proof/
│   │   │   │   ├── stats/
│   │   │   │   ├── pricing/
│   │   │   │   ├── faq/
│   │   │   │   ├── cta/
│   │   │   │   └── footer/
│   │   │   └── console/
│   │   │       ├── chat-panel.tsx
│   │   │       ├── preview-frame.tsx
│   │   │       ├── section-panel.tsx
│   │   │       ├── theme-controls.tsx
│   │   │       ├── top-bar.tsx
│   │   │       ├── viewport-toggle.tsx
│   │   │       └── section-picker.tsx
│   │   └── lib/
│   │       ├── schemas/
│   │       │   ├── page-config.ts      # PageConfig, Theme, Section (Zod — source of truth)
│   │       │   └── content/            # Per-type content schemas
│   │       ├── registry/
│   │       │   ├── index.ts            # type:variant → component + metadata
│   │       │   └── catalog.ts          # Generate catalog JSON for AI
│   │       ├── theme/
│   │       │   ├── engine.ts           # themeToCSS(), mode switching
│   │       │   └── presets.ts          # 6 presets
│   │       ├── renderer/
│   │       │   └── page-renderer.tsx
│   │       ├── agent/
│   │       │   ├── client.ts           # HttpAgent setup, runAgent()
│   │       │   └── tools.ts            # Frontend tool definitions + executors
│   │       ├── auth/
│   │       │   ├── context.tsx          # AuthProvider, useAuth()
│   │       │   └── api.ts
│   │       ├── api/
│   │       │   └── client.ts           # Fetch wrapper with JWT injection
│   │       ├── export/
│   │       │   ├── index.ts
│   │       │   ├── template/           # Vite + React base template
│   │       │   └── packager.ts         # Zip generation
│   │       └── stores/
│   │           ├── page-config.ts      # usePageConfig() — state + undo stack (50 states)
│   │           └── project.ts          # useProject() — load, save, auto-save (2s debounce)
│   ├── public/
│   ├── package.json
│   ├── tsconfig.json
│   ├── next.config.ts
│   └── tailwind.config.ts
│
└── shared/
    └── catalog.json                    # Frontend build generates → backend loads at startup
```

---

## Core Technical Decisions

### 1. The Universal Component Contract

Every section receives exactly 4 things: `type`, `variant`, `content`, `mode`.

- **All variants of a type share the same content schema.** This is the rule that makes variant-swapping work without touching content.
- **Theme is NOT part of the contract.** Theme is CSS variables on `:root`. Components read `var(--primary)`, etc.
- **Mode** (`"light"` | `"dark"`) is per-section. A wrapper div gets `.dark` class, which flips CSS variables for that subtree.

### 2. The Agentic Loop (Backend)

The AI agent is **not** built with LangGraph or any orchestration framework. It is a single async generator function that yields AG-UI events.

```python
async def agent_event_stream(input: RunAgentInput) -> AsyncIterator[BaseEvent]:
    provider = get_llm_provider()  # Swappable LLM
    system_prompt = build_system_prompt(catalog, input.state)

    yield RunStartedEvent(thread_id=input.thread_id, run_id=input.run_id)
    yield StepStartedEvent(step_name="generating_response")
    yield ActivitySnapshotEvent(content="Analyzing your request...")

    msg_id = str(uuid4())
    yield TextMessageStartEvent(message_id=msg_id, role="assistant")

    operations = None
    retries = 0

    while retries <= 2:
        async for chunk in provider.stream(system_prompt, input.messages, tools):
            if chunk.type == ChunkType.TEXT_DELTA:
                yield TextMessageContentEvent(message_id=msg_id, delta=chunk.text)

            elif chunk.type == ChunkType.TOOL_USE_START and chunk.tool_name in FRONTEND_TOOLS:
                yield TextMessageEndEvent(message_id=msg_id)
                yield ToolCallStartEvent(tool_call_id=chunk.tool_call_id, tool_call_name=chunk.tool_name)
                # ... stream tool args, emit ToolCallEndEvent
                yield RunFinishedEvent(...)
                return  # STOP — frontend calls back with tool result

            elif chunk.tool_name == "apply_operations":
                operations = parse_operations(chunk)

        if operations is None:
            break  # Text-only response (informational query)

        patches = operations_to_patches(operations, input.state)
        new_config = apply_patches(input.state, patches)

        if validate_config(new_config):
            yield StepStartedEvent(step_name="applying_operations")
            if is_full_replace(operations):
                yield StateSnapshotEvent(snapshot=new_config)
            else:
                yield StateDeltaEvent(delta=patches)
            yield StepFinishedEvent(step_name="applying_operations")
            break
        else:
            retries += 1
            if retries > 2:
                yield RunErrorEvent(message="Could not generate valid configuration. Please try rephrasing.")
                return
            yield ActivitySnapshotEvent(content="Fixing a validation issue...")

    yield TextMessageEndEvent(message_id=msg_id)
    yield StepFinishedEvent(step_name="generating_response")
    yield RunFinishedEvent(thread_id=input.thread_id, run_id=input.run_id)
```

The FastAPI route wraps this with `StreamingResponse`:

```python
@router.post("/api/agent")
async def run_agent(input: RunAgentInput, user: User = Depends(get_current_user)):
    encoder = EventEncoder()
    async def generate():
        async for event in agent_event_stream(input):
            yield encoder.encode(event)
    return StreamingResponse(generate(), media_type=encoder.get_content_type())
```

### 3. LLM Abstraction Layer

The LLM is pluggable via a Python protocol. The agentic loop never imports a specific SDK — it consumes `LLMChunk` objects from whatever provider is configured.

```python
# services/llm/base.py
class ChunkType(Enum):
    TEXT_DELTA = "text_delta"
    TOOL_USE_START = "tool_use_start"
    TOOL_USE_DELTA = "tool_use_delta"
    TOOL_USE_END = "tool_use_end"

@dataclass
class LLMChunk:
    type: ChunkType
    text: str = ""
    tool_call_id: str = ""
    tool_name: str = ""
    tool_args_delta: str = ""

class LLMProvider(Protocol):
    async def stream(self, system_prompt: str, messages: list[dict], tools: list[dict]) -> AsyncIterator[LLMChunk]: ...
```

Each provider (~60-80 lines) translates its SDK's streaming format into `LLMChunk`. Selected via env var:

```env
LLM_PROVIDER=anthropic
LLM_MODEL=claude-sonnet-4-20250514
```

### 4. State Management (AG-UI)

The page config is shared state between agent and frontend:

- **`STATE_SNAPSHOT`** — full replace (new page generation). Frontend replaces its entire config.
- **`STATE_DELTA`** — incremental edits. RFC 6902 JSON Patch via Python's `jsonpatch` library. Frontend applies patches.

Operation → JSON Patch mapping:

| Operation | JSON Patch |
|-----------|-----------|
| `replace_all` | `STATE_SNAPSHOT` (full config) |
| `add_section` | `{ "op": "add", "path": "/sections/-", "value": {...} }` |
| `remove_section` | `{ "op": "remove", "path": "/sections/{i}" }` |
| `move_section` | `{ "op": "move", "from": "/sections/{from}", "path": "/sections/{to}" }` |
| `update_content` | `{ "op": "replace", "path": "/sections/{i}/content/...", "value": ... }` |
| `swap_variant` | `{ "op": "replace", "path": "/sections/{i}/variant", "value": "..." }` |
| `set_mode` | `{ "op": "replace", "path": "/sections/{i}/mode", "value": "dark" }` |
| `set_theme` | Patches on `/theme/primary`, `/theme/fontHeading`, etc. |

### 5. Tool Calls (Multi-Turn)

The agent can invoke tools that the frontend executes:

| Tool | Purpose | Trigger |
|------|---------|---------|
| `confirm_destructive_change` | Ask user before replacing entire page | Agent detects `replace_all` when page already has content |
| `pick_section` | Let user choose from section picker | Agent needs user to pick a specific variant |
| `validate_config` | Validate config against Zod | Safety check |
| `get_current_config` | Get latest config state | Agent needs fresh state |

**Flow**: Agent emits `TOOL_CALL_*` events → stream ends (`RUN_FINISHED`) → frontend executes tool (may show UI dialog) → frontend starts a **new** `runAgent()` with `TOOL_CALL_RESULT` in messages → agent receives result and continues.

### 6. Authentication

- `POST /api/auth/register` — bcrypt hash password, create user, return JWT
- `POST /api/auth/login` — verify password, return JWT (7 day expiry)
- `GET /api/auth/me` — validate JWT, return user info
- JWT payload: `{ sub: user_id, username, exp }`
- FastAPI dependency `get_current_user()` extracts + validates JWT on all protected routes
- Frontend stores JWT in localStorage, includes in all API calls via `Authorization: Bearer <token>`

### 7. Two-Environment Config

Same code, different `.env` files. No if/else branching in application code.

```env
# .env (local dev)
DATABASE_URL=postgresql+asyncpg://postgres:postgres@localhost:5432/naguib
JWT_SECRET=dev-secret-change-me
ANTHROPIC_API_KEY=sk-ant-...
FRONTEND_URL=http://localhost:3000
AWS_S3_BUCKET=          # empty = local filesystem
LLM_PROVIDER=anthropic
LLM_MODEL=claude-sonnet-4-20250514
```

```env
# .env.production (AWS — never committed)
DATABASE_URL=postgresql+asyncpg://user:pass@rds-host:5432/naguib
JWT_SECRET=<strong-random>
ANTHROPIC_API_KEY=sk-ant-...
FRONTEND_URL=https://naguib.dev
AWS_S3_BUCKET=naguib-uploads
AWS_REGION=us-east-1
LLM_PROVIDER=anthropic
LLM_MODEL=claude-sonnet-4-20250514
```

### 8. Export Pipeline

Client-side in Next.js. No backend endpoint.

1. Read current page config from frontend state
2. Determine which components are used
3. Copy only those component source files
4. Rewrite imports to be self-relative
5. Inline content as constants in `page.tsx`
6. Generate `globals.css` with theme CSS variables
7. Bundle into a Vite + React + Tailwind project template
8. Generate README
9. Create zip → trigger browser download

Exported project: `npm install && npm run dev` works. `npm run build` produces static HTML. Zero references to Naguib.

---

## API Endpoints (Complete)

### Auth (public)
| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/auth/register` | Create account → return JWT |
| `POST` | `/api/auth/login` | Authenticate → return JWT |
| `GET` | `/api/auth/me` | Validate JWT → return user info |

### Projects (auth required, owner-scoped)
| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/projects` | List user's projects (ordered by updated_at desc) |
| `POST` | `/api/projects` | Create project (enforces free tier limit) |
| `GET` | `/api/projects/{id}` | Load full project (config + conversation) |
| `PUT` | `/api/projects/{id}` | Save project (partial update — auto-save target) |
| `DELETE` | `/api/projects/{id}` | Delete project + cascade versions |

### Agent (auth required)
| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/agent` | AI agent — SSE stream of AG-UI events |

### Uploads (auth required)
| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/upload` | Upload image (≤5MB, jpg/png/webp/svg) → return URL |

### Billing (mixed)
| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/billing/create-checkout` | Create Stripe Checkout session (auth required) |
| `POST` | `/api/billing/webhook` | Stripe webhook → update user tier (Stripe signature auth) |
| `POST` | `/api/billing/portal` | Create Stripe Customer Portal session (auth required) |

### Health
| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/health` | `{ "status": "ok" }` |

---

## Component System

### Section Types (V1 — 10 types, ~4 variants each, ~40 total)

| Type | Variants | Description |
|------|----------|-------------|
| `header` | simple, with-cta, centered, transparent | Top navigation bar |
| `hero` | centered, split-image-right, split-image-left, gradient-bold, with-app-screenshot | Above-the-fold hero |
| `logos` | simple-row, marquee, grid | Trusted-by logo bar |
| `features` | cards-grid, bento-grid, icon-list, alternating, three-column | Feature highlights |
| `social-proof` | cards-grid, carousel, single-quote, with-stats | Testimonials |
| `stats` | inline-row, cards, large-centered | Key metrics |
| `pricing` | two-tier, three-tier, comparison-table | Pricing plans |
| `faq` | accordion, two-column, simple-list | FAQ section |
| `cta` | bold-centered, with-image, split, minimal | Call to action |
| `footer` | columns-with-socials, simple-centered, minimal, mega-footer | Page footer |

### Each component file:

```typescript
// components/sections/hero/split-image-right.tsx
import { type HeroContent } from "./schema";

export const metadata = {
  type: "hero",
  variant: "split-image-right",
  description: "Headline and CTA on the left, large product image on the right. Image stacks below text on mobile.",
  tags: ["above-fold", "image-heavy", "saas"],
  supportedModes: ["light", "dark"] as const,
};

export function HeroSplitImageRight({ content, mode }: { content: HeroContent; mode: "light" | "dark" }) {
  return (
    <section className={mode === "dark" ? "dark" : ""}>
      <div className="bg-background text-foreground ...">
        {/* Implementation */}
      </div>
    </section>
  );
}
```

### Rules:
- Every component must be responsive across Desktop (1280px+), Tablet (768px), Mobile (375px)
- Every component must work in both light and dark mode
- Components reference CSS variables (`hsl(var(--primary))`) — never hardcoded colors
- Each component is self-contained (~50-150 lines)
- Content schemas defined in Zod (frontend, source of truth) and mirrored in Pydantic (backend)
- All variants of a type accept the same content shape

---

## Theme System

### CSS Variables (HSL, shadcn-compatible)

```css
:root {
  --background: 0 0% 100%;
  --foreground: 240 10% 3.9%;
  --primary: 221.2 83.2% 53.3%;
  --primary-foreground: 210 40% 98%;
  --secondary: 210 40% 96.1%;
  --secondary-foreground: 222.2 47.4% 11.2%;
  --muted: 210 40% 96.1%;
  --muted-foreground: 215.4 16.3% 46.9%;
  --accent: 210 40% 96.1%;
  --accent-foreground: 222.2 47.4% 11.2%;
  --border: 214.3 31.8% 91.4%;
  --ring: 221.2 83.2% 53.3%;
  --radius: 0.5rem;
  --font-heading: "Inter", sans-serif;
  --font-body: "Inter", sans-serif;
}

.dark {
  --background: 222.2 84% 4.9%;
  --foreground: 210 40% 98%;
  /* ... dark overrides */
}
```

### 6 Theme Presets
- **Corporate** — Blue primary, Inter font, small radius
- **Startup** — Purple, modern sans-serif, medium radius
- **Minimal** — Black/white, serif headings, no radius
- **Bold** — Saturated colors, large text, large radius
- **Warm** — Earth tones, rounded, friendly
- **Tech** — Dark background, neon accent, monospace headings

---

## Implementation Order

Follow the 7 plans sequentially. Each plan has detailed tasks in its `plan.md` file. After completing each plan, write what you did in the corresponding `implementation.md`.

### Plan 01 — Foundation
Set up both projects (Next.js + FastAPI). Define all Zod and Pydantic schemas. Build component registry, theme engine, and PageRenderer. Scaffold the backend with SQLAlchemy, Alembic, CORS. Verify with a hand-written test page config.

### Plan 02 — Component Library
Build ~40 section components (10 types × ~4 variants). Every component responsive, light/dark mode, self-contained. Use real content, not lorem ipsum.

### Plan 03 — AI Configurator
Build the agentic loop in `services/agent.py`. LLM abstraction in `services/llm/`. System prompt with catalog injection. AG-UI event streaming via SSE. State management via `STATE_SNAPSHOT` and `STATE_DELTA` (JSON Patch). Tool calls for frontend-executed actions. Validation + retry loop.

### Plan 04 — Console
Build the console frontend: chat panel (AG-UI HttpAgent), live preview (iframe + PageRenderer), section panel (drag-and-drop, mode toggle, variant swap, add/delete), theme controls (color pickers, font dropdowns, presets), viewport toggle, undo/redo stack, top bar. Wire everything to the AG-UI event stream.

### Plan 05 — Export Pipeline
Build client-side export: config → standalone Vite + React project → zip download. Only used components. Inlined content. Theme in globals.css. Self-contained, zero Naguib references.

### Plan 06 — Auth & Persistence
JWT auth (register, login, me). SQLAlchemy models (User, Project, ProjectVersion). Project CRUD endpoints. Image upload endpoint (S3 or local). Dashboard page. Auto-save integration. Conversation history round-trip.

### Plan 07 — Polish & Launch
Stripe billing (checkout, webhook, portal). Rate limiting per-user. Landing page (built with Naguib). Performance audit. Error handling. QA pass. Beta launch.

---

## Database Schema

```sql
-- Users
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR UNIQUE NOT NULL,
    password_hash VARCHAR NOT NULL,
    tier VARCHAR DEFAULT 'free',  -- 'free' | 'pro'
    stripe_customer_id VARCHAR,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Projects
CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR NOT NULL,
    config JSONB,                    -- PageConfig JSON
    conversation_history JSONB DEFAULT '[]',  -- AG-UI Message[]
    thumbnail_url VARCHAR,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Project Versions (undo history)
CREATE TABLE project_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    config JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_projects_user_id ON projects(user_id);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_project_versions_project_id ON project_versions(project_id);
```

---

## Conventions

1. **Read all system docs before writing code.** Start with `manifesto.md`.
2. **Frontend code in `frontend/`.** Backend code in `backend/`. Never mix.
3. **Zod schemas are source of truth.** Pydantic mirrors them. If they diverge, Zod wins.
4. **Use AG-UI SDK models** (`ag_ui.core`, `ag_ui.encoder`) — don't redefine event types.
5. **Every component must be responsive** at 1280px, 768px, 375px. Both light and dark mode. No exceptions.
6. **Test with real content**, not lorem ipsum.
7. **Update `implementation.md`** in each plan directory after completing work.
8. **No over-engineering.** Don't add features, abstractions, or config that isn't in the user stories.
9. **Two-environment config.** Same code, different `.env`. No if/else environment branching.
10. **Components are ~50-150 lines each.** Keep them self-contained and LLM-modifiable.
11. **Auto-save debounce is 2 seconds.** Frontend `PUT /api/projects/{id}` on inactivity.
12. **Undo stack holds 50 states.** Client-side only. Only current state is auto-saved.
13. **JWT expiry: 7 days.** Configurable via `JWT_EXPIRY_HOURS` env var.
14. **Image upload limit: 5MB.** Types: jpg, png, webp, svg.
15. **AI retry: max 2 retries** on invalid config. If all fail, emit `RUN_ERROR`.

---

## Definition of Done (V1)

V1 is complete when a real user can:

1. Visit the landing page and understand what Naguib does
2. Register with username/password
3. Log in and see an empty dashboard
4. Create a new project
5. Describe a landing page in chat → see a full page appear in the preview
6. Iterate via chat: add/remove/reorder sections, edit content, swap variants, change theme
7. Use direct manipulation: section panel (drag, toggle mode, swap variant, delete, add), theme controls (colors, fonts, radius, presets)
8. Toggle between Desktop/Tablet/Mobile preview
9. Undo/redo changes
10. Upload images and see them in the preview
11. Close the browser, come back, and find everything intact (config + conversation)
12. Download the project as a standalone Vite + React zip
13. Run `npm install && npm run dev` on the export and see the same page
14. Run `npm run build` and get static HTML
15. Hit free tier limits and see clear messages
16. Upgrade to Pro via Stripe
17. Manage subscription (cancel, update payment)

If any of these break, V1 is not done.

---

*This prompt contains everything needed to build Naguib V1. The system_docs/ and building/ directories contain the detailed specifications. Start with Plan 01 and work through to Plan 07.*
