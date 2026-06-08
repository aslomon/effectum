---
name: "effect:goal"
description: "Create or update the provider-neutral Goal envelope that drives PRD, workflow, run, and review decisions."
allowed-tools: ["Read", "Write", "Edit", "Bash", "Glob", "Grep"]
effort: "medium"
---

# effect:goal — Define the Work Goal Before Choosing a Workflow

You create or update the project-level `GOAL.md`: a provider-neutral work-order envelope that turns intent into executable agent work.

A Goal is not a PRD replacement. A PRD describes what should exist. The Goal defines how an agent should pursue the work responsibly: outcome, mandate, autonomy, evidence, workflow mode, quality gates, and review boundary.

## Step 1: Parse Input

Read `$ARGUMENTS` as one of these forms:

1. **Inline intent** — e.g. `effect:goal "Add billing export for admins"`
2. **PRD reference** — path under `docs/prds/` or `workshop/projects/*/prds/`
3. **Update request** — e.g. `effect:goal update autonomy to review-gated`
4. **Empty input** — inspect current project state and propose a Goal draft, then ask for missing essentials.

If a PRD path is provided, read it fully. If `CLAUDE.md`, `AGENTS.md`, `.effectum.json`, `PLAN.md`, `.claude/plan.local.md`, or `tasks.md` exist, read the relevant parts before drafting.

## Step 2: Inspect Current State

Check, in order:

1. Existing `GOAL.md`
2. `.effectum/goal-state.json`
3. `.claude/plan.local.md`
4. PRDs in `docs/prds/` and `workshop/projects/*/prds/`
5. `tasks.md` or `workshop/projects/*/tasks.md`
6. `git status --short`

If an existing `GOAL.md` exists, preserve stable decisions unless the user explicitly changes them.

## Step 3: Decide Workflow Mode

Choose exactly one workflow mode:

| Mode | Use when | Next command |
| ---- | -------- | ------------ |
| `plan-first` | Ambiguous, risky, multi-file, architecture-heavy, or human approval needed | `effect:dev:plan` |
| `tdd-direct` | Small, clear implementation or bugfix with obvious tests | `effect:dev:tdd` |
| `full-auto` | Clear scope, measurable completion promise, low subjective judgment | `effect:dev:run` |
| `orchestrated` | 3+ independent workstreams or complex parallel implementation | `effect:dev:orchestrate` |
| `review-only` | Changes already exist and need verification/review | `effect:dev:verify` then `effect:dev:review` |

Do not choose `full-auto` unless the Goal has a measurable completion promise and explicit quality gates.
Do not choose `orchestrated` unless parallel workstreams are genuinely separable.

## Step 4: Write GOAL.md

Create or update `GOAL.md` in the project root with this exact structure:

```markdown
# Goal: [short title]

## Outcome
[The business/user-visible outcome in 1-3 sentences.]

## Mandate
- Agent may: [allowed actions]
- Agent must not: [forbidden actions]
- Human approval required for: [external, destructive, risky, subjective decisions]

## Scope
### In scope
- [concrete items]

### Out of scope
- [explicit non-goals]

## Current Context
- Source: [inline / PRD path / plan path]
- Existing assets: [files, modules, docs, tests]
- Known constraints: [technical/product constraints]

## Workflow Decision
- Mode: `plan-first|tdd-direct|full-auto|orchestrated|review-only`
- Next command: `effect:...`
- Reason: [why this mode fits]

## Completion Promise
[Exact sentence that may only be claimed when true.]

## Quality Gates
- [ ] Build/typecheck: [command or expected check]
- [ ] Tests: [command or expected check]
- [ ] Lint/format: [command or expected check]
- [ ] Review/evidence: [what must be shown]

## Evidence Required
- [diff summary, test output, screenshots, logs, review notes, etc.]

## Risks and Stop Conditions
- Stop if: [condition]
- Escalate if: [condition]
- Rollback/restore point: [if applicable]

## Next Step
Run: `effect:... [short instruction]`
```

## Step 5: Write Machine-Readable State

Create `.effectum/goal-state.json` with matching compact state:

```json
{
  "version": 1,
  "title": "short title",
  "mode": "plan-first",
  "nextCommand": "effect:dev:plan",
  "completionPromise": "exact promise",
  "source": "inline|path",
  "status": "draft|ready|in_progress|complete|blocked",
  "updatedAt": "ISO-8601 timestamp"
}
```

Use `ready` only when the Goal has scope, mandate, completion promise, and quality gates.
Use `draft` when essentials are missing.

## Step 6: Output the Goal Card

After writing files, output:

```text
Goal ready: [title]
Mode: [mode]
Next: [command]
Why: [one sentence]
Missing: [none or concise list]
```

If essentials are missing, do not pretend the Goal is ready. Ask the smallest possible follow-up question.

## Next Steps

- → `effect:dev:plan` — Use when the Goal needs an implementation plan or approval before coding
- → `effect:dev:run` — Use when the Goal is ready for autonomous implementation with measurable gates
- → `effect:dev:orchestrate` — Use when the Goal has multiple independent workstreams

ℹ️ Alternative: If there is no PRD yet, run `effect:prd:new` first, then return to `effect:goal`.

## Communication

Follow the language settings defined in CLAUDE.md.
All file content must be written in English.
User-facing communication uses the language configured in CLAUDE.md.
