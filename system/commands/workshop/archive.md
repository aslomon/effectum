# /workshop:archive — Archive a Completed Project

You archive a completed project by moving it from `workshop/projects/` to `workshop/archive/`.

## Step 1: Identify Project

Interpret `$ARGUMENTS` as project-slug.

- If empty: List available projects under `workshop/projects/`, ask the user.

Check if `workshop/projects/{slug}/` exists. If not: Inform the user, check whether it already exists under `workshop/archive/`.

## Step 2: Check Readiness

Read `workshop/projects/{slug}/PROJECT.md`.

Check the status of all PRDs:

- **All PRDs `handed-off`**: All good, proceed.
- **Not all PRDs `handed-off`**: Warn the user with a list of incomplete PRDs and their current status. Explicitly ask: [in configured language] "Archive anyway?"
- Wait for confirmation before proceeding.

## Step 3: Ensure Archive Directory

Check if `workshop/archive/` exists. If not, create it.

## Step 4: Move Project

Move the project directory:

- From: `workshop/projects/{slug}/`
- To: `archive/{YYYY-MM-DD}_{slug}/`

Use today's date as the prefix.

## Step 5: Update STATUS.md

Read `STATUS.md` in the root directory (if present).
Update the project list:

- Remove the project from the active list.
- Add it to the archive section (with archiving date).

If `STATUS.md` does not exist, create it with the archive entry.

## Step 6: Confirmation

Confirm to the user:

- Which project was archived.
- Where it was moved to.
- Whether all PRDs were in `handed-off` status.

## Communication

Follow the language settings defined in CLAUDE.md.
All file content must be written in English.
User-facing communication uses the language configured in CLAUDE.md.
