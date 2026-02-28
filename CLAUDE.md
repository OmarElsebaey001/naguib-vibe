---
description:
alwaysApply: true
---

# Claude Development Guidelines

## HIGH-LEVEL OVERVIEW

### What is Naguib?

Naguib is a web application that assembles landing pages from a pre-built component library using AI. Users describe what they want in natural language, and the system selects from 42 tested, responsive components to produce a complete page in seconds. It does NOT generate code — it configures a finite, tested catalog. The experience is: chat on the left, live preview on the right.

### Repository Structure

Single git monorepo on `main` branch:

```
naguib/                          # Monorepo root
├── backend/                     # FastAPI + Python 3.12+
│   ├── app/                     # Application code
│   │   ├── core/                # Config, database, security, deps, rate limiting
│   │   ├── models/              # SQLAlchemy models (User, Project, ProjectVersion)
│   │   ├── routers/             # API endpoints (auth, projects, agent, uploads, billing)
│   │   ├── schemas/             # Pydantic request/response schemas
│   │   └── services/            # Business logic (catalog, prompt, LLM providers)
│   ├── migrations/              # Alembic database migrations
│   └── pyproject.toml           # Python dependencies
├── frontend/                    # Next.js 16 + React 19 + TypeScript
│   └── src/
│       ├── app/                 # App Router pages (landing, login, register, dashboard, console)
│       ├── components/          # UI: console/ (editor), sections/ (42 components), ui/ (primitives)
│       └── lib/                 # Core: agent, api, auth, export, registry, schemas, stores, theme
├── building/                    # Development plans (01-07, master_plan.md)
├── system_docs/                 # Architecture docs, manifesto, requirements, APIs
├── .claude/commands/            # Claude Code slash commands
└── research/                    # Architecture research & references
```

### Key Directories

| Directory | Purpose |
|-----------|---------|
| `backend/app/routers/` | FastAPI API endpoints |
| `backend/app/services/llm/` | LLM providers (Claude, Gemini) |
| `backend/app/models/` | SQLAlchemy ORM models |
| `frontend/src/components/sections/` | 42 component library (10 types x ~4 variants) |
| `frontend/src/lib/schemas/content/` | Zod content schemas per section type |
| `frontend/src/lib/stores/` | Zustand state management |
| `frontend/src/lib/agent/` | AG-UI integration (HttpAgent hook) |
| `frontend/src/lib/export/` | Export pipeline (config → Vite+React project) |
| `system_docs/` | Architecture reference, manifesto, API specs |
| `building/` | Implementation plans for each phase |

---

## CRITICAL RULES — MUST FOLLOW

### 1. GIT RULES
- This is a **monorepo** — one `.git`, one `main` branch
- Create feature branches for non-trivial changes: `feature/description` or `fix/description`

### 2. BACKEND (Python)
- Use the virtual environment: `cd backend && source .venv/bin/activate`
- Install with `uv sync`, NOT pip
- Backend runs on **port 8002**
- Always use `async` patterns with SQLAlchemy (AsyncSession)
- New migrations: `cd backend && alembic revision --autogenerate -m "description"`

### 3. FRONTEND (TypeScript)
- Frontend runs on **port 3003**
- Package manager: **npm** (not yarn, not pnpm)
- Styling: **Tailwind CSS v4** with OKLCH color tokens
- State: **Zustand** (not Redux, not Context API for state)
- Schemas: **Zod** for all validation
- Components use CSS variable tokens — never hardcode colors

### 4. COMPONENT LIBRARY RULES
- Every component follows the Universal Contract: `({ content, mode }) => JSX`
- All variants of a type share the **same content schema** — variant swapping must NOT break content
- Components must be responsive (mobile → tablet → desktop)
- Components must support both `light` and `dark` modes via CSS variables
- New components must export `metadata` object with `{ type, variant, description, tags, supportedModes }`
- Register new components in `frontend/src/components/sections/register.ts`

### 5. AI CONFIGURATOR RULES
- Output is JSON config, NOT generated code
- Operations are embedded in LLM text response as JSON blocks
- Backend catalog must stay in sync with frontend registry
- Always validate with Zod before applying to store

### 6. PORT ALLOCATIONS (from global registry)
- PostgreSQL: **5436**
- FastAPI backend: **8002**
- Next.js frontend: **3003**

---

## Development Commands

### Backend
```bash
cd backend
source .venv/bin/activate
uvicorn app.main:app --reload --port 8002     # Start dev server
alembic upgrade head                          # Run migrations
alembic revision --autogenerate -m "desc"     # Create migration
uv sync                                       # Install dependencies
pytest                                        # Run tests
```

### Frontend
```bash
cd frontend
npm install                   # Install dependencies
npm run dev                   # Start dev server (port 3003)
npm run build                 # Production build
npm run lint                  # ESLint check
```

---

## Before Any Git Operations

1. Check current branch: `git branch --show-current`
2. Check for uncommitted changes: `git status`
3. If on `main`, create a feature branch before making changes
4. Never force push to `main`
