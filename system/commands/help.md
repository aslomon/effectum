---
name: "Help (alias for /effectum)"
description: "Getting started guide and full command reference. Run this first."
allowed-tools: []
effort: "low"
---

> **Alias:** /help is an alias for /effectum. Both names work identically.

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
/prd:new → /prd:review → /prd:handoff → [open target repo] → /run
```

**2. EXISTING CODEBASE** — Bring an existing project into Effectum

```
/onboard → /prd:new → /prd:review → /prd:handoff → /run
```

**3. FEATURE BUILD** — Add a feature to a project already under Effectum

```
/prd:new → /save → /run
```

### Command Reference

Then print all commands grouped into 8 categories. Use a table for each group with columns: Command | Description | When to use.

**Navigation**

| Command     | Description                                                    | When to use                     |
| ----------- | -------------------------------------------------------------- | ------------------------------- |
| `/effectum` | Getting started guide and full command reference               | First time using Effectum       |
| `/help`     | Alias for /effectum                                            | Anytime you need help           |
| `/next`     | Reads project state and recommends the single best next action | When you're not sure what to do |

**Core Workflow**

| Command           | Description                                     | When to use                         |
| ----------------- | ----------------------------------------------- | ----------------------------------- |
| `/plan`           | Create implementation plan, wait for approval   | Before starting any feature         |
| `/tdd`            | Test-driven development: RED → GREEN → REFACTOR | Writing code test-first             |
| `/verify`         | Run all quality gates and report pass/fail      | After implementation, before commit |
| `/code-review`    | Security and code quality review                | Before merging                      |
| `/e2e`            | Write and run end-to-end tests                  | Testing critical user journeys      |
| `/build-fix`      | Incrementally fix build and type errors         | When the build is broken            |
| `/refactor-clean` | Remove dead code and improve quality            | Periodic cleanup                    |

**Autonomous**

| Command                    | Description                              | When to use                      |
| -------------------------- | ---------------------------------------- | -------------------------------- |
| `/ralph-loop` (`/run`)     | Autonomous iterative implementation loop | Hands-off feature implementation |
| `/cancel-ralph` (`/stop`)  | Gracefully cancel a running loop         | Need to stop the loop            |
| `/checkpoint` (`/save`)    | Create a tagged git restore point        | Before risky changes             |
| `/forensics` (`/diagnose`) | Post-mortem diagnosis for loop failures  | Loop failed or got stuck         |
| `/orchestrate`             | Manage Agent Teams (requires opt-in)     | Complex multi-agent tasks        |

**Spec**

| Command            | Description                              | When to use                         |
| ------------------ | ---------------------------------------- | ----------------------------------- |
| `/prd:new`         | Start a new PRD workshop session         | Beginning a new feature             |
| `/prd:express`     | Quick PRD from structured input          | When you know exactly what you want |
| `/prd:discuss`     | Deep-dive discussion for a specific PRD  | Clarifying requirements             |
| `/prd:decompose`   | Split large scope into multiple PRDs     | Feature is too big for one PRD      |
| `/prd:review`      | Quality review and readiness scoring     | Before handoff                      |
| `/prd:update`      | Update existing PRD with change tracking | Requirements changed                |
| `/prd:handoff`     | Export PRD as handoff package            | Ready to implement                  |
| `/prd:status`      | Dashboard of all projects and PRDs       | Overview of all work                |
| `/prd:resume`      | Resume work on an existing project/PRD   | Picking up where you left off       |
| `/prd:network-map` | Create/update project network map        | Visualizing project structure       |

**Onboarding**

| Command                      | Description                                                | When to use                      |
| ---------------------------- | ---------------------------------------------------------- | -------------------------------- |
| `/onboard`                   | Reverse-engineer existing project into Effectum            | Bringing in an existing codebase |
| `/onboard:review`            | Review onboarded PRDs for consistency                      | After onboarding                 |
| `/map-codebase` (`/explore`) | Spawn 4 parallel agents to produce codebase knowledge docs | Understanding a new codebase     |

**Project**

| Command            | Description                                                    | When to use                      |
| ------------------ | -------------------------------------------------------------- | -------------------------------- |
| `/project:init`    | Create directory structure and templates for a new project     | Starting a new project workspace |
| `/project:archive` | Archive a completed project                                    | Project is done                  |
| `/context:init`    | Interactive interview to populate project context in CLAUDE.md | Setting up project context       |

**Design**

| Command   | Description                             | When to use               |
| --------- | --------------------------------------- | ------------------------- |
| `/design` | Generate DESIGN.md visual specification | Before any UI/design work |

**Setup**

| Command  | Description                              | When to use              |
| -------- | ---------------------------------------- | ------------------------ |
| `/setup` | Install Effectum workflow into a project | First-time project setup |

### Deprecated Commands

| Old Name            | New Name           | Removed in |
| ------------------- | ------------------ | ---------- |
| `/workshop:init`    | `/project:init`    | v0.19      |
| `/workshop:archive` | `/project:archive` | v0.19      |
| `/effectum:init`    | `/context:init`    | v0.19      |

### What's Next?

Print: "Type `/next` for a personalized recommendation based on your project state."

## Communication

Follow the language settings defined in CLAUDE.md for user-facing communication.
All command tables and technical content in English.
