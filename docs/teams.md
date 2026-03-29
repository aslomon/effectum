# Agent Teams

## What Are Agent Teams?

Agent Teams is an experimental Claude Code feature that enables **parallel, coordinated execution by multiple specialized agents** — called _teammates_ — within a single task. Instead of one agent sequentially handling every layer of a feature, the orchestrator assigns teammates to specific scopes (e.g., frontend, backend, database, testing) and they work concurrently under shared coordination hooks.

Agent Teams is distinct from ad-hoc subagent spawning: teams are declared upfront with explicit file ownership, task dependencies, and role assignments. This prevents conflicts, reduces coordination overhead, and makes large multi-layer features tractable in a single session.

---

## Team Profile YAML Format

Team profiles are YAML files stored in `system/teams/`. Each profile defines a complete team composition with teammates, phases, cost estimates, and hook configuration.

### Schema

```yaml
# system/teams/{profile-name}.yaml
name: profile-name
description: "Short description of the workflow"
teammate_count: 3
min_acs: 6 # Minimum ACs for this profile to be useful
recommended_for:
  app_types: [web-app] # Which app types benefit from this profile
  stacks: [nextjs-supabase] # Which tech stacks this profile supports

lead:
  role: "Orchestrator — distributes tasks, reviews code, synthesizes results"
  instructions: "Instructions for the team lead"

teammates:
  - name: frontend # Internal label for task assignment
    agent: frontend-developer # Agent specialization (from Claude Code)
    role: "UI components, pages, styling, responsive design"
    file_ownership: # Glob patterns — only this teammate edits these
      - "src/components/"
      - "src/app/**/page.tsx"
    model_hint: sonnet # Cost optimization: sonnet for teammates, opus for lead

  - name: backend
    agent: backend-developer
    role: "API routes, services, data layer"
    file_ownership:
      - "src/lib/"
      - "src/app/api/"
    model_hint: sonnet

phases:
  - name: "Phase 1"
    tasks_for: [backend] # Which teammates work in this phase
    quality_gate: "Description of what must be true before next phase"
  - name: "Phase 2"
    tasks_for: [backend, frontend]
    parallel: true # Teammates work concurrently
    depends_on: ["Phase 1"] # Cannot start until Phase 1 passes
    quality_gate: "API responds, components render"

cost_estimate:
  min_iterations: 15
  max_iterations: 40
  estimated_tokens: "150k-400k"

hooks:
  TeammateIdle:
    check_tasks_completed: true # Verify all assigned tasks are done
    check_tests_passing: true # Run tests for teammate's scope
  TaskCompleted:
    validate_acs_met: true # Check if AC criteria are satisfied
    validate_tests_exist: true # Ensure test files were created
```

### Custom Profiles

Add custom profiles in `.effectum/teams/{name}.yaml`. These are checked after built-in profiles, so custom profiles can override built-in ones by using the same name.

---

## Predefined Profiles

### `web-feature` — 3 Teammates

Standard web feature spanning UI and API layers.

| Teammate | Specialization       | Owns                                    |
| -------- | -------------------- | --------------------------------------- |
| frontend | `frontend-developer` | `src/components/`, `src/app/` pages     |
| backend  | `backend-developer`  | `src/lib/`, `src/app/api/`, `supabase/` |
| testing  | `test-automator`     | `tests/`, `e2e/`, `**/*.test.*`         |

**Phases:** Database + Types → API + UI (parallel) → Tests
**Use when:** Adding a feature that requires both UI components and API routes.

---

### `fullstack` — 5 Teammates

Complete full-stack feature including schema changes, API, UI, tests, and code review.

| Teammate | Specialization       | Owns                         |
| -------- | -------------------- | ---------------------------- |
| frontend | `frontend-developer` | `src/components/`, pages     |
| backend  | `backend-developer`  | `src/lib/`, `src/app/api/`   |
| database | `postgres-pro`       | `supabase/migrations/`       |
| testing  | `test-automator`     | `tests/`, `**/*.test.*`      |
| reviewer | `code-reviewer`      | Read-only (produces reports) |

**Phases:** Database + Types → API + UI (parallel) → Tests → Review
**Use when:** New feature requiring database schema changes, API design, and UI.

---

### `frontend-only` — 3 Teammates

Frontend-focused work without backend changes.

| Teammate   | Specialization       | Owns                            |
| ---------- | -------------------- | ------------------------------- |
| layout     | `nextjs-developer`   | `src/app/` layouts and pages    |
| components | `react-specialist`   | `src/components/`, `src/hooks/` |
| content    | `frontend-developer` | `messages/`, `public/`          |

**Phases:** Layout + Components (parallel) → Content + Polish
**Use when:** Building pages, landing sections, or UI-only features with no API or schema changes.

---

### `review` — 2 Teammates

Parallel code review and security audit.

| Teammate | Specialization      | Owns      |
| -------- | ------------------- | --------- |
| quality  | `code-reviewer`     | Read-only |
| security | `security-engineer` | Read-only |

**Phases:** Parallel Review (both teammates work concurrently)
**Use when:** Pre-merge review of a large feature branch. Both teammates produce reports rather than code changes.

---

### `overnight-build` — 4 Teammates

Large feature build designed for unattended execution with continuous testing.

| Teammate | Specialization       | Owns                            |
| -------- | -------------------- | ------------------------------- |
| database | `postgres-pro`       | `supabase/migrations/`          |
| backend  | `backend-developer`  | `src/lib/`, `src/app/api/`      |
| frontend | `frontend-developer` | `src/components/`, pages        |
| testing  | `test-automator`     | `tests/`, `e2e/`, `**/*.test.*` |

**Phases:** Database + Types → API + Testing (parallel) → UI + Testing (parallel) → E2E + Final Verification
**Use when:** Large features that benefit from unattended execution. The testing teammate works alongside implementation teammates in each phase.

---

## When to Use Teams vs. Subagents

| Situation                                                    | Use Teams | Use Subagents |
| ------------------------------------------------------------ | --------- | ------------- |
| Feature spans multiple technical layers (DB + API + UI)      | Yes       | —             |
| Parallel work possible with clear file ownership             | Yes       | —             |
| 3-6 distinct specialists needed simultaneously               | Yes       | —             |
| Pre-merge review: quality + security in parallel             | Yes       | —             |
| Single specialist task (e.g., "write tests for this module") | —         | Yes           |
| Sequential dependent tasks                                   | —         | Yes           |
| Quick delegation to one expert                               | —         | Yes           |
| Exploratory / research task                                  | —         | Yes           |
| Only one or two layers involved                              | —         | Yes           |

**Rule of thumb:**

- Use **teams** when the work is genuinely parallel, involves multiple technical domains, and benefits from strict file ownership enforcement.
- Use **subagents** (via the `Task` tool) for focused, sequential, or single-specialist delegation.
- Teams with more than 5-6 teammates introduce coordination overhead that typically outweighs the parallelism benefit.

### Automatic Recommendation

The Recommendation Engine automatically suggests Agent Teams when a PRD meets these criteria:

- **>10 acceptance criteria** — indicates sufficient complexity
- **>2 distinct modules** — indicates cross-layer work
- **>2 parallelizable workstreams** — indicates genuine parallelism benefit

When at least 2 of these criteria are met, the setup configurator asks "Enable Agent Teams?" (defaults to No).

---

## The `/effect:dev:orchestrate` Command

`/effect:dev:orchestrate` is the central command for Agent Teams lifecycle management.

### Creating a Team

```bash
# Use a predefined profile
/effect:dev:orchestrate web-feature

# Use the fullstack profile
/effect:dev:orchestrate fullstack

# Dry run — see cost estimate without creating
/effect:dev:orchestrate fullstack --dry-run

# Set a token budget
/effect:dev:orchestrate web-feature --max-cost 300000

# Skip plan check (not recommended)
/effect:dev:orchestrate web-feature --plan-first=false
```

### Monitoring

```bash
# Show team status, task progress, token usage
/effect:dev:orchestrate status

# Prod a stuck teammate
/effect:dev:orchestrate nudge frontend

# Gracefully shut down all teammates
/effect:dev:orchestrate shutdown
```

### What `/effect:dev:orchestrate` Does

1. **Loads the YAML profile** from `system/teams/{profile}.yaml`
2. **Validates prerequisites** — checks for approved /effect:dev:plan, existing PRD/tasks
3. **Estimates cost** — shows token budget, asks for confirmation
4. **Creates the team** via Claude Code's TeamCreate primitive
5. **Distributes tasks** from the PRD — maps ACs to teammates based on file ownership
6. **Monitors progress** via TeammateIdle and TaskCompleted hooks
7. **Enforces phase ordering** — quality gates between phases
8. **Completes** with /effect:dev:verify + /effect:dev:review when all tasks are done

### Workflow

```
/effect:dev:plan → [approval] → /tasks → /effect:dev:orchestrate [profile] → [parallel work] → /effect:dev:verify → /effect:dev:review
```

Compare to the classic sequential workflow:

```
/effect:dev:plan → [approval] → /tasks → /effect:dev:tdd (sequential per task) → /effect:dev:verify → /effect:dev:review
```

---

## How to Activate Agent Teams

Agent Teams is controlled by the `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS` environment variable in `settings.json`.

### Enable Agent Teams

In `.claude/settings.json` (project) or `~/.claude/settings.json` (global):

```json
{
  "env": {
    "CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS": "1"
  }
}
```

### Disable Agent Teams (default)

```json
{
  "env": {
    "CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS": "0"
  }
}
```

The Effectum template ships with `"0"` (disabled) because Agent Teams is experimental. Enable it per project when you want to use `/effect:dev:orchestrate`.

---

## Coordination Hooks

These hooks fire exclusively in Agent Teams mode:

### TeammateIdle

Fires when a teammate finishes their assigned tasks. Performs quality checks:

1. Verifies all assigned tasks are marked `DONE` in tasks.md
2. Runs tests for the teammate's file ownership scope
3. Checks for TODO/FIXME comments in owned files
4. Looks for unclaimed tasks the teammate could pick up
5. Identifies blocked teammates who need assistance

If checks fail, the teammate is assigned remaining work. If all checks pass, the teammate is released.

### TaskCompleted

Fires when a teammate marks a task as done. Validates:

1. The task's acceptance criteria from the PRD are met
2. Test files exist for the implemented functionality
3. The code compiles without type errors

Both hooks are configurable per profile in the YAML `hooks` section.

---

## Cost Awareness

Agent Teams cost 3-4x more tokens than Subagents because each teammate is a separate Claude instance.

### Cost Estimation

`/effect:dev:orchestrate` always shows a cost estimate before creating a team:

```
Teammates: 3
Estimated iterations: 15–40
Estimated tokens: 150k–400k
Estimated cost: $1.50–$4.00

Model recommendation: Opus for Lead, Sonnet for Teammates (cost optimization)
Proceed? (Y/n)
```

### Budget Control

Use `--max-cost` to set a token budget:

```bash
/effect:dev:orchestrate web-feature --max-cost 200000
```

- At **80% consumed**: warns the lead and all teammates to prioritize
- At **100% consumed**: initiates graceful shutdown

### Model Recommendations

- **Opus** for the Team Lead (complex coordination, synthesis)
- **Sonnet** for Teammates (focused implementation, cost-efficient)

---

## Best Practices

1. **3-5 teammates** is optimal for most workflows. More than 5 creates coordination overhead.
2. **5-6 tasks per teammate** is the sweet spot for throughput.
3. **Define clear file ownership** — ambiguous ownership leads to conflicts.
4. **Database first** — if schema changes are needed, the database teammate must complete before others start (they depend on generated types).
5. **Reviewer last** — the reviewer teammate should start after all implementation teammates finish.
6. **Use `blocked by:`** in task definitions to declare dependencies explicitly.
7. **Always run /effect:dev:plan first** — never skip planning for Agent Teams workflows.
8. **Use `--dry-run`** to preview cost before committing to a team.
