# Spec: PermissionDenied Hook with Retry Support

**Intake:** #015
**Signal:** Claude Code v2.1.89 — `PermissionDenied` hook event fires when a tool is blocked; supports `{retry: true}` to attempt recovery before failing
**Priority:** P1
**Roadmap:** v0.17
**Status:** Draft (2026-04-01)

---

## Problem

When a `PreToolUse` hook denies a tool call, the Claude session currently has limited recovery options. The LLM must either:
- Accept the denial and attempt an alternative approach (unpredictable)
- Fail the current plan (aborts Ralph Loop)
- Re-attempt the same tool (same denial, infinite loop risk)

In practice, many permission denials are **recoverable** with minimal intervention:
- A file is locked → unlock it, retry
- A git operation fails because the branch is dirty → stash changes, retry
- An npm install is blocked because `node_modules` exists → clean first, retry
- A write to a protected path is denied → write to a temp path instead, then move

The v2.1.89 `PermissionDenied` hook + `{retry: true}` enables Effectum to implement **graceful recovery handlers** that automatically resolve common denial cases without human intervention.

---

## Solution: PermissionDenied Recovery Templates

Effectum ships a set of `PermissionDenied` hook scripts that handle common denial patterns and signal Claude Code to retry when recovery succeeds.

### How It Works (v2.1.89)

When a `PreToolUse` hook returns `deny`, Claude Code fires a `PermissionDenied` hook. If that hook returns `{retry: true}`, Claude Code re-runs the original `PreToolUse` hook with the same input. If it returns `{retry: false}` (or exits non-zero), the tool call is permanently blocked.

```json
// PermissionDenied hook output — retry on recovery
{"retry": true, "reason": "Stashed dirty changes, safe to retry git operation"}

// PermissionDenied hook output — permanent block
{"retry": false, "reason": "Protected path write blocked permanently"}
```

---

## Specification

### New Hook Template: `.effectum/hooks/permission-denied-handler.sh`

```bash
#!/usr/bin/env bash
# .effectum/hooks/permission-denied-handler.sh
# Handles PermissionDenied events with automatic recovery for known patterns.
# Returns {retry: true} when recovery succeeds, {retry: false} otherwise.

input=$(cat)

tool=$(echo "$input" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('tool',''))" 2>/dev/null)
reason=$(echo "$input" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('denyReason',''))" 2>/dev/null)

# --- Recovery: Git operations blocked by dirty working tree ---
if [ "$tool" = "Bash" ] && echo "$reason" | grep -qiE "dirty|unstaged|uncommitted"; then
  if git stash --include-untracked 2>/dev/null; then
    echo '{"retry":true,"reason":"Stashed dirty working tree. Retrying git operation."}'
    exit 0
  fi
fi

# --- Recovery: npm install blocked by existing node_modules ---
if [ "$tool" = "Bash" ] && echo "$reason" | grep -qiE "node_modules|EEXIST"; then
  if rm -rf node_modules 2>/dev/null; then
    echo '{"retry":true,"reason":"Removed node_modules. Retrying npm install."}'
    exit 0
  fi
fi

# --- Recovery: File locked (EBUSY/EACCES) ---
if echo "$reason" | grep -qiE "EBUSY|EACCES|locked|permission denied"; then
  sleep 2
  echo '{"retry":true,"reason":"Waited 2s for file lock release. Retrying."}'
  exit 0
fi

# --- No recovery possible ---
echo '{"retry":false,"reason":"PermissionDenied: no automatic recovery available for this pattern."}'
exit 0
```

### Ralph Loop Resilience Integration

The Ralph Loop (`effect:dev:run`) should document the `PermissionDenied` hook as a **standard resilience layer**:

```markdown
## Ralph Loop Resilience Layers (docs/workflow-overview.md addition)

1. **PreToolUse guards** (deny known-dangerous patterns)
2. **PermissionDenied recovery** (auto-retry recoverable failures)
3. **PostToolUseFailure logging** (audit trail for failures that slip through)
4. **Headless CI override** (intake #012 — bypass interactive prompts in CI)
```

### Template Registration in `effectum:setup`

When running `effectum:setup --hooks full`, the `permission-denied-handler.sh` is injected alongside other standard hooks:

```json
{
  "hooks": {
    "PermissionDenied": [
      {
        "hooks": [".effectum/hooks/permission-denied-handler.sh"]
      }
    ]
  }
}
```

---

## Acceptance Criteria

- [ ] `permission-denied-handler.sh` ships in `system/hooks/` with git-stash, node_modules, file-lock recovery
- [ ] `docs/hooks.md` updated with `PermissionDenied` event documentation and `retry` output format
- [ ] `docs/workflow-overview.md` updated with Ralph Loop Resilience Layers section
- [ ] `effectum:setup --hooks full` injects the handler automatically
- [ ] Handler is idempotent — multiple retries on the same denial don't infinite-loop (max retry counter)
- [ ] Recovery actions are logged to `.effectum/logs/recovery.jsonl` for post-run inspection

---

## Non-Goals

- Not a replacement for the allowlist in intake #012 — these are complementary
- No AI-based recovery logic in this version — pattern matching only
- No Slack/Telegram notifications on retry (future: `effect:notify`)
- Max 3 auto-retries per tool call — beyond that, permanent deny (hard-coded for safety)

---

## Connection to Existing Hooks (intake-017)

`intake-017` (compound-cmd-guard) already ships a `permission-denied-handler.sh`. This spec supersedes it with a more comprehensive handler. On v0.17 release, the two should be merged.
