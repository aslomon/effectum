# PRD: Agent Teams Integration

## Problem

Effectum has basic Agent Teams support (team profiles in `system/teams/profiles.md`, `/orchestrate` command, TeammateIdle/TaskCompleted hooks) but it's surface-level. The actual Agent Teams feature in Claude Code (Feb 2026) is fundamentally different from Subagents — it enables peer-to-peer communication, shared task queues, and true parallel collaboration. Effectum doesn't leverage this properly.

Key gaps:
1. `/orchestrate` is too basic — doesn't create Teams, distribute Tasks, or monitor progress
2. Team Profiles are markdown tables, not actionable YAML that maps to Claude Code's 7 Team-Primitives
3. The Recommendation Engine doesn't know when to suggest Teams vs. Subagents
4. No cost awareness — Agent Teams cost 3-4x more tokens
5. No integration between Agent Teams and the PRD/Task Registry system

## Goal

Make Agent Teams a first-class, opt-in workflow in Effectum. When a project is complex enough (3+ parallel workstreams, cross-layer ownership), the system should recommend Agent Teams and orchestrate them properly — including Team creation, Task distribution from PRDs, progress monitoring, quality gates, and cost tracking.

## Design Decisions

- Agent Teams remain **opt-in and experimental** — never the default
- Subagents are still the standard for simple/medium tasks
- The Decision Matrix is based on: PRD complexity, parallelizability, and cost tolerance
- Team Profiles are YAML files that directly map to Claude Code's Team-Primitives
- `/orchestrate` becomes the central command for Agent Teams workflows
- Plan-First is non-negotiable — no Team without an approved `/plan`

## Acceptance Criteria

### Decision Matrix in Recommendation Engine

- [ ] AC1: Recommendation Engine includes a `suggestTeams` boolean in output based on: number of ACs (>10), number of modules (>2), parallelizable workstreams (>2)
- [ ] AC2: When `suggestTeams: true`, the recommended setup shows: "This project may benefit from Agent Teams (experimental)"
- [ ] AC3: The configurator asks "Enable Agent Teams?" only when recommended — defaults to No
- [ ] AC4: When enabled: sets `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1` in settings.json env

### Team Profile YAML Format

- [ ] AC5: New `system/teams/` directory with YAML profile files (not markdown)
- [ ] AC6: Each profile has: name, description, lead config, teammates[] (name, role, agent specialization, file ownership, model), phases[] (dependencies), quality gates per phase
- [ ] AC7: 5 built-in profiles: web-feature (3), fullstack (5), frontend-only (3), review (2), overnight-build (4)
- [ ] AC8: Profiles are stack-aware — Next.js profiles include nextjs-developer, Python profiles include python-pro
- [ ] AC9: Custom profiles can be added in `.effectum/teams/`

### Enhanced `/orchestrate` Command

- [ ] AC10: `/orchestrate [profile]` loads team profile, creates team via TeamCreate, distributes tasks
- [ ] AC11: `/orchestrate` reads the current PRD + tasks.md to generate team tasks
- [ ] AC12: `/orchestrate status` shows: team members, task progress, messages sent
- [ ] AC13: `/orchestrate nudge [teammate]` sends a message to a stuck teammate
- [ ] AC14: `/orchestrate shutdown` gracefully terminates all teammates
- [ ] AC15: `--plan-first` flag (default: true) — refuses to start without an approved /plan
- [ ] AC16: `--max-cost` flag — sets token budget, warns when 80% consumed

### PRD → Team Task Distribution

- [ ] AC17: When Agent Teams are active, `/prd:handoff` generates team-aware handoff including task distribution per teammate
- [ ] AC18: Each AC in the PRD maps to a task assigned to a specific teammate based on file ownership
- [ ] AC19: Task dependencies from PRD phases map to Claude Code task dependencies

### Hooks Optimization

- [ ] AC20: TeammateIdle hook runs quality checks: did the teammate complete their assigned tasks? Tests passing?
- [ ] AC21: TaskCompleted hook validates: are the task's ACs met? Do tests exist?
- [ ] AC22: Both hooks are configurable in team profile YAML

### Cost Awareness

- [ ] AC23: `/orchestrate` estimates token cost before starting based on team size × expected iterations
- [ ] AC24: User confirms cost estimate before team spawns
- [ ] AC25: Recommendation: Opus for Team Lead, Sonnet for Teammates (cost optimization)

### Documentation

- [ ] AC26: AUTONOMOUS-WORKFLOW.md Section 9.5 updated with new /orchestrate capabilities
- [ ] AC27: docs/teams.md updated with YAML profile format and workflow

## Scope

### In Scope
- Team Profile YAML format + 5 built-in profiles
- Enhanced `/orchestrate` command (create, status, nudge, shutdown, cost)
- Recommendation Engine: suggestTeams logic
- PRD → Team Task distribution
- TeammateIdle + TaskCompleted hook optimization
- Cost estimation
- Documentation updates

### Out of Scope
- Agent Teams as default (always opt-in)
- Custom model per teammate (Claude Code limitation)
- Nested Teams
- Visual Team dashboard
- Agent Teams in the CLI configurator (only in Claude Code commands)

## Technical Design

### Team Profile YAML Schema

```yaml
# system/teams/web-feature.yaml
name: web-feature
description: "Standard web feature with frontend, backend, and tests"
min_acs: 6
recommended_for:
  app_types: [web-app]
  stacks: [nextjs-supabase, nextjs-firebase, nextjs-prisma]

lead:
  role: "Orchestrator — distributes tasks, reviews code, synthesizes results"
  instructions: "Create tasks from the PRD, assign to teammates based on file ownership, monitor progress"

teammates:
  - name: frontend
    agent: frontend-developer
    role: "UI components, pages, styling, responsive design"
    file_ownership: ["src/components/", "src/app/**/page.tsx", "src/app/**/layout.tsx"]
    model_hint: sonnet

  - name: backend
    agent: backend-developer  
    role: "API routes, services, data layer, database"
    file_ownership: ["src/lib/", "src/app/api/", "supabase/"]
    model_hint: sonnet

  - name: testing
    agent: test-automator
    role: "Unit tests, integration tests, E2E tests"
    file_ownership: ["tests/", "e2e/", "**/*.test.*"]
    model_hint: sonnet

phases:
  - name: "Database + Types"
    tasks_for: [backend]
    quality_gate: "Migrations applied, types generated"
  - name: "API + UI (parallel)"  
    tasks_for: [backend, frontend]
    parallel: true
    quality_gate: "API responds, components render"
  - name: "Tests"
    tasks_for: [testing]
    depends_on: ["Database + Types", "API + UI (parallel)"]
    quality_gate: "All tests pass, 80%+ coverage"

cost_estimate:
  min_iterations: 15
  max_iterations: 40
  estimated_tokens: "150k-400k"
```

### Enhanced /orchestrate Flow

```
/orchestrate web-feature

Step 1: Load Profile
  → Read system/teams/web-feature.yaml
  → Validate: PRD exists? /plan approved?

Step 2: Estimate Cost
  → "Estimated cost: 150k-400k tokens (~$1.50-4.00)"
  → "Proceed? (Y/n)"

Step 3: Create Team
  → TeamCreate("web-feature-{prd-id}")

Step 4: Generate Tasks from PRD
  → Read PRD ACs → map to teammates based on file_ownership
  → TaskCreate for each AC, assigned to correct teammate

Step 5: Spawn Teammates
  → Each teammate gets: their role + assigned tasks + file ownership rules

Step 6: Monitor
  → /orchestrate status shows progress
  → TeammateIdle hook checks quality
  → TaskCompleted hook validates ACs

Step 7: Completion
  → All tasks done → Lead synthesizes → /verify → /code-review
  → TeamDelete
```

## Quality Gates

- Team Profile YAML parses correctly
- `/orchestrate web-feature` creates team and distributes tasks from a PRD
- `/orchestrate status` shows accurate progress
- TeammateIdle hook correctly blocks teammate that hasn't finished tasks
- Cost estimate is within 2x of actual cost
- Subagents still work normally when Agent Teams are disabled
- Recommendation Engine correctly suggests Teams for complex PRDs (>10 ACs, >2 modules)

## Completion Promise

"Agent Teams are a first-class opt-in workflow in Effectum with YAML profiles, enhanced /orchestrate command, PRD-based task distribution, cost awareness, and quality gate hooks"
