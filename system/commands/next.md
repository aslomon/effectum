---
name: "effect:next"
description: "Reads your project state and recommends the single best next action."
allowed-tools: ["Read", "Bash"]
effort: "low"
---

> ⚠️ **`/next` is deprecated → use `/effect:next`** (removed in v0.20)


# effect:next — Smart Next-Action Router

You check the current project state and recommend exactly ONE next action. Never list multiple options.

## Step 1: Check Project State

Check these paths **in order**. Stop at the FIRST match:

1. **STUCK.md exists** in project root → Recommend `effect:dev:diagnose`
2. **HANDOFF.md exists** AND `.effectum/loop-state.json` exists with `status` != `"complete"` → Recommend `effect:dev:run` resume
3. **FORENSICS-\*.md exists** in project root → Recommend `effect:dev:run` retry
4. **No CLAUDE.md** in project root, OR CLAUDE.md has no `<!-- effectum:project-context:start -->` sentinel → Recommend `effectum:init`
5. **No `docs/prds/` directory** AND no `workshop/projects/*/prds/` with PRD files → Recommend `effect:prd:new`
6. **PRD exists** but no plan (no `PLAN.md` or plan section in the PRD) → Recommend `effect:dev:plan`
7. **Plan exists** but no implementation (no source files changed since plan) → Recommend `effect:dev:run`
8. **Uncommitted changes** (`git status` shows modifications) → Recommend `effect:dev:verify`
9. **After verify** (all quality gates pass, uncommitted changes exist) → Recommend `effect:dev:review`
10. **Feature complete** (all tests pass, clean code review) → Recommend `effect:dev:save`

Use `Read` to check for file existence and content. Use `Bash` for `git status` and `git diff --stat`.

## Step 2: Output ONE Recommendation

Output exactly this format:

```
Current state: [one-line description of what was detected]
→ /[command]

[1-2 sentence explanation of why this is the right next step]
```

**Rules:**

- NEVER list multiple options. One action only.
- NEVER say "you could also..." or "alternatively...".
- Be specific about what was detected (e.g., "STUCK.md found with repeated build error" not just "stuck state detected").
- If nothing matches any condition above, recommend `/effectum` to see the full guide.

## Communication

Follow the language settings defined in CLAUDE.md for user-facing communication.
All technical content in English.
