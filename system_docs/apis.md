# Naguib — API Reference (V1)

> Every backend API endpoint needed for V1, mapped to user stories.
> Backend: **FastAPI**. Frontend: **Next.js** (pure client, calls FastAPI for all server logic).
> Export is the only exception — it runs client-side in Next.js (no FastAPI endpoint needed).

---

## Overview

| Group | Base Path | Auth Required | Description |
|-------|-----------|---------------|-------------|
| Health | `/health` | No | Server status |
| Auth | `/api/auth` | No (public) | Registration, login, session |
| Projects | `/api/projects` | Yes (JWT) | Project CRUD + listing |
| Agent | `/api/agent` | Yes (JWT) | AI configurator (AG-UI SSE stream) |
| Uploads | `/api/upload` | Yes (JWT) | Image uploads |
| Billing | `/api/billing` | Mixed | Stripe checkout + webhooks |

All authenticated endpoints require `Authorization: Bearer <jwt_token>` header.

---

## 1. Health

### `GET /health`

Server health check. No auth required.

- **Response**: `{ "status": "ok" }`
- **Stories**: Infrastructure (no direct user story — operational requirement)

---

## 2. Authentication

### `POST /api/auth/register`

Create a new user account.

- **Body**: `{ username: str, password: str }`
- **Validation**: username unique, password min 8 chars
- **Returns**: `{ user_id, username, token }` (JWT issued on registration)
- **Errors**: 409 if username taken, 422 if validation fails
- **Stories**: 1.2

### `POST /api/auth/login`

Authenticate and receive a JWT.

- **Body**: `{ username: str, password: str }`
- **Returns**: `{ token, user_id, username }`
- **JWT payload**: `{ sub: user_id, username, exp }` — 7 day expiry (configurable via `JWT_EXPIRY_HOURS`)
- **Errors**: 401 if invalid credentials
- **Stories**: 1.3

### `GET /api/auth/me`

Get current user from JWT. Used by frontend to validate session on page load.

- **Auth**: Required
- **Returns**: `{ user_id, username, tier, created_at }`
- **Errors**: 401 if token invalid/expired
- **Stories**: 1.4, 1.5 (redirect logic relies on this for session validation)

### `POST /api/auth/logout`

_Not needed server-side for JWT auth._ Frontend simply deletes the token from storage. Documented here for completeness.

- **Stories**: 1.6 (handled entirely client-side)

---

## 3. Projects

All project endpoints require JWT auth. Projects are scoped to the authenticated user — a user can only access their own projects.

### `GET /api/projects`

List all projects for the current user.

- **Auth**: Required
- **Returns**: Array of `{ id, name, thumbnail_url, created_at, updated_at }`
- **Ordering**: `updated_at` descending (most recent first)
- **Notes**: No pagination needed for V1 (free users have 1 project, Pro users unlikely to hit hundreds). Can add `?limit=&offset=` later if needed.
- **Stories**: 2.1, 2.3

### `POST /api/projects`

Create a new project.

- **Auth**: Required
- **Body**: `{ name: str }`
- **Returns**: `{ id, name, created_at }`
- **Behavior**: Creates project with empty config (`null`) and empty conversation history (`[]`)
- **Billing enforcement**: Free tier limited to 1 project — returns 403 with reason if limit hit
- **Stories**: 2.2, 15.1, 15.2

### `GET /api/projects/{project_id}`

Load a full project (config + conversation history).

- **Auth**: Required (owner only — checks `user_id` matches JWT)
- **Returns**: `{ id, name, config, conversation_history, created_at, updated_at }`
- **`config`**: Full `PageConfig` JSON (or `null` if new project)
- **`conversation_history`**: Array of AG-UI `Message` objects (serialized as JSON)
- **Errors**: 404 if not found, 403 if not owner
- **Stories**: 2.4, 5.4, 11.2

### `PUT /api/projects/{project_id}`

Save/update a project (used by auto-save and manual saves).

- **Auth**: Required (owner only)
- **Body**: `{ config?: PageConfig, conversation_history?: Message[], name?: str }`
- **Behavior**: Partial update — only updates provided fields. Sets `updated_at` to now.
- **Version snapshots**: Optionally creates a `ProjectVersion` row for undo history
- **Errors**: 404 if not found, 403 if not owner
- **Stories**: 11.1, 11.2, 11.3, 5.4

### `DELETE /api/projects/{project_id}`

Delete a project and its version history.

- **Auth**: Required (owner only)
- **Behavior**: Cascade deletes `ProjectVersion` rows. Also deletes associated uploaded images (if tracked).
- **Errors**: 404 if not found, 403 if not owner
- **Stories**: 2.5

---

## 4. AI Agent (AG-UI)

### `POST /api/agent`

The core AI endpoint. Receives a user message + current page state, streams back AG-UI events via SSE. This is the main interaction loop for page generation and editing.

- **Auth**: Required (JWT)
- **Content-Type (request)**: `application/json`
- **Content-Type (response)**: `text/event-stream` (SSE)
- **Body** (AG-UI `RunAgentInput`):
  ```
  {
    thread_id: str,              // Project/conversation ID
    run_id: str,                 // Unique run ID (client-generated)
    messages: Message[],         // Full conversation history (AG-UI format)
    tools: Tool[],               // Frontend-defined tools (JSON Schema)
    context: ContextItem[],      // Additional context (optional)
    state: PageConfig | null     // Current page config
  }
  ```
- **Response**: SSE stream of AG-UI `BaseEvent` objects. Event types emitted:
  - **Lifecycle**: `RUN_STARTED`, `RUN_FINISHED`, `RUN_ERROR`
  - **Steps**: `STEP_STARTED`, `STEP_FINISHED` (e.g., `"analyzing_intent"`, `"generating_response"`, `"applying_operations"`)
  - **Text streaming**: `TEXT_MESSAGE_START`, `TEXT_MESSAGE_CONTENT`, `TEXT_MESSAGE_END`
  - **State updates**: `STATE_SNAPSHOT` (full replace for new pages), `STATE_DELTA` (RFC 6902 JSON Patch for edits)
  - **Tool calls**: `TOOL_CALL_START`, `TOOL_CALL_ARGS`, `TOOL_CALL_END` (for frontend-executed tools)
  - **Activity**: `ACTIVITY_SNAPSHOT` (progress indicators like "Selecting components...")
- **Frontend-defined tools** the agent can invoke:
  - `confirm_destructive_change` — asks user to confirm before replacing entire page
  - `pick_section` — opens section picker UI for user to choose
  - `validate_config` — validates page config against Zod schemas
  - `get_current_config` — gets the latest page config state
- **Tool call flow**: Multi-turn. Agent emits `TOOL_CALL_*` → stream ends → frontend executes tool (may involve user interaction) → frontend starts a new `runAgent()` with `TOOL_CALL_RESULT` in messages → agent continues.
- **Billing enforcement**: Free tier limited to N messages/day — returns 403 with reason if limit hit
- **Retry logic**: If Claude returns invalid config, retries up to 2 times with error context (invisible to user). If all retries fail, emits `RUN_ERROR`.
- **Stories**: 3.1–3.7, 4a.1–4a.5, 4b.1–4b.7, 4c.1–4c.3, 4d.1–4d.3, 5.1–5.3, 5.5, 10.1–10.3, 15.1, 15.2, 16.1, 16.2, 16.6

---

## 5. Image Uploads

### `POST /api/upload`

Upload an image for use in landing page sections.

- **Auth**: Required (JWT)
- **Content-Type (request)**: `multipart/form-data`
- **Body**: Single file field (image)
- **Validation**:
  - Max size: 5 MB
  - Allowed types: `image/jpeg`, `image/png`, `image/webp`, `image/svg+xml`
- **Storage backend** (determined by `AWS_S3_BUCKET` env var):
  - **Set** → upload to S3, return public S3 URL
  - **Empty/unset** → save to local `uploads/` dir, serve via FastAPI static files
- **Returns**: `{ url: "https://s3.../image.png" }` (S3) or `{ url: "/uploads/abc123.png" }` (local)
- **Rate limiting**: Per-user limit on uploads
- **Stories**: 12.1, 12.2, 12.3

---

## 6. Billing

### `POST /api/billing/create-checkout`

Create a Stripe Checkout session for upgrading to Pro.

- **Auth**: Required (JWT)
- **Body**: `{ price_id: str }` (Stripe price ID for Pro plan)
- **Returns**: `{ checkout_url: str }` (Stripe hosted checkout page URL)
- **Behavior**: Creates Stripe Checkout session with `user_id` in metadata, returns URL for frontend redirect
- **Stories**: 15.3

### `POST /api/billing/webhook`

Stripe webhook endpoint. Called by Stripe when payment events occur.

- **Auth**: No JWT — authenticated via Stripe webhook signature verification
- **Headers**: `Stripe-Signature` header (verified against `STRIPE_WEBHOOK_SECRET`)
- **Body**: Stripe event payload (raw)
- **Handled events**:
  - `checkout.session.completed` → set user tier to `"pro"`
  - `customer.subscription.deleted` → set user tier to `"free"`
  - `customer.subscription.updated` → update tier accordingly
- **Behavior**: Updates `users.tier` column in Postgres
- **Stories**: 15.3, 15.4

### `POST /api/billing/portal`

Create a Stripe Customer Portal session for subscription management.

- **Auth**: Required (JWT)
- **Returns**: `{ portal_url: str }` (Stripe portal URL)
- **Behavior**: User can view invoices, update payment method, cancel subscription
- **Stories**: 15.4

---

## 7. Client-Side Only (No Backend Endpoint)

These capabilities are handled entirely in the frontend — documented here to show they are **not** missing from the API surface.

### Export / Download

Export the current page config as a standalone Vite + React project (zip download).

- **Implementation**: Next.js client-side logic. Reads component source files from the frontend bundle, assembles a zip, triggers browser download.
- **No FastAPI endpoint needed** — all data is already in frontend state.
- **Stories**: 13.1–13.9

### Undo / Redo

Page config version history maintained client-side in a state stack.

- **Implementation**: Frontend `usePageConfig()` store holds an array of past states (up to 50).
- **No API call per undo** — only the current state is auto-saved to `PUT /api/projects/{id}`.
- **Stories**: 9.1–9.5

### Theme Controls (Direct Manipulation)

Color pickers, font dropdowns, radius presets — all update the in-memory page config directly.

- **Implementation**: Frontend state updates → preview re-renders → auto-save debounce → `PUT /api/projects/{id}`
- **Stories**: 8.1–8.6

### Section Panel (Direct Manipulation)

Drag-and-drop reorder, mode toggle, variant swap, add/delete — all operate on in-memory page config.

- **Implementation**: Frontend state updates → auto-save
- **Stories**: 7.1–7.7

### Viewport Toggle / Preview

Desktop/Tablet/Mobile preview size switching.

- **Implementation**: Pure CSS/iframe resize. No API involvement.
- **Stories**: 6.1–6.5

### Logout

- **Implementation**: Frontend deletes JWT from storage, redirects to `/login`.
- **Stories**: 1.6

---

## Coverage Matrix

Every user story mapped to its API endpoint(s):

| Story | Endpoint(s) | Notes |
|-------|-------------|-------|
| **1. Onboarding & Auth** | | |
| 1.1 Landing page | — | Static Next.js page, no API |
| 1.2 Register | `POST /api/auth/register` | |
| 1.3 Login | `POST /api/auth/login` | |
| 1.4 Auto-redirect to dashboard | `GET /api/auth/me` | Frontend checks session validity |
| 1.5 Expired session → login | `GET /api/auth/me` | 401 triggers redirect |
| 1.6 Logout | — | Client-side token deletion |
| **2. Dashboard & Projects** | | |
| 2.1 List projects | `GET /api/projects` | |
| 2.2 Create project | `POST /api/projects` | |
| 2.3 Project cards (name, thumb, date) | `GET /api/projects` | Returns thumbnail_url, name, updated_at |
| 2.4 Open project in console | `GET /api/projects/{id}` | |
| 2.5 Delete project | `DELETE /api/projects/{id}` | |
| 2.6 Private projects | All `/api/projects/*` | Owner-scoped via JWT |
| **3. Page Generation** | | |
| 3.1–3.7 AI assembles page | `POST /api/agent` | STATE_SNAPSHOT for new pages |
| **4. Chat-Based Editing** | | |
| 4a.1–4a.5 Section ops | `POST /api/agent` | STATE_DELTA with JSON Patch |
| 4b.1–4b.7 Content edits | `POST /api/agent` | STATE_DELTA on content paths |
| 4c.1–4c.3 Theme edits via chat | `POST /api/agent` | STATE_DELTA on theme paths |
| 4d.1–4d.3 Informational queries | `POST /api/agent` | Text response only, no state events |
| **5. Chat Experience** | | |
| 5.1 Streaming responses | `POST /api/agent` | SSE TEXT_MESSAGE_CONTENT events |
| 5.2 Activity indicators | `POST /api/agent` | ACTIVITY_SNAPSHOT events |
| 5.3 Conversational + changes | `POST /api/agent` | Text + state events in same stream |
| 5.4 Persistent conversation | `GET/PUT /api/projects/{id}` | conversation_history field |
| 5.5 Error messages | `POST /api/agent` | RUN_ERROR event |
| 5.6 Retry on connection drop | — | Frontend reconnection logic |
| 5.7 Enter to submit | — | Frontend UX |
| 5.8 Auto-scroll | — | Frontend UX |
| **6. Live Preview** | | |
| 6.1–6.5 Preview rendering | — | Frontend (PageRenderer + iframe) |
| **7. Section Panel** | | |
| 7.1–7.7 Direct manipulation | — | Frontend state → auto-save via `PUT /api/projects/{id}` |
| **8. Theme Controls** | | |
| 8.1–8.6 Theme UI | — | Frontend state → auto-save via `PUT /api/projects/{id}` |
| **9. Undo / Redo** | | |
| 9.1–9.5 Undo stack | — | Frontend in-memory state |
| **10. Tool Interactions** | | |
| 10.1 Confirm destructive change | `POST /api/agent` | Agent calls `confirm_destructive_change` tool |
| 10.2 Section picker | `POST /api/agent` | Agent calls `pick_section` tool |
| 10.3 Config validation | `POST /api/agent` | Pydantic (backend) + Zod (frontend) |
| **11. Persistence & Auto-Save** | | |
| 11.1 Auto-save | `PUT /api/projects/{id}` | Debounced (2s) from frontend |
| 11.2 Config + conversation saved | `PUT /api/projects/{id}` | Both fields in same PUT |
| 11.3 Rename project | `PUT /api/projects/{id}` | name field |
| **12. Image Uploads** | | |
| 12.1 Upload images | `POST /api/upload` | |
| 12.2 Images persist | `POST /api/upload` | Stored in S3 or local filesystem |
| 12.3 Images in preview + export | — | URL reference in config, frontend renders |
| **13. Export** | | |
| 13.1–13.9 Download project | — | Client-side zip generation |
| **14. Responsive Console** | | |
| 14.1–14.3 Console layout | — | Frontend CSS/layout |
| **15. Billing & Usage** | | |
| 15.1 Free tier limits | `POST /api/projects`, `POST /api/agent` | Enforce limits, return 403 |
| 15.2 Limit messages | `POST /api/projects`, `POST /api/agent` | 403 with clear reason |
| 15.3 Upgrade to Pro | `POST /api/billing/create-checkout` | Stripe Checkout |
| 15.4 Manage subscription | `POST /api/billing/portal` | Stripe Customer Portal |
| 15.5 Per-account rate limiting | All authenticated endpoints | FastAPI middleware, keyed by user_id |
| **16. Error Recovery** | | |
| 16.1 Auto-retry invalid config | `POST /api/agent` | Server-side retry (up to 2) |
| 16.2 Error in chat | `POST /api/agent` | RUN_ERROR event |
| 16.3 Preview never breaks | — | Frontend error boundary |
| 16.4 Empty state | — | Frontend UX |
| 16.5 SSE retry | — | Frontend reconnection |
| 16.6 Dual validation | `POST /api/agent` | Pydantic (backend) + Zod (frontend) |

---

## Rate Limiting Summary

Applied via FastAPI middleware, keyed by `user_id` from JWT (or IP for unauthenticated requests).

| Endpoint | Free Tier | Pro Tier | Unauthenticated |
|----------|-----------|----------|-----------------|
| `POST /api/agent` | N messages/day | M messages/day (higher) | Blocked (401) |
| `POST /api/projects` | 1 project total | Unlimited | Blocked (401) |
| `POST /api/upload` | Per-user throttle | Per-user throttle (higher) | Blocked (401) |
| `POST /api/auth/*` | IP-based throttle | — | IP-based throttle |
| All endpoints | — | — | 1 req/min IP limit |

---

## Auth Middleware

Applied to all endpoints under `/api/projects/*`, `/api/agent`, `/api/upload`, `/api/billing/create-checkout`, `/api/billing/portal`.

**Public endpoints** (no auth): `/health`, `/api/auth/register`, `/api/auth/login`, `/api/billing/webhook`.

**Mechanism**: FastAPI dependency `get_current_user()` that extracts JWT from `Authorization: Bearer <token>`, validates signature + expiry, looks up user in Postgres, returns `User` or raises 401.

---

## Error Response Format

All API errors follow a consistent format:

```json
{
  "detail": "Human-readable error message",
  "code": "ERROR_CODE"
}
```

Common error codes:
- `401` — Invalid or expired JWT
- `403` — Not owner / tier limit reached (includes reason in `detail`)
- `404` — Resource not found
- `409` — Conflict (e.g., username taken)
- `422` — Validation error (Pydantic)
- `429` — Rate limit exceeded

---

*This document covers 100% of the 99 V1 user stories. Every story is either served by a backend API endpoint or handled entirely client-side (documented in Section 7).*
