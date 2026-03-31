# v0.19 Release Notes — Draft

_Erstellt: 2026-04-01 von Lumi | Status: Draft — wartet auf Jason-Review + PR-Merges_

---

## Pending PRs für v0.19

| PR | Branch | Inhalt | Tests | Status |
|----|--------|--------|-------|--------|
| #9 | feat/frontmatter-schema | Command Schema Spec + 146 Tests | +146 (684 gesamt) | ⏳ Jason-Review |
| #10 | feat/headless-ci-mode | Headless CI Mode (--headless flag) | +15 (556+ Tests) | ⏳ Jason-Review |
| #11 | feat/intake-017-018-hooks | Permission-Denied + Compound-Cmd Guard Hooks | +272 Tests | ⏳ Jason-Review |
| #12 | feat/intake-019-absolute-file-path | Absolute file_path Fix + docs/hooks.md | +15 Tests | ⏳ Jason-Review |

**Gesamte Tests nach v0.19:** ~684 (aus PR #9-Zählung als Basis)

---

## [0.19.0] — 2026-04-XX

### Added

- **Headless CI Mode (`--headless` flag)** (Intake #012, PR #10)  
  Install Effectum in CI/CD environments without interactive prompts.  
  `effectum install --headless` writes all config files non-interactively using project defaults.  
  New `headless-approver.sh` hook: auto-approves safe tools (Read, Bash, etc.), blocks Write/Edit outside project root.  
  New `bin/lib/headless.js` module for headless detection and non-interactive config generation.

- **Permission-Denied Handler Hook** (Intake #017, PR #11)  
  `permission-denied-handler.sh` — PostToolUse hook that catches `PermissionError` outputs and logs structured diagnostics to `.effectum/permission-denied.log`. Prevents silent failures when Claude Code lacks file permissions.

- **Compound-Command Guard Hook** (Intake #018, PR #11)  
  `compound-cmd-guard.sh` — PreToolUse hook that intercepts Bash tool calls containing `&&`, `||`, `;`, or `|`. Validates that compound commands don't exceed 3 chained operations. Reduces runaway shell chains in agentic contexts.

- **Command Schema Spec** (PR #9)  
  New `docs/command-schema.md` — formal specification for `.md` command frontmatter: required fields (`name`, `description`, `allowed-tools`), optional fields (`effort`, `tags`, `aliases`), and field format rules.  
  +146 tests covering schema validation across all command files.

### Fixed

- **Headless Approver: Absolute `file_path`** (Intake #019, PR #12)  
  Claude Code sends `file_path` in hook input as an **absolute path** since v2.1.88.  
  `headless-approver.sh` now uses `realpath`-based comparison against `$project_root` (via `git rev-parse --show-toplevel`).  
  `Write`/`Edit` within project root → allowed. Outside root → denied with clear error message.  
  Fallback to `$PWD` when not in a git repository.

- **`docs/hooks.md` Absolute Path Note** (Intake #019, PR #12)  
  Added warning near `file_path` extraction examples: `file_path` is always absolute in CC ≥ v2.1.88. Includes `RELPATH=${FILE#"$PWD/"}` extraction pattern for relative-path matching.

### Changed

- **Hook Template Updates** — Any hook template using relative `file_path` patterns (`src/*`) updated to use `realpath`-safe comparison.

---

## CHANGELOG Action Items (vor Release)

1. Aktuellen `[Unreleased]` Block prüfen — enthält noch v0.17/v0.18 Content der eigentlich released ist. Bereinigen!
2. Neuen `## [0.19.0] - YYYY-MM-DD` Block einfügen (Datum erst beim Release-Tag)
3. PRs #9, #10, #11, #12 mergen → dann `npm version minor && npm publish`
4. GitHub Release Tag: `v0.19.0` mit diesen Release Notes

---

## Abhängigkeiten & Reihenfolge

```
PR #6 (loop-worker preset)     → bereits offen, P0
PR #10 (headless CI mode)      → kann unabhängig gemergt werden
PR #11 (hooks #017+#018)       → kann unabhängig gemergt werden  
PR #12 (absolute file_path)    → depends on PR #10 (headless-approver.sh changes)
PR #9 (frontmatter schema)     → unabhängig
```

Empfohlene Merge-Reihenfolge: #6 → #9 → #10 → #11 → #12 → release v0.19.0

---

_Nächste Aktion: Jason reviewed diese Notizen + die PRs, dann merge + npm publish._
