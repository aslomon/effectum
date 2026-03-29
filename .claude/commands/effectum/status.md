---
name: "effectum:status"
description: "Project dashboard: installed version, stack, autonomy level, PRD count, last run status, health check."
allowed-tools: ["Read", "Bash"]
effort: "low"
---

# effectum:status — Project Status Dashboard

You read the current project state and display a structured dashboard. This is a read-only diagnostic command with zero side effects.

## Step 1: Check Installation

Look for Effectum installation indicators:

1. Read `.effectum/config.json` or `.effectum.json` — extract version, stack, autonomy level.
2. If neither file exists, output:
   ```
   ⚠️  Effectum not installed in this project.
       Run /effectum:setup to install.
   ```
   **STOP.**

## Step 2: Read Project Context

1. Read `CLAUDE.md` in the project root.
2. Check for the sentinel block: `<!-- effectum:project-context:start -->` ... `<!-- effectum:project-context:end -->`.
3. If found, extract a one-line summary of the project context (project name, tech stack).
4. Count domain rules and guardrails mentioned.

## Step 3: Inventory PRDs

1. Scan `docs/prds/` and `workshop/projects/*/prds/` for `.md` files.
2. For each PRD file, read the YAML frontmatter `status` field.
3. Count PRDs by status: complete, in-progress, planned, draft.

## Step 4: Last Run Status

1. Read `.effectum/loop-state.json` if it exists.
2. Extract: last command, timestamp, status (complete/stuck/cancelled/running), iteration count.
3. Calculate approximate time since last run.

## Step 5: Health Check

Check for issues:

1. **STUCK.md** — if exists and created within 24h, flag as warning.
2. **HANDOFF.md** — if exists with incomplete status, flag as warning.
3. **Uncommitted changes** — run `git status --porcelain` and count modified files.
4. **Branch info** — run `git branch --show-current`.

## Step 6: Display Dashboard

Output the formatted dashboard:

```
═══════════════════════════════════════════════════
  EFFECTUM STATUS
═══════════════════════════════════════════════════
  Version:      {version} (from .effectum/config.json)
  Installed in: {current working directory}
  Stack:        {stack} (from .effectum.json)
  Autonomy:     {autonomy level} (from .effectum.json)

  CLAUDE.md:    {✅ Sentinel block found | ⚠️ No sentinel block}
  Context:      {one-line project summary or "Not configured"}
  Domain rules: {count} conventions, {count} guardrails

  PRDs:
    {status emoji} {filename}    ({status})
    ...
  Total: {count} PRDs — {complete} complete, {active} active, {planned} planned

  Last run:     {command} ({time ago})
  Status:       {status emoji} {status description}
  Loop state:   {PRD reference or "none"}
  Checkpoint:   {git tag or "none"}

  Git branch:   {current branch}
  Uncommitted:  {count} files

  HEALTH:       {✅ All systems nominal | ⚠️ N issue(s) found}
    {→ issue descriptions if any}

  Next action:  {recommended next command}
═══════════════════════════════════════════════════
```

Adapt the dashboard based on what data is available. Omit sections where data is missing (e.g., no PRDs section if no PRDs exist).

## Communication

Follow the language settings defined in CLAUDE.md for user-facing communication.
All dashboard content in English.
