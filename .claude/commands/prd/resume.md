---
name: "PRD Resume"
description: "Resume work on an existing project or PRD from where things left off."
allowed-tools: ["Read", "Write", "Bash"]
effort: "low"
---

# /prd:resume — Resume Work on an Existing Project/PRD

You resume work on an existing project or PRD. Read the current state, summarize, and continue where things left off.

## Step 1: Identify Project

Interpret `$ARGUMENTS`:

- Format `project-slug` → Resume work on the entire project.
- Format `project-slug/001` → Focus on this specific PRD.
- If empty: Scan `workshop/projects/` and show available projects with status. Ask the user which one to continue.

## Step 2: Load Full Context

Read ALL existing files of the project:

- `workshop/projects/{slug}/PROJECT.md` — Status, metadata, PRD list
- `workshop/projects/{slug}/vision.md` — Project vision (if present)
- `workshop/projects/{slug}/requirements-map.md` — Requirements map (if present)
- `workshop/projects/{slug}/prds/*.md` — All PRDs
- `workshop/projects/{slug}/network-map.mmd` — Network map (if present)
- `workshop/projects/{slug}/notes/discovery-log.md` — Discovery notes
- `workshop/projects/{slug}/notes/decisions.md` — Decision log
- `workshop/projects/{slug}/prompts/*.md` — Existing handoff prompts

## Step 3: Determine Current State

Analyze the project status and determine the current phase:

| Status in PROJECT.md | Current Phase            | Next Step                                    |
| -------------------- | ------------------------ | -------------------------------------------- |
| `discovery`          | Vision/Problem Discovery | Continue or conclude questioning             |
| `scoping`            | Scope & Requirements     | Refine requirements, check for decomposition |
| `decomposing`        | Decomposition            | Finalize PRD splitting                       |
| `drafting`           | PRD Creation             | Continue writing open PRDs                   |
| `discussing`         | Feature Deep-Dive        | Continue deep-dive                           |
| `review`             | Quality Review           | Conclude review or apply improvements        |
| `ready`              | Ready for Handoff        | Perform handoff                              |
| `handed-off`         | Completed                | Archiving or additional PRDs                 |

## Step 4: Present Summary

Give the user a compact overview:

1. **Project name and vision** (1-2 sentences)
2. **Current status** and phase
3. **What has been accomplished so far** (PRDs, decisions, open questions)
4. **What comes next** (concrete suggestion)

## Step 5: Continue Working

Offer the user to continue with the next logical step:

- If a specific PRD is referenced: Focus on that.
- If the overall project: Suggest the most important next step.
- Wait for the user's confirmation before starting.

## Next Steps

Based on the resumed project state, continue with the appropriate command:

- → `/prd:discuss {slug}/{number}` — Resume deep-dive on an in-progress PRD
- → `/prd:review {slug}` — Review PRDs that are ready for quality scoring
- → `/prd:handoff {slug}/{number}` — Hand off a ready PRD for implementation

## Communication

Follow the language settings defined in CLAUDE.md.
All file content must be written in English.
User-facing communication uses the language configured in CLAUDE.md.
