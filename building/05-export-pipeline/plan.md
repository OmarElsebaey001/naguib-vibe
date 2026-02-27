# Plan 05 — Export Pipeline

> Status: `NOT STARTED`

---

## Goal

Turn a page config JSON into a downloadable, standalone Vite + React project that the user can run, deploy, and customize independently. Zero Naguib dependencies.

### Architecture Decision

The export endpoint is a **Next.js API route** (`/api/export`), NOT a FastAPI endpoint. Rationale:
- Export only needs the page config (already in frontend state) — no Claude required
- Component source files live in `frontend/src/components/sections/` — Next.js can access them directly
- Keeps FastAPI focused solely on the AI agent

---

## Tasks

### 5.1 Export Template
- [ ] Create a base Vite + React + TypeScript + Tailwind v4 template
- [ ] Template includes: package.json, vite.config.ts, tsconfig.json, tailwind config, .gitignore, README
- [ ] Template has slot for: globals.css (theme), page.tsx (sections), components/ (used sections)

### 5.2 Component Extraction
- [ ] Given a page config, determine which components are used
- [ ] Component source files are in `frontend/src/components/sections/{type}/{variant}.tsx`
- [ ] Copy only those component source files into the export
- [ ] Rewrite imports to be self-relative (no registry, no `@/lib/...` paths)
- [ ] Inline content as a const in page.tsx (not imported from JSON)
- [ ] Strip metadata exports (only the component function is needed)

### 5.3 Theme Injection
- [ ] Convert ThemeConfig → CSS variable declarations
- [ ] Write into `globals.css` with `:root { ... }` and `.dark { ... }`
- [ ] Include Tailwind v4 imports
- [ ] Theme contract verification: ensure exported `globals.css` produces identical CSS variables to Naguib's runtime theme system. Test: exported page with custom theme looks identical to console preview

### 5.4 Page Assembly
- [ ] Generate `page.tsx` that imports each used component and renders in order
- [ ] Each section wrapped with mode class (`.dark` wrapper if mode is "dark")
- [ ] Content passed as props

### 5.5 Packaging
- [ ] Bundle everything into a zip file
- [ ] Serve as download from the console
- [ ] Verify: user can `unzip → npm install → npm run dev` and see their page
- [ ] Verify: `npm run build` produces static HTML deployable anywhere

### 5.6 README Generation
- [ ] Auto-generated README explaining:
  - How to run (`npm install && npm run dev`)
  - Project structure
  - How to edit content (which files)
  - How to change theme (globals.css)
  - How to deploy (Vercel/Netlify one-liners)

---

## Exit Criteria

- [ ] Export a working project from a test page config
- [ ] `npm install && npm run dev` works first try
- [ ] `npm run build` produces static HTML
- [ ] Exported page looks identical to the preview
- [ ] Each component file is self-contained and LLM-editable (~50-150 lines)
- [ ] No references to Naguib, registry, or internal systems in the export

---

## Dependencies

- Plan 01 (Foundation): schemas, theme engine
- Plan 02 (Component Library): component source files
- Plan 04 (Console): working page to export from

## Blocks

None — this is a leaf.
