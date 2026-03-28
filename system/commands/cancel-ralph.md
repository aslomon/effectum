---
name: "Cancel Ralph"
description: "Gracefully cancel a running Ralph Loop, preserve progress, and report current state."
allowed-tools: ["Read", "Write", "Bash"]
effort: "low"
---

# /cancel-ralph -- Cancel an Active Ralph Loop

You gracefully cancel a running Ralph Loop, preserve progress, and report the current state.

## Step 1: Check for Active Loop

Check if `.claude/ralph-loop.local.md` exists.

- **If it does not exist**: Inform the user: "No active Ralph Loop found. There is nothing to cancel."
  **STOP.**

- **If it exists**: Read the file completely. Check the `active` field:
  - If `active: false`: Inform the user: "The Ralph Loop has already completed or been cancelled. See `.claude/ralph-status.md` for the final status."
    **STOP.**
  - If `active: true`: Continue to Step 2.

## Step 2: Capture Current State

Gather the current project state:

1. Read the progress log from `.claude/ralph-loop.local.md` (iterations completed, what was done).
2. Read the original prompt and completion promise.
3. Run `git diff --stat` to see uncommitted changes.
4. Run the project's test command to get current test status.
5. Run the project's build command to get current build status.
6. Check for any blocker files at `.claude/ralph-blockers.md`.

## Step 3: Write Status Report

Write a comprehensive status report to `.claude/ralph-status.md`:

```markdown
# Ralph Loop Status Report

## Summary

- **Started**: [ISO timestamp from state file]
- **Cancelled**: [current ISO timestamp]
- **Iterations completed**: [N] of [max_iterations]
- **Completion promise**: "[PHRASE]"
- **Promise fulfilled**: No (cancelled)

## What Was Implemented

[List each piece of functionality that was implemented, based on the progress log]

## What Remains

[List acceptance criteria or tasks that were not completed]

## Current Quality Gate Status

| Gate  | Status                     |
| ----- | -------------------------- |
| Build | [PASS/FAIL]                |
| Types | [PASS/FAIL]                |
| Tests | [PASS/FAIL -- N/M passing] |
| Lint  | [PASS/FAIL]                |

## Blockers (if any)

[Content from .claude/ralph-blockers.md, or "None"]

## Uncommitted Changes

[Summary of git diff --stat output]

## Recommended Next Steps

[Concrete suggestions for how to continue: specific fixes, remaining tasks, approach changes]
```

## Step 4: Update State Files

1. Set `active: false` in `.claude/ralph-loop.local.md`. Do not delete the file -- it serves as a record.
2. If `.effectum/loop-state.json` exists, update it:
   - Set `status` to `"cancelled"`
   - Add `cancelled_at` with the current ISO 8601 timestamp
   - Preserve all other fields (`task`, `iteration`, `maxIterations`, `lastError`, `artifacts_created`, `completionPromise`, `branch`, etc.)

## Step 5: Inform the User

Report to the user:

1. The Ralph Loop has been cancelled.
2. How many iterations were completed out of the maximum.
3. Brief summary of what was accomplished.
4. Where to find the full status report (`.claude/ralph-status.md`).
5. Suggested next steps: continue manually, restart with a modified prompt, or run `/verify` to assess the current state.

## Next Steps

After cancelling the Ralph Loop:

- → `/verify` — Assess the current state of the codebase after partial implementation
- → `/build-fix` — If the build is broken, fix errors incrementally
- → `/ralph-loop` — Restart with a modified prompt or adjusted scope

ℹ️ Alternative: Review `.claude/ralph-status.md` for detailed progress and blockers before deciding next steps.

## Communication

Follow the language settings defined in CLAUDE.md for user-facing communication.
All status report content and technical details in English.
