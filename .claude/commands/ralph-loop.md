# /ralph-loop -- Self-Referential Agentic Loop for Autonomous Implementation

You enter an autonomous iteration loop. Each iteration: assess state, implement the next step, run quality gates, repeat -- until all criteria are met or max-iterations is reached.

## Step 1: Parse Arguments

Parse `$ARGUMENTS` for these components:

1. **Prompt text**: The complete work order (everything that is not a flag).
2. **`--max-iterations N`**: Maximum number of iterations (required, default 30).
3. **`--completion-promise "PHRASE"`**: The exact phrase to output when done (required).

If either `--max-iterations` or `--completion-promise` is missing, ask the user to provide them and wait.

## Step 2: Initialize State

Create the state file at `.claude/ralph-loop.local.md`:

```yaml
---
active: true
iteration: 0
max_iterations: [N]
completion_promise: "[PHRASE]"
started_at: [ISO 8601 timestamp]
errors_consecutive: 0
last_error: ""
---

## Original Prompt

[FULL PROMPT TEXT FROM $ARGUMENTS]

## Progress Log

[Empty -- will be updated each iteration]
```

Read `CLAUDE.md` for the project's build, test, lint, and type-check commands.

## Step 3: Execute Iteration Loop

For each iteration (1 through max_iterations):

### 3a. Read State

1. Read `.claude/ralph-loop.local.md` for current iteration count, progress log, and error state.
2. Check current project state: `git diff --stat`, existing files, latest test results.
3. If a PRD is referenced in the prompt, re-read the acceptance criteria.

### 3b. Determine Next Step

Based on the prompt, progress log, and current project state, determine the single next logical step to implement. Follow this general sequence:

1. Data layer: migrations, schemas, types, validation.
2. Backend: services, API routes, business logic.
3. Frontend: components, pages, hooks.
4. Tests: unit tests, integration tests (follow TDD where practical).
5. E2E tests: critical user journeys.
6. Polish: code review, cleanup, final verification.

If an `<iteration_plan>` was provided in the prompt, follow it as a roadmap.

### 3c. Implement

Execute the next step. Write code, tests, configurations -- whatever the step requires. Follow project conventions from CLAUDE.md.

### 3d. Run Quality Gates

After every significant change, run the project's quality gates:

1. Build command.
2. Type-check command.
3. Test command.
4. Lint command.

Record the results.

### 3e. Update State

Update `.claude/ralph-loop.local.md`:

- Increment `iteration` counter.
- Add a progress log entry: what was done, what passed/failed.
- Update `errors_consecutive` (reset to 0 on success, increment on failure).
- Update `last_error` with the most recent error message (if any).

### 3f. Check Completion

Evaluate whether ALL of these conditions are met:

1. Every acceptance criterion from the PRD/prompt is implemented and verified.
2. All quality gates pass (build, types, tests, lint).
3. The completion promise statement is 100% TRUE.

**If all conditions are met:**
Output the completion promise: `<promise>[COMPLETION PROMISE TEXT]</promise>`
Set `active: false` in the state file.
Write a final status report to `.claude/ralph-status.md`.
**STOP.**

**If conditions are NOT yet met:**
Continue to the next iteration.

## Step 4: Error Recovery

Apply these escalation rules:

### Build/Test Error

- Next iteration sees the error output and fixes it. This is normal -- continue.

### Same Error 3 Consecutive Times

- The current approach is not working. Try a fundamentally different approach:
  - Different algorithm or data structure.
  - Different library or API.
  - Simpler implementation that still satisfies the criteria.
- Document what was tried and why it failed in the progress log.

### Same Error 5 Consecutive Times

- This is a blocker. Document it in `.claude/ralph-blockers.md`:
  - What the error is.
  - What approaches were tried.
  - Why none worked.
  - Suggested investigation paths.
- Move to the next task/acceptance criterion. Do not keep retrying.

### 80% of Iterations Consumed

- Write a comprehensive status report to `.claude/ralph-status.md`:
  - What is done (with test results).
  - What remains.
  - Active blockers.
  - Suggested next steps.
  - Estimated remaining work.
- Continue implementing, but prioritize the most impactful remaining work.

### Flaky Test

- Investigate the root cause: stateful dependency, timing issue, test isolation problem.
- Do NOT retry blindly. Fix the underlying cause.
- If the root cause cannot be fixed in one iteration: document it as a known issue and skip to the next task.

### Max Iterations Reached

- Set `active: false` in the state file.
- Write a final status report to `.claude/ralph-status.md`.
- Do NOT output the completion promise -- it would be dishonest.
- Report what was accomplished and what remains.

## CRITICAL RULES

1. **Honesty above all**: The completion promise may ONLY be output when the statement is 100% TRUE. Do NOT output false promises to escape the loop. If the build is broken, tests fail, or criteria are unmet, the promise MUST NOT be output.
2. **One step per iteration**: Each iteration should accomplish one meaningful piece of work. Do not try to implement the entire feature in a single iteration.
3. **Always run quality gates**: After every significant change, verify the build and tests. Do not accumulate changes without verification.
4. **Self-awareness**: Read your own progress log to avoid repeating failed approaches. Learn from previous iterations.

## Communication

Follow the language settings defined in CLAUDE.md for user-facing communication.
All code, state files, progress logs, and technical content in English.
