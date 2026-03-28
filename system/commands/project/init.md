---
name: "Project Init"
description: "Create the complete directory structure and template files for a new project."
allowed-tools: ["Read", "Write", "Bash"]
effort: "low"
---

# /project:init — Initialize a New Project Workspace

You create the complete directory structure and template files for a new project.

## Step 1: Validate Slug

Interpret `$ARGUMENTS` as project-slug.

If empty: Ask the user for a project name and derive the slug from it.

Validate the slug format:

- Only lowercase letters, digits, and hyphens allowed.
- No spaces, no special characters, no umlauts.
- Must start with a letter.
- Examples: `my-saas-app`, `portfolio-2026`, `ai-agent-framework`

If invalid: Suggest a corrected slug and ask the user.

Check if `workshop/projects/{slug}/` already exists. If yes: Inform the user and ask whether `/prd:resume` was intended.

## Step 2: Create Directory Structure

Create the following structure:

```
workshop/projects/{slug}/
  prds/
  prompts/
  notes/
```

## Step 3: Create PROJECT.md

Read `workshop/templates/PROJECT.md` as a template.

Create `workshop/projects/{slug}/PROJECT.md` with:

- Project name (from slug, Title Case)
- Today's date as creation date
- Status: `discovery`
- Empty PRD list
- Empty fields for target_repo, tech_stack, etc.

## Step 4: Create Notes Files

Create `workshop/projects/{slug}/notes/discovery-log.md`:

```markdown
# Discovery Log

## Session 1 — {today's date}

(Notes will be added during discovery phase)
```

Create `workshop/projects/{slug}/notes/decisions.md`:

```markdown
# Decision Log

| #   | Date | Decision | Rationale | Status |
| --- | ---- | -------- | --------- | ------ |
```

## Step 5: Confirmation

Confirm to the user:

- Which directory was created.
- Which files were set up.
- Suggest continuing with `/prd:new {slug}`.

## Next Steps

After initialization:

- → `/prd:new {slug}` — Start the discovery phase for the new project
- → `/prd:status` — See all projects including the newly created one

## Communication

Follow the language settings defined in CLAUDE.md.
All file content must be written in English.
User-facing communication uses the language configured in CLAUDE.md.
