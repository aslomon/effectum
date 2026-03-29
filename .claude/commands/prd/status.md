---
name: "prd:status [DEPRECATED → effect:prd:status]"
description: "DEPRECATED: Use /effect:prd:status instead. This alias will be removed in v0.20."
allowed-tools: ["Read", "Bash", "Glob"]
effort: "low"
---

> ⚠️ **Deprecated as of v0.18.0**
>
> `/prd:status` has been renamed to `effect:prd:status`.
> This alias will be **removed in v0.20.0**.
>
> Please update your workflow: type `/effect:prd:status` going forward.
> (Running `effect:prd:status` now...)

---

# /prd:status — Dashboard of All Projects and PRDs

You display an overview of all projects and their PRD statuses.

## Step 1: Determine Scope

Interpret `$ARGUMENTS`:

- If empty: Show overview of ALL projects.
- If project-slug is provided: Show detailed view for that project.

## Step 2: Collect Project Data

Scan all directories under `workshop/projects/`.

For each project:

1. Read `PROJECT.md` for status, metadata, PRD list.
2. Count PRDs under `prds/`.
3. Determine the status of each PRD (discovery, draft, review, ready, handed-off).
4. Determine the last modification date.

## Step 3: Display Overview (all projects)

Present a formatted table:

```
| Project         | Status     | PRDs                          | Last Update    |
|-----------------|------------|-------------------------------|----------------|
| my-saas-app     | drafting   | 001 (ready), 002 (draft)      | 2026-03-18     |
| portfolio-site  | discovery  | —                             | 2026-03-20     |
```

## Step 4: Detailed View (single project)

If a specific project is requested, additionally show:

- Vision summary (from vision.md)
- Each PRD with: number, name, status, readiness score (if reviewed)
- Network map status (present yes/no, stage)
- Open `[ASSUMPTION]` and `[NEEDS CLARIFICATION]` counts per PRD
- Existing handoff prompts

## Step 5: Update STATUS.md

Write the current overview to `STATUS.md` in the workshop root directory.
Format: Markdown table with timestamp.

## Step 6: Suggest Next Actions

For each project, provide a concrete recommendation:

- `discovery` → "Start `effect:prd:new {slug}` to continue"
- `drafting` → "Use `effect:prd:discuss {slug}/001` for the next deep-dive"
- `review` → "Run `effect:prd:review {slug}`"
- `ready` → "Ready for `effect:prd:handoff {slug}/001`"
- `handed-off` → "All PRDs handed off. `effectum:archive {slug}` is available."

## Next Steps

Based on the dashboard, continue with the appropriate action:

- → `effect:prd:new {slug}` — Continue a project in discovery phase
- → `effect:prd:handoff {slug}/{number}` — Hand off a ready PRD
- → `effectum:archive {slug}` — Archive a fully handed-off project

## Communication

Follow the language settings defined in CLAUDE.md.
All file content must be written in English.
User-facing communication uses the language configured in CLAUDE.md.
