# PRD: PRD Lifecycle Management — Updates, Task Registry, Network Map Sync

## Problem

Effectum can create PRDs and hand them off for autonomous implementation. But once the first build cycle completes, the system has no concept of change. There is no way to:

1. **Update a PRD and only rebuild what changed.** Currently, any PRD change means starting from scratch — full re-handoff, full Ralph Loop.

2. **Track task status across PRD versions.** There is no Task Registry. The Ralph Loop tracks its own progress internally (`ralph-loop.local.md`), but nothing persists project-wide.

3. **Keep the Network Map in sync.** The map is a manual artifact — it doesn't auto-update when PRDs change or when features get implemented.

4. **Detect PRD changes during a Ralph Loop.** If someone edits the PRD while the loop runs, the loop doesn't notice.

5. **Structure PRDs for machine readability.** PRDs are pure freetext — the system re-interprets them from scratch every time instead of reading structured metadata.

This is the single biggest gap in Effectum's autonomous workflow. No competitor solves this well either (see research), making it a major differentiation opportunity.

## Goal

Implement a complete PRD lifecycle: create → build → **update → delta-build → repeat**. PRDs become living documents with versioning, structured frontmatter, and automatic synchronization with Task Registry and Network Map.

## Design Decisions (confirmed by user)

1. **Living Document** — PRDs are modified in-place. Git holds version history. No v1/v2/v3 file copies.
2. **Bugs are separate** — Bug fixes don't modify PRDs. They use direct Ralph Loop with bug reports.
3. **Hard Remove** — Removed features are deleted from code, not feature-flagged (default).
4. **Main-first branching** — PRD updates happen on main with Git tag checkpoints. Branch-per-update is configurable but not default.
5. **Automatic Task Registry** — `/prd:update` and Ralph Loop auto-manage `tasks.md`.
6. **Auto Network Map** — Map updates automatically after PRD changes and implementation progress.
7. **PRD Frontmatter** — Structured YAML header with features, dependencies, version, status.

## Acceptance Criteria

### PRD Frontmatter

- [ ] AC1: The PRD template (`workshop/templates/prd.md`) includes a YAML frontmatter block with: `id`, `version`, `status`, `last_updated`, `depends_on`, `features[]` (each with id, label, status), `connections[]`
- [ ] AC2: `/prd:new` generates frontmatter automatically when creating a new PRD
- [ ] AC3: Each feature in frontmatter has a unique ID used by the Task Registry and Network Map
- [ ] AC4: PRD version is a semver-like number (1.0, 1.1, 1.2) incremented by `/prd:update`

### PRD Changelog

- [ ] AC5: Each PRD contains a `## Changelog` section directly after frontmatter
- [ ] AC6: `/prd:update` automatically adds a changelog entry with: version, date, summary of changes
- [ ] AC7: Removed ACs are marked as `~~REMOVED in vX.Y~~` with reason, not deleted from the file

### `/prd:update` Command

- [ ] AC8: New command file: `system/commands/prd/update.md`
- [ ] AC9: Accepts project-slug/prd-number as argument (e.g., `/prd:update auth/001`)
- [ ] AC10: Also accepts freetext change description: `/prd:update auth/001 "Add Google OAuth and rate-limit password reset"`
- [ ] AC11: Loads current PRD from file AND last committed version from `git show HEAD:path`
- [ ] AC12: Performs Semantic Section Diff: compares ACs, User Stories, Scope, Data Model, API Design section by section
- [ ] AC13: Classifies each change as: ADDITIVE (new AC/feature), MODIFIED (changed AC), REMOVED (deleted AC), DESIGN (UI-only), STRUCTURAL (data model/API change)
- [ ] AC14: Shows Impact Analysis: which existing tasks are affected, which are new, which are safe
- [ ] AC15: Waits for user confirmation before proceeding (except in Full Autonomy mode)
- [ ] AC16: Creates Git checkpoint: `git tag prd-{number}-v{version}-pre`
- [ ] AC17: Updates PRD frontmatter (bumps version, updates features status)
- [ ] AC18: Adds changelog entry
- [ ] AC19: Generates Delta Handoff Prompt: `workshop/projects/{slug}/prompts/{number}-update-v{version}.md`
- [ ] AC20: Delta Handoff contains: what's already done (protection rules), what's modified (stale tasks), what's new, regression mandate
- [ ] AC21: Updates Task Registry (`tasks.md`)

### Task Registry

- [ ] AC22: File: `workshop/projects/{slug}/tasks.md` — created automatically by `/prd:handoff` or `/prd:update`
- [ ] AC23: Each task has: ID, AC reference, description, status (TODO/IN_PROGRESS/DONE/STALE/CANCELLED), PRD version
- [ ] AC24: `/prd:update` marks affected tasks as STALE when their AC changes
- [ ] AC25: `/prd:update` adds new tasks for new ACs as TODO
- [ ] AC26: `/prd:update` marks tasks as CANCELLED for removed ACs
- [ ] AC27: Ralph Loop reads `tasks.md` to understand what's done and what's pending
- [ ] AC28: Ralph Loop updates task status during execution (TODO → IN_PROGRESS → DONE)

### Network Map Auto-Sync

- [ ] AC29: `/prd:new` automatically generates a Stage 1 Feature Map after scope is defined
- [ ] AC30: `/prd:update` automatically updates `network-map.mmd` with new/changed/removed features
- [ ] AC31: Ralph Loop updates node status in Network Map (planned → inProgress → done)
- [ ] AC32: `/prd:network-map --validate` checks for circular dependencies, isolated nodes, missing PRD assignments

### PRD-Hash Change Detection

- [ ] AC33: Ralph Loop stores PRD hash in `ralph-loop.local.md` at start
- [ ] AC34: Ralph Loop checks PRD hash at the beginning of each iteration
- [ ] AC35: If hash changed during loop: pause, notify user, show what changed, ask whether to continue or restart with delta

### Branching Configuration

- [ ] AC36: Default: PRD updates happen on current branch with Git tag checkpoints
- [ ] AC37: Configurable in `.effectum.json`: `"branchPerUpdate": true` creates a new branch for each PRD update
- [ ] AC38: When branching enabled: `git checkout -b prd-{number}-v{version}` before changes

### Delta Handoff Template

- [ ] AC39: Delta Handoff clearly separates: DONE (don't touch), STALE (needs rework), NEW (build fresh), CANCELLED (remove)
- [ ] AC40: Includes Protection Rules: "These tests MUST remain green"
- [ ] AC41: Includes Regression Mandate: "All existing Quality Gates must still pass"
- [ ] AC42: Ralph Loop can be started directly with the delta handoff prompt

## Scope

### In Scope

- PRD frontmatter (YAML header) in template and `/prd:new`
- PRD changelog convention
- `/prd:update` command (semantic diff + impact analysis + delta handoff)
- Task Registry (`tasks.md`) — auto-created and auto-updated
- Network Map auto-sync (after PRD changes and during Ralph Loop)
- PRD-hash change detection in Ralph Loop
- Delta Handoff Prompt template
- Configurable branching strategy
- Updates to existing commands: `/prd:new`, `/prd:handoff`, `/prd:network-map`

### Out of Scope

- Visual/interactive Network Map viewer (HTML export)
- Multiple views (feature/process/data/dependency) — future
- Sequence diagrams for process flows
- AI-powered semantic diff (v1 uses section-level text comparison)
- Automatic Ralph Loop restart after PRD change detection (v1 just notifies)
- Cross-PRD impact analysis (v1 only analyzes within one PRD)

## Technical Design

### New Files

```
system/commands/prd/update.md       — The /prd:update command
workshop/templates/prd.md           — Updated with frontmatter + changelog
workshop/templates/delta-handoff.md — Template for delta handoff prompts
workshop/templates/tasks.md         — Template for task registry
```

### Modified Files

```
system/commands/prd/new.md          — Generate frontmatter, auto Stage 1 map
system/commands/prd/handoff.md      — Initialize task registry on first handoff
system/commands/prd/network-map.md  — Add --validate flag, read frontmatter
system/commands/ralph-loop.md       — PRD-hash check, task registry sync, network map sync
workshop/knowledge/01-prd-template.md — Document frontmatter format
workshop/knowledge/06-network-map-guide.md — Document auto-sync behavior
```

### PRD Frontmatter Schema

```yaml
---
id: PRD-001
title: "Authentication System"
version: 1.0
status: ready           # drafting | ready | in-progress | done | archived
last_updated: 2026-03-21
depends_on: []
features:
  - { id: AUTH, label: "Authentication Module", status: planned }
  - { id: LOGIN, label: "Login Flow", status: planned }
  - { id: REGISTER, label: "Registration", status: planned }
connections:
  - { from: AUTH, to: DASHBOARD, type: hard, label: "requires auth" }
---
```

### Task Registry Format

```markdown
# Task Registry: {project-slug}

## PRD-001: Auth System (v1.2)

| ID | AC | Description | Status | Since |
|----|-----|-------------|--------|-------|
| T1 | AC-1 | User registration with email | ✅ DONE | v1.0 |
| T2 | AC-2 | User login with password | ✅ DONE | v1.0 |
| T3 | AC-3 | Password reset with rate limiting | ⚠️ STALE | v1.2 |
| T4 | AC-4 | Session management | ✅ DONE | v1.0 |
| T7 | AC-7 | Google OAuth | 📋 TODO | v1.2 |
```

### Delta Handoff Structure

```markdown
# Delta Implementation: {PRD Name} v{old} → v{new}

## Protection Rules (DO NOT modify)
[List of completed ACs and their tests that must remain green]

## Stale Tasks (needs rework)
[Tasks where AC changed — update implementation + tests]

## New Tasks (build fresh)
[New ACs — implement from scratch]

## Cancelled Tasks (remove if implemented)
[Removed ACs — delete code or mark as dead]

## Quality Gates (unchanged)
[Same gates as original PRD]

## Completion Promise
"All modified and new ACs implemented, all existing tests still pass, 
all Quality Gates green, no regressions"
```

### Ralph Loop Integration

Add to ralph-loop.md Step 2 (Initialize State):
```yaml
prd_hash: "sha256:..."
prd_path: "workshop/projects/{slug}/prds/001-*.md"
tasks_path: "workshop/projects/{slug}/tasks.md"
network_map_path: "workshop/projects/{slug}/network-map.mmd"
```

Add to Step 3a (Read State):
```
- Check PRD hash: if changed since last iteration → PAUSE, notify user
- Read tasks.md: identify next TODO or STALE task
```

Add to Step 3e (Update State):
```
- Update tasks.md: mark current task as IN_PROGRESS → DONE
- Update network-map.mmd: mark corresponding feature node status
```

## Quality Gates

- `/prd:update` correctly identifies added, modified, and removed ACs
- Delta handoff contains protection rules for completed work
- Task Registry reflects accurate status after Ralph Loop
- Network Map nodes change status during implementation
- PRD-hash detection pauses Ralph Loop when PRD changes
- Git checkpoints are created before every update
- `--validate` on network-map detects circular dependencies
- All existing commands (`/prd:new`, `/prd:handoff`, `/plan`, `/ralph-loop`) still work

## Completion Promise

"PRD frontmatter, changelog, /prd:update with semantic diff, task registry, network map auto-sync, PRD-hash detection in Ralph Loop, and delta handoff generation are all implemented and integrated into the existing Effectum workflow"
