# Spec: TaskCreated Hook for Effectum Agent Teams

**Intake:** #018
**Signal:** Claude Code v2.1.89 — `TaskCreated` hook event (with blocking behavior) officially documented; fires when an agent spawns a subagent task
**Priority:** P1
**Roadmap:** v0.17
**Status:** Draft (2026-04-01)

---

## Problem

In Effectum Agent Teams (`effect:teams`, `docs/teams.md`), the orchestrator spawns subagents via `/agent:start` or Claude Code's native subagent mechanism. Currently, each subagent starts with the system context it was born with — no opportunity for:

1. **Context injection** — the subagent doesn't know which Effectum stack it's on, which task it was assigned, or what the parent agent's current state is
2. **Pre-flight checks** — no way to validate that the subagent's environment (branch, working directory, tool availability) is correct before it starts working
3. **Audit logging** — no record of when subagents are created, by whom, and with what initial context
4. **Rate limiting** — spawning 20 subagents simultaneously can overwhelm API rate limits; no gate mechanism exists

The `TaskCreated` hook fills this gap. It fires synchronously before a subagent starts executing, and can block (return exit code 2) to prevent the spawn if conditions aren't met.

---

## Solution: TaskCreated Hook Templates for Agent Teams

Effectum ships a `task-created-handler.sh` template that provides context injection, pre-flight checks, and spawn logging for Agent Team workflows.

### How It Works (v2.1.89)

When an orchestrator agent spawns a subagent task, Claude Code fires a `TaskCreated` hook. The hook receives task metadata on stdin:

```json
{
  "task": {
    "id": "<task-uuid>",
    "description": "<task description passed to subagent>",
    "parentSessionId": "<orchestrator session id>",
    "createdAt": "<ISO timestamp>"
  }
}
```

The hook can:
- Return exit code `0` (allow spawn, optionally inject context via stdout)
- Return exit code `2` (block spawn — orchestrator receives denial)
- Inject additional context into the task by printing to stdout:

```json
{
  "additionalContext": "Stack: NextJS+Supabase. Branch: feat/v0.17. Test runner: vitest. Commit before finishing."
}
```

---

## Specification

### New Hook Template: `.effectum/hooks/task-created-handler.sh`

```bash
#!/usr/bin/env bash
# .effectum/hooks/task-created-handler.sh
# Fires on TaskCreated events — injects Effectum context into new subagent tasks.

input=$(cat)
task_id=$(echo "$input" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d['task']['id'])" 2>/dev/null)
task_desc=$(echo "$input" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d['task']['description'][:100])" 2>/dev/null)
timestamp=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

# --- Rate limiter: max concurrent subagents ---
MAX_CONCURRENT="${EFFECTUM_MAX_SUBAGENTS:-5}"
active=$(ls /tmp/.effectum-tasks/ 2>/dev/null | wc -l | tr -d ' ')
if [ "$active" -ge "$MAX_CONCURRENT" ]; then
  echo '{"decision":"deny","reason":"Max concurrent subagents reached. Try again shortly."}'
  exit 2
fi

# --- Register task as active ---
mkdir -p /tmp/.effectum-tasks/
touch "/tmp/.effectum-tasks/$task_id"

# --- Build context injection ---
stack_context=""
if [ -f ".effectum.json" ]; then
  stack_context=$(python3 -c "
import json
with open('.effectum.json') as f:
    d = json.load(f)
stack = d.get('stack', 'generic')
version = d.get('version', 'unknown')
print(f'Effectum stack: {stack} (v{version}).')
" 2>/dev/null)
fi

branch=$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "unknown")

# --- Audit log ---
mkdir -p .effectum/logs/
echo "{\"event\":\"TaskCreated\",\"taskId\":\"$task_id\",\"description\":\"$task_desc\",\"branch\":\"$branch\",\"timestamp\":\"$timestamp\"}" \
  >> .effectum/logs/task-audit.jsonl

# --- Output context injection ---
echo "{\"additionalContext\":\"$stack_context Branch: $branch. Log task completion to .effectum/logs/task-audit.jsonl when done.\"}"
exit 0
```

### Cleanup Hook (PostToolUse on Stop)

To deregister active tasks on completion, add a `PostToolUse` hook on `Stop`:

```bash
#!/usr/bin/env bash
# .effectum/hooks/task-cleanup.sh
task_id="${CLAUDE_TASK_ID:-}"
if [ -n "$task_id" ]; then
  rm -f "/tmp/.effectum-tasks/$task_id"
fi
exit 0
```

### Integration with Agent Teams Config

In `docs/agent-teams.md`, `TaskCreated` is documented as the standard way to implement context injection:

```markdown
## Subagent Context Injection

By default, subagents spawned by an orchestrator start without knowledge of the Effectum stack,
current branch, or task audit requirements. Use the `TaskCreated` hook to inject this context:

...
```

### `effect:teams:setup` Command Extension

When running `effect:teams:setup`, inject the `TaskCreated` handler automatically:

```json
{
  "hooks": {
    "TaskCreated": [
      {
        "hooks": [".effectum/hooks/task-created-handler.sh"]
      }
    ]
  }
}
```

---

## Acceptance Criteria

- [ ] `task-created-handler.sh` ships in `system/hooks/` with rate limiting, context injection, audit logging
- [ ] `task-cleanup.sh` ships in `system/hooks/` for deregistering completed tasks
- [ ] `docs/hooks.md` updated with `TaskCreated` event documentation (input format, `additionalContext` output)
- [ ] `docs/teams.md` updated with subagent context injection section
- [ ] `effect:teams:setup` injects handler automatically
- [ ] `EFFECTUM_MAX_SUBAGENTS` env var documented (default: 5)
- [ ] Audit log format documented in `docs/extending-agents.md`
- [ ] `/tmp/.effectum-tasks/` cleanup on session end (handled by `task-cleanup.sh`)

---

## Non-Goals

- No persistent subagent state between spawns in this version
- No Telegram/Slack notifications on spawn events (future: `effect:notify`)
- No visual task tree UI (future: Mission Control dashboard)
- Max concurrent limit is process-local (per machine) — not distributed

---

## Connection to Existing Specs

- **intake #012 (Headless CI):** TaskCreated hook fires in headless mode too; the two are compatible
- **intake #014 (Defer):** Checkpoint defer can use `TaskCreated` to pause before spawning critical subagents
- **Agent Teams docs** (`docs/teams.md`, `docs/agent-teams.md`): this spec is the hooks layer for those docs
