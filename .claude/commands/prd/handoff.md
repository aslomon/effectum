# /prd:handoff — Hand Off PRD to the Target Project

You export a completed PRD as a handoff package for implementation in the target project.

## Step 1: Load PRD and Check Readiness

Interpret `$ARGUMENTS` as `project-slug/001`.

- If empty or unclear: List available projects and PRDs, ask the user.

Read the PRD: `workshop/projects/{project-slug}/prds/001-*.md`

Check the readiness score:

- If no review has been performed yet: Automatically perform a review (like `/prd:review`). Read `workshop/knowledge/05-quality-checklist.md` for this.
- If score < 2.0: Warn the user and ask whether to proceed anyway. List the weaknesses.
- If score >= 2.0: Proceed.

## Step 2: Load Project Information

Read `workshop/projects/{slug}/PROJECT.md` for:

- `target_repo`: Path to the target repository
- Project context and tech stack information

## Step 3: Determine Workflow Mode

Read `workshop/knowledge/08-workflow-modes.md` for the decision matrix.

Determine the appropriate mode based on:

- PRD complexity
- Number of affected files
- Risk level
- User preference (if known)

Possible modes:

- **Standard Session**: Normal Claude Code session with the PRD as context
- **Full-Auto**: Autonomous implementation with defined checkpoints
- **Ralph Loop**: Iterative Review-Adjust-Learn-Polish-Harden cycle

## Step 4: Generate Handoff Prompt

Read `workshop/knowledge/07-prompt-templates.md` for the appropriate template.

Generate the complete handoff prompt:

1. Embed or reference the PRD content.
2. Workflow instructions according to the chosen mode.
3. Adopt Quality Gates and Completion Criteria from the PRD.
4. Include tech stack context from PROJECT.md.

## Step 5: Save Files

Save the prompt under: `workshop/projects/{slug}/prompts/{number}-{name}-handoff.md`

## Step 6: Serve Target Repository (optional)

If `target_repo` is defined in PROJECT.md and the path exists:

- Ask the user whether PRD and prompt should be copied there.
- If yes: Copy both files to the target repository (e.g., under `docs/prds/`).

## Step 7: Initialize Task Registry

On first handoff (no `tasks.md` exists yet), create the task registry:

1. Read `workshop/templates/tasks.md` for the template.
2. Create `workshop/projects/{slug}/tasks.md`.
3. Generate one task per acceptance criterion from the PRD:
   - Task ID: `T1`, `T2`, etc. (sequential)
   - AC reference: `AC-1`, `AC-2`, etc.
   - Description: Derived from the AC text (concise summary)
   - Status: `📋 TODO`
   - Since: `v{PRD version from frontmatter}`
4. Group tasks under a section header: `## PRD-{number}: {title} (v{version})`

If `tasks.md` already exists (subsequent handoff for a different PRD in the same project):

1. Read the existing task registry.
2. Append a new PRD section with tasks for the new PRD.
3. Do not modify existing tasks from other PRDs.

## Step 8: Update PRD Status

Update the PRD frontmatter `status` to `in-progress`.
Update the PRD status in `PROJECT.md` to `handed-off`.

## Step 9: Show Next Steps

Show the user:

1. Where the handoff prompt was saved.
2. Where the task registry was created/updated.
3. How the prompt is used in the target project (brief instructions).
4. The chosen workflow mode and why.
5. If additional PRDs are open in the project: what comes next.

## Communication

Follow the language settings defined in CLAUDE.md.
All file content must be written in English.
User-facing communication uses the language configured in CLAUDE.md.
