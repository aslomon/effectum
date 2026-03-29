---
name: "effect:prd:express"
description: "Create a complete PRD from structured input with minimal follow-up questions."
allowed-tools: ["Read", "Write", "Bash"]
effort: "medium"
---

# /prd:express — Quick PRD from Structured/Semi-Structured Input

You create a complete PRD from an already relatively clear feature input. Minimal follow-up questions, maximum inference.

## Step 1: Analyze Input

Read `$ARGUMENTS` as a feature description.

If empty: Ask the user for a feature description. Briefly explain that Express is intended for features that are already relatively clear.

Parse the input for existing structure:

- User Stories / Job Stories
- Acceptance Criteria
- Scope / Boundaries
- Technical details
- Data model hints
- Integrations

## Step 2: Determine Project

Check if a matching project exists under `workshop/projects/`:

- If yes: Assign the PRD there.
- If no: Create a new project (like `effectum:setup`). Derive the slug from the feature description.

## Step 3: Generate PRD

Read `workshop/knowledge/01-prd-template.md` for the template.

Fill out the template intelligently:

1. **Title and Problem Statement**: Derive from the description.
2. **User Stories**: Adopt existing ones or generate from the description.
3. **Acceptance Criteria**: Adopt existing ones or derive from described behavior.
4. **Scope**: Clearly define what is in-scope.
5. **Non-Goals**: Proactively suggest — what is explicitly NOT part of this feature?
6. **Data Model**: If data persistence is involved, suggest tables/fields.
7. **API Contracts**: If API endpoints are needed, suggest them.
8. **Quality Gates**: Set sensible defaults (tests, performance, accessibility).
9. **Autonomy Rules**: Define what the implementing agent may decide on its own.
10. **Completion Promise**: Clear definition of "done".

## Step 4: Mark Assumptions

Mark ALL assumptions with `[ASSUMPTION]` at the end of the PRD in a dedicated section.
Group them by category:

- Business/Product Assumptions
- Technical Assumptions
- Scope Assumptions

## Step 5: Determine Workflow Mode

Read `workshop/knowledge/08-workflow-modes.md`.
Determine the appropriate workflow mode for the implementation.

## Step 6: Save Files

1. Save the PRD under `workshop/projects/{slug}/prds/{number}-{name}.md`.
2. Update `PROJECT.md` with the new PRD.

## Step 7: Generate Handoff Prompt

Read `workshop/knowledge/07-prompt-templates.md`.
Immediately generate a handoff prompt and save it under `workshop/projects/{slug}/prompts/{number}-{name}-handoff.md`.

## Step 8: Present Result

Show the user:

1. The generated PRD (complete or summary).
2. List of all assumptions — the user should confirm or correct these.
3. The chosen workflow mode with justification.
4. Next steps: recommend review (`effect:prd:review`) or direct handoff.

## Next Steps

After the Express PRD is generated:

- → `effect:prd:review {slug}/{number}` — Review the PRD before handing off
- → `effect:prd:handoff {slug}/{number}` — Export the PRD as a handoff package
- → `effect:prd:discuss {slug}/{number}` — Deepen the discussion if assumptions need clarification

## Communication

Follow the language settings defined in CLAUDE.md.
All file content must be written in English.
User-facing communication uses the language configured in CLAUDE.md.
