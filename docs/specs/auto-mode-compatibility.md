# Spec: Auto Mode Compatibility (Claude Code)
> Effectum v0.16 candidate | Signal #007 | Created: 2026-03-28

---

## Background

Claude Code introduced **Auto Mode** in March 2026: an AI-powered safety classifier that replaces manual permission prompts. Instead of Claude pausing to ask "allow this bash command?", the classifier automatically approves or denies based on risk assessment.

This changes the interaction model that several Effectum components currently assume.

---

## Current State (v0.15)

### settings.json.tmpl — Permission Config
```json
"permissions": {
  "allow": ["Bash(*)", "Read(*)", "Write(*)", ...],
  "deny": [...destructive patterns...],
  "defaultMode": "default"
}
```

**Problem:** `defaultMode: "default"` is the pre-Auto-Mode setting. In Auto Mode, this might be overridden or interact unexpectedly with the new classifier.

### Stop Hooks — Type `"prompt"`
The `settings.json.tmpl` Stop hooks include two `"type": "prompt"` hooks:
```json
{"type": "prompt", "prompt": "Evaluate if Claude should stop..."},
{"type": "prompt", "prompt": "Check if tests were written..."}
```

**Known issue (documented in MEMORY.md):** Stop hooks of type `"prompt"` can drive Claude Code sessions into loops. One instance of this was fixed in Tangent (commit c62867d) by replacing with `exit 0`.

In Auto Mode, `"prompt"` hooks interact with the safety classifier — behavior is undefined. The classifier may auto-approve or auto-deny hook continuation, causing unpredictable loop or silent-stop behavior.

### bypassPermissions Workflows
Effectum's standard invocation (from TOOLS.md):
```
claude --permission-mode bypassPermissions --print
```
`bypassPermissions` bypasses the classifier entirely. This is fine for intentional headless runs, but Effectum-generated CLAUDE.md instructs Claude to "Act autonomously" — users may be confused about which mode applies when.

---

## Risk Assessment

| Component | Risk | Severity |
|-----------|------|----------|
| `defaultMode: "default"` in settings.json.tmpl | Auto Mode may override; unclear interaction | Medium |
| Stop hooks `"type": "prompt"` | Loop risk in Auto Mode (already a known footgun) | High |
| `bypassPermissions` CLI flag | Works correctly, no change needed | None |
| CLAUDE.md "Act autonomously" instruction | Fine — reinforces intended behavior | None |
| Sentinel block (CLAUDE.md) | Passive config block, Auto Mode doesn't touch it | None |

---

## Proposed Changes

### 1. Replace Stop hook `"type": "prompt"` → `exit 0` in settings.json.tmpl (HIGH)

The existing `"prompt"` Stop hooks are already a known footgun (Tangent bug c62867d). Auto Mode makes this worse. Replace the two `"prompt"` Stop hooks with safe `"type": "command"` + `"command": "exit 0"` stubs, or remove them entirely.

**Before:**
```json
{
  "type": "prompt",
  "prompt": "Evaluate if Claude should stop...",
  "timeout": 30
}
```

**After (option A — remove):** Delete these two prompt-type Stop hooks entirely.

**After (option B — downgrade to command):**
```json
{
  "type": "command",
  "command": "exit 0",
  "statusMessage": "Completion check passed"
}
```

Recommendation: **Option A** — the stop-quality-check logic is already covered by the `SubagentStop` and `TaskCompleted` hooks. The top-level `Stop` prompt hooks are redundant and dangerous.

### 2. Add `autoMode` field to settings.json.tmpl (MEDIUM)

When Claude Code detects Auto Mode is active, document how Effectum-generated settings interact:

```json
"permissions": {
  "allow": [...],
  "deny": [...],
  "defaultMode": "auto"  // ← change from "default" to "auto" 
}
```

This opts generated projects into Auto Mode by default — removing the manual-approval bottleneck that Effectum workflows already try to minimize via `bypassPermissions`.

**Trade-off:** Some users may want manual review. Consider exposing this in the configurator as an autonomy level:
- `strict` → `defaultMode: "default"` (manual approvals)
- `standard` → `defaultMode: "auto"` (classifier-based)  
- `bypass` → CLI flag `--permission-mode bypassPermissions` (headless/CI)

### 3. Document in `/setup` and README (LOW)

Add a note explaining the three autonomy levels and when to use each. Users coming from pre-Auto-Mode Claude Code may not know this option exists.

---

## Acceptance Criteria

- [ ] `settings.json.tmpl` Stop hooks: no `"type": "prompt"` entries (replaced or removed)
- [ ] `defaultMode` in `settings.json.tmpl` updated to reflect Auto Mode awareness
- [ ] Configurator (if prompt-type exists for autonomy level) offers `strict/standard/bypass`
- [ ] `/setup` docs mention Auto Mode + permission levels
- [ ] Existing presets tested: generated `settings.json` does not cause loops in a fresh project

---

## Open Questions for Jason

1. **Default autonomy level:** Should new Effectum projects default to `auto` (classifier) or `default` (manual)? Recommendation: `auto` — aligns with Effectum's "trust the workflow" philosophy.

2. **Configurator prompt:** Worth adding an "autonomy level" question to `/setup`? Or hide it as an advanced option?

3. **Remove or stub Stop prompt-hooks?** Option A (remove) is cleaner but loses the "did Claude really finish?" safety net. The `SubagentStop` + `TaskCompleted` hooks cover agent teams. Solo sessions would lose this check.

---

## Roadmap Slot

**v0.16** — can be bundled with Conditional Hooks (`if` field, #001) and Multi-glob (#003). All three are settings/template changes, low implementation risk.

Estimated effort: **0.5 days** (mostly template edits + docs update).

---

*Spec by Lumi (Heartbeat 06:00, 2026-03-28) | Intake Signal #007*
