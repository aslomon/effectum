# PRD: Effectum v0.18 — Autonomy Modes + Loop Worker Integration
> Status: Draft | Author: Lumi (Heartbeat) | Created: 2026-03-29

---

## Problem

Effectum currently has a single implicit autonomy level. Users running in Claude Code Auto Mode or overnight `/loop` builds need explicit control over how aggressively Effectum operates — but there's no way to express that.

Three specific gaps:

1. **No autonomy mode selection** — `/effectum` entry point doesn't surface the `autonomyLevel` from `.effectum.json` or let users switch modes mid-session
2. **`/next` is blind to autonomy context** — the smart router recommends the same actions regardless of whether the user wants conservative or full-auto behavior
3. **`loop-worker` preset exists but isn't wired into `/setup`** — users can't configure a project for `/loop` background execution through the normal setup flow

---

## Proposed Solution

### 1. Autonomy Mode Display in `/effectum`

Extend the getting-started card to show current autonomy mode and offer a switch:

```
╭─────────────────────────────────────────────╮
│  EFFECTUM — Autonomous Development Workflow │
│  Mode: STANDARD  [conservative|full-auto]   │
╰─────────────────────────────────────────────╯
```

When the user types `/effectum conservative` or `/effectum full-auto`, update `.effectum.json` with the new `autonomyLevel` and acknowledge.

**Autonomy levels:**

| Level | autonomyLevel | Behavior |
|-------|--------------|----------|
| Conservative | `conservative` | Always ask before risky actions; never auto-commit; prompt on quality gate failures |
| Standard | `standard` | Auto-commit on clean verify; ask before force-push; prompt on critical failures |
| Full Auto | `auto` | Fully autonomous; auto-commit, auto-push on passing tests; designed for `/loop` |

### 2. `/next` Autonomy-Aware Recommendations

Extend the router's Step 1 check list to consider autonomy context:

**After existing checks, add:**

11. **`autonomyLevel` is `"auto"`** AND `.effectum/loop-state.json` is missing → Recommend `/context:init` first (loop needs project context to operate safely)
12. **`autonomyLevel` is `"conservative"`** AND uncommitted changes exist → Recommend `/verify` before anything else (never assume safe to skip)
13. **`loop-worker` preset detected** in `.effectum.json` AND no tasks.md → Recommend creating `tasks.md` (loop-worker preset requires task file)

Output format extension (append to existing output):
```
Mode: STANDARD  ·  Switch: /effectum conservative | /effectum full-auto
```

### 3. `/setup` Loop Worker Preset Option

Extend the `/setup` command's stack/preset selection step to include:

```
? Which preset fits your project?
  › Next.js + Supabase
    Next.js + Firebase
    Next.js + Prisma
    Django + Postgres
    ...
    ──────────────────
    Background Worker (/loop)  ← NEW
```

When selected:
- Applies `system/presets/loop-worker.json`
- Injects `system/blocks/loop-worker.md` into CLAUDE.md
- Sets `autonomyLevel: "auto"` in `.effectum.json`
- Adds `tasks.md` stub if not present

---

## Acceptance Criteria

- [ ] `/effectum` shows current `autonomyLevel` from `.effectum.json`
- [ ] `/effectum conservative`, `/effectum standard`, `/effectum full-auto` switch modes and update `.effectum.json`
- [ ] `/next` includes autonomy context in its output line
- [ ] `/next` routes to `/context:init` when `autonomyLevel=auto` but no loop context exists
- [ ] `/setup` presents `loop-worker` as a preset option in the stack selection step
- [ ] Selecting loop-worker in `/setup` injects the loop-worker block into CLAUDE.md
- [ ] Selecting loop-worker in `/setup` sets `autonomyLevel: auto` in `.effectum.json`
- [ ] All existing tests pass (454+)
- [ ] New tests for autonomy mode switching (min 5)

---

## Out of Scope

- Persisting autonomy mode changes across sessions (already handled via `.effectum.json`)
- UI/TUI for mode switching (CLI-first)
- Auto-detection of Auto Mode from Claude Code (no stable API for this)
- Changes to `permissions.defaultMode` in settings.json (separate decision, see auto-mode-compat spec)

---

## Data Model

No new tables or schemas. Changes to `.effectum.json`:

```json
{
  "autonomyLevel": "conservative" | "standard" | "auto",
  "preset": "loop-worker" | "nextjs-supabase" | ...
}
```

`preset` field is new — currently only `stack` is stored. Preset ID allows `/setup` to re-apply the full preset on update.

---

## Implementation Notes

- `/effectum` and `/next` are pure-output commands (no file writes needed for display)
- Mode switching requires writing `.effectum.json` — needs `Bash` tool (write via `jq` or node inline)
- `/setup` changes are additive — new branch in the existing stack-selection flow
- loop-worker block injection reuses existing `bin/update.js` template machinery

---

## Effort Estimate

| Component | Effort | Owner |
|-----------|--------|-------|
| `/effectum` mode display + switching | Small (1h) | Lumi |
| `/next` autonomy-aware extensions | Small (1h) | Lumi |
| `/setup` loop-worker preset option | Medium (2h) | Lumi |
| Tests (5+ new) | Small (1h) | Lumi |
| **Total** | **~5h** | |

---

## Dependencies

- PR #6 (loop-worker preset files) must be merged first
- PR #7 (stop hook fix) should be merged for clean dogfood environment

---

_v0.18 target. Ready for implementation after PR #6 + #7 merge._
