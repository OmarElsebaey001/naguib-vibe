# Prime (Full Stack)

> Load full Naguib codebase context silently, then display ready banner.

## CRITICAL OUTPUT RULES

**DO NOT output ANY text while reading files or running commands.** No commentary, no file listings, no intermediate summaries. Perform ALL exploration silently. The ONLY output the user should see is the final ready banner in the last step.

## Step 1: Read system documentation (silent)

Read ALL of these:
- `system_docs/ARCHITECTURE.md` (if exists)
- `system_docs/manifesto.md`
- `system_docs/requirements.md`
- `system_docs/apis.md`

## Step 2: Read building plans (silent)

Read these:
- `building/master_plan.md`
- Scan `building/` for any recent `implementation.md` files

## Step 3: Scan repository (silent)

Run these in parallel — do NOT print output:
```bash
echo "=== branch ===" && git branch --show-current && echo "=== status ===" && git status --short && echo "=== log ===" && git log --oneline -5
```
```bash
echo "=== backend ===" && find backend/app -type f -name "*.py" | head -50
```
```bash
echo "=== frontend ===" && find frontend/src -type f \( -name "*.ts" -o -name "*.tsx" \) | grep -v node_modules | head -80
```

## Step 4: Read key files (silent)

Read these files — do NOT print their contents:
- `backend/pyproject.toml`
- `backend/app/main.py`
- `backend/app/routers/agent.py`
- `backend/app/services/catalog.py`
- `frontend/package.json`
- `frontend/src/lib/registry/catalog.ts`
- `frontend/src/lib/schemas/page-config.ts`
- `frontend/src/lib/stores/page-config.ts`
- `frontend/src/lib/agent/use-agent.ts`
- `frontend/src/components/sections/register.ts`

## Step 5: Display ready message — NOTHING ELSE

After ALL reading is complete, output **ONLY** this single line:

```
NAGUIB PRIMED AND READY
```

**STOP HERE. Do NOT output anything after that line. No tables, no summaries, no follow-up text, no "What are we building?" prompt. That single line is the complete and final output.**
