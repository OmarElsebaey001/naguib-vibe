# Implementation 05 — Export Pipeline

> This file is updated as work is completed.

---

## Work Log

### 2026-02-28 — Full Export Pipeline Built & Tested

**New dependencies:**
- `jszip` — ZIP file generation in Next.js API routes

**Files created:**
- `src/lib/export/template.ts` — Static template files for the exported Vite + React + TypeScript + Tailwind v4 project: package.json, vite.config.ts, tsconfig.json, index.html, main.tsx, vite-env.d.ts, .gitignore, README.md
- `src/lib/export/extract.ts` — Component extraction engine. Reads component source files from `src/components/sections/{type}/{variant}.tsx`, strips Naguib internals (schema imports, metadata exports, "use client" directives), replaces content type references with `Record<string, any>`, converts to default exports. Deduplicates components across sections.
- `src/lib/export/build-project.ts` — Project orchestrator. Combines template + components + theme CSS + page assembly into a flat file map. Generates `globals.css` with `:root` and `.dark` CSS variables from ThemeConfig, builds `App.tsx` with inline content constants and component imports.
- `src/app/api/export/route.ts` — Next.js API route (`POST /api/export`). Accepts PageConfig JSON, validates with Zod, calls `buildExportProject()`, packages into ZIP with JSZip, returns as `application/zip` download.

**Files modified:**
- `src/app/console/page.tsx` — Added Export button (violet, with download icon) to top bar. Shows loading spinner during export. Triggers `/api/export` POST, creates blob URL, auto-downloads ZIP.

**Architecture:**
- Export is a **Next.js API route** (not FastAPI) — only needs frontend state + component source files
- Component extraction reads `.tsx` files directly from disk via `fs/promises`
- Import rewriting via regex: strips `./schema` imports, replaces type names with `Record<string, any>`, removes metadata, converts to default export
- Theme CSS uses the same token mapping as `lib/theme/engine.ts` (HSL values wrapped in `hsl()`)
- Page assembly generates `App.tsx` with imports, inline content constants, and JSX with dark mode wrappers
- ZIP structure: `{project-name}/` root folder with all files nested correctly

**Component transformations applied:**
1. Remove `import { type XxxContent } from "./schema"` → type reference replaced with `Record<string, any>`
2. Remove `export const metadata = { ... };` block
3. Remove `"use client";` (Vite React doesn't need it)
4. `export function` → `export default function`
5. React `useState` and other framework imports preserved

**Exported project stack:**
- Vite 6 + React 19 + TypeScript 5 + Tailwind CSS v4
- `@tailwindcss/vite` plugin (v4 native)
- `@vitejs/plugin-react`
- Zero Naguib dependencies

**Verified:**
- Export API returns 200 with valid ZIP (5.9KB for 2-section page)
- ZIP contains correct structure: package.json, vite.config.ts, tsconfig.json, index.html, src/main.tsx, src/globals.css, src/App.tsx, src/components/*.tsx, README.md
- `npm install` — clean install, 0 vulnerabilities
- `npm run build` — 0 errors, produces dist/ with static HTML/CSS/JS (197KB JS + 12KB CSS gzipped to ~65KB)
- `npm run dev` — Vite dev server starts in 152ms, serves 200
- Components are self-contained: no registry, no Zod, no `@/lib/...` paths
- Dark mode sections wrapped in `<div className="dark">` in App.tsx
- Content inlined as `as const` typed objects
- Next.js production build passes with 0 errors
