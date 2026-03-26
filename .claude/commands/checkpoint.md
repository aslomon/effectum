---
name: "Checkpoint"
description: "Create a tagged git commit as a safe restore point for easy rollback."
allowed-tools: ["Bash", "Read"]
---

# /checkpoint -- Create a Git Restore Point

You create a tagged git commit as a safe restore point. This allows easy rollback if subsequent changes need to be undone.

## Step 1: Check Current State

Run `git status` to assess the working tree.

- **If there are no changes** (clean working tree, nothing to commit):
  Inform the user: "Nothing to checkpoint -- the working tree is clean. The latest commit is already a valid restore point."
  Show the current HEAD commit hash and message for reference.
  **STOP.**

- **If there are uncommitted changes** (tracked modifications, untracked files, or staged changes):
  Continue to Step 2.

## Step 2: Summarize Changes

Briefly analyze what has changed:

1. Run `git diff --stat` to see modified files.
2. Run `git status` to see untracked and staged files.
3. Generate a brief description of the current state (1 sentence), e.g.:
   - "Added user invitation API routes and tests"
   - "Partial implementation of dark mode toggle"
   - "Build fixes for type errors in auth module"

## Step 3: Create the Checkpoint

1. Stage all changes:

   ```
   git add -A
   ```

2. Create the commit with a descriptive checkpoint message:

   ```
   git commit -m "checkpoint: [brief description of current state]"
   ```

3. Create a timestamp-based tag for easy identification:
   ```
   git tag checkpoint-[YYYY-MM-DD-HHMMSS]
   ```
   Use the current date and time in the format `YYYY-MM-DD-HHMMSS` (e.g., `checkpoint-2025-01-15-143022`).

## Step 4: Report

Show the user:

1. The commit hash (short form).
2. The tag name.
3. Summary of what was included (files changed, insertions, deletions).
4. Rollback instructions:
   - **Soft rollback** (keep changes as uncommitted): `git reset --soft [commit-hash]`
   - **View checkpoint**: `git show [tag-name]`
   - **List all checkpoints**: `git tag -l "checkpoint-*"`

## Next Steps

After creating a checkpoint:

- → Continue working — The checkpoint provides a safe rollback point
- → `/tdd` — Continue implementing the next piece of functionality
- → `/verify` — Run quality gates if the checkpoint marks a milestone

ℹ️ Alternative: Use checkpoints before risky refactoring or experimental changes.

## Communication

Follow the language settings defined in CLAUDE.md for user-facing communication.
All git messages, tag names, and technical content in English.
