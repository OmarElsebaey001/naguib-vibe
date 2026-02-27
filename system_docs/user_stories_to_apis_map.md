# User Stories ↔ API Endpoints — Full Cross-Reference

> Bidirectional mapping: every user story to its endpoint(s), and every endpoint to its user stories.
> Ensures 100% coverage in both directions — nothing orphaned, nothing missing.

---

## Part 1: User Stories → API Endpoints

Every single V1 user story, with the exact endpoint(s) that serve it.

### 1. Onboarding & Authentication (6 stories)

| # | Story | Endpoint(s) | How |
|---|-------|-------------|-----|
| 1.1 | See a landing page explaining what Naguib does | — | Static Next.js page at `/`. No API call. |
| 1.2 | Register with username and password | `POST /api/auth/register` | Creates user, hashes password, returns JWT. |
| 1.3 | Log in with credentials | `POST /api/auth/login` | Validates password, returns JWT. |
| 1.4 | Auto-redirect to dashboard when logged in | `GET /api/auth/me` | Frontend calls on load; if valid → redirect to `/dashboard`. |
| 1.5 | Redirect to login on expired session | `GET /api/auth/me` | Returns 401 → frontend redirects to `/login`. |
| 1.6 | Log out | — | Client-side: delete JWT from storage, redirect to `/login`. |

### 2. Dashboard & Project Management (6 stories)

| # | Story | Endpoint(s) | How |
|---|-------|-------------|-----|
| 2.1 | See dashboard listing all my projects | `GET /api/projects` | Returns array of user's projects. |
| 2.2 | Create a new project from dashboard | `POST /api/projects` | Creates project with empty config. |
| 2.3 | See project name, thumbnail, last modified | `GET /api/projects` | Response includes `name`, `thumbnail_url`, `updated_at`. |
| 2.4 | Click project card to open in console | `GET /api/projects/{id}` | Loads full config + conversation history. |
| 2.5 | Delete a project (with confirmation) | `DELETE /api/projects/{id}` | Confirmation is frontend UI; API does the delete. |
| 2.6 | Projects are private to me | All `/api/projects/*` | Every endpoint checks `user_id` from JWT matches project owner. |

### 3. Page Generation — First Prompt (7 stories)

| # | Story | Endpoint(s) | How |
|---|-------|-------------|-----|
| 3.1 | Describe landing page in natural language | `POST /api/agent` | User message sent in `messages[]`; agent assembles page. |
| 3.2 | AI asks 1–2 clarifying questions | `POST /api/agent` | Agent streams text-only response (questions), no state events. |
| 3.3 | See fully assembled page in preview within seconds | `POST /api/agent` | Agent emits `STATE_SNAPSHOT` with full page config; frontend renders. |
| 3.4 | AI generates realistic content (not lorem ipsum) | `POST /api/agent` | Prompt engineering ensures relevant content generation. |
| 3.5 | AI picks appropriate theme | `POST /api/agent` | Theme included in `STATE_SNAPSHOT` page config. |
| 3.6 | AI assigns light/dark modes for visual rhythm | `POST /api/agent` | Each section in config has `mode` field set by AI. |
| 3.7 | AI confirms before replacing entire page | `POST /api/agent` | Agent calls `confirm_destructive_change` tool → frontend shows dialog. |

### 4a. Chat-Based Editing — Section Operations (5 stories)

| # | Story | Endpoint(s) | How |
|---|-------|-------------|-----|
| 4a.1 | Ask AI to add a section | `POST /api/agent` | `STATE_DELTA`: JSON Patch `add` on `/sections/-`. |
| 4a.2 | Ask AI to remove a section | `POST /api/agent` | `STATE_DELTA`: JSON Patch `remove` on `/sections/{i}`. |
| 4a.3 | Ask AI to reorder sections | `POST /api/agent` | `STATE_DELTA`: JSON Patch `move` on `/sections/{from}` → `/sections/{to}`. |
| 4a.4 | Ask AI to swap a section's variant | `POST /api/agent` | `STATE_DELTA`: JSON Patch `replace` on `/sections/{i}/variant`. |
| 4a.5 | Ask AI to change a section's mode | `POST /api/agent` | `STATE_DELTA`: JSON Patch `replace` on `/sections/{i}/mode`. |

### 4b. Chat-Based Editing — Content Editing (7 stories)

| # | Story | Endpoint(s) | How |
|---|-------|-------------|-----|
| 4b.1 | Change specific text (e.g., headline) | `POST /api/agent` | `STATE_DELTA`: patch on `/sections/{i}/content/headline`. |
| 4b.2 | Rewrite entire section's content | `POST /api/agent` | `STATE_DELTA`: patch replacing `/sections/{i}/content`. |
| 4b.3 | Update CTA labels and links | `POST /api/agent` | `STATE_DELTA`: patch on `/sections/{i}/content/cta_primary`. |
| 4b.4 | Update pricing plan details | `POST /api/agent` | `STATE_DELTA`: patch on `/sections/{i}/content/plans`. |
| 4b.5 | Add or edit FAQ items | `POST /api/agent` | `STATE_DELTA`: patch on `/sections/{i}/content/items`. |
| 4b.6 | Update testimonials/social proof | `POST /api/agent` | `STATE_DELTA`: patch on `/sections/{i}/content/items`. |
| 4b.7 | Change navigation and footer links | `POST /api/agent` | `STATE_DELTA`: patch on header/footer content fields. |

### 4c. Chat-Based Editing — Theme (3 stories)

| # | Story | Endpoint(s) | How |
|---|-------|-------------|-----|
| 4c.1 | Change color scheme via chat | `POST /api/agent` | `STATE_DELTA`: patches on `/theme/primary`, `/theme/secondary`, etc. |
| 4c.2 | Apply a theme preset via chat | `POST /api/agent` | `STATE_DELTA`: patches replacing all `/theme/*` values. |
| 4c.3 | Change fonts via chat | `POST /api/agent` | `STATE_DELTA`: patches on `/theme/fontHeading`, `/theme/fontBody`. |

### 4d. Chat-Based Editing — Informational Queries (3 stories)

| # | Story | Endpoint(s) | How |
|---|-------|-------------|-----|
| 4d.1 | Ask what sections I have | `POST /api/agent` | Text response only — no state events emitted. |
| 4d.2 | Ask what variants are available | `POST /api/agent` | Text response only — agent reads catalog and describes options. |
| 4d.3 | Ask what theme presets are available | `POST /api/agent` | Text response only — agent lists presets from catalog. |

### 5. Chat Experience (8 stories)

| # | Story | Endpoint(s) | How |
|---|-------|-------------|-----|
| 5.1 | See AI response stream in real-time | `POST /api/agent` | SSE `TEXT_MESSAGE_CONTENT` events streamed chunk by chunk. |
| 5.2 | See activity indicators while AI works | `POST /api/agent` | `ACTIVITY_SNAPSHOT` events (e.g., "Selecting components..."). |
| 5.3 | AI responds conversationally AND applies changes | `POST /api/agent` | Same stream contains text events + state events. |
| 5.4 | Conversation history persists across sessions | `PUT /api/projects/{id}`, `GET /api/projects/{id}` | `conversation_history` field saved and loaded as JSON. |
| 5.5 | Clear error message if AI fails | `POST /api/agent` | `RUN_ERROR` event with human-readable message. |
| 5.6 | Retry option if connection drops | — | Frontend reconnection logic; re-calls `POST /api/agent`. |
| 5.7 | Submit messages with Enter | — | Frontend UX (keyboard handling). |
| 5.8 | Chat auto-scrolls to latest message | — | Frontend UX (scroll behavior). |

### 6. Live Preview (5 stories)

| # | Story | Endpoint(s) | How |
|---|-------|-------------|-----|
| 6.1 | Live preview updates within 1 second | — | Frontend PageRenderer re-renders on state change. |
| 6.2 | Toggle Desktop / Tablet / Mobile viewports | — | Frontend iframe resize (CSS). |
| 6.3 | Scroll through full page in preview | — | Frontend iframe scrolling. |
| 6.4 | Preview renders actual components | — | Frontend PageRenderer + component registry. |
| 6.5 | Zoom / fit-to-width controls | — | Frontend CSS transform. |

### 7. Section Panel — Direct Manipulation (7 stories)

| # | Story | Endpoint(s) | How |
|---|-------|-------------|-----|
| 7.1 | See list of all sections | — | Frontend reads from in-memory page config. |
| 7.2 | Drag-and-drop to reorder sections | `PUT /api/projects/{id}` | Frontend reorders config → auto-save. |
| 7.3 | Toggle section mode (light/dark) with a click | `PUT /api/projects/{id}` | Frontend toggles mode → auto-save. |
| 7.4 | Swap variant via dropdown | `PUT /api/projects/{id}` | Frontend swaps variant → auto-save. |
| 7.5 | Delete a section from panel | `PUT /api/projects/{id}` | Frontend removes section → auto-save. |
| 7.6 | "Add section" button with section picker | `PUT /api/projects/{id}` | Frontend adds section → auto-save. |
| 7.7 | Section picker shows descriptions and thumbnails | — | Frontend reads from component registry (client-side). |

### 8. Theme Controls — Direct Manipulation (6 stories)

| # | Story | Endpoint(s) | How |
|---|-------|-------------|-----|
| 8.1 | Pick theme preset from grid | `PUT /api/projects/{id}` | Frontend applies preset → auto-save. |
| 8.2 | Adjust primary color via color picker | `PUT /api/projects/{id}` | Frontend updates theme → auto-save. |
| 8.3 | Adjust secondary, background, foreground colors | `PUT /api/projects/{id}` | Frontend updates theme → auto-save. |
| 8.4 | Choose heading and body fonts | `PUT /api/projects/{id}` | Frontend updates theme → auto-save. |
| 8.5 | Pick border radius preset | `PUT /api/projects/{id}` | Frontend updates theme → auto-save. |
| 8.6 | Theme changes apply instantly to preview | — | Frontend CSS variable injection — no API involved. |

### 9. Undo / Redo (5 stories)

| # | Story | Endpoint(s) | How |
|---|-------|-------------|-----|
| 9.1 | Undo last change (Ctrl+Z) | — | Frontend pops from in-memory state stack. |
| 9.2 | Redo undone change (Ctrl+Shift+Z) | — | Frontend pushes back from redo stack. |
| 9.3 | Undo works for both AI and manual changes | — | Unified state stack in frontend. |
| 9.4 | Undo button in UI | — | Frontend button triggers same logic. |
| 9.5 | Undo stack holds 50+ states | — | Frontend state array. |

### 10. Tool Interactions — AI ↔ Frontend (3 stories)

| # | Story | Endpoint(s) | How |
|---|-------|-------------|-----|
| 10.1 | Confirmation dialog before replacing page | `POST /api/agent` | Agent calls `confirm_destructive_change` tool → frontend shows dialog → result sent back in next run. |
| 10.2 | AI opens section picker for user to choose | `POST /api/agent` | Agent calls `pick_section` tool → frontend shows picker → result sent back. |
| 10.3 | Config validated before applying | `POST /api/agent` | Backend: Pydantic validates before emitting state events. Frontend: Zod re-validates as safety net. |

### 11. Persistence & Auto-Save (3 stories)

| # | Story | Endpoint(s) | How |
|---|-------|-------------|-----|
| 11.1 | Auto-save every 2 seconds of inactivity | `PUT /api/projects/{id}` | Frontend debounces config changes, sends PUT. |
| 11.2 | Page config + conversation saved together | `PUT /api/projects/{id}` | Both `config` and `conversation_history` in same PUT body. |
| 11.3 | Rename project | `PUT /api/projects/{id}` | `name` field in PUT body. |

### 12. Image Uploads (3 stories)

| # | Story | Endpoint(s) | How |
|---|-------|-------------|-----|
| 12.1 | Upload images (JPG, PNG, WebP, SVG, ≤5MB) | `POST /api/upload` | Multipart form upload; validated server-side. |
| 12.2 | Uploaded images persist across sessions | `POST /api/upload` | Stored in S3 (prod) or local filesystem (dev). URL saved in config. |
| 12.3 | Images render in preview and export | — | URL in page config; frontend renders; export includes URL reference. |

### 13. Export (9 stories)

| # | Story | Endpoint(s) | How |
|---|-------|-------------|-----|
| 13.1 | Download as Vite + React + Tailwind project | — | Client-side zip generation in Next.js. |
| 13.2 | `npm install && npm run dev` works | — | Export template tested offline. |
| 13.3 | `npm run build` produces static HTML | — | Vite static build. |
| 13.4 | Exported page identical to preview | — | Same components + theme. |
| 13.5 | Only used components included | — | Frontend filters by config sections. |
| 13.6 | Each component self-contained (~50–150 lines) | — | Component architecture. |
| 13.7 | Theme in `globals.css` as CSS variables | — | Export writes CSS from theme config. |
| 13.8 | README in export | — | Auto-generated during export. |
| 13.9 | Zero references to Naguib in export | — | Export strips all internal references. |

### 14. Responsive Console (3 stories)

| # | Story | Endpoint(s) | How |
|---|-------|-------------|-----|
| 14.1 | Two-panel layout on desktop | — | Frontend CSS layout. |
| 14.2 | Tabbed layout on mobile | — | Frontend responsive design. |
| 14.3 | Top bar with logo, project name, actions | — | Frontend component. |

### 15. Billing & Usage Limits (5 stories)

| # | Story | Endpoint(s) | How |
|---|-------|-------------|-----|
| 15.1 | Free user: 1 project, limited messages/day | `POST /api/projects`, `POST /api/agent` | FastAPI checks project count and daily message count; returns 403 if exceeded. |
| 15.2 | Clear message when limit hit | `POST /api/projects`, `POST /api/agent` | 403 response with human-readable `detail` explaining the limit. |
| 15.3 | Upgrade to Pro | `POST /api/billing/create-checkout` | Creates Stripe Checkout session; `POST /api/billing/webhook` updates tier on payment. |
| 15.4 | Manage subscription (cancel, update) | `POST /api/billing/portal` | Creates Stripe Customer Portal session. |
| 15.5 | Rate limiting per-account | All authenticated endpoints | FastAPI middleware keyed by `user_id` from JWT. |

### 16. Error Recovery & Edge Cases (6 stories)

| # | Story | Endpoint(s) | How |
|---|-------|-------------|-----|
| 16.1 | AI auto-retries on invalid config (up to 2) | `POST /api/agent` | Server-side retry loop; invisible to user. |
| 16.2 | Error message in chat after retries fail | `POST /api/agent` | `RUN_ERROR` event with message. |
| 16.3 | Preview never shows broken page | — | Frontend error boundary catches invalid state. |
| 16.4 | Empty project shows helpful empty state | — | Frontend empty state UI. |
| 16.5 | SSE connection drop shows retry option | — | Frontend detects disconnect, shows retry button. |
| 16.6 | Dual validation (backend + frontend) | `POST /api/agent` | Pydantic before emitting; Zod on receipt. |

---

## Part 2: API Endpoints → User Stories

The reverse mapping. Every endpoint with all the stories it serves.

### `GET /health`

| Stories | Count |
|---------|-------|
| — | 0 |

Operational endpoint. No direct user story — required for deployment health checks.

---

### `POST /api/auth/register`

| Stories | Count |
|---------|-------|
| 1.2 | 1 |

---

### `POST /api/auth/login`

| Stories | Count |
|---------|-------|
| 1.3 | 1 |

---

### `GET /api/auth/me`

| Stories | Count |
|---------|-------|
| 1.4, 1.5 | 2 |

---

### `GET /api/projects`

| Stories | Count |
|---------|-------|
| 2.1, 2.3, 2.6 | 3 |

---

### `POST /api/projects`

| Stories | Count |
|---------|-------|
| 2.2, 2.6, 15.1, 15.2 | 4 |

---

### `GET /api/projects/{id}`

| Stories | Count |
|---------|-------|
| 2.4, 2.6, 5.4, 11.2 | 4 |

---

### `PUT /api/projects/{id}`

| Stories | Count |
|---------|-------|
| 2.6, 5.4, 7.2, 7.3, 7.4, 7.5, 7.6, 8.1, 8.2, 8.3, 8.4, 8.5, 11.1, 11.2, 11.3 | 15 |

The auto-save workhorse. Every direct manipulation action in the frontend eventually flows through this endpoint.

---

### `DELETE /api/projects/{id}`

| Stories | Count |
|---------|-------|
| 2.5, 2.6 | 2 |

---

### `POST /api/agent`

| Stories | Count |
|---------|-------|
| 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 4a.1, 4a.2, 4a.3, 4a.4, 4a.5, 4b.1, 4b.2, 4b.3, 4b.4, 4b.5, 4b.6, 4b.7, 4c.1, 4c.2, 4c.3, 4d.1, 4d.2, 4d.3, 5.1, 5.2, 5.3, 5.5, 10.1, 10.2, 10.3, 15.1, 15.2, 15.5, 16.1, 16.2, 16.6 | **38** |

The AI core. Handles all chat-based interaction — generation, editing, informational queries, streaming, tool calls, error recovery, and billing enforcement.

---

### `POST /api/upload`

| Stories | Count |
|---------|-------|
| 12.1, 12.2 | 2 |

---

### `POST /api/billing/create-checkout`

| Stories | Count |
|---------|-------|
| 15.3 | 1 |

---

### `POST /api/billing/webhook`

| Stories | Count |
|---------|-------|
| 15.3, 15.4 | 2 |

Receives Stripe events to update user tier in the database.

---

### `POST /api/billing/portal`

| Stories | Count |
|---------|-------|
| 15.4 | 1 |

---

## Part 3: Summary

### Endpoint Load Distribution

| Endpoint | Story Count | Role |
|----------|-------------|------|
| `POST /api/agent` | 38 | AI core — generation, editing, queries, streaming, tools |
| `PUT /api/projects/{id}` | 15 | Auto-save — all frontend state changes persist through here |
| `GET /api/projects/{id}` | 4 | Project loading — config + conversation restoration |
| `POST /api/projects` | 4 | Project creation + billing enforcement |
| `GET /api/projects` | 3 | Dashboard listing |
| `DELETE /api/projects/{id}` | 2 | Project deletion |
| `GET /api/auth/me` | 2 | Session validation |
| `POST /api/upload` | 2 | Image uploads |
| `POST /api/billing/webhook` | 2 | Stripe tier updates |
| `POST /api/auth/register` | 1 | Registration |
| `POST /api/auth/login` | 1 | Login |
| `POST /api/billing/create-checkout` | 1 | Stripe checkout |
| `POST /api/billing/portal` | 1 | Subscription management |
| `GET /health` | 0 | Operational (no user story) |

### Client-Side Only Stories (no backend endpoint)

| Stories | Category |
|---------|----------|
| 1.1, 1.6 | Onboarding (landing page, logout) |
| 5.6, 5.7, 5.8 | Chat UX (retry, enter key, auto-scroll) |
| 6.1–6.5 | Live preview (rendering, viewports, zoom) |
| 7.1, 7.7 | Section panel (read-only display) |
| 8.6 | Theme instant preview |
| 9.1–9.5 | Undo/redo (in-memory state stack) |
| 12.3 | Image rendering in preview/export |
| 13.1–13.9 | Export pipeline (client-side zip) |
| 14.1–14.3 | Console responsive layout |
| 16.3–16.5 | Error recovery (frontend error boundaries, empty states, reconnection) |

**Total: 34 stories handled client-side only.**

### Final Tally

| | Count |
|---|---|
| Total user stories | 99 |
| Served by backend endpoints | 65 |
| Handled client-side only | 34 |
| Orphaned stories (no coverage) | **0** |
| Orphaned endpoints (no story) | **1** (`GET /health` — operational) |

---

*Every story has a home. Every endpoint has a purpose.*
