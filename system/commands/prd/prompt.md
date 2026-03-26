---
name: "PRD Prompt"
description: "Generate a handoff prompt for a PRD without performing the full export process."
allowed-tools: ["Read", "Write"]
---

# /prd:prompt — Generate Handoff Prompt for a PRD

You generate a handoff prompt for a PRD without performing the full export process.

## Step 1: Load PRD

Interpret `$ARGUMENTS` as `project-slug/001`.

- If empty or unclear: List available projects and PRDs, ask the user.

Read the PRD: `workshop/projects/{project-slug}/prds/001-*.md`

## Step 2: Determine Workflow Mode

Read `workshop/knowledge/08-workflow-modes.md` for the decision matrix.

Evaluate the PRD against the matrix criteria:

- **Complexity**: Number of ACs, data model scope, integrations
- **Risk**: New technologies, security-relevant, critical path
- **File Impact**: How many files are expected to be affected
- **Autonomy Level**: How much can be implemented without follow-up questions

Determine the mode:

- **Standard Session**: Moderate complexity, user wants to collaborate
- **Full-Auto**: Clearly defined, low risk, high autonomy
- **Ralph Loop**: Complex, high risk, iterative approach needed

## Step 3: Generate Prompt

Read `workshop/knowledge/07-prompt-templates.md` for the appropriate template.

Build the complete prompt:

1. **Context Section**: Project name, tech stack, relevant context from PROJECT.md.
2. **PRD Content**: Embed the complete PRD.
3. **Workflow Instructions**: According to the chosen mode.
4. **Quality Gates**: Quality criteria adopted from the PRD.
5. **Completion Criteria**: When is the implementation done.
6. **Autonomy Rules**: What the implementing agent may decide on its own.

## Step 4: Save Prompt

Save the prompt under: `workshop/projects/{slug}/prompts/{number}-{name}-handoff.md`

## Step 5: Display Prompt

Show the complete prompt in a code block so the user can easily copy it.

## Step 6: Explain Mode

Briefly explain (2-3 sentences) why this workflow mode was chosen. For example:

- "Full-Auto, because the PRD is clearly defined, affects few files, and has no external dependencies."
- "Ralph Loop, because the feature is security-critical and needs iterative review."

## Communication

Follow the language settings defined in CLAUDE.md.
All file content must be written in English.
User-facing communication uses the language configured in CLAUDE.md.
