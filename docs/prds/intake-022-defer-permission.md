# Spec: Defer Permission Decision via PreToolUse Hook

**Intake:** #022  
**Signal:** Claude Code v2.1.89 — `PreToolUse` hooks can now return `"defer"` as a `permissionDecision`. This pauses the headless session, which can be resumed via `claude -p --resume <session-id>`.  
**Priority:** P1  
**Roadmap:** v0.17  
**Status:** Draft (2026-04-02)

---

## Problem

Headless and autonomous runs (`/ralph-loop`, CI pipelines) currently have two extremes for handling sensitive operations:

1. **Allow** — auto-approve everything matching a pattern (via `headless-approver.sh`). Fast, but risky for destructive commands.
2. **Deny** — block the operation entirely. Safe, but the loop fails and the session cannot continue from where it stopped.

Neither option supports a "pause and let a human review before continuing" workflow. When an autonomous run encounters a destructive command (`rm -rf`, `DROP TABLE`, `git push --force`), the only choices are to silently approve it or kill the session. There is no way to freeze the session, notify a human, wait for review, and resume exactly where it left off.

This is the missing middle path: **defer**.

---

## Solution: `defer` Permission Decision

Claude Code v2.1.89 adds `"defer"` as a valid `permissionDecision` return value from `PreToolUse` hooks. When a hook returns `defer`:

1. The headless session **pauses** (does not exit, does not fail).
2. The session ID is preserved and can be resumed with `claude -p --resume <session-id>`.
3. The human reviews the pending operation, then resumes the session — at which point Claude Code re-evaluates the tool call.

This enables human-in-the-loop checkpoints during autonomous runs without losing session state.

---

## Specification

### New Config Flag: `defer-on-destructive`

Add a `deferOnDestructive` flag to `.effectum/config.json` under the `autonomy` section:

```json
{
  "autonomy": {
    "level": "full",
    "headless": true,
    "deferOnDestructive": true
  }
}
```

When `deferOnDestructive: true`, `effectum:setup` and `effectum update` inject a `PreToolUse` hook that returns `"defer"` for destructive command patterns instead of `"deny"`.

### PreToolUse Hook: `defer-on-destructive`

Location: injected into `.claude/settings.json` under `hooks.PreToolUse`, alongside the existing `headless-approver` hook.

```json
{
  "matcher": "Bash",
  "if": "{{EFFECTUM_HEADLESS}}",
  "hooks": [
    {
      "type": "command",
      "command": "bash -c 'source .effectum/defer-destructive.sh'",
      "statusMessage": "Checking for destructive operations..."
    }
  ]
}
```

### Defer Script: `.effectum/defer-destructive.sh`

This script receives the tool input via stdin (JSON) and returns `defer` for destructive patterns:

```bash
#!/usr/bin/env bash
# .effectum/defer-destructive.sh
# Returns "defer" for destructive command patterns during headless runs.
# The session pauses until a human resumes it with: claude -p --resume <id>

input=$(cat)

cmd=$(echo "$input" | python3 -c \
  "import sys,json; d=json.load(sys.stdin); print(d.get('input',{}).get('command',''))" \
  2>/dev/null)

# Destructive patterns that require human review
if echo "$cmd" | grep -qEi \
  "(rm\s+(-rf|--force)|DROP\s+(TABLE|DATABASE|SCHEMA)|TRUNCATE|DELETE\s+FROM|git\s+push\s+--force|git\s+reset\s+--hard|--dangerously)"; then
  echo '{"permissionDecision":"defer","message":"Destructive operation detected. Session paused for human review. Resume with: claude -p --resume <session-id>"}'
  exit 0
fi

# Non-destructive — pass through (no decision, let other hooks handle)
exit 0
```

### Integration with Existing Scripts

**`headless-approver.sh`** — No changes needed. The defer script runs as a separate `PreToolUse` hook with a `Bash` matcher. It evaluates before the general headless-approver. Hook ordering:

1. `defer-destructive.sh` — catches destructive patterns, returns `defer`
2. `headless-approver.sh` — auto-approves known-safe patterns, denies the rest

**`permission-denied-handler.sh`** — When `deferOnDestructive` is enabled, destructive operations no longer hit the deny path. The permission-denied handler still catches any remaining denials from the headless-approver whitelist.

### Resume Flow

When a session is deferred:

```
[Ralph Loop running autonomously]
  ↓
[Destructive command detected: rm -rf dist/]
  ↓
[Hook returns "defer" → session pauses]
  ↓
[Notification sent (desktop/Slack/webhook — via existing notification hooks)]
  ↓
[Human reviews: "claude -p --resume abc123"]
  ↓
[Session resumes, Claude re-evaluates the tool call]
```

### Environment Variables

| Variable                     | Purpose                                                                    |
| ---------------------------- | -------------------------------------------------------------------------- |
| `EFFECTUM_HEADLESS`          | Enables headless mode (existing)                                           |
| `EFFECTUM_DEFER_DESTRUCTIVE` | Enables defer-on-destructive (optional override, defaults to config value) |

---

## Acceptance Criteria

- [ ] `effectum:setup` accepts `--defer-on-destructive` flag; sets `autonomy.deferOnDestructive: true` in config
- [ ] `effectum update` injects `defer-destructive` PreToolUse hook when `deferOnDestructive: true`
- [ ] `defer-destructive.sh` returns `{"permissionDecision":"defer"}` for: `rm -rf`, `DROP TABLE`, `DELETE FROM`, `TRUNCATE`, `git push --force`, `git reset --hard`
- [ ] Non-destructive commands pass through to `headless-approver.sh` without interference
- [ ] Deferred sessions can be resumed with `claude -p --resume <session-id>` and continue from the exact point of deferral
- [ ] Defer message includes the session ID and resume command in the output
- [ ] Hook is NOT injected when `deferOnDestructive: false` (default) — zero impact on existing setups
- [ ] `EFFECTUM_DEFER_DESTRUCTIVE` env var overrides config for one-shot CI runs
- [ ] Works correctly alongside `headless-approver.sh` (no hook conflicts)
- [ ] Template documented in `docs/command-schema.md` and `docs/hooks.md`

---

## Non-Goals

- No custom defer patterns in this version — only the built-in destructive pattern list. Custom patterns are a follow-up.
- No automatic resume (e.g., after timeout). Defer always requires explicit human action.
- No Slack/webhook integration for defer notifications in this spec — use existing notification hooks.
- No changes to the `--dangerously-skip-permissions` flag. Defer is orthogonal to that escape hatch.

---

## Implementation Notes

- `permissionDecision: "defer"` requires Claude Code ≥ v2.1.89
- `--resume <session-id>` requires Claude Code ≥ v2.1.89
- The defer script should be committed to the repo so CI environments have consistent behavior
- Hook ordering matters: the `defer-destructive` hook must run before `headless-approver` to catch destructive patterns before they hit the allow/deny logic
- Add `EFFECTUM_DEFER_DESTRUCTIVE` to `.env.effectum.example` with comment

---

## Open Questions

1. **Hook ordering guarantees** — Does Claude Code execute `PreToolUse` hooks in the order they appear in `settings.json`? If not, how do we ensure `defer-destructive` runs before `headless-approver`?
2. **Session ID availability** — Can the hook script access the current session ID to include it in the defer message, or must the user find it from the Claude Code output?
3. **Extend to Write/Edit?** — Should destructive file operations (overwriting `.env`, deleting migrations) also trigger defer? Current spec only covers Bash commands.
4. **Custom pattern list** — v0.18 follow-up: let users define their own defer patterns in `.effectum/config.json`.
