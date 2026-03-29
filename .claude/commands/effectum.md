---
name: "Effectum Help"
description: "Getting started guide and full command reference. Run this first."
allowed-tools: []
effort: "low"
---

# /effectum — Getting Started & Command Reference

You output a formatted getting-started card followed by the full command reference. No tools needed — this is pure informational output.

## Output the Following

### Getting Started

Print this card:

```
╭─────────────────────────────────────────────╮
│  EFFECTUM — Autonomous Development Workflow │
╰─────────────────────────────────────────────╯
```

Then print three numbered journeys:

**1. NEW PROJECT** — Start from scratch

```
effect:prd:new → effect:prd:review → effect:prd:handoff → [open target repo] → effect:dev:run
```

**2. EXISTING CODEBASE** — Bring an existing project into Effectum

```
effectum:onboard → effect:prd:new → effect:prd:review → effect:prd:handoff → effect:dev:run
```

**3. FEATURE BUILD** — Add a feature to a project already under Effectum

```
effect:prd:new → effect:dev:save → effect:dev:run
```

### Command Reference

Then print all commands grouped by namespace tier. Use a table for each group with columns: Command | Description | When to use.

**Entry Point**

| Command     | Description                                      | When to use               |
| ----------- | ------------------------------------------------ | ------------------------- |
| `/effectum` | Getting started guide and full command reference | First time using Effectum |
| `/help`     | Alias for `/effectum`                            | Anytime you need help     |

**System Commands (effectum:\*)**

| Command                   | Description                                                | When to use                      |
| ------------------------- | ---------------------------------------------------------- | -------------------------------- |
| `effectum:setup`          | Install Effectum workflow into a project                   | First-time project setup         |
| `effectum:init`           | Interactive interview to populate project context          | Setting up project context       |
| `effectum:status`         | Project dashboard: version, stack, PRDs, health            | Orientation and diagnostics      |
| `effectum:archive`        | Archive a completed project                                | Project is done                  |
| `effectum:onboard`        | Reverse-engineer existing project into Effectum            | Bringing in an existing codebase |
| `effectum:onboard:review` | Review onboarded PRDs for consistency                      | After onboarding                 |
| `effectum:explore`        | Spawn 4 parallel agents to produce codebase knowledge docs | Understanding a new codebase     |

**Navigation**

| Command       | Description                                                    | When to use                     |
| ------------- | -------------------------------------------------------------- | ------------------------------- |
| `effect:next` | Reads project state and recommends the single best next action | When you're not sure what to do |

**Spec (effect:prd:\*)**

| Command                  | Description                              | When to use                         |
| ------------------------ | ---------------------------------------- | ----------------------------------- |
| `effect:prd:new`         | Start a new PRD workshop session         | Beginning a new feature             |
| `effect:prd:express`     | Quick PRD from structured input          | When you know exactly what you want |
| `effect:prd:discuss`     | Deep-dive discussion for a specific PRD  | Clarifying requirements             |
| `effect:prd:decompose`   | Split large scope into multiple PRDs     | Feature is too big for one PRD      |
| `effect:prd:review`      | Quality review and readiness scoring     | Before handoff                      |
| `effect:prd:update`      | Update existing PRD with change tracking | Requirements changed                |
| `effect:prd:handoff`     | Export PRD as handoff package            | Ready to implement                  |
| `effect:prd:status`      | Dashboard of all projects and PRDs       | Overview of all work                |
| `effect:prd:resume`      | Resume work on an existing project/PRD   | Picking up where you left off       |
| `effect:prd:network-map` | Create/update project network map        | Visualizing project structure       |

**Implementation (effect:dev:\*)**

| Command               | Description                                     | When to use                         |
| --------------------- | ----------------------------------------------- | ----------------------------------- |
| `effect:dev:plan`     | Create implementation plan, wait for approval   | Before starting any feature         |
| `effect:dev:tdd`      | Test-driven development: RED → GREEN → REFACTOR | Writing code test-first             |
| `effect:dev:verify`   | Run all quality gates and report pass/fail      | After implementation, before commit |
| `effect:dev:review`   | Security and code quality review                | Before merging                      |
| `effect:dev:e2e`      | Write and run end-to-end tests                  | Testing critical user journeys      |
| `effect:dev:fix`      | Incrementally fix build and type errors         | When the build is broken            |
| `effect:dev:refactor` | Remove dead code and improve quality            | Periodic cleanup                    |

**Autonomous (effect:dev:\*)**

| Command                          | Description                              | When to use                      |
| -------------------------------- | ---------------------------------------- | -------------------------------- |
| `effect:dev:run` (`/ralph-loop`) | Autonomous iterative implementation loop | Hands-off feature implementation |
| `effect:dev:stop`                | Gracefully cancel a running loop         | Need to stop the loop            |
| `effect:dev:save`                | Create a tagged git restore point        | Before risky changes             |
| `effect:dev:diagnose`            | Post-mortem diagnosis for loop failures  | Loop failed or got stuck         |
| `effect:dev:orchestrate`         | Manage Agent Teams (requires opt-in)     | Complex multi-agent tasks        |

**Design**

| Command         | Description                             | When to use               |
| --------------- | --------------------------------------- | ------------------------- |
| `effect:design` | Generate DESIGN.md visual specification | Before any UI/design work |

### Permanent Aliases

| Alias         | Points to        | Why permanent          |
| ------------- | ---------------- | ---------------------- |
| `/ralph-loop` | `effect:dev:run` | Brand name             |
| `/help`       | `/effectum`      | Universal help command |

### Deprecated Commands (removed in v0.20)

| Old Name            | New Name                           |
| ------------------- | ---------------------------------- |
| `/setup`            | `effectum:setup`                   |
| `/context:init`     | `effectum:init`                    |
| `/project:init`     | `effectum:setup`                   |
| `/project:archive`  | `effectum:archive`                 |
| `/onboard`          | `effectum:onboard`                 |
| `/onboard:review`   | `effectum:onboard:review`          |
| `/map-codebase`     | `effectum:explore`                 |
| `/explore`          | `effectum:explore`                 |
| `/next`             | `effect:next`                      |
| `/plan`             | `effect:dev:plan`                  |
| `/tdd`              | `effect:dev:tdd`                   |
| `/verify`           | `effect:dev:verify`                |
| `/code-review`      | `effect:dev:review`                |
| `/e2e`              | `effect:dev:e2e`                   |
| `/build-fix`        | `effect:dev:fix`                   |
| `/refactor-clean`   | `effect:dev:refactor`              |
| `/run`              | `effect:dev:run`                   |
| `/cancel-ralph`     | `effect:dev:stop`                  |
| `/stop`             | `effect:dev:stop`                  |
| `/checkpoint`       | `effect:dev:save`                  |
| `/save`             | `effect:dev:save`                  |
| `/forensics`        | `effect:dev:diagnose`              |
| `/diagnose`         | `effect:dev:diagnose`              |
| `/orchestrate`      | `effect:dev:orchestrate`           |
| `/design`           | `effect:design`                    |
| `/prd:new`          | `effect:prd:new`                   |
| `/prd:express`      | `effect:prd:express`               |
| `/prd:review`       | `effect:prd:review`                |
| `/prd:handoff`      | `effect:prd:handoff`               |
| `/prd:update`       | `effect:prd:update`                |
| `/prd:discuss`      | `effect:prd:discuss`               |
| `/prd:decompose`    | `effect:prd:decompose`             |
| `/prd:resume`       | `effect:prd:resume`                |
| `/prd:status`       | `effect:prd:status`                |
| `/prd:network-map`  | `effect:prd:network-map`           |
| `/prd:prompt`       | `effect:prd:handoff --prompt-only` |
| `/workshop:init`    | `effectum:setup`                   |
| `/workshop:archive` | `effectum:archive`                 |
| `/effectum:init`    | `effectum:init`                    |

### What's Next?

Print: "Type `effect:next` for a personalized recommendation based on your project state, or `effectum:status` for a project health dashboard."

## Communication

Follow the language settings defined in CLAUDE.md for user-facing communication.
All command tables and technical content in English.
