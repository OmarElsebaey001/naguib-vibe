# Naguib — Master Plan

---

## Reference Files

These are the source of truth. Any agent implementing Naguib must read these first:

| File | Purpose |
|---|---|
| `system_docs/manifesto.md` | Core mental model — universal contract, two phases, principles |
| `system_docs/requirements.md` | Engineering spec — stack, schemas, AI flow, export format, timelines |
| `system_docs/ag-ui.md` | AG-UI protocol spec — the agent↔frontend communication protocol used for the console |

---

## Architecture

Two separate services communicating via the AG-UI protocol:

```
┌─────────────────────────────┐    AG-UI (SSE) + REST API    ┌─────────────────────────────┐
│       FRONTEND (Next.js)    │ ◄──────────────────────────► │     BACKEND (FastAPI)        │
│                             │                              │                              │
│  Console UI                 │   HttpAgent ↔ /api/agent     │  AG-UI Agent Endpoint        │
│  Chat Panel                 │   REST    ↔ /api/auth/*      │  Auth (JWT + bcrypt)         │
│  Live Preview (PageRenderer)│   REST    ↔ /api/projects/*  │  Project CRUD                │
│  Section Panel              │   REST    ↔ /api/upload      │  Image Uploads (S3/local)    │
│  Theme Controls             │                              │  Anthropic Claude SDK        │
│  @ag-ui/client (HttpAgent)  │                              │  SQLAlchemy + Postgres       │
│  Dashboard                  │                              │  Pydantic Schemas            │
└─────────────────────────────┘                              └─────────────────────────────┘
         │                                                              │
         ▼                                                              ▼
    Vercel (deploy)                                          AWS (EC2/ECS) + RDS Postgres
```

**FastAPI owns all server-side concerns**: auth, database, projects, AI agent, image storage.
**Next.js is a pure frontend**: UI rendering, preview, export (file generation only).

## Tech Stack

### Frontend (Next.js)

| Layer | Technology | Version |
|---|---|---|
| Framework | Next.js (App Router) | 15.x |
| Language | TypeScript (strict) | 5.x |
| Styling | Tailwind CSS | v4 |
| Variant management | class-variance-authority (cva) | latest |
| Class composition | clsx + tailwind-merge | latest |
| Console UI primitives | shadcn/ui | latest |
| Schema validation (frontend) | Zod | latest |
| Agent↔Frontend protocol | AG-UI (`@ag-ui/client`) | latest |
| Streaming primitives | RxJS (Observable) | latest |
| Deployment | Vercel | — |
| Export target | Vite + React | latest |

### Backend (FastAPI)

| Layer | Technology | Version |
|---|---|---|
| Framework | FastAPI | latest |
| Language | Python | 3.12+ |
| Schema validation | Pydantic v2 | latest |
| ORM | SQLAlchemy 2.0 (async) | latest |
| DB driver | asyncpg | latest |
| Migrations | Alembic | latest |
| Database | PostgreSQL on AWS RDS | 16.x |
| Auth | JWT (`python-jose[cryptography]`) + bcrypt (`passlib[bcrypt]`) | latest |
| AI provider | Anthropic Python SDK (`anthropic`) | latest |
| AG-UI Python SDK | `ag-ui-core` (`ag_ui.core`) + `ag-ui-encoder` (`ag_ui.encoder`) | latest |
| SSE streaming | FastAPI `StreamingResponse` + AG-UI `EventEncoder` | latest |
| JSON Patch | `jsonpatch` (RFC 6902) | latest |
| Image storage | AWS S3 (`boto3`) or local filesystem | latest |
| ASGI server | uvicorn | latest |
| Deployment | AWS (EC2/ECS) + RDS Postgres | — |

### Shared

| Layer | Technology |
|---|---|
| Agent↔Frontend protocol | AG-UI (SSE event stream) |
| Frontend↔Backend API | REST (auth, projects, uploads) + SSE (agent) |

---

## Plan of Plans

Each plan is a self-contained workstream. They are roughly sequential but some overlap. Each lives in its own directory with:

- `plan.md` — What needs to be built, broken into tasks
- `implementation.md` — What was actually done, decisions made, deviations from plan

| # | Plan | Directory | Status | Description |
|---|---|---|---|---|
| 01 | Foundation | `01-foundation/` | `NOT STARTED` | Frontend project setup (Next.js) + Backend project setup (FastAPI), schemas (Zod + Pydantic), component registry, theme engine, PageRenderer |
| 02 | Component Library | `02-component-library/` | `NOT STARTED` | Build ~40 section components across 10 types |
| 03 | AI Configurator (AG-UI Agent) | `03-ai-configurator/` | `NOT STARTED` | AG-UI agent backend: SSE streaming, event-driven ops, tool calls, state sync via snapshot/delta |
| 04 | Console (AG-UI Client) | `04-console/` | `NOT STARTED` | AG-UI HttpAgent client: chat panel, live preview, tool execution, state subscription, viewport toggle |
| 05 | Export Pipeline | `05-export-pipeline/` | `NOT STARTED` | Config → standalone Vite + React project download |
| 06 | Auth & Persistence | `06-auth-persistence/` | `NOT STARTED` | Username/password + JWT auth, Postgres (RDS) via SQLAlchemy, project CRUD, image uploads, dashboard |
| 07 | Polish & Launch | `07-polish-launch/` | `NOT STARTED` | Billing, rate limiting, landing page, performance, beta launch |

### Status Values

- `NOT STARTED` — No work begun
- `IN PROGRESS` — Actively being built
- `BLOCKED` — Waiting on a dependency or decision
- `COMPLETE` — Done and verified

### Dependency Graph

```
01 Foundation
 ├──→ 02 Component Library (needs schemas + registry + theme)
 ├──→ 03 AI Configurator (needs schemas + catalog format)
 └──→ 04 Console (needs PageRenderer + theme engine)

02 Component Library
 └──→ 03 AI Configurator (needs real components to test against)

03 AI Configurator
 └──→ 04 Console (needs AI endpoint to wire chat)

04 Console
 └──→ 05 Export Pipeline (needs working page to export)

06 Auth & Persistence ← needs 01 (FastAPI + SQLAlchemy) + 04 (Console to wire auto-save)
07 Polish & Launch ← starts after everything else
```

### Critical Path

```
Foundation → Component Library (MVP subset) → AI Configurator → Console → Export
```

Auth and Polish are parallel/trailing work.

---

## Conventions

### For agents implementing these plans:

1. **Read `system_docs/manifesto.md`, `system_docs/requirements.md`, and `system_docs/ag-ui.md` before touching any code.**
2. **Update `implementation.md`** in the relevant plan directory after completing work.
3. **Update the status** in this master plan table when a plan's status changes.
4. **Don't deviate from the requirements** without documenting the reason in implementation.md.
5. **Each component must be responsive** across desktop/tablet/mobile and support light/dark mode. No exceptions.
6. **Test with real content**, not lorem ipsum, before marking anything complete.
7. **Frontend code goes in `frontend/`**, backend code goes in `backend/`**. Never mix.
8. **Use the AG-UI Python SDK** (`ag_ui.core`, `ag_ui.encoder`) for the backend — don't reimplement event models.
9. **`requirements.md` describes the original vision** (pre-FastAPI, pre-AG-UI). The building plans are the updated source of truth for architecture decisions. Where they conflict, the building plans win.

---

## Security & Integration Checklist

Cross-service concerns that span multiple plans. Verify these before launch:

| Concern | Owner Plans | Details |
|---------|-------------|---------|
| **Frontend → Backend auth** | 06 + 03 | Frontend stores JWT from `/api/auth/login`. All API calls include `Authorization: Bearer <token>`. FastAPI middleware validates JWT, extracts `user_id`. |
| **Billing tier propagation** | 07 + 06 | Stripe webhook → updates `users.tier` in Postgres. FastAPI reads tier on every request. |
| **Rate limiting** | 07 | FastAPI: per-user (from JWT) on all endpoints. Keyed by `user_id`. |
| **Error handling (distributed)** | 07 + 03 + 04 | FastAPI validates with Pydantic before emitting state events. Frontend re-validates with Zod. SSE connection drops → retry with preserved state. |
| **Export auth** | 05 + 06 | Export builds zip client-side from frontend state. No server endpoint needed for V1. |
| **Conversation schema** | 04 + 06 | Chat history stored in Postgres `projects.conversation_history` as JSON array of AG-UI `Message` objects. Must round-trip cleanly. |
| **Tool contract sync** | 03 + 04 | Both plans must agree on tool names, schemas, and multi-turn flow. Changes require updating both plans. |
| **Message format** | 03 + 04 | All messages use AG-UI `Message` type. Frontend serializes to this format before `RunAgentInput`. |

---

*This file is the index. Start here, follow the plans in order.*
