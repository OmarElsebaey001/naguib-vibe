# Plan 06 — Auth & Persistence

> Status: `COMPLETE`

---

## Goal

Users can register, log in, save projects, and come back to them later. Images are stored. Projects are listed in a dashboard. **All server-side logic lives in FastAPI** — auth, database, project CRUD, image uploads. Next.js is a pure frontend that calls the FastAPI API.

### Architecture

```
Next.js (frontend)                        FastAPI (backend)
─────────────────                         ─────────────────
POST /api/auth/register  ───────────────► Create user (bcrypt hash)
POST /api/auth/login     ───────────────► Validate password → return JWT

GET  /api/projects       ───────────────► List user's projects (from JWT)
POST /api/projects       ───────────────► Create project
GET  /api/projects/:id   ───────────────► Load project + conversation
PUT  /api/projects/:id   ───────────────► Save project (auto-save)
DELETE /api/projects/:id ───────────────► Delete project

POST /api/upload         ───────────────► Upload image → S3/local → return URL

POST /api/agent          ───────────────► AG-UI SSE stream (requires JWT)

All requests include: Authorization: Bearer <jwt_token>
```

---

## Tasks

### 6.1 Database Schema (SQLAlchemy + Alembic)
- [ ] Define SQLAlchemy models:
  ```python
  class User(Base):
      id: UUID (primary key)
      username: str (unique, indexed)
      password_hash: str
      tier: str = "free"  # "free" | "pro"
      created_at: datetime
      updated_at: datetime

  class Project(Base):
      id: UUID (primary key)
      user_id: UUID (foreign key → User.id)
      name: str
      config: JSON  # PageConfig as JSON
      conversation_history: JSON  # AG-UI Message[] as JSON
      thumbnail_url: str (nullable)
      created_at: datetime
      updated_at: datetime

  class ProjectVersion(Base):
      id: UUID (primary key)
      project_id: UUID (foreign key → Project.id)
      config: JSON  # PageConfig snapshot
      created_at: datetime
  ```
- [ ] Create Alembic migration for initial schema
- [ ] Run migration against **local Postgres** (dev): `alembic upgrade head` with local `DATABASE_URL`
- [ ] Run migration against **AWS RDS** (production): same command, different `DATABASE_URL` from `.env.production`
- [ ] Add indexes: `User.username`, `Project.user_id`

### 6.2 Auth Endpoints (FastAPI)
- [ ] `POST /api/auth/register` — Create new user
  - Input: `{ username: str, password: str }`
  - Hash password with bcrypt via `passlib`
  - Return: `{ user_id, username, token }`
  - Validation: username unique, password min 8 chars
- [ ] `POST /api/auth/login` — Authenticate user
  - Input: `{ username: str, password: str }`
  - Verify password against bcrypt hash
  - Generate JWT with `python-jose` (payload: `{ sub: user_id, username, exp }`)
  - Return: `{ token, user_id, username }`
  - JWT expiry: 7 days (configurable via `JWT_EXPIRY_HOURS` env var)
- [ ] `GET /api/auth/me` — Get current user from JWT
  - Requires valid JWT in `Authorization: Bearer <token>` header
  - Return: `{ user_id, username, tier, created_at }`

### 6.3 Auth Middleware (FastAPI)
- [ ] `get_current_user` dependency that:
  - Extracts JWT from `Authorization: Bearer <token>` header
  - Validates JWT signature and expiry using `JWT_SECRET`
  - Looks up user in database by `user_id` from token claims
  - Returns `User` object or raises `401 Unauthorized`
- [ ] Apply to all protected endpoints: `/api/projects/*`, `/api/agent`, `/api/upload`
- [ ] Public endpoints (no auth required): `/api/auth/register`, `/api/auth/login`, `/health`

### 6.4 Frontend Auth Integration (Next.js)
- [ ] Login page (`/login`) — username + password form
- [ ] Register page (`/register`) — username + password + confirm password form
- [ ] Store JWT in `localStorage` (or secure httpOnly cookie via a thin Next.js API proxy)
- [ ] Auth context/provider that:
  - Holds current user state + JWT token
  - Exposes `login()`, `register()`, `logout()`
  - Includes JWT in all API calls to FastAPI (`Authorization: Bearer <token>`)
  - Redirects to `/login` if token is missing or expired
- [ ] Protected routes: `/console/*`, `/dashboard` require auth
- [ ] Public routes: `/`, `/login`, `/register`

### 6.5 Project CRUD (FastAPI)
- [ ] `POST /api/projects` — Create project
  - Input: `{ name: str }`
  - Creates project with empty config + empty conversation for current user
  - Return: `{ id, name, created_at }`
- [ ] `GET /api/projects` — List user's projects
  - Returns all projects for current user (from JWT), ordered by `updated_at` desc
  - Each: `{ id, name, thumbnail_url, updated_at }`
- [ ] `GET /api/projects/:id` — Load project
  - Returns full project: `{ id, name, config, conversation_history, updated_at }`
  - Only accessible by project owner (check `user_id` matches JWT)
- [ ] `PUT /api/projects/:id` — Save project (auto-save)
  - Input: `{ config?: PageConfig, conversation_history?: Message[], name?: str }`
  - Partial update — only update fields that are provided
  - Optionally create `ProjectVersion` snapshot for undo history
- [ ] `DELETE /api/projects/:id` — Delete project
  - Only accessible by project owner
  - Cascade delete versions

### 6.6 Dashboard (Next.js)
- [ ] `/dashboard` — grid of user's projects (fetched from `GET /api/projects`)
- [ ] Each card: thumbnail, name, last modified date
- [ ] Create new project button (calls `POST /api/projects`)
- [ ] Delete project (with confirmation, calls `DELETE /api/projects/:id`)
- [ ] Click → navigates to `/console/:projectId` with that project loaded

### 6.7 Image Uploads
- [ ] `POST /api/upload` — Upload image (requires auth)
  - Accept multipart form data
  - Validate: size limit 5MB, types jpg/png/webp/svg only
  - Storage backend determined by `AWS_S3_BUCKET` env var:
    - **Set** → upload to S3, return S3 URL
    - **Empty/unset** → save to local `uploads/` dir, return local URL
  - Return: `{ url: "https://..." }` (S3) or `{ url: "/uploads/..." }` (local)
- [ ] **Production**: Configure S3 bucket with public read access for uploaded images
- [ ] **Dev**: Serve from local filesystem via FastAPI static files mount (`/uploads`)

### 6.8 Auto-Save Integration
- [ ] Console (`usePageConfig()` store) debounces config changes (2 second delay)
- [ ] On debounce: calls `PUT /api/projects/:id` with current config + conversation
- [ ] On page load: calls `GET /api/projects/:id` and restores config + conversation
- [ ] Conversation history stored as JSON array of AG-UI `Message` objects — must serialize/deserialize cleanly

---

## Exit Criteria

- [ ] User can register with username/password → gets JWT → redirected to dashboard
- [ ] User can log in → JWT stored → all API calls authenticated
- [ ] Invalid/expired JWT → 401 → redirected to login
- [ ] Create project → build page → close browser → come back → page is restored
- [ ] Dashboard shows all projects with names and dates
- [ ] Images uploaded in a project persist and render correctly
- [ ] Conversation history round-trips cleanly: save to Postgres JSON → load back → AG-UI messages intact
- [ ] Project access is scoped: user A cannot access user B's projects

---

## Dependencies

- Plan 01 (Foundation): FastAPI project scaffolded, SQLAlchemy + Alembic set up, Postgres connected
- Plan 04 (Console): needs to exist so we can wire auto-save and project loading

## Blocks

None — parallel work, not on critical path.
