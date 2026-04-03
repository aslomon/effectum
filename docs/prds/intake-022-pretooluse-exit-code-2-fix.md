# Spec: PreToolUse JSON-Exit-Code-2 Blocking Fix (Intake #022)

**Intake:** #022  
**Signal:** Claude Code v2.1.90 — `PreToolUse` hooks emitting JSON on stdout + `exit 2` now correctly block tool calls  
**Source:** Claude Code Changelog v2.1.90  
**Decision:** `implement-now` (P1)  
**Roadmap:** v0.17  
**Status:** ✅ Implemented (docs update + hook pattern clarification)

---

## Background

Before v2.1.90, `PreToolUse` hooks that emitted JSON on stdout and returned exit code `2` did not reliably block the tool call. This was a Claude Code bug.

Claude Code supports two distinct blocking mechanisms in `PreToolUse` hooks:

| Mechanism | How | Exit Code | Version |
|-----------|-----|-----------|---------|
| Hard block (stderr) | Write reason to `stderr` | `2` | All versions |
| Permission decision (JSON) | `{"permissionDecision": "deny"}` to stdout | `0` | All versions |
| JSON + hard block | JSON to stdout + `exit 2` | `2` | v2.1.90+ only |

The third pattern (JSON stdout + exit 2) was broken before v2.1.90.

---

## What Changed in Effectum

### 1. `docs/hooks.md` — Blocking a tool call section

Added:
- v2.1.90 requirement note for JSON-emitting blocking hooks
- Example of JSON-blocking pattern (v2.1.90+)
- Example of stderr-only pattern (all versions, safer)

### 2. Existing hook templates unaffected

Effectum's current hook templates use **stderr-only blocking** (no JSON on stdout with exit 2) or **permissionDecision JSON with exit 0** (headless-approver). Neither pattern was affected by the bug.

The secret-detection hook in `docs/prds/cli-tools-hooks-agents.md` uses `exit 2` with `stderr` — this was always safe.

---

## Impact Assessment

- **Existing Effectum users:** No breaking changes. All current hook patterns work on v2.1.88+.
- **New hook development:** Developers can now safely use JSON stdout + exit 2 if on v2.1.90+.
- **Headless CI mode:** Uses `permissionDecision` + `exit 0` — unaffected.

---

## Files Changed

- `docs/hooks.md` — Blocking section updated with v2.1.90 note + dual pattern examples
- `docs/prds/intake-022-pretooluse-exit-code-2-fix.md` — This file

---

## Testing

1. Upgrade Claude Code to v2.1.90+
2. Create a `PreToolUse` hook that emits JSON to stdout and exits with `2`
3. Trigger the hooked tool — confirm the tool call is blocked with the JSON reason
4. Verify the stderr-only pattern still works on older versions
