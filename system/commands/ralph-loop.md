---
name: "Ralph Loop"
description: "Autonomous iterative implementation loop that runs until all acceptance criteria are met."
allowed-tools: ["Read", "Write", "Edit", "Bash", "Glob", "Grep", "Agent"]
effort: "high"
---

# /ralph-loop -- Self-Referential Agentic Loop for Autonomous Implementation

You enter an autonomous iteration loop. Each iteration: assess state, implement the next step, run quality gates, repeat -- until all criteria are met or max-iterations is reached.

## Step 1: Parse Arguments

Parse `$ARGUMENTS` for these components:

1. **Prompt text**: The complete work order (everything that is not a flag).
2. **`--max-iterations N`**: Maximum number of iterations (required, default 30).
3. **`--completion-promise "PHRASE"`**: The exact phrase to output when done (required).

If either `--max-iterations` or `--completion-promise` is missing, ask the user to provide them and wait.

## Prime Directives

1. **Honesty above all**: The completion promise may ONLY be output when the statement is 100% TRUE. Do NOT output false promises to escape the loop. If the build is broken, tests fail, or criteria are unmet, the promise MUST NOT be output.
2. **One step per iteration**: Each iteration should accomplish one meaningful piece of work. Do not try to implement the entire feature in a single iteration.
3. **Always run quality gates**: After every significant change, verify the build and tests. Do not accumulate changes without verification.
4. **Self-awareness**: Read your own progress log to avoid repeating failed approaches. Learn from previous iterations.

## Context Management

Before each iteration, estimate remaining context capacity:

1. **Estimate context usage**: Consider the number of iterations completed, the volume of code read/written, and tool output accumulated.
2. **If estimated context usage exceeds 80%**:
   - Immediately commit current state with a descriptive message: `wip: ralph-loop checkpoint at iteration N`
   - Write `HANDOFF.md` in the project root with:

     ```markdown
     # Ralph Loop Handoff

     ## What Was Done

     [List of completed work with iteration numbers]

     ## What Remains

     [Remaining acceptance criteria / tasks]

     ## Last Error

     [Most recent error message, if any]

     ## Next Recommended Step

     [Specific instruction for the next session to pick up from]

     ## Loop State

     - Iteration: N of M
     - Branch: [current branch]
     - Last commit: [hash]
     ```

   - **STOP immediately**. Do not attempt another iteration.

3. Do not continue when context is nearly full — a clean handoff is better than a corrupted loop.

## Stuck Detection

Track error messages across iterations to detect loops:

1. After each failed iteration, compare the current error message against the previous iteration's error.
2. **If the SAME error message appears in 2 consecutive iterations**: STOP immediately.
3. Write `STUCK.md` in the project root with:

   ```markdown
   # Ralph Loop — Stuck Report

   ## Repeated Error

   [The exact error message that repeated]

   ## What Was Tried

   [Approaches attempted across the stuck iterations]

   ## Why It Didn't Work

   [Analysis of why the approaches failed]

   ## Suggested Next Steps

   [Concrete recommendations for a human or fresh session]

   ## Loop State

   - Iteration: N of M
   - Task: [current task]
   - Branch: [current branch]
   ```

4. Do NOT continue looping on the same error. Two repetitions means the approach is fundamentally wrong.

## Per-Iteration Loop State

Persist loop state to disk after every iteration for crash recovery:

1. **After EVERY iteration**, write/update `.effectum/loop-state.json`:
   ```json
   {
     "task": "current task description",
     "iteration": 5,
     "maxIterations": 30,
     "status": "running",
     "lastError": "error message or null",
     "timestamp": "2026-03-28T12:00:00Z",
     "artifacts_created": ["src/auth.ts", "test/auth.test.ts"],
     "completionPromise": "the promise text",
     "branch": "feat/my-feature"
   }
   ```
2. **At the START of a new run**: Check if `.effectum/loop-state.json` exists with `status` != `"complete"`.
   - If found: Ask the user — **"Incomplete run detected (iteration N of M, status: STATUS). Resume or start fresh?"**
   - If "resume": Continue from the recorded iteration, re-read progress log.
   - If "start fresh": Delete the state file and begin from iteration 1.
3. **On successful completion**: Set `status` to `"complete"` and write final metrics (see Loop Ledger below).
4. **On stuck/budget stop**: Set `status` to `"stuck"` or `"budget_exceeded"` respectively.

## Loop Ledger (effectum-metrics.json)

On run completion (success, stuck, or budget stop), append a session entry to `effectum-metrics.json` in the project root:

```json
{
  "sessions": [
    {
      "command": "ralph-loop",
      "started": "2026-03-28T10:00:00Z",
      "finished": "2026-03-28T11:30:00Z",
      "iterations": 12,
      "maxIterations": 30,
      "outcome": "success|stuck|budget_exceeded|max_iterations",
      "qualityGates": {
        "build": true,
        "types": true,
        "tests": true,
        "lint": true
      },
      "duration_estimate": "~90 minutes",
      "notes": "Implemented auth flow. Stuck on OAuth callback for 3 iterations before switching approach."
    }
  ]
}
```

- If `effectum-metrics.json` already exists, read it and append to the `sessions` array.
- If it does not exist, create it with the first session entry.
- This ledger is append-only — never remove previous entries.

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
prd_hash: ""
prd_path: ""
tasks_path: ""
network_map_path: ""
---

## Original Prompt

[FULL PROMPT TEXT FROM $ARGUMENTS]

## Progress Log

[Empty -- will be updated each iteration]
```

Read `CLAUDE.md` for the project's build, test, lint, and type-check commands.

### PRD Lifecycle Detection

If the prompt references a PRD (contains a path to a PRD file, or a `workshop/projects/` reference):

1. Resolve the PRD file path and store it as `prd_path`.
2. Compute the SHA-256 hash of the PRD file and store it as `prd_hash`.
3. Detect the task registry: `workshop/projects/{slug}/tasks.md` → store as `tasks_path`.
4. Detect the network map: `workshop/projects/{slug}/network-map.mmd` → store as `network_map_path`.

If no PRD is referenced, leave these fields empty — the loop runs in legacy mode without lifecycle integration.

## Step 3: Execute Iteration Loop

For each iteration (1 through max_iterations):

### 3a. Read State

1. Read `.claude/ralph-loop.local.md` for current iteration count, progress log, and error state.
2. Check current project state: `git diff --stat`, existing files, latest test results.
3. If a PRD is referenced in the prompt, re-read the acceptance criteria.

#### PRD-Hash Change Detection

If `prd_path` is set (lifecycle mode):

1. Compute the current SHA-256 hash of the PRD file.
2. Compare against `prd_hash` stored in the state file.
3. **If the hash changed**:
   - **PAUSE** the loop immediately.
   - Notify the user: **"PRD has changed since this loop started."**
   - Show a summary of what changed (diff the sections).
   - Ask the user: **"Continue with current plan, or restart with a delta handoff?"**
   - If "continue": Update `prd_hash` in state file, re-read ACs, resume.
   - If "restart": Output instructions to run `/prd:update` and start a new loop with the delta handoff.
   - **Do NOT silently continue with stale requirements.**

#### Task Registry Read (MANDATORY)

**You MUST check for and use a task registry if one exists.**

1. Look for `tasks.md` in the project: `workshop/projects/*/tasks.md` or `tasks.md` in the project root. If found, set `tasks_path`.
2. If `tasks_path` is set, read it at the START of every iteration.
3. Identify the next task to work on: first `⚠️ STALE` task, then first `📋 TODO` task.
4. Skip `✅ DONE` and `❌ CANCELLED` tasks.
5. The current task determines what you implement this iteration. Do NOT skip ahead.
6. If no `tasks.md` exists but the prompt references ACs, create one from the ACs before starting.

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

#### Task Registry Sync (MANDATORY)

**You MUST update the task registry after EVERY iteration where you worked on a task.**

1. Open `tasks.md` and update the task you worked on:
   - When you START working on a task: change `📋 TODO` → `🔄 IN_PROGRESS`
   - When a task's AC is fully implemented AND tests pass: change `🔄 IN_PROGRESS` → `✅ DONE`
   - For STALE tasks after rework is complete and tests pass: change `⚠️ STALE` → `✅ DONE`
2. Write the file to disk immediately. Do NOT batch updates.
3. This is NOT optional. If you implemented code for a task, you MUST update `tasks.md` in the same iteration.

**Verification:** At the end of each iteration, confirm that `tasks.md` reflects what you just did. If it doesn't, fix it before proceeding.

#### Network Map Status Sync

If `network_map_path` is set and a feature's status changed:

1. Read the current network map.
2. Update the CSS class of the corresponding feature node:
   - When first task of a feature starts: `:::planned` → `:::inProgress`
   - When all tasks of a feature are DONE: `:::inProgress` → `:::done`
3. Write the updated network map to disk.
4. Also update the feature `status` in the PRD frontmatter to match (`planned` → `in-progress` → `done`).

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

## Next Steps

After the Ralph Loop completes (or is cancelled):

- → `/verify` — Run full quality gates to confirm the implementation is solid
- → `/code-review` — Run a security and quality audit on the changes
- → `/cancel-ralph` — If the loop needs to be stopped, cancel gracefully

ℹ️ Alternative: If the loop completed with all criteria met, proceed directly to `/code-review` and then commit.

## Overnight / Scheduled Runs (via `/loop`)

For long PRD implementations you want to run unattended:

1. Set up your PRD and `tasks.md` normally
2. Instead of running `/ralph-loop` interactively, schedule it:
   ```
   /loop schedule "0 22 * * *" — run /ralph-loop --max-iterations 50 --completion-promise "ALL_DONE"
   ```
3. Claude will fire at 22:00, iterate autonomously, and stop when done or on iteration limit
4. Review `.claude/loop-summary.log` in the morning for a one-line status
5. Run `/verify` and `/code-review` after waking up

**When to use scheduled vs. interactive:**
- Interactive: tasks that need guidance mid-way, or where you want to review each iteration
- Scheduled (`/loop`): well-defined PRDs with clear acceptance criteria, overnight builds, CI-like automation

## Communication

Follow the language settings defined in CLAUDE.md for user-facing communication.
All code, state files, progress logs, and technical content in English.
