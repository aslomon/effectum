---
name: "prd:update [DEPRECATED → effect:prd:update]"
description: "DEPRECATED: Use /effect:prd:update instead. This alias will be removed in v0.20."
allowed-tools: ["Read", "Write", "Bash"]
effort: "medium"
---

> ⚠️ **Deprecated as of v0.18.0**
>
> `/prd:update` has been renamed to `effect:prd:update`.
> This alias will be **removed in v0.20.0**.
>
> Please update your workflow: type `/effect:prd:update` going forward.
> (Running `effect:prd:update` now...)

---

# /prd:update — Update an Existing PRD with Change Tracking

You update an existing PRD, performing semantic diff, impact analysis, and delta handoff generation.

## Step 1: Parse Arguments

Interpret `$ARGUMENTS` for:

1. **PRD reference**: `{project-slug}/{prd-number}` (e.g., `auth/001`). Required.
2. **Change description** (optional): Freetext in quotes describing the changes (e.g., `"Add Google OAuth and rate-limit password reset"`).

If `$ARGUMENTS` is empty or unclear: List available projects and their PRDs, ask the user to specify.

## Step 2: Load Current and Previous State

1. Read the current PRD file: `workshop/projects/{slug}/prds/{number}-*.md`
2. Parse the YAML frontmatter to get: `id`, `version`, `status`, `features[]`, `connections[]`
3. Load the last committed version from git: `git show HEAD:workshop/projects/{slug}/prds/{number}-*.md`
4. Read the task registry if it exists: `workshop/projects/{slug}/tasks.md`
5. Read the network map if it exists: `workshop/projects/{slug}/network-map.mmd`

If the PRD has no frontmatter (legacy PRD), inform the user and offer to add frontmatter first.

## Step 3: Interactive Change Session

If no change description was provided:

1. Ask the user: **[in configured language] "What changed in this PRD? Describe the updates, or say 'diff' to see what I detect."**
2. If user says "diff": Show the section-by-section differences detected between the current file and the last committed version.
3. Collect the change description from the user.

If a change description was provided: Use it as context for the semantic diff.

## Step 4: Semantic Section Diff

Compare the current PRD file against the last committed version, section by section:

### Sections to Compare

- **Acceptance Criteria**: Compare each AC individually. Detect added, modified, and removed ACs.
- **User Stories**: Detect new, changed, or removed stories.
- **Scope**: Check if In Scope or Out of Scope changed.
- **Data Model**: Detect table/column/relation changes.
- **API Design**: Detect endpoint changes.
- **UI/UX**: Detect layout or interaction changes.

### Change Classification

Classify each detected change:

| Type           | Detection                           | Impact                                          |
| -------------- | ----------------------------------- | ----------------------------------------------- |
| **ADDITIVE**   | New AC, new feature in scope        | New tasks in registry, new nodes in network map |
| **MODIFIED**   | Changed AC text, changed data model | Existing tasks become STALE                     |
| **REMOVED**    | Deleted AC, removed from scope      | Tasks become CANCELLED, nodes removed from map  |
| **DESIGN**     | UI/UX changes only                  | Existing tasks become STALE (UI tasks only)     |
| **STRUCTURAL** | Data model or API changes           | High-impact: may affect multiple tasks          |

## Step 5: Impact Analysis

Present the impact analysis to the user:

```
## Impact Analysis: {PRD Title} v{current} → v{next}

### Changes Detected
- ADDITIVE: {count} new ACs
- MODIFIED: {count} changed ACs
- REMOVED: {count} deleted ACs
- DESIGN: {count} UI-only changes
- STRUCTURAL: {count} data model/API changes

### Task Impact
- ✅ Safe (DONE, unaffected): {list}
- ⚠️ Stale (needs rework): {list}
- 📋 New (to be built): {list}
- ❌ Cancelled (to be removed): {list}

### Risk Assessment
- [High/Medium/Low]: [reason]
```

## Step 6: User Confirmation

Present the impact analysis and wait for user confirmation before proceeding.

- Show the classified changes clearly.
- If STRUCTURAL changes are detected: Highlight the risk and affected areas.
- Ask: **[in configured language] "Proceed with this update? (yes/no)"**

Exception: In Full Autonomy mode (if configured), skip confirmation.

## Step 7: Create Git Checkpoint

Before modifying any files:

1. Check for uncommitted changes: `git status`
2. If there are uncommitted changes: Ask the user to commit or stash first.
3. Create a pre-update tag: `git tag prd-{number}-v{current_version}-pre`

## Step 8: Update PRD Frontmatter

1. **Bump version**: Increment the minor version (e.g., 1.0 → 1.1).
2. **Update `last_updated`**: Set to today's date.
3. **Update `features[]`**: Add new feature entries, keep existing ones.
4. **Update `connections[]`**: Add/remove connections as needed.
5. **Update `status`**: If status was `done`, change to `in-progress` (since new work is needed).

## Step 9: Add Changelog Entry

Add a new row at the top of the Changelog table:

```markdown
| {new_version} | {today} | {summary of changes} |
```

The summary should be concise but specific (e.g., "Added Google OAuth (AC7), modified password reset rate limiting (AC3), removed SMS login (AC5)").

## Step 10: Mark Removed ACs

For any removed ACs: Do NOT delete them from the file. Instead, mark them with strikethrough and version:

```markdown
- ~~AC5: SMS-based login~~ REMOVED in v1.1 — Replaced by OAuth
```

## Step 11: Update Task Registry

Read or create `workshop/projects/{slug}/tasks.md`:

1. **New ACs** → Add as `📋 TODO` with the next available task ID and `Since: v{new_version}`.
2. **Modified ACs** → Mark existing tasks as `⚠️ STALE` and update `Since: v{new_version}`.
3. **Removed ACs** → Mark existing tasks as `❌ CANCELLED` and update `Since: v{new_version}`.
4. **Unaffected DONE tasks** → Keep as `✅ DONE` (no changes).
5. Update the PRD version number in the section header.

## Step 12: Update Network Map

Read `workshop/projects/{slug}/network-map.mmd` and update:

1. **New features** → Add nodes with `:::planned` status.
2. **Removed features** → Remove nodes and their connections.
3. **New connections** → Add edges from the frontmatter `connections[]`.
4. **Removed connections** → Remove edges no longer in frontmatter.

Follow the conventions from `workshop/knowledge/06-network-map-guide.md`.

## Step 13: Generate Delta Handoff

Read `workshop/templates/delta-handoff.md` for the template.

Generate the delta handoff prompt at: `workshop/projects/{slug}/prompts/{number}-update-v{new_version}.md`

Fill in all sections:

1. **Protection Rules**: List all DONE tasks and their test locations. If no explicit automated test exists yet, say so clearly (e.g. `No explicit automated test located yet`) — never invent a test path.
2. **Stale Tasks**: For each STALE task, show the before/after AC text and what changed. Preserve original typography from the PRD when quoting snippets (em dashes `—`, curly quotes, etc.).
3. **New Tasks**: List all new ACs to implement.
4. **Cancelled Tasks**: List removed ACs with removal reason.
5. **Quality Gates**: Copy from the PRD.
6. **Completion Promise**: Use the delta-specific promise.

## Step 14: Commit Changes

Before staging, run `git status --short` and classify files:

- **Expected generated files**: updated PRD, task registry, network map, delta handoff prompt
- **Pre-existing unrelated changes**: leave untouched unless the user explicitly asked for them
- **Untracked scratch/prompt files**: do **not** stage automatically unless they are the generated delta handoff for this update

Stage and show the user what will be committed:

- Updated PRD file
- Updated or created task registry
- Updated network map
- Generated delta handoff prompt

Ask the user whether to commit now or later.

Suggested commit message: `feat({slug}): update PRD-{number} to v{new_version} — {brief summary}`

## Step 15: Show Summary

Display:

1. Version bump: v{old} → v{new}
2. Changes: {count} additive, {count} modified, {count} removed
3. Delta handoff location
4. Next steps: how to use the delta handoff prompt

## Next Steps

After the PRD update:

- → `effect:prd:handoff {slug}/{number}` — Generate an updated handoff with the delta prompt
- → `effect:dev:run` (`/ralph-loop`) — Run the delta handoff prompt to implement the changes
- → `effect:prd:review {slug}/{number}` — Re-review the updated PRD before handing off

## Communication

Follow the language settings defined in CLAUDE.md.
All file content must be written in English.
User-facing communication uses the language configured in CLAUDE.md.
