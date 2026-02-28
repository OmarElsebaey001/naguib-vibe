# Update Architecture (Full Stack)

> Review recent changes and update `system_docs/ARCHITECTURE.md` **only when needed**.

## Usage

```
/update-arch                    # Uses commit from ARCHITECTURE.md
/update-arch abc123             # Force review from specific commit
```

**Argument:** $ARGUMENTS (optional — "commit_hash")

## Philosophy

**Skip by default.** Most commits don't need documentation.

Only update docs when the **structure** changes:
- New section type/variant, new model, new router, new service, new schema, new pattern

---

## Phase 1: Extract Current State

### 1.1 Read Architecture Document
Read `system_docs/ARCHITECTURE.md` to understand current state.

### 1.2 Get Last Documented Commit
Extract from bottom of document:
- `<!-- COMMIT: ... -->`

### 1.3 Get Current HEAD Commit
```bash
git rev-parse HEAD
```

### 1.4 Early Exit Check
If the commit hasn't changed, report "No changes since last update" and stop.

---

## Phase 2: Analyze Changes

### 2.1 List Commits Since Last Doc
```bash
git log {LAST_COMMIT}..HEAD --oneline
```

### 2.2 List Changed Files
```bash
git diff --name-only {LAST_COMMIT}..HEAD
```

### 2.3 Check for Backend Architectural Changes
Look for:
- New models (`backend/app/models/*.py`)
- New routers (`backend/app/routers/*.py`)
- New services (`backend/app/services/**/*.py`)
- New schemas (`backend/app/schemas/*.py`)
- New migrations (`backend/migrations/versions/*.py`)
- Changes to core config (`backend/app/core/*.py`)

### 2.4 Check for Frontend Architectural Changes
Look for:
- New section types (`frontend/src/components/sections/*/`)
- New section variants (new `.tsx` files in section directories)
- Registry changes (`frontend/src/components/sections/register.ts`)
- New content schemas (`frontend/src/lib/schemas/content/*.ts`)
- Page config schema changes (`frontend/src/lib/schemas/page-config.ts`)
- New pages (`frontend/src/app/*/page.tsx`)
- New lib modules (`frontend/src/lib/*/`)
- Agent integration changes (`frontend/src/lib/agent/use-agent.ts`)
- Theme changes (`frontend/src/lib/theme/*.ts`)
- Export pipeline changes (`frontend/src/lib/export/*.ts`)
- Store changes (`frontend/src/lib/stores/*.ts`)
- Catalog changes (`frontend/src/lib/registry/catalog.ts`)

---

## Phase 3: Filter — What to Document

### SKIP (most changes)
- Bug fixes, refactors, cleanups
- Styling tweaks within existing components
- Content text changes
- Dependency updates (unless major version bump)
- Test changes
- Config tweaks

### DOCUMENT (rare)

| What Changed | Update Section |
|--------------|----------------|
| New section type | Component Library |
| New section variant | Component Library |
| New content schema | Component Library + AI Configurator |
| New backend router | Backend Architecture + API Endpoints |
| New backend model | Database Architecture |
| New backend service | Backend Architecture |
| New Pydantic schema | Backend Architecture |
| New migration | Database Architecture |
| New frontend page | Frontend Architecture |
| New lib module | Frontend Architecture |
| Theme system changes | Theme System |
| Export pipeline changes | Export Pipeline |
| AG-UI flow changes | AG-UI Integration |
| Auth flow changes | Authentication |
| New pattern | Implementation Checklist |

---

## Phase 4: Update ARCHITECTURE.md

### 4.1 Update Relevant Sections
Only update sections affected by architectural changes.

For each change found:
1. Read the new/modified file to understand what was added
2. Update the corresponding section in ARCHITECTURE.md
3. Keep the existing format and style

### 4.2 Update Commit Tracking
Update the Commit Tracking table and markers:

```markdown
| Repository | Branch | Last Commit |
|------------|--------|-------------|
| Monorepo | main | {new_commit} |

---
<!-- LAST_UPDATED: YYYY-MM-DD -->
<!-- COMMIT: {new_commit} -->
```

---

## Phase 5: Report

```markdown
## Architecture Review

**Date:** {today}

### Changes: `{OLD_COMMIT}..{NEW_COMMIT}`
- Commits reviewed: {count}
- Architectural changes: {list or "None"}
- Skipped: {count} (bug fixes, refactors, styling)

### Documentation Updates
{list what was added/updated, or "None — no architectural changes"}
```

---

## Quick Reference

### Backend Architectural Changes
- New `backend/app/routers/{router}.py` → Add to API Endpoints
- New `backend/app/models/{model}.py` → Add to Database Architecture
- New `backend/app/services/{service}.py` → Add to Backend Architecture
- New `backend/app/schemas/{schema}.py` → Add to Backend Architecture
- New migration → Add to Database Architecture

### Frontend Architectural Changes
- New `frontend/src/components/sections/{type}/` → Add to Component Library
- New variant `.tsx` in sections → Update variant count in Component Library
- Changes to `register.ts` → Update Component Library
- New `frontend/src/lib/schemas/content/{schema}.ts` → Update Component Library
- New `frontend/src/app/*/page.tsx` → Add to Frontend Architecture
- Changes to `use-agent.ts` → Update AG-UI Integration
- Changes to `page-config.ts` schema → Update AI Configurator
- Changes to theme files → Update Theme System
- Changes to export files → Update Export Pipeline
