---
name: "diagnose [DEPRECATED → effect:dev:diagnose]"
description: "DEPRECATED: Use /effect:dev:diagnose instead. This alias will be removed in v0.20."
allowed-tools: ["Read", "Bash", "Glob", "Grep", "Write"]
effort: "medium"
---

> ⚠️ **Deprecated as of v0.18.0**
>
> `/diagnose` has been renamed to `effect:dev:diagnose`.
> This alias will be **removed in v0.20.0**.
>
> Please update your workflow: type `/effect:dev:diagnose` going forward.
> (Running `effect:dev:diagnose` now...)

---

# effect:dev:diagnose — Post-Mortem Diagnosis for Loop Failures

Reads all loop artifacts, analyzes failure patterns, and outputs a structured diagnosis report.

## Step 1: Gather Artifacts

Read all available loop artifacts. Not all will exist — collect what is available:

1. **HANDOFF.md** — context budget stop report (project root)
2. **STUCK.md** — stuck detection report (project root)
3. **.effectum/loop-state.json** — last persisted loop state
4. **effectum-metrics.json** — historical session ledger (project root)
5. **Recent git log** — run `git log --oneline -20` for recent commit context
6. **.claude/ralph-loop.local.md** — internal loop state file
7. **.claude/ralph-blockers.md** — blocker documentation (if exists)
8. **.claude/ralph-status.md** — final status report (if exists)

For each artifact that exists, read its full content. For missing artifacts, note their absence.

## Step 2: Analyze Patterns

With all gathered data, analyze:

### Failure Mode Classification

Classify the failure as one of:

- **stuck**: Same error repeated, loop gave up
- **budget_exceeded**: Context ran out before completion
- **max_iterations**: Hit the iteration limit without finishing
- **blocker**: A specific error could not be resolved after multiple approaches
- **partial_success**: Most criteria met but some remain
- **unknown**: Artifacts are insufficient to determine

### Root Cause Analysis

1. **What was the last quality gate that failed?** (build, types, tests, lint)
2. **What error patterns repeat across sessions?** (check effectum-metrics.json for recurring failures)
3. **What was the state at the point of failure?** (iteration count, files modified, tests passing/failing)
4. **Were there signs of approach thrashing?** (multiple different strategies tried for the same problem)
5. **Was the task scope appropriate?** (too many ACs for the iteration budget)

### Trend Analysis (if multiple sessions exist)

- Are the same quality gates failing across sessions?
- Is iteration count trending up or down?
- Are outcomes improving (partial → more complete)?

## Step 3: Generate Report

Write `FORENSICS-YYYY-MM-DD.md` in the project root (using today's date):

```markdown
# Forensics Report — YYYY-MM-DD

## Summary

[One-paragraph executive summary of what happened]

## Failure Classification

**Mode**: [stuck | budget_exceeded | max_iterations | blocker | partial_success | unknown]
**Confidence**: [high | medium | low]

## Artifacts Found

| Artifact              | Present | Key Finding        |
| --------------------- | ------- | ------------------ |
| HANDOFF.md            | ✅/❌   | [one-line summary] |
| STUCK.md              | ✅/❌   | [one-line summary] |
| loop-state.json       | ✅/❌   | [one-line summary] |
| effectum-metrics.json | ✅/❌   | [one-line summary] |
| ralph-loop.local.md   | ✅/❌   | [one-line summary] |

## Root Cause

[Detailed analysis of the root cause]

## Error Timeline

[Chronological list of key errors/events from the artifacts]

## Patterns

[Recurring patterns found across artifacts and sessions]

## Recommended Next Steps

1. [Most impactful action to take]
2. [Second priority]
3. [Third priority]

## Suggested Command

[The exact command or workflow to run next, e.g.:]
```

/ralph-loop "Fix the OAuth callback — use strategy X instead of Y" --max-iterations 10 --completion-promise "OAuth callback works and tests pass"

```

```

## Step 4: Report to User

After writing the report, print a summary:

```
Forensics report written to FORENSICS-YYYY-MM-DD.md

Failure mode: [classification]
Root cause: [one-line summary]
Recommended: [primary next step]
```

## Next Steps

After the forensics report is generated:

- → `effect:dev:run` — Restart with the suggested command from the report
- → `effect:dev:fix` — If the root cause is a build failure, fix errors incrementally
- → `effect:dev:verify` — Assess the current state before deciding on the next action

ℹ️ Always read the full `FORENSICS-YYYY-MM-DD.md` report before restarting a loop — it contains the recommended approach for the next session.

## Communication

Follow the language settings defined in CLAUDE.md for user-facing communication.
All report content and technical analysis in English.
