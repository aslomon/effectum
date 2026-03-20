# Effectum

**Describe what you want. Get production-ready code.**

Effectum is an autonomous development system for [Claude Code](https://claude.ai/claude-code). It turns your ideas into structured requirements, then implements them — with tests, security checks, and quality gates — while you sleep.

_Effectum (Latin): the result, the accomplishment — that which has been brought to completion._

---

## How It Works

You have an idea. Effectum turns it into working software in three steps:

```
1. DESCRIBE          2. PLAN & BUILD           3. EFFECTUM
   your idea            autonomously              production-ready code
                                                  with tests & security
```

**Step 1** — You describe your idea. Effectum asks the right questions and writes a detailed specification (PRD).

**Step 2** — Effectum's workflow takes the specification and implements it autonomously: tests first, then code, then verification.

**Step 3** — You wake up to a working feature. Tests passing. Code reviewed. Quality gates green.

---

## Quick Start

```bash
# 1. Clone
git clone https://github.com/jasonrinnert/effectum.git
cd effectum

# 2. Open Claude Code
claude

# 3. Set up your project
/setup ~/my-project

# 4. Write a specification
/prd:new

# 5. Build it (in your project)
cd ~/my-project && claude
/plan docs/prds/001-my-feature.md
```

That's it. Five steps from zero to autonomous development.

---

## What `/setup` Installs in Your Project

One command. 14 files. Your project is ready.

```
/setup ~/my-project
```

Claude asks four questions — project name, tech stack, language, autonomy level — then installs:

| File                                 | What it does                                                   |
| ------------------------------------ | -------------------------------------------------------------- |
| `CLAUDE.md`                          | Your project's brain — rules, architecture, quality standards  |
| `AUTONOMOUS-WORKFLOW.md`             | Complete reference guide                                       |
| `.claude/commands/plan.md`           | **`/plan`** — Analyze, create implementation plan, wait for OK |
| `.claude/commands/tdd.md`            | **`/tdd`** — Write tests first, then code                      |
| `.claude/commands/verify.md`         | **`/verify`** — Run all quality checks                         |
| `.claude/commands/e2e.md`            | **`/e2e`** — End-to-end browser tests                          |
| `.claude/commands/code-review.md`    | **`/code-review`** — Security + quality audit                  |
| `.claude/commands/build-fix.md`      | **`/build-fix`** — Fix errors one at a time                    |
| `.claude/commands/refactor-clean.md` | **`/refactor-clean`** — Remove dead code                       |
| `.claude/commands/ralph-loop.md`     | **`/ralph-loop`** — Fully autonomous overnight mode            |
| `.claude/commands/cancel-ralph.md`   | **`/cancel-ralph`** — Stop the loop                            |
| `.claude/commands/checkpoint.md`     | **`/checkpoint`** — Git restore point                          |
| `.claude/settings.json`              | Auto-formatting, file protection, safety hooks                 |
| `.claude/guardrails.md`              | Rules that prevent known mistakes                              |

---

## The Workflow

### `/plan` — Think before building

Claude reads your specification, explores your codebase, and creates a plan. It identifies risks, asks questions, and **waits for your OK** before writing any code.

### `/tdd` — Tests first, always

Write a failing test. Write the code to pass it. Improve. Repeat. Every feature is tested before it exists.

### `/verify` — Every quality gate, every time

| Check       | What it verifies               |
| ----------- | ------------------------------ |
| Build       | Compiles without errors        |
| Types       | No type errors                 |
| Lint        | Clean code, no warnings        |
| Tests       | All pass, 80%+ coverage        |
| Security    | No OWASP vulnerabilities       |
| Debug logs  | No `console.log` in production |
| Type safety | No `any` or unsafe casts       |
| File size   | Nothing over 300 lines         |

### `/code-review` — Security + quality audit

Reviews every change for security issues, code quality, and architecture violations. Finds what humans miss.

### `/ralph-loop` — Build while you sleep

The most powerful feature:

```
/ralph-loop "Build the auth system"
  --max-iterations 30
  --completion-promise "All tests pass, build succeeds, 0 lint errors"
```

Claude works alone — writing code, running tests, fixing errors, iterating — until **every quality gate passes**. It only stops when the promise is 100% true.

You go to sleep. You wake up to a working feature.

---

## Writing Specifications — The PRD Workshop

A specification is the bridge between "I want this" and "Claude builds this." Better spec = better code.

### Two Modes

**Workshop** — You have a vague idea. Effectum asks questions, round by round, until it understands. Then writes the spec.

**Express** — You know what you want. Describe it, Effectum fills the gaps and produces the spec in one shot.

### What Effectum Produces

Every specification includes:

| Section             | Why it matters                                  |
| ------------------- | ----------------------------------------------- |
| Problem & Goal      | What are we solving? How do we measure success? |
| User Stories        | What can users do when this is done?            |
| Acceptance Criteria | Testable conditions: Given X, When Y, Then Z    |
| Data Model          | Tables, fields, types, security policies        |
| API Design          | Endpoints, formats, error codes                 |
| Quality Gates       | Automated checks that must pass                 |
| Completion Promise  | The sentence that must be true when done        |

### Network Map

For complex projects, Effectum generates a visual network map (Mermaid diagram) showing how every feature, module, and data entity connects. The map grows as your project grows.

### Workshop Commands

| Command            | What it does                      |
| ------------------ | --------------------------------- |
| `/prd:new`         | Start a new specification         |
| `/prd:express`     | Quick spec from clear input       |
| `/prd:discuss`     | Deep-dive into details            |
| `/prd:review`      | Quality check — is this ready?    |
| `/prd:decompose`   | Split a large project into pieces |
| `/prd:network-map` | Visualize how everything connects |
| `/prd:handoff`     | Send spec to your project         |
| `/prd:status`      | See all projects and progress     |
| `/prd:resume`      | Continue where you left off       |
| `/prd:prompt`      | Generate the handoff prompt       |

---

## Stack Presets

Effectum adapts to your tech stack:

| Preset                 | Technologies                                                        | Best for                         |
| ---------------------- | ------------------------------------------------------------------- | -------------------------------- |
| **Next.js + Supabase** | Next.js, TypeScript, Tailwind, Shadcn, Supabase, Vitest, Playwright | Full-stack web apps              |
| **Python + FastAPI**   | Python, FastAPI, Pydantic, SQLAlchemy, pytest, ruff                 | APIs and backends                |
| **Swift/SwiftUI**      | Swift, SwiftUI, SwiftData, XCTest                                   | iOS and macOS apps               |
| **Generic**            | Stack-agnostic baseline                                             | Anything — customize after setup |

Each preset configures the right build commands, test frameworks, linters, and architecture rules.

---

## Three Autonomy Levels

| Level             | Claude asks before...               | Best for                     |
| ----------------- | ----------------------------------- | ---------------------------- |
| **Conservative**  | Most changes, all git operations    | Teams, learning the system   |
| **Standard**      | Ambiguous specs, breaking changes   | Daily development            |
| **Full Autonomy** | Almost nothing — only real blockers | Overnight builds, Ralph Loop |

Choose during `/setup`. Change anytime in `.claude/settings.json`.

---

## The Big Picture

```
┌─────────────────────────────────────────────┐
│  EFFECTUM REPO                              │
│  (clone once, use for all projects)         │
│                                             │
│  /setup       → Install the workflow        │
│  /prd:new     → Write specifications        │
│  /prd:handoff → Send to your project        │
└──────────────┬──────────────────────────────┘
               │
               │  installs CLAUDE.md, commands,
               │  hooks, guardrails
               ▼
┌─────────────────────────────────────────────┐
│  YOUR PROJECT                               │
│                                             │
│  /plan          → Think, then propose       │
│  /tdd           → Tests first, then code    │
│  /verify        → All quality gates         │
│  /code-review   → Security + quality        │
│  /ralph-loop    → Autonomous overnight      │
│                                             │
│  Result: Production-ready code              │
└─────────────────────────────────────────────┘
```

---

## Before & After

|                    | Without Effectum                 | With Effectum                                      |
| ------------------ | -------------------------------- | -------------------------------------------------- |
| Starting a feature | "Build a login" → Claude guesses | Detailed spec → Claude knows exactly what to build |
| Testing            | Maybe, after coding              | Tests written first, always                        |
| Quality            | Hope for the best                | 8 automated gates must pass                        |
| Security           | Manual review (or forget)        | Automatic OWASP audit                              |
| Overnight work     | Not possible                     | Ralph Loop builds while you sleep                  |
| Consistency        | Depends on the prompt            | Same workflow, same quality, every time            |

---

## Project Structure

```
effectum/
├── system/                      The installable workflow
│   ├── templates/               Config templates (CLAUDE.md, settings, guardrails)
│   ├── commands/                10 workflow commands
│   └── stacks/                  Stack presets
│
├── workshop/                    Specification tools
│   ├── knowledge/               8 reference guides
│   ├── templates/               Document templates
│   └── projects/                Your spec projects
│
├── docs/                        Documentation
│   ├── workflow-overview.md
│   ├── installation-guide.md
│   ├── prd-workshop-guide.md
│   ├── customization.md
│   └── troubleshooting.md
│
└── CLAUDE.md                    Makes Claude understand this repo
```

---

## Documentation

| Guide                                            | What you'll learn                 |
| ------------------------------------------------ | --------------------------------- |
| [Workflow Overview](docs/workflow-overview.md)   | The complete workflow explained   |
| [Installation Guide](docs/installation-guide.md) | Detailed setup instructions       |
| [PRD Workshop Guide](docs/prd-workshop-guide.md) | How to write great specifications |
| [Customization](docs/customization.md)           | Adapting Effectum to your needs   |
| [Troubleshooting](docs/troubleshooting.md)       | Common issues and solutions       |

---

## FAQ

**Do I need to write a specification for every feature?**
No. Use `/plan` directly with a description for small things. Specifications shine for anything complex.

**Does this work with other AI coding tools?**
Effectum is built for Claude Code. The specifications work with any AI tool, but the workflow commands are Claude Code specific.

**Can I customize everything after setup?**
Yes. Everything is plain text — edit `CLAUDE.md`, `.claude/settings.json`, `.claude/guardrails.md`. See [Customization](docs/customization.md).

**What if Ralph Loop gets stuck?**
Built-in error recovery: reads errors, tries alternatives, documents blockers. At 80% of max iterations, writes a status report of what's done and what's left.

**Is this safe?**
File protection blocks writes to `.env` and secrets. Destructive command prevention blocks `rm -rf` and `DROP TABLE`. Quality gates catch issues before they ship. Conservative mode asks before most actions.

---

## Contributing

The most impactful areas:

- **Stack presets** — Add Go, Rust, Ruby, Django, etc.
- **Workflow commands** — Improve or add new ones
- **Knowledge base** — Better examples, more techniques
- **Documentation** — Clearer guides, more languages

---

## License

MIT
