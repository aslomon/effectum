# Intake #019 — Absolute `file_path` in PreToolUse/PostToolUse

**Status:** Draft  
**Priority:** P2 — Breaking behaviour, not critical blocker  
**Target version:** v0.19 or v0.20  
**Source:** CC v2.1.88 observation — `file_path` in hook input is always absolute  
**Related:** Intake #012 (headless-ci-mode), headless-approver.sh

---

## Problem

Claude Code sends `file_path` in `PreToolUse`/`PostToolUse` hook input as an **absolute path** (e.g. `/Users/lumi/repos/myproject/src/index.ts`).

Any hook that matches against a relative path (e.g. `src/`, `scripts/`, `./`) will **never match** and will silently fail to block or trigger.

### Affected hooks

1. **headless-approver.sh** (Intake #012)  
   - Line: `denies: Write, Edit to paths outside project root`  
   - Currently does NOT check `file_path` at all — the `Write`/`Edit` case falls through to deny everything.  
   - A path-aware approver would need `realpath`-based comparison against `$PWD`.

2. **Any user-written hook** that uses relative path matching on `file_path`, e.g.:
   ```bash
   FILE=$(jq -r '.tool_input.file_path' <<< "$(cat)")
   if [[ "$FILE" == src/* ]]; then  # ← NEVER matches
   ```

3. **docs/hooks.md** example on line ~408:
   ```bash
   FILE=$(jq -r ".tool_input.file_path // empty" <<< "$(cat)")
   ```
   Docs don't mention the absolute-path behaviour → user confusion.

---

## Requirements

### R1 — Headless approver: path-safe Write/Edit
Allow `Write`/`Edit` when `file_path` is within the project root. Block when outside.

```bash
if [ "$tool" = "Write" ] || [ "$tool" = "Edit" ]; then
  file_path=$(echo "$input" | jq -r '.tool_input.file_path // empty' 2>/dev/null)
  project_root=$(git rev-parse --show-toplevel 2>/dev/null || echo "$PWD")
  # Normalize both to realpath
  abs_file=$(realpath -m "$file_path" 2>/dev/null || echo "$file_path")
  if [[ "$abs_file" == "$project_root"/* ]]; then
    echo '{"permissionDecision":"allow"}'
    exit 0
  else
    echo '{"permissionDecision":"deny","message":"Headless mode: Write/Edit outside project root blocked."}'
    exit 0
  fi
fi
```

### R2 — docs/hooks.md: note absolute path behaviour
Add a note near the `file_path` extraction example:

> ⚠️ `file_path` is always an absolute path in Claude Code ≥ v2.1.88.  
> To match relative paths, strip the project root: `RELPATH=${FILE#"$PWD/"}`.

### R3 — Template hooks: use absolute-safe pattern
Any hook template in `system/hooks/` that uses `file_path` matching must use `realpath` comparison or strip `$PWD` prefix, not literal `src/*` patterns.

---

## Acceptance Criteria

- [ ] `headless-approver.sh` allows `Write`/`Edit` within `$project_root` and denies outside
- [ ] `docs/hooks.md` has a note about absolute `file_path` with example of `RELPATH` extraction
- [ ] Any template hooks using relative `file_path` patterns are updated
- [ ] Existing tests for headless-approver still pass (556+)
- [ ] New tests cover: Write inside root → allow, Write outside root → deny

---

## Out of scope

- Changing how CC sends `file_path` (can't control)
- Hooks that don't use `file_path` at all

---

## Notes

- `realpath -m` (no error if file doesn't exist yet) is the safest approach on macOS + Linux
- Fallback: `echo "$PWD"` when `git rev-parse` fails (non-git directory edge case)
- This does NOT require a new minor version — could ship as a patch in next release alongside other hook fixes
