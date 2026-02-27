# Plan 07 — Polish & Launch

> Status: `NOT STARTED`

---

## Goal

Make it ready for real users. Billing, rate limiting, landing page, performance tuning, bug fixes, and beta launch. **Billing and rate limiting are split across two services.**

---

## Tasks

### 7.1 Billing
- [ ] Stripe integration
- [ ] Define tiers:
  - Free: 1 project, N messages/day
  - Pro: unlimited projects, more messages, export, custom domain
- [ ] Payment flow (checkout, subscription management)
- [ ] Usage tracking (messages per day, projects count)
- [ ] **Billing logic split across two services**:
  - **Next.js** checks project count before create (free tier = 1 project, Pro = unlimited)
  - **FastAPI** checks message count before calling Claude (free tier = N/day, Pro = M/day)
  - Stripe webhook updates user tier in **Supabase** → both services read tier from there
- [ ] Enforce limits with clear error messages

### 7.2 Rate Limiting
- [ ] FastAPI middleware: extract `user_id` from Supabase JWT (from Plan 06)
- [ ] Rate limits keyed by `user_id` (not just IP)
- [ ] Per-user limits on FastAPI `/api/agent` endpoint (AI calls)
- [ ] Per-user limits on Next.js project creation (free tier)
- [ ] Per-user limits on Next.js image uploads
- [ ] Unauthenticated requests: very low IP-based limits (e.g., 1 req/min)
- [ ] Graceful 429 error messages when limits hit

### 7.3 Landing Page
- [ ] Build Naguib's own landing page using Naguib (dogfooding)
- [ ] Sections: hero, features, how-it-works, pricing, FAQ, CTA, footer
- [ ] Lives at `/` (root) of the Next.js frontend
- [ ] Unauthenticated users see landing page; authenticated users redirect to `/dashboard`
- [ ] Same Vercel deployment — no separate site needed
- [ ] Deploy to naguib.dev (or chosen domain)

### 7.4 Performance
- [ ] Audit: preview render time < 1 second (target 500ms)
- [ ] Audit: AI response time < 5s for new page, < 3s for edits
- [ ] Audit: exported page Lighthouse > 90
- [ ] Optimize: component lazy loading in preview
- [ ] Optimize: streaming AI responses (verify AG-UI SSE chunks arrive incrementally, not buffered)

### 7.5 Error Handling & Edge Cases
- [ ] **Dual validation**: FastAPI validates with Pydantic before sending state events; frontend re-validates with Zod as safety net
- [ ] If frontend validation fails on received state → show error in chat, log to monitoring, don't apply to preview
- [ ] Network failure during SSE stream → show retry option, preserve chat history + page config
- [ ] Empty project state (no sections) → helpful empty state with suggestions
- [ ] Long conversations → manage token window (summarize or truncate history before sending to Claude)

### 7.6 QA Pass
- [ ] Test all 10 section types × all variants in both modes
- [ ] Test viewport responsiveness on real devices
- [ ] Test full user flow: sign up → create → build → iterate → export → deploy
- [ ] **Auth bridge integration test**: signed-in user creates project → console sends JWT to FastAPI → AI responds → message count tracked in billing
- [ ] Test export on fresh machine (npm install → dev → build)
- [ ] Cross-browser: Chrome, Firefox, Safari
- [ ] Test rate limits: free user hits message limit → gets friendly 429

### 7.7 Beta Launch
- [ ] Set up feedback mechanism (in-app or email)
- [ ] Invite beta users
- [ ] Monitor: errors, AI success rate, export success rate, auth failures
- [ ] Iterate based on feedback

---

## Exit Criteria

- [ ] A real user (not us) can sign up, build a landing page, and export it — without help
- [ ] Billing works (can upgrade, payments process, limits enforced on both services)
- [ ] No critical bugs in the user flow
- [ ] Landing page is live
- [ ] Rate limiting works on both services (FastAPI for AI, Next.js for projects/uploads)

---

## Dependencies

- All previous plans must be functionally complete.

## Blocks

None — this is the final plan.
