# Plan 06 — Auth & Persistence: Implementation

> Status: `COMPLETE`

---

## What Was Built

Full authentication, project persistence, and dashboard — users can register, log in, create/manage projects, and return to them later with config + conversation fully restored.

### Backend (FastAPI)

**Database setup:**
- Docker Postgres container `naguib-postgres` on port 5436
- Alembic migration auto-generated and applied — creates `users`, `projects`, `project_versions` tables
- Fixed timezone issue: model defaults use `datetime.utcnow()` (naive) to match asyncpg's behavior with `sa.DateTime()` columns

**Auth endpoints (`app/routers/auth.py`):**
- `POST /api/auth/register` — creates user with bcrypt hash, returns JWT
- `POST /api/auth/login` — validates password, returns JWT
- `GET /api/auth/me` — returns user info from JWT
- Rewrote `app/core/security.py` to use `bcrypt` directly (passlib incompatible with bcrypt 5.x)

**Auth middleware (`app/core/deps.py`):**
- `get_current_user` dependency using `HTTPBearer` security scheme
- Extracts JWT, validates signature/expiry, looks up user in DB
- Applied to: `/api/projects/*`, `/api/agent`, `/api/upload`

**Project CRUD (`app/routers/projects.py`):**
- `POST /api/projects` — create with empty config
- `GET /api/projects` — list user's projects (ordered by updated_at desc)
- `GET /api/projects/:id` — load with full config + conversation
- `PUT /api/projects/:id` — partial update (config, conversation, name)
- `DELETE /api/projects/:id` — delete with 204 response
- `_get_owned_project()` helper enforces ownership (403 if not owner)

**Upload endpoint (`app/routers/uploads.py`):**
- `POST /api/upload` — multipart file upload
- Validates content type (jpg/png/webp/svg) and size (5MB max)
- Saves to local `uploads/` directory with UUID filename

**Agent auth:**
- `app/routers/agent.py` now requires `Depends(get_current_user)`

### Frontend (Next.js)

**API client (`src/lib/api/client.ts`):**
- Full typed client with auto JWT injection from `localStorage`
- 401 handling: clears token, redirects to `/login`
- Functions: `register`, `login`, `getMe`, `listProjects`, `createProject`, `getProject`, `updateProject`, `deleteProject`

**Auth system:**
- `src/lib/auth/context.tsx` — AuthProvider with React Context, localStorage persistence
- `src/lib/auth/protected.tsx` — ProtectedRoute wrapper (redirects to /login if unauthenticated)
- `src/app/login/page.tsx` — login form with error display
- `src/app/register/page.tsx` — register form with confirm password

**Dashboard (`src/app/dashboard/page.tsx`):**
- Project grid with cards (thumbnail placeholder, name, date)
- Create new page → creates project → navigates to `/console/:id`
- Delete with confirmation dialog
- Logout button

**Project console (`src/app/console/[projectId]/page.tsx`):**
- Loads project on mount via `api.getProject(projectId)`
- Restores config + conversation history
- Auto-save with 2s debounce on config/messages changes
- Save on unmount
- Back to dashboard link
- All existing features preserved (undo/redo, theme picker, export, section panel)

**Routing updates:**
- `/` → redirects to `/dashboard`
- `/console` → redirects to `/dashboard`
- `/console/:projectId` → project-scoped console (protected)
- `/dashboard` → project list (protected)
- `/login`, `/register` → public

**AG-UI agent hook (`src/lib/agent/use-agent.ts`):**
- Added `setInitialMessages()` for restoring conversation on project load
- JWT token sent via `headers` config on HttpAgent

---

## Bugs Fixed

| Bug | Root Cause | Fix |
|-----|-----------|-----|
| `passlib` + `bcrypt` 5.x crash | passlib checks `bcrypt.__about__` which doesn't exist in v5 | Rewrote security.py to use `bcrypt` directly |
| Timezone-aware datetime in naive column | Models used `datetime.now(UTC)` but Alembic generated `sa.DateTime()` (no timezone) | Changed to `datetime.utcnow()` (naive UTC) |

---

## Verification

- **Build**: `npx next build` — 0 errors, all 8 routes compile
- **Auth enforcement**: Unauthenticated requests to `/api/projects`, `/api/agent`, `/api/auth/me` all return 401
- **Full CRUD flow**: register → login → me → create project → get → update (config + conversation) → list → delete → list (empty) — all pass
- **Project isolation**: Ownership check on get/update/delete prevents cross-user access

---

## Files Changed

### Backend
- `app/core/security.py` — rewritten (bcrypt direct)
- `app/core/deps.py` — new (get_current_user dependency)
- `app/models/user.py` — fixed datetime defaults
- `app/models/project.py` — fixed datetime defaults
- `app/routers/auth.py` — rewritten from stub
- `app/routers/projects.py` — rewritten from stub
- `app/routers/uploads.py` — rewritten from stub
- `app/routers/agent.py` — added auth dependency
- `app/main.py` — uploads dir creation on startup
- `migrations/versions/326a1718bece_*.py` — auto-generated initial migration

### Frontend
- `src/lib/api/client.ts` — new
- `src/lib/auth/context.tsx` — new
- `src/lib/auth/protected.tsx` — new
- `src/lib/agent/use-agent.ts` — added setInitialMessages + auth headers
- `src/app/page.tsx` — replaced smoke test with redirect to /dashboard
- `src/app/layout.tsx` — added AuthProvider
- `src/app/login/page.tsx` — new
- `src/app/register/page.tsx` — new
- `src/app/dashboard/page.tsx` — new
- `src/app/console/page.tsx` — replaced with redirect to /dashboard
- `src/app/console/[projectId]/page.tsx` — new (project-scoped console)
