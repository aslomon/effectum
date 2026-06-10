# Stack Preset: Loop Worker

> Background worker preset for scheduled `/loop` execution, PR monitoring, deployment checks, and overnight autonomous builds.

## TECH_STACK

```
- Workflow preset for background / scheduled work, not a normal app framework
- Claude Code `/loop` for recurring execution
- `tasks.md` as the state source of truth between iterations
- Transcript timestamps enabled for auditability
- {{PACKAGE_MANAGER}} available for repo-local scripts when needed
```

## ARCHITECTURE_PRINCIPLES

```
- Each loop iteration is independent. Re-read `tasks.md` at the start every time.
- Prefer small, resumable steps over long speculative runs.
- Persist state in files and logs, not only in transcript memory.
- Exit cleanly when all tasks are done. Do not invent filler work.
- Errors should be logged with enough context to resume on the next iteration.
```

## PROJECT_STRUCTURE

````
```
.claude/
  loop-summary.log          # one-line summary per completed iteration
  loop-errors.log           # error log for recoverable failures
tasks.md                    # queue / state the loop re-reads every run
```
````

## QUALITY_GATES

```
- Every iteration re-reads `tasks.md` before acting
- Task status changes are persisted immediately
- Completion is logged to `.claude/loop-summary.log`
- Recoverable failures are logged to `.claude/loop-errors.log`
- Loop exits cleanly when no TODO work remains
```

## FORMATTER

```
[No stack-specific formatter override]
```

## FORMATTER_GLOB

```
md|json
```

## PACKAGE_MANAGER

```
{{PACKAGE_MANAGER}}
```

## STACK_SPECIFIC_GUARDRAILS

```
- This preset is for scheduled workflows, not normal product scaffolding.
- Never fake a framework just to satisfy validation.
- Re-read `tasks.md` at the start of every `/loop` fire.
- If all tasks are done, exit cleanly instead of generating new work.
- Log recoverable errors and continue on the next iteration.
```

## TOOL_SPECIFIC_GUARDRAILS

```
- Use `/loop` for scheduling, `/ralph-loop` for iterative implementation inside a run.
- Keep summaries short and append-only.
- Prefer file-backed state over transcript-only state.
```
