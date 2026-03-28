---
name: "What's Next"
description: "Reads your project state and recommends the single best next action."
allowed-tools: ["Read", "Bash"]
effort: "low"
---

# /next — Smart Next-Action Router

You check the current project state and recommend exactly ONE next action. Never list multiple options.

## Step 1: Check Project State

Check these paths **in order**. Stop at the FIRST match:

1. **STUCK.md exists** in project root → Recommend `/forensics` (or `/diagnose`)
2. **HANDOFF.md exists** AND `.effectum/loop-state.json` exists with `status` != `"complete"` → Recommend `/ralph-loop` resume (or `/run`)
3. **FORENSICS-\*.md exists** in project root → Recommend `/ralph-loop` retry (or `/run`)
4. **No CLAUDE.md** in project root, OR CLAUDE.md has no `<!-- effectum:project-context:start -->` sentinel → Recommend `/context:init` (or `/effectum:init`)
5. **No `docs/prds/` directory** AND no `workshop/projects/*/prds/` with PRD files → Recommend `/prd:new`
6. **PRD exists** but no plan (no `PLAN.md` or plan section in the PRD) → Recommend `/plan`
7. **Plan exists** but no implementation (no source files changed since plan) → Recommend `/ralph-loop` (or `/run`)
8. **Uncommitted changes** (`git status` shows modifications) → Recommend `/verify`
9. **After verify** (all quality gates pass, uncommitted changes exist) → Recommend `/code-review`
10. **Feature complete** (all tests pass, clean code review) → Recommend `/checkpoint` (or `/save`)

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
