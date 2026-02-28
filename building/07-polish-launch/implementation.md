# Plan 07 — Polish & Launch: Implementation

> Status: `IN PROGRESS`

---

## Completed

### 7.1 Rate Limiting (Backend)
- Installed `slowapi` and added to `pyproject.toml`
- Created `app/core/rate_limit.py` — per-user rate limiting keyed by `user_id` from JWT
- Dynamic limits based on tier: free gets `FREE_MESSAGES_PER_DAY`, pro gets `PRO_MESSAGES_PER_DAY`
- Applied to:
  - `/api/agent` — tier-based dynamic limit (20/day free, 200/day pro)
  - `POST /api/projects` — 10/minute
  - `POST /api/upload` — 30/minute
- Updated `get_current_user` dependency to stash user on `request.state` for rate limiter access
- Integrated limiter into `main.py` with `RateLimitExceeded` error handler (returns 429)

### 7.2 Project Limit Enforcement (Backend)
- `POST /api/projects` now checks project count for free tier users
- Free tier limited to `FREE_PROJECT_LIMIT` (default: 1) projects
- Returns 403 with clear upgrade message when limit hit
- Pro tier users have unlimited projects

### 7.3 Global Error Handlers (Backend)
- Added `RequestValidationError` handler — returns structured 422 with field-level errors
- Added catch-all `Exception` handler — returns 500 with generic message, logs full traceback
- Added `logging` setup with timestamp and level formatting
- Improved health check — tests database connectivity, returns 503 if DB is unreachable

### 7.4 Stripe Billing Skeleton (Backend)
- Rewrote `app/routers/billing.py` with three endpoints:
  - `POST /api/billing/create-checkout` — creates Stripe Checkout session for Pro upgrade
  - `POST /api/billing/portal` — creates Stripe Customer Portal session
  - `POST /api/billing/webhook` — handles `checkout.session.completed` (upgrade to pro) and `customer.subscription.deleted` (downgrade to free)
- Creates/retrieves Stripe customer, stores `stripe_customer_id` on User model
- All endpoints return 501 if Stripe keys not configured (graceful degradation)

### 7.5 Landing Page (Frontend)
- Built complete marketing page at `/` with sections:
  - Nav (sticky with blur backdrop)
  - Hero (gradient background, mock console screenshot, dual CTAs)
  - Logo bar (technologies used)
  - Features (6-card grid: chat to build, themes, components, export, reliability, iteration)
  - How It Works (4-step process)
  - Pricing (Free vs Pro cards)
  - FAQ (5 items with accordion)
  - CTA (gradient card with sign-up link)
  - Footer
- Authenticated users auto-redirect to `/dashboard`
- Design matches app aesthetic (zinc-950, violet accents, gradient text)

### 7.6 Frontend Error Handling
- Created toast notification system:
  - `src/lib/hooks/use-toast.ts` — external store with `showToast()` function, auto-dismiss after 4s
  - `src/components/ui/toast-container.tsx` — renders toasts with icons, colors, dismiss button
  - Added `ToastContainer` to root layout
- Updated API client:
  - 429 → "You've hit the rate limit" message
  - 403 → Shows `detail` from backend (e.g., project limit message)
- Console page improvements:
  - Project load failure → error state with "Back to Dashboard" link
  - Auto-save failure → toast on first failure (no spam)
  - Export success/failure → toasts
- Dashboard improvements:
  - Create project failure → toast with error message (shows upgrade prompt for free tier limit)
  - Delete project → confirmation toast

---

## Remaining (Requires External Setup)

### 7.7 Stripe Configuration
- Needs: `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PRO_PRICE_ID` in `.env`
- Code is ready — just needs keys configured

### 7.8 QA Pass
- Test all 10 section types × all variants in both modes
- Cross-browser testing (Chrome, Firefox, Safari)
- Full user flow: register → dashboard → create → build → iterate → export

### 7.9 Beta Launch
- Set up monitoring and error tracking
- Invite beta users
- Configure production deployment (Vercel + AWS)

---

## Files Changed

### Backend
- `app/core/rate_limit.py` — new (slowapi rate limiting module)
- `app/core/deps.py` — updated (stash user on request.state)
- `app/main.py` — rewritten (rate limiter, error handlers, health check)
- `app/routers/agent.py` — added rate limit decorator
- `app/routers/projects.py` — added project limit check + rate limit
- `app/routers/uploads.py` — added rate limit decorator
- `app/routers/billing.py` — rewritten (Stripe checkout, portal, webhook)
- `pyproject.toml` — added slowapi dependency

### Frontend
- `src/app/page.tsx` — rewritten (marketing landing page)
- `src/app/layout.tsx` — added ToastContainer
- `src/app/dashboard/page.tsx` — toast notifications on create/delete errors
- `src/app/console/[projectId]/page.tsx` — load error state, save failure toast, export toasts
- `src/lib/api/client.ts` — 429 and 403 handling
- `src/lib/hooks/use-toast.ts` — new (toast external store)
- `src/components/ui/toast-container.tsx` — new (toast UI component)

## Verification

- **Backend build**: Server starts with all new middleware, health check returns `{"status":"ok","database":"connected"}`
- **Rate limiting**: slowapi integrated, decorators applied to agent/projects/uploads
- **Project limits**: Free tier blocked from creating 2nd project with clear 403 message
- **Validation errors**: Returns structured 422 with field-level details
- **Frontend build**: `npx next build` — 0 errors, all 8 routes compile
