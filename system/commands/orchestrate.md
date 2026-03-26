# /orchestrate — Agent Teams Orchestration

Manage Agent Teams: create teams from YAML profiles, distribute tasks from PRDs, monitor progress, and control team lifecycle.

> **Requires** `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1` in settings.json env. If not set, print an error and exit.

## Syntax

```
/orchestrate [profile] [options]        — Create team and start work
/orchestrate status                     — Show team status and progress
/orchestrate nudge [teammate]           — Send a message to a stuck teammate
/orchestrate shutdown                   — Gracefully terminate all teammates
```

## Options

| Flag           | Default | Description                                        |
| -------------- | ------- | -------------------------------------------------- |
| `--plan-first` | `true`  | Require an approved /plan before spawning the team |
| `--max-cost`   | none    | Token budget limit — warns at 80%, stops at 100%   |
| `--dry-run`    | `false` | Show what would happen without creating the team   |

## Step 1: Parse Arguments

Parse `$ARGUMENTS` for:

1. **Subcommand**: One of `[profile-name]`, `status`, `nudge`, `shutdown`. If no subcommand, show usage help.
2. **Profile name**: Must match a YAML file in `system/teams/` or `.effectum/teams/` (custom profiles).
3. **Flags**: `--plan-first` (default true), `--max-cost N`, `--dry-run`.

### Subcommand: `status`

1. Read `.claude/team-state.local.md` for current team information.
2. Display:
   - Team name and profile
   - Each teammate: name, role, current task, status (working/idle/blocked)
   - Task progress: completed / total
   - Estimated token usage vs. budget (if `--max-cost` was set)
   - Messages sent between teammates
3. If no active team, print "No active team. Use `/orchestrate [profile]` to start one."

### Subcommand: `nudge [teammate]`

1. Read `.claude/team-state.local.md` to find the teammate.
2. Send a message to the teammate: "Please check your assigned tasks and report status. If blocked, describe the blocker."
3. Log the nudge in `.claude/logs/team-activity.log`.

### Subcommand: `shutdown`

1. Read `.claude/team-state.local.md` for active teammates.
2. Send each teammate a shutdown message: "Complete your current task, commit your work, and stop."
3. Wait for all teammates to acknowledge (timeout: 60s).
4. Log the shutdown in `.claude/logs/team-activity.log`.
5. Set `active: false` in `.claude/team-state.local.md`.
6. Print summary: tasks completed, tasks remaining, total tokens used.

## Step 2: Validate Prerequisites

Before creating a team:

1. **Check feature flag**: Verify `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1` in environment. If not set:

   ```
   Error: Agent Teams is not enabled.
   Set CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1 in .claude/settings.json env to activate.
   ```

2. **Load profile**: Read `system/teams/{profile}.yaml`. If not found, check `.effectum/teams/{profile}.yaml` (custom profiles). If neither exists, show available profiles and exit.

3. **Check plan approval** (if `--plan-first` is true, which is the default):
   - Look for an approved plan in the conversation context or `.claude/plan.local.md`.
   - If no approved plan exists:
     ```
     Error: No approved plan found. Run /plan first, then /orchestrate.
     Use --plan-first=false to skip this check (not recommended).
     ```

4. **Locate PRD and tasks**: Find the current PRD and `tasks.md`:
   - Check conversation context for PRD reference.
   - Check `workshop/projects/*/prds/*.md` for active PRDs.
   - Check for `tasks.md` in the project root or `workshop/projects/*/tasks.md`.
   - If no tasks found, generate tasks from the PRD acceptance criteria.

## Step 3: Estimate Cost

Calculate estimated token cost based on the profile:

```
Teammates: {teammate_count}
Estimated iterations: {min_iterations}–{max_iterations}
Estimated tokens: {estimated_tokens}
Estimated cost: ${min_cost}–${max_cost}

Model recommendation: Opus for Lead, Sonnet for Teammates (cost optimization)
```

Cost calculation formula:

- Per-teammate: ~10k tokens/iteration (Sonnet)
- Lead overhead: ~5k tokens/iteration (Opus)
- Total: (teammates × iterations × 10k) + (iterations × 5k)

If `--max-cost` is set, validate that the estimated minimum doesn't exceed the budget.

**Ask for confirmation**: "Proceed with team creation? (Y/n)"

If `--dry-run` is set, print the estimate and exit without creating the team.

## Step 4: Create Team

1. **Initialize team state** at `.claude/team-state.local.md`:

```yaml
---
active: true
profile: {profile_name}
team_name: "{profile}-{prd-slug}"
created_at: {ISO 8601 timestamp}
max_cost: {max_cost or "unlimited"}
tokens_used: 0
---

## Teammates

| Name | Agent | Status | Current Task | Tasks Done |
|------|-------|--------|--------------|------------|
| {name} | {agent} | idle | — | 0 |

## Task Distribution

[Generated from PRD ACs — see Step 5]
```

2. **Create the team** using Claude Code's TeamCreate primitive:
   - Team name: `{profile}-{prd-slug}` (e.g., `web-feature-user-notifications`)

3. **Spawn teammates** with their role instructions:
   - Each teammate receives: their role description, assigned tasks, file ownership rules, and the PRD context.
   - Lead receives: the full profile, all task assignments, phase dependencies, and quality gate definitions.

## Step 5: Distribute Tasks from PRD

Map PRD acceptance criteria to teammates based on file ownership:

1. **Read the PRD** and extract all acceptance criteria.
2. **Read tasks.md** if it exists (preferred) — tasks already have IDs and dependencies.
3. **For each AC / task**:
   - Analyze which files/directories will be affected.
   - Match against teammate `file_ownership` patterns.
   - Assign to the matching teammate.
   - If no clear match, assign to the lead for manual distribution.
4. **Apply phase ordering**:
   - Tasks for Phase 1 teammates are unblocked immediately.
   - Tasks for Phase 2+ teammates are marked as `blocked by: [Phase N-1 tasks]`.
5. **Update tasks.md** with teammate assignments:
   - Add `assigned_to: {teammate_name}` to each task.
   - Add `blocked_by: [task_ids]` for phase dependencies.

## Step 6: Monitor Progress

The lead monitors progress through:

1. **TeammateIdle hook** — fires when a teammate finishes their tasks:
   - Check: Did the teammate complete ALL assigned tasks?
   - Check: Do tests pass for the teammate's scope?
   - If incomplete: assign remaining tasks or reassign from overloaded teammates.
   - If complete: acknowledge and check if phase is done.

2. **TaskCompleted hook** — fires when a task is marked done:
   - Validate: Are the task's acceptance criteria met?
   - Validate: Do tests exist for the implemented functionality?
   - Log completion in `.claude/logs/team-activity.log`.

3. **Cost tracking** (if `--max-cost` set):
   - Track cumulative token usage.
   - At 80%: warn the lead and all teammates to prioritize remaining work.
   - At 100%: initiate graceful shutdown.

4. **Phase transitions**:
   - When all tasks in a phase are complete, unblock the next phase's tasks.
   - Run the phase's quality gate before unblocking.
   - If quality gate fails, reassign fixes to the responsible teammate.

## Step 7: Completion

When all tasks are done:

1. **Run /verify** — full quality gate check (build, types, tests, lint).
2. **Run /code-review** — automated code review of all changes.
3. **Shut down the team** — send completion message to all teammates.
4. **Generate summary**:

   ```
   Team "{team_name}" completed.

   Profile: {profile}
   Duration: {elapsed_time}
   Tasks: {completed}/{total}
   Tokens used: {tokens_used}
   Cost: ~${estimated_cost}

   Quality gates: ✅ Build | ✅ Types | ✅ Tests | ✅ Lint
   ```

5. **Update team state**: Set `active: false` in `.claude/team-state.local.md`.
6. **Update tasks.md**: Verify all tasks are marked `✅ DONE`.

## CRITICAL RULES

1. **Plan-first is non-negotiable** (unless explicitly overridden): Never spawn a team without an approved plan. The plan ensures task decomposition is sound before committing N×token-cost.
2. **File ownership is sacred**: Never allow two teammates to edit the same file. If a conflict is detected, the lead must reassign the task.
3. **Phase ordering is enforced**: Teammates MUST NOT start phase N+1 work until phase N's quality gate passes.
4. **Cost awareness**: Always show the cost estimate. Agent Teams cost 3-4x more than Subagents — the user must make an informed choice.
5. **Graceful degradation**: If a teammate fails or gets stuck, the lead reassigns their tasks rather than spawning a new teammate.
6. **Subagents still work**: When Agent Teams are disabled, `/orchestrate` prints an error directing the user to enable the feature flag. It does NOT fall back to subagents — that's what the normal workflow commands do.

## Next Steps

After orchestration is complete:

- → `/verify` — Run full quality gates on the combined output from all teammates
- → `/code-review` — Review all changes for security and quality

ℹ️ Alternative: If a teammate got stuck, use `/build-fix` to resolve errors before running verification.

## Communication

Follow the language settings defined in CLAUDE.md for user-facing communication.
All state files, logs, and technical content in English.
