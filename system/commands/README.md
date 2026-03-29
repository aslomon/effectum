# Effectum Commands

> **New?** Run `/effectum` for the getting started guide.
> **Lost?** Run `effect:next` to get a personalized recommendation.

## Quick Reference

| Namespace      | Purpose             | Example                               |
| -------------- | ------------------- | ------------------------------------- |
| `/effectum`    | Entry point         | `/effectum`                           |
| `effectum:*`   | System & setup      | `effectum:setup`, `effectum:onboard`  |
| `effect:prd:*` | Spec & planning     | `effect:prd:new`, `effect:prd:review` |
| `effect:dev:*` | Implementation      | `effect:dev:run`, `effect:dev:plan`   |
| `effect:*`     | Design & navigation | `effect:design`, `effect:next`        |

## Entry Point

| Command     | Description                                      | When to use               |
| ----------- | ------------------------------------------------ | ------------------------- |
| `/effectum` | Getting started guide and full command reference | First time using Effectum |
| `/help`     | Permanent alias for `/effectum`                  | Anytime you need help     |

## System Commands (effectum:\*)

### Setup & Installation

| Command            | Description                                       | When to use                |
| ------------------ | ------------------------------------------------- | -------------------------- |
| `effectum:setup`   | Install Effectum workflow into a project          | First-time project setup   |
| `effectum:init`    | Interactive interview to populate project context | Setting up project context |
| `effectum:archive` | Archive a completed project                       | Project is done            |

### Codebase Analysis

| Command                   | Description                                                | When to use                      |
| ------------------------- | ---------------------------------------------------------- | -------------------------------- |
| `effectum:onboard`        | Reverse-engineer existing project into Effectum            | Bringing in an existing codebase |
| `effectum:onboard:review` | Review onboarded PRDs for consistency                      | After onboarding                 |
| `effectum:explore`        | Spawn 4 parallel agents to produce codebase knowledge docs | Understanding a new codebase     |

### Dashboard

| Command           | Description                                     | When to use                 |
| ----------------- | ----------------------------------------------- | --------------------------- |
| `effectum:status` | Project dashboard: version, stack, PRDs, health | Orientation and diagnostics |

## Pipeline Commands (effect:\*)

### Navigation

| Command       | Description                                                    | When to use                     |
| ------------- | -------------------------------------------------------------- | ------------------------------- |
| `effect:next` | Reads project state and recommends the single best next action | When you're not sure what to do |

### Spec (effect:prd:\*)

| Command                  | Description                                              | When to use                         |
| ------------------------ | -------------------------------------------------------- | ----------------------------------- |
| `effect:prd:new`         | Start a new PRD workshop session                         | Beginning a new feature             |
| `effect:prd:express`     | Quick PRD from structured input                          | When you know exactly what you want |
| `effect:prd:discuss`     | Deep-dive discussion for a specific PRD                  | Clarifying requirements             |
| `effect:prd:decompose`   | Split large scope into multiple PRDs                     | Feature is too big for one PRD      |
| `effect:prd:review`      | Quality review and readiness scoring                     | Before handoff                      |
| `effect:prd:update`      | Update existing PRD with change tracking                 | Requirements changed                |
| `effect:prd:handoff`     | Export PRD as handoff package (supports `--prompt-only`) | Ready to implement                  |
| `effect:prd:status`      | Dashboard of all projects and PRDs                       | Overview of all work                |
| `effect:prd:resume`      | Resume work on an existing project/PRD                   | Picking up where you left off       |
| `effect:prd:network-map` | Create/update project network map                        | Visualizing project structure       |

### Implementation (effect:dev:\*)

| Command               | Description                                     | When to use                         |
| --------------------- | ----------------------------------------------- | ----------------------------------- |
| `effect:dev:plan`     | Create implementation plan, wait for approval   | Before starting any feature         |
| `effect:dev:tdd`      | Test-driven development: RED → GREEN → REFACTOR | Writing code test-first             |
| `effect:dev:verify`   | Run all quality gates and report pass/fail      | After implementation, before commit |
| `effect:dev:review`   | Security and code quality review                | Before merging                      |
| `effect:dev:e2e`      | Write and run end-to-end tests                  | Testing critical user journeys      |
| `effect:dev:fix`      | Incrementally fix build and type errors         | When the build is broken            |
| `effect:dev:refactor` | Remove dead code and improve quality            | Periodic cleanup                    |

### Autonomous (effect:dev:\*)

| Command                          | Description                              | When to use                      |
| -------------------------------- | ---------------------------------------- | -------------------------------- |
| `effect:dev:run` (`/ralph-loop`) | Autonomous iterative implementation loop | Hands-off feature implementation |
| `effect:dev:stop`                | Gracefully cancel a running loop         | Need to stop the loop            |
| `effect:dev:save`                | Create a tagged git restore point        | Before risky changes             |
| `effect:dev:diagnose`            | Post-mortem diagnosis for loop failures  | Loop failed or got stuck         |
| `effect:dev:orchestrate`         | Manage Agent Teams (requires opt-in)     | Complex multi-agent tasks        |

### Design

| Command         | Description                             | When to use               |
| --------------- | --------------------------------------- | ------------------------- |
| `effect:design` | Generate DESIGN.md visual specification | Before any UI/design work |

## Permanent Aliases (never deprecated)

| Alias         | Points to        | Why permanent          |
| ------------- | ---------------- | ---------------------- |
| `/ralph-loop` | `effect:dev:run` | Brand name             |
| `/help`       | `/effectum`      | Universal help command |

## Deprecated Aliases (→ removal in v0.20)

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
