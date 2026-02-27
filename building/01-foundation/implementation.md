# Implementation 01 — Foundation

> This file is updated as work is completed.

---

## Work Log

### 2026-02-27 — Foundation Complete

**Frontend Setup:**
- Next.js 15 (App Router), TypeScript strict, Tailwind CSS v4, shadcn/ui, cva, clsx, tailwind-merge, Zod v4, @ag-ui/client, rxjs
- Port: 3003 (registered in ~/.claude/port-registry.json)

**Backend Setup:**
- FastAPI + uvicorn, Pydantic v2, SQLAlchemy 2.0 (async) + asyncpg, Alembic, python-jose, passlib, anthropic, ag-ui-protocol, jsonpatch
- Port: 8002 (registered in ~/.claude/port-registry.json)
- All router stubs created (auth, projects, agent, uploads, billing)
- Alembic initialized with async migration env

**Schemas:**
- 10 Zod content schemas (header, hero, logos, features, social-proof, stats, pricing, faq, cta, footer)
- ThemeSchema, SectionSchema, PageConfigSchema
- Full Pydantic mirrors in backend
- Operations schema with RFC 6902 JSON Patch conversion

**Component Registry:**
- Map-based `type:variant` → component + metadata
- Catalog generator for AI consumption
- ensureRegistered() pattern for module-level registration

**Theme Engine:**
- 6 presets: corporate, startup, minimal, bold, warm, tech
- themeToCSS(), darkThemeToCSS(), themeToStyleObject()
- HSL values wrapped in hsl() for CSS variable compatibility
- DarkThemeOverrides for section-level dark mode

**PageRenderer:**
- Per-section error boundaries
- SectionWrapper with dark mode class application
- Empty state display

**Smoke Test:**
- 10 skeleton components (1 variant per type)
- Full "Acme AI Writing Assistant" test config with realistic content
- Theme switcher toolbar — verified all 6 presets work
- Dark mode verified on stats and CTA sections
- Mobile responsive verified at 375px

**Deviations from Plan:**
- `ag-ui-core`/`ag-ui-encoder` don't exist as separate PyPI packages → used `ag-ui-protocol` instead
- Zod v4 breaking changes from v3: `z.record()` needs two args, `.default({})` needs factory
- Port 3002 conflicted with another project → switched to 3003
- Components are skeletons (not production quality) — full build deferred to Plan 02
