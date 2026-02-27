# Plan 06 — Auth & Persistence

> Status: `NOT STARTED`

---

## Goal

Users can sign up, log in, save projects, and come back to them later. Images are stored. Projects are listed in a dashboard. **Auth works across both services** — frontend (Next.js) and backend (FastAPI).

---

## Tasks

### 6.1 Supabase Setup
- [ ] Create Supabase project
- [ ] Configure auth providers (email, Google, GitHub)
- [ ] Set up database tables:
  - `users` (managed by Supabase Auth)
  - `projects` (id, user_id, name, config JSON, conversation_history JSON, thumbnail_url, created_at, updated_at)
  - `project_versions` (id, project_id, config JSON, created_at) — for version history
- [ ] Set up Storage bucket for image uploads
- [ ] Row-level security policies (users only see their own projects)

### 6.2a Frontend Auth (Next.js)
- [ ] Supabase Auth in Next.js (middleware for protected routes)
- [ ] Sign up / sign in pages
- [ ] OAuth flows (Google, GitHub)
- [ ] Session management
- [ ] Redirect unauthenticated users to login
- [ ] Store Supabase JWT in client for API calls

### 6.2b Backend Auth Bridge (FastAPI)
> **CRITICAL**: This is the auth bridge between the two services.

- [ ] When frontend calls FastAPI `/api/agent`, send Supabase JWT in `Authorization: Bearer <token>` header
- [ ] FastAPI middleware to validate Supabase JWT on every request:
  - Verify JWT signature against Supabase project's JWT secret
  - Extract `user_id` from token claims
  - Reject expired or invalid tokens with 401
- [ ] Make `user_id` available to the agent endpoint (for billing/rate limiting in Plan 07)
- [ ] Unauthenticated requests to `/api/agent` → 401 Unauthorized
- [ ] Test: console sends JWT → FastAPI validates → agent responds. Invalid JWT → 401.

### 6.3 Project CRUD
> Projects are stored in Supabase and accessed from the Next.js frontend via Supabase client library. No FastAPI project endpoints needed — FastAPI only serves `/api/agent`.

- [ ] Create project (generates new UUID, empty config)
- [ ] Save project (auto-save config + conversation on change)
- [ ] Load project (fetch config + conversation, restore state)
- [ ] Delete project
- [ ] Rename project
- [ ] Conversation history persisted as JSON array of AG-UI `Message` objects (must serialize/deserialize cleanly)
- [ ] Project thumbnail: auto-screenshot of current preview (nice to have)

### 6.4 Dashboard
- [ ] `/dashboard` — grid of user's projects
- [ ] Each card: thumbnail, name, last modified date
- [ ] Create new project button
- [ ] Delete project (with confirmation)
- [ ] Click → opens console with that project loaded

### 6.5 Image Uploads
> Image uploads happen in the Next.js frontend (no Claude dependency). API route `/api/upload` accepts multipart form data.

- [ ] Next.js API route `/api/upload` for image uploads
- [ ] Validate: size limit 5MB, types jpg/png/webp/svg only
- [ ] Store in Supabase Storage
- [ ] Return public URL for use in content
- [ ] Chat can reference uploaded image URLs directly

---

## Exit Criteria

- [ ] User can sign up, create a project, build a page, close the browser, come back, and their page is there
- [ ] Dashboard shows all projects with thumbnails
- [ ] Images uploaded in a project persist and render correctly
- [ ] Auth works with email + at least one OAuth provider
- [ ] **Auth bridge**: console calls FastAPI with JWT → FastAPI validates and responds. Invalid/missing JWT → 401.
- [ ] Conversation history round-trips cleanly: save to Supabase JSON → load back → AG-UI messages intact

---

## Dependencies

- Plan 04 (Console): needs to exist so we can wire persistence into it
- Plan 03 (AI Configurator): FastAPI needs auth middleware added

## Blocks

None — parallel work, not on critical path.
