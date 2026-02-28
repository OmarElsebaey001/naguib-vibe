# Naguib Architecture

> **Auto-generated** by `/archi-init` on 2026-02-28.
> Run `/archi-init` to regenerate, or `/update-arch` to refresh after changes.

---

## Quick Reference

| Component | Technology | Port | URL (Local) |
|-----------|-----------|------|-------------|
| **Frontend** | Next.js 16 + React 19 | 3003 | http://localhost:3003 |
| **Backend API** | FastAPI + Python 3.12+ | 8002 | http://localhost:8002 |
| **PostgreSQL** | PostgreSQL (AWS RDS) | 5436 | localhost:5436 |
| **AI Provider** | Anthropic Claude / Gemini | — | API calls |
| **Image Storage** | Local filesystem / AWS S3 | — | /uploads/ |
| **Billing** | Stripe | — | Webhooks |

---

## System Overview

```
┌──────────────────────────────────────────────────────────────┐
│                    FRONTEND (Next.js 16)                      │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────┐ │
│  │ Zustand   │  │  Zod     │  │ Tailwind │  │  AG-UI       │ │
│  │ Store     │  │ Schemas  │  │  CSS v4  │  │  HttpAgent   │ │
│  └──────────┘  └──────────┘  └──────────┘  └──────────────┘ │
│                    │ REST (fetch)        │ SSE (AG-UI)        │
└────────────────────┼────────────────────┼────────────────────┘
                     │                    │
                     ▼                    ▼
┌──────────────────────────────────────────────────────────────┐
│                 BACKEND API (FastAPI)                         │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────┐ │
│  │ Routers  │→ │ Services │→ │ Schemas  │→ │ SQLAlchemy   │ │
│  │ (JWT)    │  │ (LLM)    │  │(Pydantic)│  │ (AsyncPG)    │ │
│  └──────────┘  └──────────┘  └──────────┘  └──────────────┘ │
│                         │                                    │
│  ┌──────────┐           ▼                                    │
│  │ AG-UI    │  ┌──────────────────┐                          │
│  │ Encoder  │  │ Claude / Gemini  │                          │
│  │ (SSE)    │  │ (Streaming LLM)  │                          │
│  └──────────┘  └──────────────────┘                          │
└──────────────────────────────────────────────────────────────┘
                         │
                         ▼
              ┌──────────────────┐
              │   PostgreSQL     │
              │  (AWS RDS)       │
              │  users, projects │
              └──────────────────┘
```

### Data Flow — Page Assembly

1. User types a description in the chat panel
2. Frontend sends AG-UI `RunAgentInput` (messages + current page config as state) via POST `/api/agent`
3. Backend builds system prompt with full component catalog (types, variants, schemas)
4. Backend streams LLM response as AG-UI SSE events (text chunks + state updates)
5. LLM returns operations JSON embedded in the response text
6. Backend parses operations → emits `STATE_SNAPSHOT` (full replace) or `STATE_DELTA` (RFC 6902 patches)
7. Frontend Zustand store applies the state update
8. PageRenderer re-renders the section stack with new config
9. Live preview updates instantly

---

## Core Concept

**Naguib assembles landing pages from a pre-built component library — it does NOT generate code.**

The AI is a **configurator**: given a user's natural language description, it selects components from a finite, tested catalog and produces a JSON configuration. Every output is guaranteed to work because every component has been hand-built and tested.

### Universal Component Contract

Every section receives exactly 4 things:

| Prop | Type | Purpose |
|------|------|---------|
| `type` | string | Section family: `"hero"`, `"features"`, `"pricing"`, etc. |
| `variant` | string | Layout within type: `"centered"`, `"cards-grid"`, etc. |
| `content` | object | Data matching the type's content schema |
| `mode` | `"light" \| "dark"` | Visual rhythm — flips CSS variables |

**Key rule**: All variants of a type accept the **same content shape**, so the AI can swap variants without touching content.

---

## Frontend Architecture

### Tech Stack

| Category | Technology | Version |
|----------|-----------|---------|
| Framework | Next.js (App Router) | 16.1.6 |
| Language | TypeScript | 5.x (strict) |
| UI Framework | React | 19.2.3 |
| Styling | Tailwind CSS | v4 |
| Variant Management | class-variance-authority (cva) | latest |
| Class Composition | clsx + tailwind-merge | latest |
| Console UI Primitives | shadcn/ui (Radix) | latest |
| Schema Validation | Zod | latest |
| State Management | Zustand | latest |
| Agent Protocol | @ag-ui/client (HttpAgent + RxJS) | latest |
| Icons | lucide-react | latest |
| Package Manager | npm | — |

### Directory Structure

```
frontend/src/
├── app/                         # Next.js App Router
│   ├── layout.tsx               # Root layout (Geist fonts, AuthProvider)
│   ├── page.tsx                 # Public landing page
│   ├── globals.css              # OKLCH color tokens + Tailwind imports
│   ├── login/page.tsx           # Login form
│   ├── register/page.tsx        # Registration form
│   ├── dashboard/page.tsx       # Project listing (protected)
│   ├── console/[projectId]/     # Main editor workspace (protected)
│   │   └── page.tsx
│   └── api/export/route.ts      # Export API route (server-side zip)
├── components/
│   ├── console/                 # Editor UI
│   │   ├── chat-panel.tsx       # Chat with AI (messages, input, suggestions)
│   │   ├── generation-skeleton.tsx # Skeleton loading UX during page generation
│   │   ├── operations-block.tsx # Collapsible operations pill (tool call display)
│   │   ├── preview-panel.tsx    # Live preview (desktop/tablet/mobile)
│   │   └── section-list.tsx     # Section manager (reorder, variant swap, mode toggle)
│   ├── sections/                # Component library (42 components)
│   │   ├── header/              # 4 variants
│   │   ├── hero/                # 5 variants
│   │   ├── logos/               # 4 variants
│   │   ├── features/            # 5 variants
│   │   ├── social-proof/        # 4 variants
│   │   ├── stats/               # 4 variants
│   │   ├── pricing/             # 4 variants
│   │   ├── faq/                 # 4 variants
│   │   ├── cta/                 # 4 variants
│   │   ├── footer/              # 4 variants
│   │   └── register.ts          # Registers all components into registry
│   └── ui/                      # Base UI primitives (button, input, scroll-area, tooltip, toast)
└── lib/
    ├── agent/use-agent.ts       # AG-UI HttpAgent hook (streaming chat + tool call tracking)
    ├── api/client.ts            # Fetch wrapper (JWT, error handling)
    ├── auth/                    # Auth context + ProtectedRoute
    │   ├── context.tsx
    │   └── protected.tsx
    ├── export/                  # Export pipeline
    │   ├── build-project.ts     # Config → Vite+React project files
    │   ├── extract.ts           # Component source extraction
    │   └── template/            # Static project templates
    ├── hooks/use-toast.ts       # Toast notifications
    ├── registry/                # Component registry
    │   ├── index.ts             # Map<"type:variant", Component>
    │   └── catalog.ts           # AI-readable catalog generator
    ├── renderer/
    │   └── page-renderer.tsx    # Section stack renderer with error boundaries
    ├── schemas/
    │   ├── page-config.ts       # PageConfig + Theme + Section Zod schemas
    │   └── content/             # Per-type content schemas
    │       ├── hero.ts, features.ts, pricing.ts, header.ts
    │       ├── logos.ts, stats.ts, faq.ts, cta.ts
    │       ├── footer.ts, social-proof.ts
    │       └── index.ts
    ├── stores/
    │   └── page-config.ts       # Zustand store (undo/redo, JSON Patch)
    ├── theme/
    │   ├── engine.ts            # HSL → CSS variable conversion
    │   └── presets.ts           # 6 theme presets
    └── utils.ts                 # cn() utility
```

### Routes

| Route | Page | Auth | Description |
|-------|------|------|-------------|
| `/` | Landing | No | Marketing page with features, pricing, FAQ |
| `/login` | Login | No | Username + password login |
| `/register` | Register | No | Account creation |
| `/dashboard` | Dashboard | Yes | Project listing + create/delete |
| `/console/[projectId]` | Console | Yes | Main editor (chat + preview + sections) |

### State Management

**Zustand Store** (`lib/stores/page-config.ts`):
- `config`: Current PageConfig
- `undoStack` / `redoStack`: 50-item limit each
- Actions: `setConfig`, `replaceConfig`, `applyPatches` (RFC 6902), `setTheme`, `applyThemePreset`, `toggleSectionMode`, `removeSection`, `moveSectionUp/Down`, `swapVariant`, `undo()`, `redo()`

**Auth Context** (`lib/auth/context.tsx`):
- `user`, `token` in localStorage
- `login()`, `register()`, `logout()`
- Auto-restores session on mount

### API Client

**`lib/api/client.ts`** — Fetch wrapper:
- Auto-attaches `Authorization: Bearer <token>` header
- 401 → clears localStorage, redirects to `/login`
- 429 → rate limit error
- 403 → permission denied

---

## Backend Architecture

### Tech Stack

| Category | Technology | Version |
|----------|-----------|---------|
| Framework | FastAPI | >=0.115.0 |
| Language | Python | >=3.12 |
| Schema Validation | Pydantic | v2 |
| ORM | SQLAlchemy (async) | >=2.0.0 |
| DB Driver | asyncpg | >=0.29.0 |
| Migrations | Alembic | >=1.13.0 |
| Auth | python-jose (JWT) + passlib (bcrypt) | latest |
| AI (Anthropic) | anthropic SDK | >=0.40.0 |
| AI (Gemini) | google-generativeai | via GeminiService (not in pyproject.toml — install if using Gemini) |
| AG-UI Protocol | ag-ui-protocol | >=0.1.0 |
| JSON Patch | jsonpatch | >=1.33 |
| Image Storage | boto3 (S3) / local filesystem | >=1.35.0 |
| Billing | stripe | >=10.0.0 |
| Rate Limiting | slowapi | >=0.1.9 |
| Server | uvicorn | >=0.30.0 |

### Directory Structure

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py                 # FastAPI app, CORS, routers, error handlers
│   ├── core/
│   │   ├── config.py           # Pydantic BaseSettings from .env
│   │   ├── database.py         # AsyncSession + Base declarative
│   │   ├── security.py         # JWT creation + password hashing
│   │   ├── deps.py             # get_current_user dependency
│   │   └── rate_limit.py       # SlowAPI limiter config
│   ├── models/
│   │   ├── user.py             # User model (id, username, password_hash, tier, stripe_customer_id)
│   │   └── project.py          # Project + ProjectVersion models
│   ├── routers/
│   │   ├── auth.py             # Register, login, me
│   │   ├── projects.py         # CRUD + tier enforcement
│   │   ├── agent.py            # AG-UI SSE streaming endpoint
│   │   ├── uploads.py          # Image upload (local/S3)
│   │   └── billing.py          # Stripe checkout, portal, webhooks
│   ├── schemas/
│   │   ├── auth.py             # RegisterRequest, LoginRequest, TokenResponse, UserResponse
│   │   ├── project.py          # CreateProject, UpdateProject, ProjectSummary, ProjectDetail
│   │   ├── page_config.py      # validate_page_config()
│   │   └── operations.py       # operations_to_patches() — converts AI ops to RFC 6902
│   └── services/
│       ├── catalog.py          # Component catalog for LLM system prompt
│       ├── prompt.py           # build_system_prompt() with catalog + instructions
│       └── llm/
│           ├── claude_service.py   # Anthropic streaming + operation extraction
│           └── gemini_service.py   # Google Gemini streaming
├── migrations/                 # Alembic migration versions
├── tests/                      # Test suite
├── uploads/                    # Local image storage (dev)
├── alembic.ini                 # Alembic config
├── pyproject.toml              # Dependencies (hatchling build)
└── .env / .env.example         # Environment configuration
```

### Routers

| Router | Prefix | Purpose |
|--------|--------|---------|
| `auth` | `/api/auth` | Registration, login, current user |
| `projects` | `/api/projects` | Project CRUD with tier enforcement |
| `agent` | `/api` | AG-UI agent endpoint (SSE stream) |
| `uploads` | `/api` | Image upload |
| `billing` | `/api/billing` | Stripe checkout, portal, webhooks |

### LLM Integration

Two pluggable providers controlled by `LLM_PROVIDER` env var:
- **`anthropic`** → `ClaudeService` (Anthropic SDK, streaming)
- **`gemini`** → `GeminiService` (Google Gemini, streaming)

Both implement `stream(system_prompt, messages) → AsyncGenerator[str]`.

The `extract_operations()` function parses JSON operation blocks from the LLM's text response.

---

## Component Library

### Section Types (10 types, 42 variants)

| Type | Variants | Count |
|------|----------|-------|
| `header` | simple-with-cta, centered, transparent, floating | 4 |
| `hero` | centered, split-image-right, split-image-left, gradient-bold, with-app-screenshot | 5 |
| `logos` | simple-row, marquee, grid, with-title | 4 |
| `features` | cards-grid, bento-grid, icon-list, alternating, three-column | 5 |
| `social-proof` | cards-grid, carousel, single-quote, twitter-wall | 4 |
| `stats` | inline-row, cards, large-centered, with-description | 4 |
| `pricing` | three-tier, two-tier, comparison-table, single-highlight | 4 |
| `faq` | accordion, two-column, simple-list, with-categories | 4 |
| `cta` | bold-centered, with-image, split, minimal | 4 |
| `footer` | columns-with-socials, simple-centered, minimal, mega-footer | 4 |
| **Total** | | **42** |

### Content Schema Contract

Each type has a Zod schema in `frontend/src/lib/schemas/content/`. All variants of a type share the same schema:

| Type | Key Fields |
|------|-----------|
| `hero` | headline, subheadline, primaryCta, secondaryCta, image, badge |
| `features` | tagline, headline, description, features[{icon, title, description, image}] |
| `pricing` | tagline, headline, plans[{name, price, period, features[], cta, highlighted}] |
| `header` | logo{text, href}, navItems[{label, href}], cta |
| `logos` | title, logos[{name, src, href}] |
| `stats` | tagline, headline, stats[{value, label, description}] |
| `faq` | tagline, headline, items[{question, answer, category}] |
| `cta` | headline, description, primaryCta, secondaryCta, image |
| `footer` | logo, columns[{title, links[]}], socialLinks[], copyright, newsletter |
| `social-proof` | tagline, headline, testimonials[{quote, author, role, company, avatar, rating}] |

### Component File Convention

```
sections/<type>/
  schema.ts          # Re-exports from lib/schemas/content/<type>
  <variant>.tsx      # Component + metadata export
  index.ts           # Re-exports all variants
```

Each variant exports:
- `metadata`: `{ type, variant, description, tags, supportedModes }`
- Named component function: `({ content, mode }) => JSX`

### Styling Rules
- Use CSS variable tokens: `bg-background`, `text-foreground`, `bg-primary`
- Use `var(--font-heading)`, `var(--font-body)`, `var(--radius)` for fonts/radii
- Never hardcode colors — all values come from theme
- Responsive: `grid-cols-1 md:grid-cols-2 lg:grid-cols-3`
- Dark mode handled by parent `.dark` class on `SectionWrapper`

---

## AI Configurator

### Flow

1. User sends message in chat panel
2. `useAgent()` hook sends `RunAgentInput` to `POST /api/agent` (messages + current config as state)
3. Backend `build_system_prompt()` injects full component catalog (types, variants, descriptions, content schemas)
4. LLM receives: system prompt (catalog) + conversation history + user message
5. LLM determines intent: new page, edit content, swap variant, add/remove section, change theme
6. LLM responds with text + embedded JSON operations block
7. Backend `extract_operations()` parses the JSON from the response
8. Operations are either:
   - `replace_all` → `STATE_SNAPSHOT` event (full config replacement)
   - Incremental ops → `operations_to_patches()` → `STATE_DELTA` event (RFC 6902 patches)
9. Frontend Zustand store applies the update, preview re-renders

### Operation Types

| Operation | Effect |
|-----------|--------|
| `replace_all` | Full page config replacement (new pages) |
| `add_section` | Append section to stack |
| `remove_section` | Remove section by id |
| `update_content` | Update specific content fields |
| `swap_variant` | Change variant for a section |
| `set_theme` | Update theme properties |
| `reorder_sections` | Change section order |

---

## AG-UI Integration

### Event Types Used

| Event | Direction | Purpose |
|-------|-----------|---------|
| `RUN_STARTED` | Backend → Frontend | Agent run begins |
| `RUN_FINISHED` | Backend → Frontend | Agent run completed |
| `RUN_ERROR` | Backend → Frontend | Agent run failed |
| `STEP_STARTED` | Backend → Frontend | Phase begins (building_prompt, generating_response, applying_operations) |
| `STEP_FINISHED` | Backend → Frontend | Phase completed |
| `TEXT_MESSAGE_START` | Backend → Frontend | Assistant message begins |
| `TEXT_MESSAGE_CONTENT` | Backend → Frontend | Text chunk (filtered — JSON fences stripped) |
| `TEXT_MESSAGE_END` | Backend → Frontend | Assistant message complete |
| `TOOL_CALL_START` | Backend → Frontend | Operations tool call begins (`apply_operations`) |
| `TOOL_CALL_ARGS` | Backend → Frontend | Operations JSON chunk (200-char segments) |
| `TOOL_CALL_END` | Backend → Frontend | Operations tool call complete |
| `STATE_SNAPSHOT` | Backend → Frontend | Full page config replacement |
| `STATE_DELTA` | Backend → Frontend | Incremental RFC 6902 JSON Patches |

### Streaming Architecture

```
Frontend (useAgent)                    Backend (agent.py)
    │                                      │
    │  POST /api/agent                     │
    │  { messages, state, threadId }       │
    │─────────────────────────────────────>│
    │                                      │
    │  SSE: RUN_STARTED                    │
    │<─────────────────────────────────────│
    │  SSE: STEP_STARTED(building_prompt)  │
    │<─────────────────────────────────────│
    │  SSE: STEP_FINISHED(building_prompt) │
    │<─────────────────────────────────────│
    │  SSE: STEP_STARTED(generating)       │
    │<─────────────────────────────────────│
    │  SSE: TEXT_MESSAGE_START             │
    │<─────────────────────────────────────│
    │  SSE: TEXT_MESSAGE_CONTENT (chunk)   │ ← repeated (JSON fences filtered out)
    │<─────────────────────────────────────│
    │  SSE: TEXT_MESSAGE_END              │
    │<─────────────────────────────────────│
    │  SSE: STEP_FINISHED(generating)     │
    │<─────────────────────────────────────│
    │  SSE: STEP_STARTED(applying_ops)    │
    │<─────────────────────────────────────│
    │  SSE: TOOL_CALL_START(apply_ops)    │ ← operations streamed as tool call
    │<─────────────────────────────────────│
    │  SSE: TOOL_CALL_ARGS (chunk)        │ ← repeated (200-char segments)
    │<─────────────────────────────────────│
    │  SSE: TOOL_CALL_END                 │
    │<─────────────────────────────────────│
    │  SSE: STATE_SNAPSHOT or STATE_DELTA  │
    │<─────────────────────────────────────│
    │  SSE: STEP_FINISHED(applying_ops)   │
    │<─────────────────────────────────────│
    │  SSE: RUN_FINISHED                  │
    │<─────────────────────────────────────│
```

### Fence-Aware JSON Filtering

The backend strips `\`\`\`json ... \`\`\`` fences from the text stream in real-time so the user never sees raw JSON operations in the chat. The full unfiltered text is preserved for `extract_operations()` parsing. A lookback buffer (6 chars) handles chunk boundary splitting.

### Operations as Tool Calls

After parsing operations from the full response, the backend emits them as an AG-UI tool call stream (`apply_operations`). The frontend `useAgent` hook tracks these in a `toolCalls` Map (`ToolCallState`) and renders them via the `OperationsBlock` component — a collapsible pill showing a human-readable summary (e.g., "Page created with 7 sections") with expandable raw JSON.

---

## Database Architecture

### PostgreSQL (AWS RDS / localhost:5436)

**Database**: `naguib`

| Table | Columns | Purpose |
|-------|---------|---------|
| `users` | id (UUID PK), username (unique), password_hash, tier ("free"/"pro"), stripe_customer_id, created_at, updated_at | User accounts |
| `projects` | id (UUID PK), user_id (FK → users, CASCADE), name, config (JSON), conversation_history (JSON), thumbnail_url, created_at, updated_at | User's page projects |
| `project_versions` | id (UUID PK), project_id (FK → projects, CASCADE), config (JSON), created_at | Version history snapshots |

### Relationships

```
users (1) ──── (N) projects ──── (N) project_versions
```

- `projects.user_id` → `users.id` (CASCADE delete)
- `project_versions.project_id` → `projects.id` (CASCADE delete)

### Key Fields

- `projects.config`: Full PageConfig JSON (theme, sections, metadata)
- `projects.conversation_history`: Array of chat messages for the project
- `users.tier`: `"free"` or `"pro"` — controls rate limits and project count

---

## Theme System

### CSS Variable Tokens (OKLCH)

14 color tokens defined in `globals.css` `:root`:

| Token | Usage |
|-------|-------|
| `--background` | Page background |
| `--foreground` | Default text |
| `--primary` / `--primary-foreground` | Primary actions, buttons |
| `--secondary` / `--secondary-foreground` | Secondary elements |
| `--accent` / `--accent-foreground` | Accent highlights |
| `--muted` / `--muted-foreground` | Muted/disabled states |
| `--destructive` | Error/delete actions |
| `--border` | Borders |
| `--ring` | Focus rings |
| `--card` / `--card-foreground` | Card backgrounds |
| `--popover` / `--popover-foreground` | Popover/dropdown |

Additional tokens: `--font-heading`, `--font-body`, `--radius`

### Theme Presets (6)

| Preset | Primary | Font | Vibe |
|--------|---------|------|------|
| Corporate | Blue | Inter | Professional, trustworthy |
| Startup | Purple | DM Sans | Modern, energetic |
| Minimal | Black/White | Playfair Display | Clean, elegant |
| Bold | Red/Pink | Space Grotesk | Striking, impactful |
| Warm | Earth tones | Nunito | Friendly, approachable |
| Tech | Neon green on dark | JetBrains Mono | Developer, futuristic |

### Light/Dark Mode Per Section

- Each section has a `mode` prop: `"light"` or `"dark"`
- `SectionWrapper` adds `.dark` class when mode is dark
- CSS variables automatically flip under `.dark`
- Components use token classes only — never hardcode colors

---

## Export Pipeline

### Flow

1. User clicks "Export" in console toolbar
2. Frontend `POST /api/export` with current PageConfig
3. `buildExportProject(config)` generates a standalone project:
   - `package.json` (Vite + React 19 + Tailwind v4)
   - `vite.config.ts` + `tsconfig.json`
   - `src/main.tsx` + `src/App.tsx`
   - `src/globals.css` (theme as CSS variables)
   - `src/components/<Type><Variant>.tsx` (only used components)
   - Content inlined as constants
4. Returns zip file download

### Output Characteristics
- Zero runtime dependency on Naguib
- Each component ~50-100 lines, self-contained
- CSS variable theme is editable in `globals.css`
- LLM-modifiable (components are simple, standard React)

---

## Authentication

### Flow

```
Frontend                          Backend
   │                                 │
   │ POST /api/auth/register         │
   │  { username, password }         │
   │────────────────────────────────>│
   │                                 │ Hash password (bcrypt)
   │                                 │ Create user in DB
   │     { token, user_id, username }│ Generate JWT (HS256)
   │<────────────────────────────────│
   │                                 │
   │ Store token in localStorage     │
   │ All requests: Authorization:    │
   │   Bearer <token>                │
   │                                 │
   │ GET /api/auth/me                │
   │────────────────────────────────>│ Verify JWT
   │     { user_id, username, tier } │
   │<────────────────────────────────│
```

### JWT Configuration
- Algorithm: HS256
- Expiry: 168 hours (7 days), configurable via `JWT_EXPIRY_HOURS`
- Payload: `{ sub: user_id, username, exp }`
- Secret: `JWT_SECRET` env var

### Protected Routes
- `ProtectedRoute` component wraps pages requiring auth
- Redirects to `/login` if no token
- Shows loading state while verifying

---

## API Endpoints

### Health
| Method | Endpoint | Auth | Rate Limit | Description |
|--------|----------|------|------------|-------------|
| GET | `/health` | No | — | Health check + DB connectivity |

### Auth (`/api/auth`)
| Method | Endpoint | Auth | Rate Limit | Description |
|--------|----------|------|------------|-------------|
| POST | `/api/auth/register` | No | — | Create account → JWT |
| POST | `/api/auth/login` | No | — | Authenticate → JWT |
| GET | `/api/auth/me` | JWT | — | Current user info |

### Projects (`/api/projects`)
| Method | Endpoint | Auth | Rate Limit | Description |
|--------|----------|------|------------|-------------|
| POST | `/api/projects` | JWT | 10/min | Create project (free tier limit enforced) |
| GET | `/api/projects` | JWT | — | List user's projects |
| GET | `/api/projects/{id}` | JWT | — | Full project config + conversation |
| PUT | `/api/projects/{id}` | JWT | — | Update project (auto-save target) |
| DELETE | `/api/projects/{id}` | JWT | — | Delete project + cascade versions |

### Agent (`/api`)
| Method | Endpoint | Auth | Rate Limit | Description |
|--------|----------|------|------------|-------------|
| POST | `/api/agent` | JWT | Per-tier daily | AG-UI agent (SSE stream) |

### Uploads (`/api`)
| Method | Endpoint | Auth | Rate Limit | Description |
|--------|----------|------|------------|-------------|
| POST | `/api/upload` | JWT | 30/min | Image upload (jpg/png/webp/svg, max 5MB) |

### Billing (`/api/billing`)
| Method | Endpoint | Auth | Rate Limit | Description |
|--------|----------|------|------------|-------------|
| POST | `/api/billing/create-checkout` | JWT | — | Stripe Checkout session (upgrade to Pro) |
| POST | `/api/billing/portal` | JWT | — | Stripe Customer Portal |
| POST | `/api/billing/webhook` | Stripe sig | — | Stripe events → tier updates |

### Rate Limiting
- **Free tier**: 20 messages/day, 1 project max
- **Pro tier**: 200 messages/day, unlimited projects
- **Uploads**: 30/minute per user
- **Project creation**: 10/minute per user

---

## Local Development

### Prerequisites
- Python >=3.12 + `uv` package manager
- Node.js 18+ + npm
- PostgreSQL (local or remote)

### Quick Start

```bash
# Backend
cd backend
cp .env.example .env          # Edit with your DB URL + API keys
uv sync                       # Install Python dependencies
alembic upgrade head          # Run migrations
uvicorn app.main:app --reload --port 8002

# Frontend
cd frontend
npm install
npm run dev                   # Starts on port 3003
```

### Environment Variables

| Variable | Service | Default | Description |
|----------|---------|---------|-------------|
| `DATABASE_URL` | Backend | `postgresql+asyncpg://...localhost:5436/naguib` | PostgreSQL connection |
| `JWT_SECRET` | Backend | `dev-secret-change-me` | JWT signing secret |
| `JWT_EXPIRY_HOURS` | Backend | `168` | Token expiry (7 days) |
| `ANTHROPIC_API_KEY` | Backend | — | Claude API key |
| `GEMINI_API_KEY` | Backend | — | Gemini API key |
| `LLM_PROVIDER` | Backend | `gemini` | `"anthropic"` or `"gemini"` |
| `LLM_MODEL` | Backend | `gemini-2.5-flash` | Model identifier |
| `FRONTEND_URL` | Backend | `http://localhost:3003` | CORS origin |
| `AWS_S3_BUCKET` | Backend | (empty) | S3 bucket (empty = local filesystem) |
| `STRIPE_SECRET_KEY` | Backend | — | Stripe secret key |
| `STRIPE_WEBHOOK_SECRET` | Backend | — | Stripe webhook verification |
| `STRIPE_PRO_PRICE_ID` | Backend | — | Stripe Pro plan price ID |
| `FREE_MESSAGES_PER_DAY` | Backend | `20` | Daily message limit (free) |
| `PRO_MESSAGES_PER_DAY` | Backend | `200` | Daily message limit (pro) |
| `FREE_PROJECT_LIMIT` | Backend | `1` | Max projects (free) |
| `NEXT_PUBLIC_API_URL` | Frontend | `http://localhost:8002` | Backend API URL |
| `NEXT_PUBLIC_AGENT_URL` | Frontend | `http://localhost:8002/api/agent` | Agent SSE endpoint |

---

## Implementation Checklist

### Adding a New Section Type

1. Create content schema in `frontend/src/lib/schemas/content/<type>.ts`
2. Export from `frontend/src/lib/schemas/content/index.ts`
3. Add to `contentSchemaMap` in `frontend/src/lib/schemas/page-config.ts`
4. Add to `SectionType` enum in `page-config.ts`
5. Create directory `frontend/src/components/sections/<type>/`
6. Add `schema.ts` re-exporting from `lib/schemas/content`
7. Create variant components with `metadata` export
8. Create `index.ts` re-exporting all variants
9. Register in `frontend/src/components/sections/register.ts`
10. Update backend catalog in `backend/app/services/catalog.py`

### Adding a New Variant

1. Create `frontend/src/components/sections/<type>/<variant>.tsx`
2. Export `metadata` and named component function
3. Re-export from `<type>/index.ts`
4. Add `registerComponent()` call in `register.ts`
5. Update backend catalog

### Adding a New Backend Endpoint

1. Create/update router in `backend/app/routers/<router>.py`
2. Add Pydantic schemas in `backend/app/schemas/<schema>.py`
3. Register router in `backend/app/main.py` if new file
4. Add rate limiting if needed
5. Update API client in `frontend/src/lib/api/client.ts`

### Full Stack Feature

1. Design Pydantic schemas + SQLAlchemy models (if DB)
2. Create Alembic migration: `alembic revision --autogenerate -m "description"`
3. Implement backend router + service
4. Test with `httpx` or curl
5. Implement frontend (API client → hook/store → component)
6. Run `/update-arch` if architectural change

---

## Commit Tracking

| Repository | Branch | Last Commit |
|------------|--------|-------------|
| Monorepo | main | 45f030771e2c97f4ca64bff6876638fe84cb6207 |

---
<!-- LAST_UPDATED: 2026-02-28 -->
<!-- COMMIT: 45f030771e2c97f4ca64bff6876638fe84cb6207 -->
