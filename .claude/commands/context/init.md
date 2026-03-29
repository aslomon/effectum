---
name: "effectum:init"
description: "Interactive interview to populate the project-context sentinel block in CLAUDE.md."
allowed-tools: ["Read", "Write", "Edit", "Bash", "Glob", "Grep"]
effort: "medium"
---

> ⚠️ **`/context:init` is deprecated → use `/effectum:init`** (removed in v0.20)


# effectum:init — Project Context Interview

Populates the project-context sentinel block in CLAUDE.md through an interactive interview. This provides Claude with domain knowledge that cannot be inferred from code alone.

## Sentinel Block

This command writes ONLY between the sentinel markers in CLAUDE.md:

```
<!-- effectum:project-context:start -->
... content written here ...
<!-- effectum:project-context:end -->
```

**NEVER touch any content outside these markers.** The rest of CLAUDE.md is system-managed.

## Step 1: Verify Sentinel Block Exists

1. Read `CLAUDE.md` in the project root.
2. Confirm both `<!-- effectum:project-context:start -->` and `<!-- effectum:project-context:end -->` markers exist.
3. If markers are missing, print an error:
   ```
   Error: Sentinel markers not found in CLAUDE.md.
   Run `effectum update` to get the latest template with sentinel support.
   ```
   Stop execution.

## Step 2: Check for Existing Content

1. Extract content between the sentinel markers.
2. If non-placeholder content exists (more than just the default comment):
   - Show the existing content to the user.
   - Ask: **"Project context already exists. Overwrite, append, or cancel?"**
   - If "cancel": stop.
   - If "append": new content will be added after existing content.
   - If "overwrite": existing content will be replaced.

## Step 3: Interview

Ask the following questions. All are optional except the first. Accept free-text answers.

### Question 1 (Required)

**"What is this app/project? Give me the elevator pitch."**

- This is the only required question. If skipped, stop with an error.
- Example: "A SaaS platform for managing restaurant inventory with real-time alerts"

### Question 2 (Optional)

**"Who are the primary users? (press Enter to skip)"**

- Example: "Restaurant managers, kitchen staff, and suppliers"

### Question 3 (Optional)

**"Any key domain terminology I should know? (press Enter to skip)"**

- Example: "PAR level = target inventory amount, 86'd = item out of stock"

### Question 4 (Optional)

**"Architecture constraints or key decisions? (press Enter to skip)"**

- Example: "Must work offline — uses local-first sync with CRDTs. No WebSocket dependency."

### Question 5 (Optional)

**"Important conventions I should follow? (press Enter to skip)"**

- Example: "All API routes use snake_case. Feature flags in LaunchDarkly. No ORM — raw SQL only."

### Question 6 (Optional)

**"Critical files or areas I should know about? (press Enter to skip)"**

- Example: "src/sync/ is the CRDT engine — extremely sensitive, needs careful review. migrations/ must be backward-compatible."

### Question 7 (Optional)

**"Known risks, tech debt, or landmines? (press Enter to skip)"**

- Example: "The auth module is being migrated from JWT to session-based. Both paths exist temporarily. Don't add new JWT dependencies."

## Step 4: Generate and Write Context

Format the answers into structured markdown:

```markdown
## Project Context

### What This Is

[Answer to Q1]

### Users

[Answer to Q2, or omit section if skipped]

### Domain Terminology

[Answer to Q3, or omit section if skipped]

### Architecture Decisions

[Answer to Q4, or omit section if skipped]

### Conventions

[Answer to Q5, or omit section if skipped]

### Critical Areas

[Answer to Q6, or omit section if skipped]

### Known Risks & Tech Debt

[Answer to Q7, or omit section if skipped]
```

Write this content between the sentinel markers in CLAUDE.md:

```
<!-- effectum:project-context:start -->
[generated content]
<!-- effectum:project-context:end -->
```

## Step 5: Confirm

Print a summary:

```
Project context written to CLAUDE.md (sentinel block).
Sections populated: [list of non-skipped sections]

This context will be preserved across effectum updates.
Edit it anytime — just keep the sentinel markers intact.
```

## Next Steps

After populating project context:

- → `effect:dev:plan` — Create an implementation plan using the new context
- → `effect:prd:new` — Start a PRD workshop session with domain context in place
- → `effectum:explore` — Run parallel codebase analysis to complement the context

ℹ️ The sentinel block can be updated at any time by re-running `effectum:init`.

## Communication

Follow the language settings defined in CLAUDE.md for user-facing communication.
All generated content in English.
