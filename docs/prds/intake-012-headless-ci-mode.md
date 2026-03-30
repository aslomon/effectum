# Spec: Headless CI Mode via PreToolUse Hook

**Intake:** #012  
**Signal:** Claude Code v2.1.85 — `PreToolUse` hook can answer `AskUserQuestion` headless via `updatedInput` + `permissionDecision: "allow"`  
**Priority:** P1  
**Roadmap:** v0.19  
**Status:** Draft (2026-03-30)

---

## Problem

`/ralph-loop` (`effect:dev:run`) is interrupted whenever Claude Code displays an `AskUserQuestion` prompt — typically for tool approvals or permission checks. In CI environments and overnight autonomous runs, these interruptions either:

1. Block the loop indefinitely (nobody watching)
2. Require `--dangerously-skip-permissions` (unsafe, disables all permission checks)

There is no clean middle path: allow specific, known-safe approvals automatically while keeping other safety checks active.

## Solution: PreToolUse Headless Pattern

Claude Code v2.1.85 introduced the ability for `PreToolUse` hooks to intercept `AskUserQuestion` events and respond with:

```json
{
  "updatedInput": { ... },
  "permissionDecision": "allow"
}
```

This enables a **targeted approval list**: a hook that auto-approves a defined set of tools/patterns during Ralph Loop runs, without bypassing all permissions.

---

## Specification

### New Feature: `headless` Autonomy Mode

Add a `headless` flag to `.effectum/config.json` (or inline in `.effectum.json`):

```json
{
  "autonomy": {
    "level": "full",
    "headless": true
  }
}
```

When `headless: true`, `effectum:setup` and `effectum update` inject a `PreToolUse` hook into `settings.json` that handles `AskUserQuestion` auto-approval.

### PreToolUse Hook: `headless-approver`

Location: injected into `.claude/settings.json` under `hooks.PreToolUse`

```json
{
  "matcher": "AskUserQuestion",
  "if": "{{EFFECTUM_HEADLESS}}",
  "hooks": [
    {
      "type": "command",
      "command": "bash -c 'source .effectum/headless-approver.sh'",
      "statusMessage": "Headless: auto-approving known-safe tool..."
    }
  ]
}
```

### Approval Script: `.effectum/headless-approver.sh`

This script receives the tool input via stdin (JSON) and outputs the approval decision:

```bash
#!/usr/bin/env bash
# .effectum/headless-approver.sh
# Auto-approves known-safe tool patterns during headless/CI runs.
# Called by PreToolUse hook when EFFECTUM_HEADLESS=1.

input=$(cat)

# Always allow read operations
if echo "$input" | grep -qE '"tool":\s*"(Read|Glob|Grep|Bash)"'; then
  echo '{"permissionDecision":"allow"}'
  exit 0
fi

# Allow bash commands matching safe patterns (build, test, lint)
cmd=$(echo "$input" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('input',{}).get('command',''))" 2>/dev/null)
if echo "$cmd" | grep -qE "^(npm (test|run|install|build)|npx|jest|vitest|tsc|eslint|prettier|git (status|diff|log|add|commit))"; then
  echo '{"permissionDecision":"allow"}'
  exit 0
fi

# Deny everything else (loop will pause or fail gracefully)
echo '{"permissionDecision":"deny","message":"Headless mode: non-whitelisted tool blocked. Add to headless-approver.sh to allow."}'
exit 0
```

### Environment Variable: `EFFECTUM_HEADLESS`

The hook's `if` condition checks `EFFECTUM_HEADLESS`. Users set this when running in CI:

```bash
EFFECTUM_HEADLESS=1 claude --print /ralph-loop
```

Or permanently via `.effectum/config.json` `headless: true`, which causes `effectum update` to set `EFFECTUM_HEADLESS=1` in the project's `.env.effectum` file (gitignored by default).

---

## Acceptance Criteria

- [ ] `effectum:setup` accepts `--headless` flag; sets `autonomy.headless: true` in config
- [ ] `effectum update` injects `headless-approver` PreToolUse hook when `headless: true`
- [ ] `headless-approver.sh` auto-approves: Read, Glob, Grep, Bash (safe patterns)
- [ ] `headless-approver.sh` denies: Write, Edit to paths outside project root
- [ ] Ralph Loop runs to completion in headless mode without manual approvals for standard build/test commands
- [ ] Non-whitelisted tools produce a clear denial message (loop fails loudly, not silently)
- [ ] Hook is NOT injected when `headless: false` (default) — zero impact on interactive use
- [ ] `EFFECTUM_HEADLESS` env var overrides config for one-shot CI runs
- [ ] Template documented in `docs/command-schema.md` and `docs/hooks.md`

---

## Non-Goals

- This is not a replacement for `--dangerously-skip-permissions`. Headless mode still enforces denials on unrecognized patterns.
- No UI for managing the approval whitelist in this version — direct `.sh` edits only.
- No support for `AskUserQuestion` responses that require actual user input (e.g., "enter your API key") — those still block.

---

## Implementation Notes

- `PreToolUse` hook with `if` conditional requires Claude Code ≥ v2.1.85
- The `if` field in hooks accepts environment variable expressions: `"if": "$EFFECTUM_HEADLESS"` or `"if": "{{EFFECTUM_HEADLESS}}"` — verify exact syntax against v2.1.85 changelog
- `headless-approver.sh` should be committed to the repo so CI can use it predictably
- Add `EFFECTUM_HEADLESS` to `.env.effectum.example` with comment

---

## Open Questions

1. **Exact `if` syntax for env vars in hooks** — needs verification against Claude Code source/docs. v2.1.85 changelog is ambiguous.
2. **Scope of whitelist** — should the whitelist be configurable per-project, or is a static default sufficient for v0.19?
3. **Write permissions** — should headless mode allow writes to project files? Current spec denies non-whitelisted writes; full-auto users may want to allow all writes within project root.
