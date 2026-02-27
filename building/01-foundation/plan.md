# Plan 01 — Foundation

> Status: `NOT STARTED`

---

## Goal

Set up **both projects** (Next.js frontend + FastAPI backend), define all core abstractions, and have a working renderer that can take a page config JSON and paint a page with themed, responsive components.

By the end of this plan, we should be able to hand-write a page config JSON and see it render correctly in a browser, and have the FastAPI backend scaffolded and ready for the AI agent logic.

---

## Tasks

### 1.1a Frontend Project Setup (Next.js)
- [ ] Initialize Next.js 15 project with App Router, TypeScript strict
- [ ] Install and configure Tailwind CSS v4
- [ ] Install shadcn/ui (for console UI only)
- [ ] Install cva, clsx, tailwind-merge
- [ ] Install Zod
- [ ] Install `@ag-ui/client` and `rxjs` (AG-UI protocol for console↔agent communication)
- [ ] Set up project structure:
  ```
  frontend/
    src/
      app/              # Next.js app router
      components/
        ui/             # shadcn/ui console components
        sections/       # Section components (the product)
      lib/
        registry/       # Component registry system
        schemas/        # Zod schemas (TypeScript)
        theme/          # Theme engine
        renderer/       # PageRenderer
  ```
- [ ] Configure path aliases (`@/`)
- [ ] Set up ESLint + Prettier

### 1.1b Backend Project Setup (FastAPI)
- [ ] Initialize Python project with `uv` (or `poetry`)
- [ ] Install FastAPI, uvicorn, pydantic v2
- [ ] Install SQLAlchemy 2.0 (async), asyncpg, alembic (ORM + Postgres)
- [ ] Install `python-jose[cryptography]`, `passlib[bcrypt]` (auth)
- [ ] Install `anthropic` (Python SDK)
- [ ] Install `ag-ui-core` and `ag-ui-encoder` (AG-UI Python SDK — event models, RunAgentInput, EventEncoder)
- [ ] Install `jsonpatch` (RFC 6902 JSON Patch)
- [ ] Install `boto3` (AWS S3 for image uploads — optional, can use local filesystem in dev)
- [ ] Set up project structure:
  ```
  backend/
    app/
      main.py           # FastAPI app entry point
      routers/
        agent.py        # AG-UI agent endpoint (POST /api/agent)
        auth.py         # Auth endpoints (POST /api/auth/register, /api/auth/login)
        projects.py     # Project CRUD (GET/POST/PUT/DELETE /api/projects)
        uploads.py      # Image upload (POST /api/upload)
      models/
        user.py         # SQLAlchemy User model
        project.py      # SQLAlchemy Project model
      schemas/
        page_config.py  # Pydantic models (mirror of frontend Zod schemas)
        operations.py   # Operation types + JSON Patch mapping
        auth.py         # Auth request/response schemas (register, login, token)
        project.py      # Project request/response schemas
      services/
        claude.py       # Anthropic Claude API wrapper
        catalog.py      # Catalog generation from registry data
        prompt.py       # System prompt builder
      core/
        config.py       # Settings (API keys, CORS origins, DB URL, JWT secret, etc.)
        database.py     # SQLAlchemy async engine + session factory
        security.py     # JWT creation/validation, password hashing
      migrations/       # Alembic migrations
    tests/
    pyproject.toml
    alembic.ini
  ```
- [ ] Configure CORS middleware (allow frontend origin)
- [ ] Create `.env` with `DATABASE_URL`, `JWT_SECRET`, `ANTHROPIC_API_KEY`, `FRONTEND_URL`
- [ ] Set up SQLAlchemy async engine with asyncpg connecting to Postgres
- [ ] Initialize Alembic for migrations
- [ ] Verify server starts: `uvicorn app.main:app --reload`
- [ ] Health check endpoint: `GET /health` → `{ "status": "ok" }`

### 1.1c Shared Schema Strategy
- [ ] Define canonical schemas in **Zod (frontend)** as the source of truth
- [ ] Mirror them in **Pydantic (backend)** for validation on the Python side
- [ ] Export JSON Schema from Zod → backend loads at startup for AI catalog
- [ ] Import AG-UI event models from `ag_ui.core` (RunAgentInput, EventType, all event classes) — do NOT redefine them
- [ ] Use `ag_ui.encoder.EventEncoder` for SSE formatting — do NOT build custom SSE serialization
- [ ] Document the schema sync process (which side is source of truth, how to keep in sync)

### 1.2 Zod Schemas
- [ ] `ThemeSchema` — all CSS variable tokens
- [ ] `SectionSchema` — id, type, variant, mode, content
- [ ] `PageConfigSchema` — id, name, theme, sections, metadata, version
- [ ] Content schemas per section type:
  - [ ] `HeaderContentSchema`
  - [ ] `HeroContentSchema`
  - [ ] `LogosContentSchema`
  - [ ] `FeaturesContentSchema`
  - [ ] `SocialProofContentSchema`
  - [ ] `StatsContentSchema`
  - [ ] `PricingContentSchema`
  - [ ] `FaqContentSchema`
  - [ ] `CtaContentSchema`
  - [ ] `FooterContentSchema`
- [ ] JSON Schema generation from Zod (for AI catalog)

### 1.3 Component Registry
- [ ] Define `ComponentRegistryEntry` type
- [ ] Build registry that maps `type:variant` → component + metadata
- [ ] Auto-discovery from file convention OR manual registration
- [ ] Export function to generate AI catalog JSON from registry
- [ ] Validate that all registered components have matching schemas

### 1.4 Theme Engine
- [ ] Define theme presets (Corporate, Startup, Minimal, Bold, Warm, Tech)
- [ ] Function: `themeToCSS(theme: Theme) → string` (generates CSS variable declarations)
- [ ] Section-level mode switching: wrapper component that applies `.dark` class
- [ ] Verify CSS variable inheritance works across light/dark mode boundaries

### 1.5 PageRenderer
- [ ] `<PageRenderer config={PageConfig} />` component
- [ ] Injects theme as CSS variables on root
- [ ] Maps over sections → looks up registry → renders component with content + mode
- [ ] Handles unknown type/variant gracefully (error boundary per section)
- [ ] Verify with a hand-written test config

### 1.6 Smoke Test
- [ ] Create 1 minimal component per type (placeholder/skeleton)
- [ ] Write a complete test page config JSON by hand
- [ ] Render it with PageRenderer
- [ ] Verify: theme applies, mode switches work, responsive at all 3 breakpoints
- [ ] Screenshot the result — this is our "it works" proof

---

## Exit Criteria

- [ ] A hand-written page config JSON renders a full page with placeholder components
- [ ] Theme changes (swap preset) visually update the entire page
- [ ] Section mode (light/dark) works independently per section
- [ ] All schemas validate correctly (both Zod and Pydantic)
- [ ] Registry exports a catalog JSON suitable for AI consumption
- [ ] FastAPI backend starts, health check passes, CORS configured for frontend origin
- [ ] SQLAlchemy connects to Postgres, Alembic migrations run successfully
- [ ] Both projects run concurrently in development (`frontend` on :3000, `backend` on :8000)

---

## Dependencies

None — this is the first plan.

## Blocks

- 02 Component Library
- 03 AI Configurator
- 04 Console
