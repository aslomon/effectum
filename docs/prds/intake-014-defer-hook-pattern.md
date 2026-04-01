# Spec: Defer Hook Pattern for Pause/Resume Flows

**Intake:** #014
**Signal:** Claude Code v2.1.89 — `PreToolUse` hook can return `"decision": "defer"` to pause execution and wait for external signal before proceeding
**Priority:** P1
**Roadmap:** v0.17
**Status:** Draft (2026-04-01)

---

## Problem

The existing Effectum hook system supports `allow` and `deny` decisions in `PreToolUse` hooks. This works well for headless CI runs (intake #012) and permission guards, but there is no mechanism to **pause** a claude session and wait for an external trigger before resuming.

Use cases that require pause/resume:

1. **Ralph Loop checkpoints** — pause the loop after N commits for a human review step before continuing
2. **Multi-stage pipelines** — wait for a CI job to pass before allowing further file edits
3. **Approval workflows** — require a Slack/Telegram confirm before allowing destructive operations (e.g., DB migrations)
4. **Rate-limiting** — throttle agent activity during peak hours (pause for N minutes between tool calls)

Without `defer`, these require either blocking the terminal (not usable in CI) or denying the tool (which aborts the current plan).

---

## Solution: `defer` Decision in PreToolUse Hooks

Claude Code v2.1.89 introduced a third hook decision value:

```json
{
  "decision": "defer",
  "waitForSignal": "<signal-file-path-or-env-var>"
}
```

When a hook returns `defer`, Claude Code:
1. Suspends the tool call (no execution)
2. Polls the specified signal mechanism until it resolves
3. Re-runs the hook on resolution to get the final `allow` / `deny`

Effectum will provide a standard `defer-guard.sh` template plus a `/defer-checkpoint` command that injects a configurable pause point into the Ralph Loop.

---

## Specification

### New Hook Template: `.effectum/hooks/defer-guard.sh`

```bash
#!/usr/bin/env bash
# .effectum/hooks/defer-guard.sh
# Defers tool execution until EFFECTUM_RESUME signal file is present.
# Remove or touch the signal file to resume: touch /tmp/.effectum-resume

SIGNAL_FILE="${EFFECTUM_RESUME_SIGNAL:-/tmp/.effectum-resume}"
MAX_WAIT="${EFFECTUM_DEFER_TIMEOUT_SECS:-300}"  # 5 min default

# If resume signal already set, allow immediately
if [ -f "$SIGNAL_FILE" ]; then
  rm -f "$SIGNAL_FILE"
  echo '{"decision":"allow"}'
  exit 0
fi

# Emit defer decision — Claude Code will poll until signal appears
echo "{\"decision\":\"defer\",\"waitForSignal\":\"$SIGNAL_FILE\"}"
exit 0
```

### New Effectum Command: `/defer-checkpoint`

A command that can be injected at any point in the Ralph Loop to insert a pause:

```markdown
---
name: defer-checkpoint
description: "Pause the Ralph Loop at a configurable checkpoint and wait for external resume signal."
usage: /defer-checkpoint [--timeout 300] [--signal /tmp/.effectum-resume]
---
```

**Behavior:**
1. Writes a checkpoint marker to `.effectum/checkpoints/<timestamp>.json`
2. Sets `EFFECTUM_DEFER_CHECKPOINTED=1` in the session environment
3. Outputs the resume command to the user: `touch /tmp/.effectum-resume`
4. Suspends further tool execution until signal file appears

### Integration with Ralph Loop (`effect:dev:run`)

In `.effectum/config.json`, users can configure checkpoint triggers:

```json
{
  "ralphLoop": {
    "checkpoints": [
      {
        "trigger": "after_n_commits",
        "n": 5,
        "action": "defer",
        "signal": "/tmp/.effectum-resume",
        "timeout": 600
      }
    ]
  }
}
```

When `effectum update` processes this config, it injects the appropriate `PreToolUse` hook with the defer pattern.

---

## Connection to Headless CI Mode (intake #012)

Defer is the **complement** to headless auto-approval:
- **Headless (#012):** auto-approves known-safe operations → removes blocking in CI
- **Defer (#014):** pauses at configurable checkpoints → adds human-in-the-loop control where needed

Together they enable a full spectrum: full-auto CI pipelines with opt-in human checkpoints.

---

## Acceptance Criteria

- [ ] `defer-guard.sh` template ships in `system/hooks/` and is documented in `docs/hooks.md`
- [ ] `/defer-checkpoint` command injects the defer hook and outputs resume instructions
- [ ] Ralph Loop config supports `checkpoints[].trigger = "after_n_commits"` with `action: "defer"`
- [ ] `effectum update` injects defer hook when checkpoint config is present
- [ ] Resume signal file mechanism documented in `docs/hooks.md` and `docs/workflow-overview.md`
- [ ] Timeout behavior documented: on timeout, hook returns `deny` (loop fails loudly)
- [ ] Checkpoint state written to `.effectum/checkpoints/` (inspectable by user)

---

## Non-Goals

- No UI for approving checkpoints in this version — file-based signal only
- No Telegram/Slack integration in this spec (future: `effect:notify` skill)
- No support for resuming a different tool than the deferred one

---

## Open Questions

1. **Signal polling interval** — how frequently does Claude Code poll the signal file? Needs verification from v2.1.89 source/docs.
2. **`waitForSignal` format** — does it accept env var names or only file paths?
3. **Checkpoint persistence** — should checkpoints survive a `claude --resume`? Likely yes, but needs testing.
