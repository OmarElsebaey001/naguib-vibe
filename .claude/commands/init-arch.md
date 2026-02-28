# Initialize Architecture (Full Stack)

> Generate `system_docs/ARCHITECTURE.md` from scratch by exploring the full Naguib monorepo.

## Usage

```
/init-arch
```

Use when:
- Architecture document doesn't exist
- Architecture document is completely outdated
- Starting fresh documentation

---

## Phase 0: Reference Existing Docs

### 0.1 Read Existing Architecture (if exists)
Read `system_docs/ARCHITECTURE.md` to understand:
- Current documented structure
- Sections and format used
- What was previously considered important

### 0.2 Read System Docs
Read these for context on what the system is meant to be:
- `system_docs/manifesto.md`
- `system_docs/requirements.md`
- `system_docs/apis.md`

**These are design intent — verify against actual code.**

---

## Phase 1: Explore Backend

### 1.1 Read Backend Config
```bash
cat backend/pyproject.toml
```

### 1.2 List Backend Structure
```bash
find backend/app -type f -name "*.py" | sort
```

### 1.3 Read Core Configuration
Read these files:
- `backend/app/core/config.py`
- `backend/app/core/database.py`
- `backend/app/core/security.py`
- `backend/app/core/deps.py`

### 1.4 List Models
```bash
cat backend/app/models/*.py
```

### 1.5 List Routers & Endpoints
```bash
cat backend/app/routers/*.py
```

### 1.6 List Services
```bash
find backend/app/services -type f -name "*.py" | sort
```
Read each service file.

### 1.7 List Schemas
```bash
cat backend/app/schemas/*.py
```

### 1.8 List Migrations
```bash
ls backend/migrations/versions/ 2>/dev/null || echo "No migrations"
```

### 1.9 Check for Docker/Compose
```bash
ls backend/docker-compose* backend/Dockerfile 2>/dev/null || echo "No Docker files in backend"
ls docker-compose* Dockerfile 2>/dev/null || echo "No Docker files at root"
```

---

## Phase 2: Explore Frontend

### 2.1 Read Frontend Config
```bash
cat frontend/package.json
```

### 2.2 List Frontend Structure
```bash
find frontend/src -type f \( -name "*.ts" -o -name "*.tsx" \) | grep -v node_modules | sort
```

### 2.3 Read App Router Pages
```bash
find frontend/src/app -type f \( -name "*.ts" -o -name "*.tsx" \) | sort
```
Read each page file.

### 2.4 Read Component Library
Read the section registry:
- `frontend/src/components/sections/register.ts`

List all section types and variants:
```bash
find frontend/src/components/sections -type f -name "*.tsx" | sort
```

### 2.5 Read Lib Layer
Read these key files:
- `frontend/src/lib/registry/catalog.ts` — component catalog
- `frontend/src/lib/schemas/page-config.ts` — page config schema
- `frontend/src/lib/stores/page-config.ts` — Zustand state
- `frontend/src/lib/agent/use-agent.ts` — AG-UI integration
- `frontend/src/lib/theme/engine.ts` — theme engine
- `frontend/src/lib/theme/presets.ts` — theme presets
- `frontend/src/lib/renderer/page-renderer.tsx` — page renderer
- `frontend/src/lib/export/build-project.ts` — export pipeline

### 2.6 Read Content Schemas
```bash
find frontend/src/lib/schemas/content -type f -name "*.ts" | sort
```
Read each content schema file.

### 2.7 Read UI Components
```bash
ls frontend/src/components/ui/
```

### 2.8 Read Console Components
```bash
ls frontend/src/components/console/
```
Read each console component.

---

## Phase 3: Generate Architecture Document

Create `system_docs/ARCHITECTURE.md` with these sections:

### Required Sections

1. **Quick Reference** — Technology stack table with ports, key URLs
2. **System Overview** — ASCII diagram of full stack (Frontend ↔ Backend API ↔ DB, AG-UI streaming)
3. **Core Concept** — How Naguib works: user describes → AI selects from catalog → config assembled → preview renders (no code generation)
4. **Frontend Architecture** — Tech stack, App Router structure, component library (section types × variants), lib layer (schemas, stores, agent, registry, theme, export), state management (Zustand)
5. **Backend Architecture** — Tech stack, FastAPI structure, routers, services, models, schemas, LLM integration
6. **Component Library** — Section types, variant counts, content schema contract, the universal 4-prop interface (type, variant, content, mode)
7. **AI Configurator** — How the LLM receives catalog + user message, returns page config or operations, Zod validation
8. **AG-UI Integration** — Event types used, streaming flow, how frontend consumes agent events
9. **Database Architecture** — PostgreSQL tables, models, relationships
10. **Theme System** — CSS variable tokens, HSL format, light/dark mode per section, presets
11. **Export Pipeline** — How config becomes a standalone Vite + React project
12. **Authentication** — JWT flow, protected routes, auth context
13. **API Endpoints** — Full endpoint reference from routers
14. **Data Flows** — Auth flow, page assembly flow, export flow
15. **Local Development** — Start commands, ports, environment setup
16. **Implementation Checklist** — Steps for new section types, new features, full-stack changes
17. **Commit Tracking** — Current commit hash for the monorepo

---

## Phase 4: Set Markers

### 4.1 Get Current Commit
```bash
git rev-parse HEAD
```

### 4.2 Add Markers
Add at bottom of `system_docs/ARCHITECTURE.md`:
```markdown
---
<!-- LAST_UPDATED: YYYY-MM-DD -->
<!-- COMMIT: <commit_hash> -->
```

---

## Phase 5: Verify & Fact-Check

**CRITICAL — Do not skip**

For each section:
- Verify paths exist (glob/find to confirm)
- Verify technology versions match `pyproject.toml` and `package.json`
- Verify database models match migration files
- Verify endpoints exist in routers
- Verify section types/variants match actual component files
- Verify schema names match actual files in `frontend/src/lib/schemas/content/`
- Cross-reference `system_docs/apis.md` with actual router code

---

## Phase 6: Report

```markdown
## Architecture Initialized

**Date:** {today}

### Commit Tracked
- Monorepo: {commit}

### Documented
- Frontend: {count} section types, {count} variants, {count} pages
- Backend: {count} routers, {count} services, {count} models

### Verified
- [ ] Technology versions
- [ ] Database schemas
- [ ] API endpoints
- [ ] Component library inventory
- [ ] Content schemas

### Next Steps
Run `/update-arch` after future changes.
```
