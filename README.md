<div align="center">

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="docs/logo-dark.svg">
  <source media="(prefers-color-scheme: light)" srcset="docs/logo-light.svg">
  <img src="docs/logo-light.svg" alt="effectum" width="280">
</picture>

<br><br>

### Describe what you want. Get production-ready code.

_Effectum (Latin): the result, the accomplishment — that which has been brought to completion._

[![npm](https://img.shields.io/npm/v/@aslomon/effectum.svg)](https://www.npmjs.com/package/@aslomon/effectum)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Claude Code](https://img.shields.io/badge/Built%20for-Claude%20Code-blueviolet)](https://claude.ai/claude-code)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)
[![Version](https://img.shields.io/badge/version-0.10.0-orange)](CHANGELOG.md)
[![Website](https://img.shields.io/badge/Website-aslomon.github.io%2Feffectum-D97706)](https://aslomon.github.io/effectum/)

<br>

[Quick Start](#-quick-start) · [Configurator](#-configurator) · [The Workflow](#-the-workflow) · [PRD Lifecycle](#-prd-lifecycle) · [Project Onboarding](#-project-onboarding) · [Foundation](#-foundation) · [How is this different?](#-how-is-this-different) · [Website](https://aslomon.github.io/effectum/)

</div>

---

> Built by Jason Salomon-Rinnert. Works for me — might work for you. MIT licensed, PRs welcome.

## Why I built this

I'm a solo developer who builds everything with Claude Code. I tried BMAD, SpecKit, Taskmaster, GSD — they all taught me something. BMAD was too enterprise. SpecKit too rigid. GSD is brilliant at context engineering but doesn't help you write the spec in the first place.

So I built Effectum. It combines what I learned from all of them: structured specifications (like SpecKit), autonomous execution (like GSD's approach), and quality gates that actually enforce standards.

**v0.9.0 is a different animal.** The original was a workflow tool. This is closer to a development operating system. There's now an intelligent configurator that detects your stack and sets everything up in four steps. There's a full PRD lifecycle with changelogs, semantic diffs, and delta handoffs. And there's `/onboard` — my personal favorite — which drops 6 parallel agents into any unfamiliar codebase and produces a complete understanding of it in minutes.

The result: from zero to autonomous development, for any stack, any language, with the quality gates that make overnight builds actually trustworthy.

This isn't a new idea — it's the best combination of existing ideas I've found, packaged so it actually works.

---

## 🚀 Quick Start

```bash
npx @aslomon/effectum
```

The interactive configurator detects your stack, asks what you're building, and sets everything up.

```bash
# Open Claude Code in your project
cd ~/my-project && claude

# Onboard an existing codebase (new in v0.9.0!)
/onboard

# Or write a specification and build from scratch
/prd:new
/plan docs/prds/001-my-feature.md
```

> [!TIP]
> New project? `/prd:new` → `/plan` → `/ralph-loop`. Existing codebase? Start with `/onboard` — it gives Claude a complete picture of what you already have.

### Install options

```bash
npx @aslomon/effectum                   # Interactive configurator (recommended)
npx @aslomon/effectum --global          # Install to ~/.claude/ for all projects
npx @aslomon/effectum --local           # Install to ./.claude/ for this project only
npx @aslomon/effectum --global --claude # Non-interactive, Claude Code runtime
```

<details>
<summary><strong>Prefer the classic git approach?</strong></summary>

```bash
git clone https://github.com/aslomon/effectum.git
cd effectum
claude
/setup ~/my-project
```

</details>

---

## 📦 What's Included

One command. Everything you need for autonomous Claude Code development.

| What                          | Details                                                                                                              |
| ----------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| **Intelligent Configurator**  | Stack auto-detection, 8 quick presets, 16 languages, guided CLI tool install                                        |
| **17 workflow commands**      | `/plan`, `/tdd`, `/verify`, `/e2e`, `/code-review`, `/build-fix`, `/refactor-clean`, `/ralph-loop`, `/cancel-ralph`, `/checkpoint`, `/prd:new`, `/prd:update`, `/prd:review`, `/prd:handoff`, `/prd:network-map`, `/onboard`, `/onboard:review` |
| **PRD Lifecycle**             | Frontmatter, changelog, semantic diff, delta handoffs, task registry, network map auto-sync                         |
| **Project Onboarding**        | 6 parallel analysis agents, 7-point self-test loop, per-area PRDs, interactive HTML network map                     |
| **19 Agent Specializations**  | Pre-configured agent roles with distinct behaviors for planning, TDD, review, security, and more                    |
| **22+ Skills**                | Reusable capability blocks attached to agent roles                                                                   |
| **7 Stack Presets + 8 Quick** | Next.js+Supabase, Python+FastAPI, Swift/SwiftUI, Go+Echo, Django+PostgreSQL, Rust+Actix, Generic + Firebase, Prisma, Flutter…   |
| **Quality gates**             | 8 automated checks (build, types, lint, tests, security, etc.)                                                       |
| **Foundation Hooks**          | Always-on: secret detection, TDD enforcement, guardrails                                                             |
| **Extensible**                | JSON-based tool definitions + detection rules, community presets + blocks                                            |

---

## 🎯 How It Works

Effectum has three parts that work together:

<table>
<tr>
<td width="33%" valign="top">

### ⚙️ The Configurator

Sets up your project intelligently — detects your stack, recommends settings, and configures everything in four steps:

- App type + intent → recommended setup
- Ecosystem → Framework → DB → Deploy
- 8 quick presets for instant start
- 16 languages + custom

**One command: `npx @aslomon/effectum`**

</td>
<td width="33%" valign="top">

### 📋 The PRD Lifecycle

Write, evolve, and track specifications across the life of a project:

- Guided writing + semantic diffs
- Changelog + frontmatter
- Task registry (tasks.md)
- Network Map auto-sync
- PRD-hash detection in Ralph Loop

**One command: `/prd:new`**

</td>
<td width="33%" valign="top">

### 🔍 Project Onboarding

Drop into any unfamiliar codebase and understand it completely:

- 6 parallel analysis agents
- 7-point self-test loop
- PRDs per feature area
- Interactive HTML network map

**One command: `/onboard`**

</td>
</tr>
</table>

```mermaid
graph LR
    A["💡 Your Idea"] --> B["⚙️ Configurator\nStack Detection"]
    B --> C["📋 PRD Lifecycle\nSpec & Tracking"]
    C --> D["/plan\nAnalyze & Plan"]
    D --> E["/tdd\nTests → Code"]
    E --> F["/verify\nQuality Gates"]
    F --> G["/code-review\nSecurity Audit"]
    G --> H["✅ Production Code"]

    style A fill:#fef3c7,stroke:#f59e0b,color:#92400e
    style B fill:#fde8d8,stroke:#f97316,color:#9a3412
    style C fill:#e0e7ff,stroke:#6366f1,color:#3730a3
    style D fill:#f3f4f6,stroke:#9ca3af,color:#374151
    style E fill:#f3f4f6,stroke:#9ca3af,color:#374151
    style F fill:#f3f4f6,stroke:#9ca3af,color:#374151
    style G fill:#f3f4f6,stroke:#9ca3af,color:#374151
    style H fill:#dcfce7,stroke:#22c55e,color:#166534
```

---

## ⚙️ Configurator

The configurator is what makes Effectum genuinely approachable for any stack. You don't configure Effectum — Effectum figures out what you need and configures itself.

### Intelligent Setup Recommender

Tell it what type of app you're building and what you want to accomplish. It maps your input to a recommended stack and workflow configuration.

```
What are you building?
> A multi-tenant SaaS with Stripe billing and a REST API

Recommended setup:
  ✓ Stack: Next.js + Supabase
  ✓ Auth: Supabase RLS + JWT
  ✓ Payments: Stripe webhook pattern
  ✓ Testing: Vitest + Playwright
  ✓ Deploy: Vercel
```

### Smart Auto-Detection

Drop it into any project and it reads your existing config files to detect your stack automatically:

| File detected              | Stack recognized        |
| -------------------------- | ----------------------- |
| `package.json`             | Node.js / framework     |
| `next.config.*`            | Next.js                 |
| `pyproject.toml`           | Python ecosystem        |
| `go.mod`                   | Go                      |
| `Package.swift`            | Swift / SPM             |
| `pubspec.yaml`             | Flutter / Dart          |
| `requirements.txt`         | Python (legacy)         |
| `Cargo.toml`               | Rust                    |

### Modular Stack Selection (4 Steps)

If auto-detection doesn't nail it, or you want to be explicit:

```
Step 1/4: Ecosystem    → Node.js / Python / Go / Swift / Dart / …
Step 2/4: Framework    → Next.js / FastAPI / Echo / SwiftUI / …
Step 3/4: Database     → Supabase / PostgreSQL / Firebase / SQLite / …
Step 4/4: Deploy       → Vercel / Railway / Fly.io / App Store / …
```

### 8 Quick Presets

One click. Instantly configured.

| Preset                    | Stack                               |
| ------------------------- | ----------------------------------- |
| **Next.js + Supabase**    | Full-stack web, TypeScript          |
| **Python + FastAPI**      | API backend, Pydantic               |
| **Swift / SwiftUI**       | iOS / macOS native                  |
| **Go + Echo**             | High-performance API                |
| **Django + PostgreSQL**   | Python web, ORM-first               |
| **Generic**               | Stack-agnostic, customize freely    |
| **+ Firebase**            | Any framework + Firebase backend    |
| **+ Prisma**              | Any framework + Prisma ORM          |
| **+ Flutter**             | Cross-platform mobile               |

### Language & CLI Setup

- **16 languages supported** + custom
- CLI tool check on install: detects what's missing (`brew`, `pipx`, `go`, `swiftpm`, etc.)
- Guided installation walkthrough when tools are absent — no silent failures

---

## 🔧 The Workflow

20+ commands. Each does exactly one thing, and does it well.

### Core Build Cycle

| Command            | What it does                                                           |
| ------------------ | ---------------------------------------------------------------------- |
| `/plan`            | Read spec, explore codebase, produce a plan — **waits for your OK**   |
| `/tdd`             | Failing test → passing code → refactor → repeat                       |
| `/verify`          | Run all 8 quality gates                                                |
| `/code-review`     | Security audit, architecture review, rating by severity                |
| `/build-fix`       | Targeted fix loop for a specific failing build or test                 |
| `/refactor-clean`  | Clean up code without changing behavior                                |
| `/e2e`             | End-to-end test run with Playwright                                    |

### Autonomy & Control

| Command            | What it does                                                                   |
| ------------------ | ------------------------------------------------------------------------------ |
| `/ralph-loop`      | Autonomous build loop — writes, tests, fixes, iterates until done              |
| `/cancel-ralph`    | Stop the loop cleanly, preserve state                                          |
| `/checkpoint`      | Snapshot current state (git + test results + notes)                           |

### PRD Commands

| Command              | What it does                                                           |
| -------------------- | ---------------------------------------------------------------------- |
| `/prd:new`           | Start a new specification (guided workshop)                            |
| `/prd:update`        | Evolve an existing spec — tracks changes semantically                 |
| `/prd:review`        | Quality check — is this spec ready for implementation?                |
| `/prd:handoff`       | Delta handoff: what changed since last implementation run             |
| `/prd:network-map`   | Render PRD dependencies as interactive HTML map                        |

### Onboarding

| Command            | What it does                                                           |
| ------------------ | ---------------------------------------------------------------------- |
| `/onboard`         | Full codebase analysis with 6 parallel agents + self-test loop         |
| `/onboard:review`  | Re-run onboarding review after significant changes                     |

---

### `/ralph-loop` — Build while you sleep

> [!IMPORTANT]
> This is the most powerful feature.

```bash
/ralph-loop "Build the auth system"
  --max-iterations 30
  --completion-promise "All tests pass, build succeeds, 0 lint errors"
```

Claude works autonomously — writing code, running tests, fixing errors, iterating — until **every quality gate passes**. It only stops when the promise is 100% true.

**You go to sleep. You wake up to a working feature.**

Starting in v0.9.0, Ralph Loop also detects PRD changes mid-run via PRD-hash comparison. If your spec was updated while the loop was running, it pauses and reconciles before continuing.

<details>
<summary><strong>🔄 How Ralph Loop works internally</strong></summary>

<br>

```mermaid
graph TD
    A["Start: Read PRD\n+ Compute PRD Hash"] --> B["Check current state\n(git diff, tests)"]
    B --> B2{"PRD hash\nchanged?"}
    B2 -- Yes --> B3["Reconcile\nspec changes"]
    B3 --> B
    B2 -- No --> C["Implement next step"]
    C --> D["Run quality gates"]
    D --> E{"All gates\npass?"}
    E -- No --> F{"Same error\n3+ times?"}
    F -- No --> B
    F -- Yes --> G["Try different approach"]
    G --> B
    E -- Yes --> H{"Completion\npromise true?"}
    H -- No --> B
    H -- Yes --> I["✅ Output promise\nDone!"]

    D --> J{"80% iterations\nused?"}
    J -- Yes --> K["📝 Write status report"]
    K --> B

    style I fill:#dcfce7,stroke:#22c55e
    style A fill:#e0e7ff,stroke:#6366f1
    style B3 fill:#fef3c7,stroke:#f59e0b
```

- **PRD-hash detection**: if your spec changes mid-run, the loop reconciles before continuing
- **Built-in error recovery**: reads errors, tries alternatives, documents blockers
- **Status report at 80%**: if running low on iterations, writes what's done and what's left
- **Honest promises**: the completion promise is ONLY output when 100% true

</details>

---

### `/verify` — Every quality gate, every time

| Gate           | What it checks              | Standard                |
| -------------- | --------------------------- | ----------------------- |
| 🔨 Build       | Compiles without errors     | 0 errors                |
| 📐 Types       | Type safety                 | 0 errors                |
| 🧹 Lint        | Clean code style            | 0 warnings              |
| 🧪 Tests       | Test suite                  | All pass, 80%+ coverage |
| 🔒 Security    | OWASP vulnerabilities       | None found              |
| 🚫 Debug logs  | `console.log` in production | 0 occurrences           |
| 🛡️ Type safety | `any` or unsafe casts       | None                    |
| 📏 File size   | Oversized files             | Max 300 lines           |

---

## 📋 PRD Lifecycle

Specifications aren't static. They evolve. v0.9.0 treats PRDs as living documents with full version control, semantic diffing, and automatic synchronization across your project.

### Frontmatter & Changelog

Every PRD now has structured frontmatter:

```yaml
---
id: prd-001
title: Auth System
status: in-progress
version: 1.3.0
created: 2026-01-15
updated: 2026-03-20
hash: a3f8d2c1
authors:
  - jason
implements:
  - prd-000-foundation
affects:
  - tasks.md
  - docs/network-map.html
---
```

And an auto-maintained changelog at the bottom:

```markdown
## Changelog
- v1.3.0 (2026-03-20): Added rate limiting spec, revised token refresh flow
- v1.2.0 (2026-03-10): Expanded RLS policy section
- v1.1.0 (2026-02-28): Added 2FA requirements
- v1.0.0 (2026-01-15): Initial specification
```

### Semantic Diff

`/prd:update` doesn't just append changes — it understands what changed and why:

```
Semantic diff v1.2.0 → v1.3.0:

  ADDED    Rate limiting requirements (3 acceptance criteria)
  REVISED  Token refresh flow — expiry window changed: 24h → 7d
  REMOVED  Session cookie approach (replaced by JWT)
  UNCHANGED Data model, API endpoints, security requirements
```

This diff is what powers delta handoffs.

### Delta Handoff

`/prd:handoff` produces a focused summary of what changed since the last implementation run. Instead of handing Claude the full PRD every time, it gets a precise delta:

```
Handoff delta (v1.2.0 → v1.3.0):

  NEW WORK:
  - Implement rate limiter middleware (3 new tests required)
  - Update token expiry from 24h to 7d in auth service

  REMOVE:
  - Delete session cookie handler (replaced — see JWT module)

  UNCHANGED — no action needed:
  - Data model, user stories, error codes
```

This is what makes Ralph Loop so much more reliable on evolving projects.

### Task Registry

`tasks.md` is auto-generated and kept in sync with your PRDs:

```markdown
# Task Registry

## prd-001 · Auth System (v1.3.0)

- [x] JWT token generation
- [x] Supabase RLS policies
- [ ] Rate limiter middleware        ← added in v1.3.0
- [ ] Token expiry update: 24h → 7d ← changed in v1.3.0
- [ ] Remove session cookie handler  ← deprecated in v1.3.0

Last synced: 2026-03-20T14:32:00Z
```

### Network Map Auto-Sync

`/prd:network-map` renders your PRD dependency graph as an interactive HTML file. With auto-sync enabled, it regenerates whenever a PRD changes.

```
docs/network-map.html  ← open in browser, zoom, click nodes
```

---

## 🔍 Project Onboarding

This is the feature I'm most excited about in v0.9.0. `/onboard` solves a real problem: dropping into an unfamiliar codebase (or coming back to your own after months away) and needing to get up to speed fast.

### How It Works

Run `/onboard` in any project directory. Effectum spawns **6 parallel analysis agents**, each with a specific lens:

| Agent                   | Focus                                                        |
| ----------------------- | ------------------------------------------------------------ |
| 🏗️ **Architecture**     | Directory structure, module boundaries, dependency graph     |
| 🗄️ **Data Model**       | Schemas, migrations, RLS policies, relationships             |
| 🔌 **API Surface**      | Endpoints, contracts, authentication patterns                |
| 🧪 **Test Coverage**    | What's tested, what's not, test quality assessment           |
| 🔒 **Security**         | Auth flows, secret handling, known vulnerability patterns    |
| 📦 **Dependencies**     | Packages, versions, outdated or risky dependencies           |

### Self-Test Loop (7 Tests)

After analysis, Effectum runs a 7-point self-test loop to verify its own understanding is correct:

1. Can it explain the main data flow end-to-end?
2. Can it identify all entry points to the system?
3. Can it describe every database table and its purpose?
4. Can it list every external API the project calls?
5. Can it find where authentication is enforced (and where it's missing)?
6. Can it predict where a specific type of bug is most likely to occur?
7. Can it identify what would break if a specific module were removed?

If any test produces an uncertain answer, it re-runs targeted analysis before continuing.

### Output

Three artifacts, auto-generated:

```
docs/
├── onboarding/
│   ├── architecture.md      ← How the system is structured
│   ├── data-model.md        ← All entities, schemas, RLS
│   ├── api-surface.md       ← All endpoints documented
│   ├── test-coverage.md     ← Coverage map + gaps
│   ├── security-audit.md    ← Auth flows + risks
│   └── dependencies.md      ← Package health report
├── prds/
│   └── [feature-area].md    ← One PRD per major feature area
└── network-map.html         ← Interactive dependency visualization
```

`/onboard:review` re-runs a lightweight version after significant changes.

> [!TIP]
> Use `/onboard` before starting a Ralph Loop on an unfamiliar codebase. It gives Claude the context it needs to make good decisions autonomously.

---

## 🧠 Foundation

### 19 Agent Specializations

Effectum ships with pre-configured agent roles. Each has a distinct behavior profile, toolset, and communication style appropriate to its function:

| Category            | Agents                                                                |
| ------------------- | --------------------------------------------------------------------- |
| **Planning**        | Architect, Decomposer, Risk Analyst                                   |
| **Build**           | Engineer, TDD Driver, Refactor Specialist                             |
| **Quality**         | QA Reviewer, Security Auditor, Performance Analyst                    |
| **Documentation**   | Spec Writer, API Documenter, Onboarding Analyst                       |
| **Orchestration**   | Ralph (autonomous loop), Checkpoint Manager, Delta Tracker            |
| **Analysis**        | Architecture Agent, Data Model Agent, Test Coverage Agent, Dep Auditor |

Each specialization is defined in `system/agents/` and composed from shared skills.

### 22+ Skills

Skills are reusable capability blocks that agent specializations are composed from:

| Domain              | Examples                                                               |
| ------------------- | ---------------------------------------------------------------------- |
| **Code**            | TypeScript, Python, Go, Swift, Rust, SQL                              |
| **Testing**         | TDD, E2E, snapshot, load testing                                      |
| **Security**        | Secret detection, OWASP scanning, RLS validation                      |
| **Documentation**   | PRD authoring, markdown, Mermaid diagrams                             |
| **Infrastructure**  | Vercel, Railway, Fly.io, Docker, GitHub Actions                       |

### Foundation Hooks (Always Active)

Three hooks run on every Claude Code session, regardless of configuration:

| Hook                     | What it does                                                      |
| ------------------------ | ----------------------------------------------------------------- |
| **Secret Detection**     | Blocks writes containing API keys, tokens, passwords to any file  |
| **TDD Enforcement**      | Warns when code is written before a failing test exists           |
| **Guardrails**           | Prevents `rm -rf`, `DROP TABLE`, direct writes to `.env`          |

These can't be disabled by mistake. They're the safety net.

---

## 🔌 Extensibility

Effectum is built to be extended. Everything is defined in JSON — no code changes needed.

### JSON-Based Tool Definitions

Add new workflow commands by dropping a JSON file into `system/tools/`:

```json
{
  "name": "db-migrate",
  "description": "Run and verify database migrations safely",
  "trigger": "/db-migrate",
  "agent": "engineer",
  "steps": [
    "backup current schema",
    "run migration",
    "verify integrity",
    "run post-migration tests"
  ],
  "quality_gates": ["build", "tests"]
}
```

### JSON-Based Detection Rules

Extend stack auto-detection without touching the configurator:

```json
{
  "name": "remix",
  "detect": {
    "files": ["remix.config.js", "remix.config.ts"],
    "package_deps": ["@remix-run/node"]
  },
  "maps_to": "nextjs-supabase",
  "overrides": {
    "build_command": "remix build",
    "test_command": "vitest run"
  }
}
```

### Community Presets + Blocks

Presets and blocks are shareable. Drop a `preset.json` into `system/stacks/community/` and it appears in the configurator automatically.

Pull requests for new stacks, presets, and detection rules are especially welcome. The goal is to have every common stack covered out of the box.

---

## 🆚 How is this different?

| Tool           | What it does                              | What Effectum adds / differs                                                         |
| -------------- | ----------------------------------------- | ------------------------------------------------------------------------------------ |
| **GSD**        | Context engineering, prevents context rot | PRD Lifecycle (spec versioning + delta handoffs), Ralph Loop, Project Onboarding     |
| **BMAD**       | Full enterprise methodology               | Same ideas, 90% less ceremony. Configurator auto-selects what's relevant.            |
| **SpecKit**    | Living specifications                     | + Autonomous execution + Quality gates + Task registry + Network map                 |
| **Taskmaster** | Task breakdown from PRDs                  | + TDD workflow + Code review + E2E testing + Semantic diff + Onboarding agents       |
| **Kiro (AWS)** | IDE-native spec-driven dev (VS Code fork) | CLI-native. No IDE required. No opaque request pricing. Works with your existing setup. |

The short version: Effectum doesn't invent new concepts. It combines what already works, removes what doesn't, and packages it so it actually runs.

**On IDE tools (Kiro, Cursor, etc.):** If you're happy in your IDE, great — stay there. Effectum is for developers who want a Claude Code-native, terminal-first workflow that doesn't require switching editors or agreeing to opaque pricing models.

**On AGENTS.md:** Effectum supports both `CLAUDE.md` (default) and `AGENTS.md` (the emerging multi-agent standard adopted by GSD 2.37+). Use `--output-format agents-md` or `--output-format both` to generate a tool-agnostic project instruction file alongside your Claude Code config.

---

## 🎨 Stack Presets

Six full presets. Eight quick add-ons. Detected automatically from your project files.

### Full Presets

<table>
<tr>
<td width="33%" align="center">
<br>
<strong>Next.js + Supabase</strong>
<br><br>
TypeScript, Tailwind, Shadcn<br>
Supabase, Vitest, Playwright<br>
<br>
<em>Full-stack web apps</em>
<br><br>
</td>
<td width="33%" align="center">
<br>
<strong>Python + FastAPI</strong>
<br><br>
Pydantic, SQLAlchemy<br>
pytest, ruff, mypy<br>
<br>
<em>APIs and backends</em>
<br><br>
</td>
<td width="33%" align="center">
<br>
<strong>Swift / SwiftUI</strong>
<br><br>
SwiftData, XCTest<br>
swift-format, SPM<br>
<br>
<em>iOS and macOS apps</em>
<br><br>
</td>
</tr>
<tr>
<td width="33%" align="center">
<br>
<strong>Go + Echo</strong>
<br><br>
sqlc, testify, golangci-lint<br>
Air (hot reload)<br>
<br>
<em>High-performance APIs</em>
<br><br>
</td>
<td width="33%" align="center">
<br>
<strong>Django + PostgreSQL</strong>
<br><br>
DRF, pytest-django<br>
black, mypy, psycopg2<br>
<br>
<em>Python web, ORM-first</em>
<br><br>
</td>
<td width="33%" align="center">
<br>
<strong>Generic</strong>
<br><br>
Stack-agnostic<br>
Customize everything<br>
<br>
<em>Anything else</em>
<br><br>
</td>
</tr>
</table>

### Quick Presets (Add-Ons)

| Quick Preset       | Adds to your stack                                            |
| ------------------ | ------------------------------------------------------------- |
| **+ Firebase**     | Firebase SDK, Firestore rules, Auth integration patterns      |
| **+ Prisma**       | Prisma schema, migration workflow, typed client               |
| **+ Flutter**      | Dart/Flutter project config, widget test setup                |
| **+ Stripe**       | Webhook handling patterns, price/subscription management      |
| **+ tRPC**         | End-to-end typesafe API layer                                 |
| **+ Turborepo**    | Monorepo workspace configuration                              |
| **+ Docker**       | Dockerfile, docker-compose, health check patterns             |
| **+ GitHub CI**    | GitHub Actions workflow for test + deploy                     |

Each preset configures build commands, test frameworks, linters, formatters, and architecture rules for your stack.

---

## 🎚️ Three Autonomy Levels

Choose how much Claude decides on its own:

|                           |  Conservative   |    Standard     |  Full Autonomy   |
| ------------------------- | :-------------: | :-------------: | :--------------: |
| **Claude asks before...** |  Most changes   | Ambiguous specs |  Almost nothing  |
| **Git operations**        |   Always asks   |  Asks for push  |    Autonomous    |
| **File changes**          |  Confirms each  |  Works freely   |   Works freely   |
| **Best for**              | Teams, learning |    Daily dev    | Overnight builds |
| **Ralph Loop**            |       ❌        |       ✅        |  ✅ Recommended  |

Choose during setup. Change anytime in `.claude/settings.json`.

---

## ⚠️ Limitations

Effectum is useful, but it's honest about what it can't do yet:

- **Only works with Claude Code** — workflow commands are Claude Code specific. Other runtimes (Codex, Gemini CLI) are on the roadmap.
- **Onboarding quality depends on codebase legibility** — heavily minified, obfuscated, or machine-generated code produces lower-quality analysis.
- **Ralph Loop effectiveness depends on PRD quality** — garbage in, garbage out. A vague spec produces vague code, even autonomously.
- **MCP servers need npm/Node.js** — if you're in a restricted environment without npm access, MCP setup will fail.
- **Delta handoffs accumulate** — on very long-lived projects with many spec revisions, the changelog can grow large. Periodic archival is on the roadmap.

---

## 📁 Project Structure

```
effectum/
│
├── system/                          The installable workflow
│   ├── configurator/                Stack detection + setup recommender
│   ├── templates/                   CLAUDE.md, settings, guardrails (parameterized)
│   ├── commands/                    17 workflow commands
│   ├── agents/                      19 agent specializations
│   ├── skills/                      22+ reusable skill blocks
│   ├── tools/                       JSON-based tool definitions
│   ├── stacks/                      6 full presets + community/
│   │   └── community/               Drop JSON presets here
│   ├── detection/                   JSON-based auto-detection rules
│   └── hooks/                       Foundation hooks (always active)
│
├── workshop/                        PRD lifecycle tools
│   ├── knowledge/                   Reference guides for spec writing
│   ├── templates/                   PRD + frontmatter templates
│   ├── tasks/                       Auto-generated task registry (tasks.md)
│   └── projects/                    Your spec projects (per branch)
│
├── docs/                            Documentation
│   ├── workflow-overview.md
│   ├── configurator-guide.md
│   ├── prd-lifecycle.md
│   ├── onboarding-guide.md
│   ├── customization.md
│   └── troubleshooting.md
│
├── CLAUDE.md                        Makes Claude understand this repo
├── CHANGELOG.md                     Version history
└── README.md                        You are here
```

---

## 📚 Documentation

| Guide                                                   | What you'll learn                              |
| ------------------------------------------------------- | ---------------------------------------------- |
| 📖 [Workflow Overview](docs/workflow-overview.md)       | The complete autonomous workflow explained      |
| ⚙️ [Configurator Guide](docs/configurator-guide.md)    | Stack detection, presets, language setup        |
| 📋 [PRD Lifecycle](docs/prd-lifecycle.md)               | Frontmatter, diffs, delta handoffs, tasks.md   |
| 🔍 [Onboarding Guide](docs/onboarding-guide.md)         | Getting up to speed on any codebase fast        |
| 🔧 [Customization](docs/customization.md)               | JSON tools, detection rules, community presets  |
| 🔍 [Troubleshooting](docs/troubleshooting.md)           | Common issues and solutions                     |

---

## ❓ FAQ

<details>
<summary><strong>Do I need to write a specification for every feature?</strong></summary>

No. Use `/plan` directly with a description for small things. Specifications shine for anything complex — they eliminate back-and-forth and produce dramatically better results. For existing projects you're onboarding to, `/onboard` generates a baseline PRD per feature area automatically.

</details>

<details>
<summary><strong>Does this work with other AI coding tools?</strong></summary>

Effectum is built for Claude Code. The specifications and PRDs it produces are useful for any AI tool, but the workflow commands (`/plan`, `/tdd`, etc.) are Claude Code specific. See [Limitations](#️-limitations).

</details>

<details>
<summary><strong>Can I customize everything after setup?</strong></summary>

Yes. Everything is plain text or JSON — edit `CLAUDE.md` for rules, `.claude/settings.json` for hooks, `system/tools/` for new commands, `system/detection/` for new stack rules. See [Customization](docs/customization.md).

</details>

<details>
<summary><strong>What if Ralph Loop gets stuck?</strong></summary>

Built-in error recovery: reads errors, tries alternatives, documents blockers. At 80% of max iterations, writes a status report of what's done and what's left. Use `/cancel-ralph` to stop it manually anytime. If the spec changed mid-run, PRD-hash detection will cause it to pause and reconcile before continuing.

</details>

<details>
<summary><strong>Is this safe to use?</strong></summary>

Yes. Foundation hooks are always active: secret detection blocks writes to `.env` and similar files, TDD enforcement warns before code without tests, and the guardrails hook blocks `rm -rf` and `DROP TABLE`. These hooks can't be turned off by mistake.

</details>

<details>
<summary><strong>When should I use /onboard vs /prd:new?</strong></summary>

`/onboard` is for existing codebases — it reads what's there. `/prd:new` is for new features — it helps you design what doesn't exist yet. For a new project, start with `/prd:new`. For an inherited or unfamiliar codebase, start with `/onboard`, then use `/prd:new` for new features on top of it.

</details>

<details>
<summary><strong>How do the 19 agent specializations work?</strong></summary>

Each specialization is a pre-configured behavior profile that Claude adopts when running a particular command. When you run `/tdd`, Claude behaves as the TDD Driver agent — test-first mindset, specific communication style, specific toolset. You don't configure this; Effectum sets it up automatically based on which command you're running.

</details>

---

## 🤝 Contributing

The most impactful areas:

- **🎨 Stack presets** — Add Laravel, Rails, Bun, .NET, etc. (Rust+Actix already added!)
- **🔌 Detection rules** — Better auto-detection for more project types
- **🔧 Workflow commands** — Improve or add new ones
- **📚 Knowledge base** — Better examples, more techniques
- **🌍 Documentation** — Clearer guides, translations

---

<div align="center">

## License

MIT © 2026 [Jason Salomon-Rinnert](https://github.com/aslomon)

<br>

_Effectum — that which has been brought to completion._

<br>

**[⬆ Back to top](#-effectum)**

</div>
