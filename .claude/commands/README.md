# Effectum Commands

## Standard Workflow

```
/plan → /tdd → /verify → /code-review
```

## Autonomous

```
/ralph-loop (combines plan + tdd + verify in a loop)
```

## PRD Workshop

```
/prd:new → /prd:discuss → /prd:decompose → /prd:review → /prd:handoff
```

## Command Reference

### Planning

| Command   | Description                                   |
| --------- | --------------------------------------------- |
| `/plan`   | Create implementation plan, wait for approval |
| `/design` | Generate DESIGN.md visual specification       |

### Implementation

| Command       | Description                                     |
| ------------- | ----------------------------------------------- |
| `/tdd`        | Test-driven development: RED → GREEN → REFACTOR |
| `/ralph-loop` | Autonomous iterative implementation loop        |
| `/build-fix`  | Incrementally fix build and type errors         |

### Quality

| Command           | Description                                |
| ----------------- | ------------------------------------------ |
| `/verify`         | Run all quality gates and report pass/fail |
| `/code-review`    | Security and code quality review           |
| `/e2e`            | Write and run end-to-end tests             |
| `/refactor-clean` | Remove dead code and improve quality       |

### Git

| Command       | Description                       |
| ------------- | --------------------------------- |
| `/checkpoint` | Create a tagged git restore point |

### Loop Control

| Command         | Description                            |
| --------------- | -------------------------------------- |
| `/cancel-ralph` | Gracefully cancel a running Ralph Loop |

### Orchestration

| Command        | Description                          |
| -------------- | ------------------------------------ |
| `/orchestrate` | Manage Agent Teams (requires opt-in) |

### Setup

| Command           | Description                                     |
| ----------------- | ----------------------------------------------- |
| `/setup`          | Install Effectum workflow into a project        |
| `/onboard`        | Reverse-engineer existing project into Effectum |
| `/onboard:review` | Review onboarded PRDs for consistency           |

### PRD Workshop

| Command            | Description                              |
| ------------------ | ---------------------------------------- |
| `/prd:new`         | Start a new PRD workshop session         |
| `/prd:express`     | Quick PRD from structured input          |
| `/prd:discuss`     | Deep-dive discussion for a specific PRD  |
| `/prd:decompose`   | Split large scope into multiple PRDs     |
| `/prd:review`      | Quality review and readiness scoring     |
| `/prd:update`      | Update existing PRD with change tracking |
| `/prd:handoff`     | Export PRD as handoff package            |
| `/prd:prompt`      | Generate handoff prompt for a PRD        |
| `/prd:resume`      | Resume work on an existing project/PRD   |
| `/prd:status`      | Dashboard of all projects and PRDs       |
| `/prd:network-map` | Create/update project network map        |

### Workshop

| Command             | Description                        |
| ------------------- | ---------------------------------- |
| `/workshop:init`    | Initialize a new project workspace |
| `/workshop:archive` | Archive a completed project        |
