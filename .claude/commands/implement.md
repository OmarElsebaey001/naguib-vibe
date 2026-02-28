# Implement (Full Stack)
> Implement a planned spec by following the requirements and plan, then document decisions in implementation.md.

Arguments: $ARGUMENTS

If no arguments are provided, list existing spec directories and ask the user which one to implement:
```bash
ls -d specs/*/
```

---

## Phase 1: Load Spec

1. Read `specs/$ARGUMENTS/requirements.md` — this is the **what** (goals, acceptance criteria, user-facing behavior)
2. Read `specs/$ARGUMENTS/plan.md` — this is the **how** (technical approach, file changes, implementation steps)
3. If either file is missing, stop and tell the user:
   ```
   Missing files in specs/$ARGUMENTS/:
   - requirements.md: [found/missing]
   - plan.md: [found/missing]

   Run /plan $ARGUMENTS first to generate the plan.
   ```
4. Read `specs/$ARGUMENTS/implementation.md` if it exists — check for prior progress (resume from where it left off)

---

## Phase 2: Validate & Prepare

1. Parse all tasks from `plan.md`
2. Check task dependencies and determine the implementation order
3. Create `specs/$ARGUMENTS/implementation.md` with the initial structure (or update if resuming):

```markdown
# Implementation Log — $ARGUMENTS

> **Spec:** specs/$ARGUMENTS/
> **Started:** [date]
> **Status:** In Progress

---

## Progress

| # | Task | Status | Notes |
|---|------|--------|-------|
| 1 | [title] | Pending | — |
| 2 | [title] | Pending | — |

---

[Task sections will be added as implementation progresses]
```

---

## Phase 3: Implement Tasks

For each task, in dependency order:

### Before starting a task:
1. Update `implementation.md` — mark the task as **In Progress**
2. Read the plan section for this task carefully
3. Check relevant existing code to match patterns

### Implementation rules:
- **Backend first, then frontend** for full-stack tasks
- **Follow the plan** — implement what the plan says, in the order it says
- **Match existing patterns** — check how similar things are done in the codebase before writing new code
- **Do not commit** — leave committing to the user
- **Do not create feature branches** — leave branching to the user
- **Backend uses Python + FastAPI** — async patterns, SQLAlchemy AsyncSession, Pydantic v2
- **Frontend uses TypeScript + Next.js 16** — React 19, Zustand stores, Zod schemas, Tailwind CSS v4
- **Components follow the Universal Contract** — `({ content, mode }) => JSX`
- **Install backend deps with `uv sync`**, frontend deps with `npm install`

### After completing a task:
1. Update `implementation.md` with the task's section:

```markdown
## Task [N]: [Title]

**Status:** Done
**Scope:** Frontend | Backend | Full-stack

### Changes Made

**Backend:**
- `path/to/file.py` — Description of what was changed and why

**Frontend:**
- `path/to/file.tsx` — Description of what was changed and why

### Decisions & Notes

[Document any implementation decisions that deviated from or elaborated on the plan. These are valuable for future reference.]

- **Decision:** [what you decided]
  **Reason:** [why — e.g., "the plan suggested X but Y was better because..."]
```

2. Update the Progress table status to **Done**
3. Move to the next task

---

## Phase 4: Finalize

After all tasks are complete:

1. Update `implementation.md` with a final summary:

```markdown
---

## Summary

**Status:** Complete
**Completed:** [date]

### Files Changed

| File | Action | Task |
|------|--------|------|
| `path/to/file` | Modified | Task 1 |
| `path/to/file` | Created | Task 2 |

### Key Decisions

[Consolidate the most important decisions from all tasks — things the team should know about]

1. **[Decision]** — [Reasoning]
2. **[Decision]** — [Reasoning]

### Testing Notes

[How to verify the implementation works]

1. Step 1
2. Step 2
```

2. Update all task statuses in the Progress table to **Done**
3. Update the top-level Status to **Complete**

---

## Phase 5: Report

After completing implementation, report to the user:

```
Implementation complete: specs/$ARGUMENTS/

Tasks completed: [count]
Files changed: [count]
  - Backend: [list key files]
  - Frontend: [list key files]

Key decisions: [count] (see implementation.md)

Next steps:
1. Review changes: specs/$ARGUMENTS/implementation.md
2. Test locally: /dev start
3. Review and commit changes
```

---

## Paths Reference

- **Backend**: `backend/` (FastAPI + Python 3.12+)
  - Routers: `backend/app/routers/{name}.py`
  - Models (SQLAlchemy): `backend/app/models/{name}.py`
  - Schemas (Pydantic): `backend/app/schemas/{name}.py`
  - Services: `backend/app/services/{name}.py`
  - LLM providers: `backend/app/services/llm/{provider}_service.py`
  - Core (config, db, security, deps): `backend/app/core/`
  - Migrations: `backend/migrations/versions/`
  - Dependencies: `backend/pyproject.toml` (install with `uv sync`)

- **Frontend**: `frontend/` (Next.js 16 + React 19 + TypeScript)
  - Pages (App Router): `frontend/src/app/`
  - Section components (42 variants): `frontend/src/components/sections/`
  - Console UI: `frontend/src/components/console/`
  - UI primitives (shadcn): `frontend/src/components/ui/`
  - Zod schemas: `frontend/src/lib/schemas/`
  - Content schemas: `frontend/src/lib/schemas/content/`
  - Zustand stores: `frontend/src/lib/stores/`
  - AG-UI agent hook: `frontend/src/lib/agent/use-agent.ts`
  - Component registry: `frontend/src/lib/registry/`
  - Theme engine + presets: `frontend/src/lib/theme/`
  - Export pipeline: `frontend/src/lib/export/`
  - API client: `frontend/src/lib/api/client.ts`
  - Auth context: `frontend/src/lib/auth/`
  - Page renderer: `frontend/src/lib/renderer/page-renderer.tsx`
  - Dependencies: `frontend/package.json` (install with `npm install`)

## Error Handling

- If a task fails or is blocked, mark it as **Blocked** in `implementation.md` with the reason
- Ask the user for guidance before skipping a blocked task
- If the plan is wrong or outdated, document the discrepancy in implementation.md and proceed with the correct approach
