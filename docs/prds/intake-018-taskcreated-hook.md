# Intake #018 — `TaskCreated` Hook for Agent Teams Pre-Flight

**Status:** spec  
**Priority:** P1  
**Roadmap:** v0.17  
**Source:** Claude Code v2.1.89 changelog  
**Date:** 2026-04-02  

---

## Signal

Claude Code v2.1.89 officially documented the `TaskCreated` hook event for Agent Teams mode. It fires when a new task is created and assigned — with **blocking behavior**: a `prompt`-type hook returning `{"ok": false}` prevents the task from starting.

Previously this event existed but was undocumented. Now it's first-class.

---

## Problem

Effectum currently has no `TaskCreated` support. Teams workflows are missing:

1. **Pre-flight context injection** — no way to inject project-specific context before a subagent starts
2. **Task logging** — `TaskCompleted` is logged, but task lifecycle has no start event
3. **Routing/validation** — can't validate task assignments before they run (e.g., "is this task assigned to the right agent?")
4. **Gate checks** — can't block tasks based on conditions (e.g., "don't start new tasks if tests are red")

---

## Solution

Add `TaskCreated` hook support to:

### 1. `settings.json.tmpl` — Foundation Hook

Add a default async logging hook for `TaskCreated` to close the lifecycle gap:

```json
"TaskCreated": [
  {
    "hooks": [
      {
        "type": "command",
        "command": "bash -c 'INPUT=$(cat); TASK=$(echo \"$INPUT\" | jq -r \".task_id // empty\"); AGENT=$(echo \"$INPUT\" | jq -r \".agent_name // empty\"); mkdir -p \"${CLAUDE_PROJECT_DIR:-.}/.claude/logs\"; echo \"$(date +%Y-%m-%dT%H:%M:%S) TASK_CREATED: $TASK by $AGENT\" >> \"${CLAUDE_PROJECT_DIR:-.}/.claude/logs/team-activity.log\"; exit 0'",
        "statusMessage": "Logging task creation...",
        "async": true
      }
    ]
  }
]
```

### 2. Agent Teams Profile (optional blocking hook)

For projects using Agent Teams (`/teams` command), add an opt-in blocking hook template:

```json
"TaskCreated": [
  {
    "hooks": [
      {
        "type": "prompt",
        "prompt": "A new task was just created in Agent Teams mode.\nContext: $ARGUMENTS\n\nPre-flight checks:\n1. Are there any blockers (failing tests, merge conflicts, unresolved P0 issues)?\n2. Is the task assigned to the correct agent based on expertise?\n3. Are the task's dependencies satisfied?\n\nIf pre-flight passes, respond {\"ok\": true}.\nIf blocked, respond {\"ok\": false, \"reason\": \"specific blocker\"}.",
        "timeout": 30,
        "statusMessage": "Running task pre-flight checks..."
      }
    ]
  }
]
```

### 3. `docs/hooks.md` Update

Document `TaskCreated` alongside `TaskCompleted` in the reference section. ✅ Done (04:00 02.04.2026)

---

## Acceptance Criteria

- [ ] `settings.json.tmpl` includes async `TaskCreated` logging hook
- [ ] Agent Teams profile has opt-in blocking `TaskCreated` prompt hook
- [ ] `docs/hooks.md` documents `TaskCreated` with example and v2.1.89 attribution
- [ ] CHANGELOG.md updated under `[Unreleased]`

---

## Out of Scope

- Modifying existing `TaskCompleted` hooks (separate concern)
- Changes to CLI commands
- Non-teams projects (no-op if not in Agent Teams mode)

---

## Implementation Notes

- `TaskCreated` and `TaskCompleted` should be documented as a pair in hooks.md (lifecycle symmetry)
- Blocking hook should be opt-in (default = async logging only); blocking on every task is too aggressive
- Use `async: true` for logging hooks to avoid blocking task startup
