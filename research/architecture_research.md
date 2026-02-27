# Architecture Research — Extracted Notes

From initial exploration with LLMs. Filtered for what's actually useful.

---

## Existing Projects Worth Studying

These aren't competitors to copy — they're reference implementations to learn from.

### Core Builders

| Project | What to steal from it |
|---|---|
| **Puck** (puckeditor/puck) — 12k+ stars, MIT | Closest to our model. You register your own React components, then AI + editor assembles pages constrained to your blocks. Study their component registration API, how they handle drag-drop reordering, and their recent AI page generation (v0.21+). |
| **GrapesJS** — 25k+ stars, BSD-3 | The OG block-based builder. Extremely mature. Study their block system, how custom blocks are registered, and their storage/export model. |
| **ChaiBuilder** — MIT | Drag-and-drop React + Tailwind builder with custom component registration. Very close to our workflow. Worth reading their component contract. |
| **Webstudio** — 8.3k stars, AGPL | Open-source Webflow. Clean component system + headless CMS integration. Study their style system and how they handle component ownership. |

### Component Libraries to Study (Not Fork)

| Library | Why it matters |
|---|---|
| **Page UI** (danmindru/page-ui) | Best existing landing-page section library. Multiple variants per section type, Tailwind + shadcn-style. Study their variant organization and how they handle the same section type with different layouts. |
| **Magic UI** (magicui.design) | 150+ animated/shadcn components. Good reference for what "polish" looks like at the component level. |
| **shadcn/ui** | Not a component library — it's a pattern. Components you own, not install. This philosophy aligns with Naguib's eject model. Study their CLI and registry pattern. |

---

## Three Architecture Paths

### Path 1: Next.js Monolith (React-First)

**Stack:** Next.js 15 (App Router + RSC), React 19, TypeScript, Tailwind, Zod, Supabase/Postgres, Vercel AI SDK

**How components work:**
- File convention: `src/components/sections/{type}/{variant}.tsx`
- Each exports a React component receiving `{ content, mode }`
- Central `registry.ts` builds a map auto-scanned from filesystem
- Dynamic imports (`next/dynamic`) for code-splitting per variant

**How schemas work:**
- Zod schemas in `schemas/sections.ts`, one per type
- Root config uses `z.discriminatedUnion("type", [...])`
- Schema version at root + migration functions

**How rendering works:**
- Dynamic route `/render/[pageId]` loads config from DB
- `<PageRenderer>` maps sections → registry lookup → render component
- Theme injected once in `<head>` as `:root { CSS vars }`

**How AI configurator works:**
- Catalog auto-generated from registry + `zod-to-json-schema`
- Structured outputs + Zod validation + retry loop (max 3)

**How eject works:**
- "Eject" returns raw `.tsx` source → Monaco editor + LLM chat
- Config gains `ejected: true, customSource: string`
- Sandboxed client-side bundle (esbuild in Web Worker + iframe preview)

**Tradeoffs:**
- ✅ Fastest to V1. Familiar stack. Best DX and type safety.
- ✅ Scales well for traffic (Next.js optimizations)
- ⚠️ Custom code rendering needs careful sandboxing
- ⚠️ Monolith makes sharing library with other products painful long-term
- ⚠️ Bundle size grows unless aggressively code-split

---

### Path 2: Web Components (Lit/Stencil) + Node Backend

**Stack:** Stencil or Lit 3 (TS → web components), Express/NestJS, Zod/JSON Schema, Tailwind via PostCSS

**How components work:**
- `packages/components/src/{type}/{variant}.tsx` (Stencil)
- Compiled to single ESM bundle + `custom-elements.json` manifest
- Published as npm package `@naguib/components`

**How rendering works:**
- Server outputs HTML with custom element tags + declarative shadow DOM
- `<naguib-hero variant="split-image-right" mode="dark">` with JSON content in child `<script>`
- Components use `connectedCallback` to parse and render

**How eject works:**
- LLM edits the Stencil/Lit class
- Shadow DOM provides natural isolation
- Custom class definition injected as inline `<script>` before the tag

**Tradeoffs:**
- ✅ Perfect style isolation (Shadow DOM)
- ✅ Works outside Naguib (any framework, plain HTML)
- ✅ Tiny runtime, CDN-able, great performance
- ⚠️ Slower V1 (learning curve, less ecosystem)
- ⚠️ Harder interactive debugging
- ⚠️ Shadow DOM can fight with global theming (CSS vars pierce through, but other things don't)

---

### Path 3: FastAPI + Jinja2 + HTMX (Python Server-Side)

**Stack:** FastAPI, Pydantic v2, Jinja2 + HTMX + Tailwind, OpenAI/LangChain, PostgreSQL

**How components work:**
- `templates/sections/{type}/{variant}.html` — Jinja macros
- `{% macro render(content, mode) %}` per variant
- Python `registry.py` dict loaded from filesystem scan at startup

**How schemas work:**
- Pydantic models with discriminated unions
- JSON schema auto-generated for AI prompts via `model_json_schema()`
- FastAPI gives you OpenAPI docs for free

**How rendering works:**
- Endpoint loads config → Jinja loops sections → `{% include %}` each variant template
- HTMX for any interactivity (modals, accordions, form submissions)
- Pure server-rendered HTML

**How eject works:**
- Returns raw Jinja macro source → LLM edits ~50 lines
- `jinja.from_string(customTemplate).render(...)` — trivial and naturally sandboxed
- Jinja safe mode + CSP for security

**Tradeoffs:**
- ✅ Fastest V1 for server-rendered pages. Eject is trivial and secure.
- ✅ Pydantic makes AI/schema work effortless
- ✅ No frontend framework churn. Cheap maintenance.
- ✅ Best SEO out of the box
- ⚠️ Rich client-side interactions need HTMX/JS islands
- ⚠️ Less "app-like" feel
- ⚠️ Smaller talent pool comfortable with Jinja templating

---

## Useful Patterns (Stack-Agnostic)

These ideas are worth adopting regardless of which path we pick:

1. **Vector embeddings for component discovery** — Embed each component's description into a vector DB (Pinecone/Qdrant). AI uses RAG to find the best variant for a user's request instead of stuffing the entire catalog into the prompt. Scales as the library grows.

2. **`cva` (class-variance-authority) for variant styling** — Clean pattern for managing Tailwind variant classes without messy conditionals. Worth using if we go React/Tailwind.

3. **Zod/Pydantic for the schema layer** — Whichever language we pick, having typed schemas that can auto-generate JSON Schema (for AI prompts) and validate at runtime is non-negotiable.

4. **Structured outputs + validation + retry loop** — Don't trust the AI's first attempt. Validate against schema, feed errors back, retry up to 3x. This is the reliability layer.

5. **Component metadata for AI shopping** — Every component needs: `sectionType`, `variant` slug, `semanticDescription` (human-readable), `themeSupport` (light/dark/both). This is what the AI reads to make decisions.

6. **shadcn registry pattern** — Components you own, not install. CLI to add new ones from a catalog. Aligns perfectly with our eject philosophy.

---

## Open Questions

- Do we want the rendered pages to be static HTML exports, or always server-rendered?
- Is the builder UI a visual drag-drop editor, or a chat-first interface, or both?
- How do we handle images/assets in the config? Just URLs, or do we need an asset pipeline?
- What's the deployment story? One-click to Vercel/Netlify? Self-hosted?
- How do we version configs when the component library updates?

---

*This document captures research inputs. Architecture decisions are not yet made.*
