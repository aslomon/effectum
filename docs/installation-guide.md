# Installation Guide

Step-by-step guide for installing the autonomous development workflow into your project.

## Prerequisites

1. **Claude Code** installed and authenticated. See [Claude Code documentation](https://docs.anthropic.com/en/docs/claude-code) for setup.
2. **Git** installed. The workflow uses git for tracking progress, checkpoints, and diffs.
3. **A target project** (existing or new) where you want to install the workflow.

## Step 1: Clone the Repository

```bash
git clone https://github.com/yourname/autonomous-dev.git
cd autonomous-dev
```

## Step 2: Open in Claude Code

```bash
claude
```

Claude Code reads the repository's `CLAUDE.md` and recognizes this as the PRD Workshop and Autonomous Development System.

## Step 3: Run /setup

```bash
/setup ~/path/to/your/project
```

Or run without arguments and Claude will ask for the path:

```bash
/setup
```

## Step 4: Answer Configuration Questions

The setup command asks 4 questions. It auto-detects as much as possible from your project.

### 4.1 Project Name

Claude derives the name from the directory. Confirm or change it.

### 4.2 Tech Stack

Choose from presets:

| Preset             | Auto-detected by                       | Includes                                                               |
| ------------------ | -------------------------------------- | ---------------------------------------------------------------------- |
| Next.js + Supabase | `package.json` with "next"             | App Router, TypeScript, Tailwind, Shadcn, Supabase, Vitest, Playwright |
| Python + FastAPI   | `pyproject.toml` or `requirements.txt` | FastAPI, Pydantic, SQLAlchemy, Alembic, pytest, ruff                   |
| Swift/SwiftUI      | `Package.swift`                        | SwiftUI, SwiftData, XCTest, swift-format                               |
| Generic            | No match                               | Stack-agnostic rules, configure tools manually                         |
| Custom             | User choice                            | Detailed questions about your specific stack                           |

### 4.3 Communication Language

Default is English. Other options include German (du/informal) or any language you prefer. This affects Claude's conversation language only; all code and documentation remain in English.

### 4.4 Autonomy Level

| Level                  | Behavior                                 | Best for                                  |
| ---------------------- | ---------------------------------------- | ----------------------------------------- |
| Conservative           | Claude asks before most actions          | Learning the workflow, sensitive projects |
| Standard (recommended) | Autonomous within guardrails             | Normal development                        |
| Full autonomy          | Decides everything, stops only on errors | Experienced users, well-defined tasks     |

## What Gets Installed

After setup, these files are created in your project:

### Configuration (3 files)

| File                    | Purpose                                                                                                                                                                |
| ----------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `CLAUDE.md`             | Main configuration file. Defines stack, conventions, commands, hooks, and quality rules. Claude reads this at every session start.                                     |
| `.claude/settings.json` | Hook configuration. Defines auto-formatting, file protection, destructive command blocking, guardrails injection, CHANGELOG updates, and quality gates.                |
| `.claude/guardrails.md` | Curated lessons from past sessions. Injected at every session start and after context compaction. Contains error patterns, workflow lessons, and stack-specific rules. |

### Reference Guide (1 file)

| File                     | Purpose                                                                                                                                                          |
| ------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `AUTONOMOUS-WORKFLOW.md` | Complete reference for the autonomous workflow. PRD template, prompt templates, workflow phases, command chains, quality gates, Ralph Loop, and lessons learned. |

### Workflow Commands (10 files)

All installed to `.claude/commands/` and available as slash commands in Claude Code.

| Command           | File                | Phase          | Function                                                                                          |
| ----------------- | ------------------- | -------------- | ------------------------------------------------------------------------------------------------- |
| `/plan`           | `plan.md`           | Start          | Analyze requirements, explore codebase, create implementation plan. Stops and waits for approval. |
| `/tdd`            | `tdd.md`            | Implementation | Test-first development: write failing tests, implement, refactor.                                 |
| `/verify`         | `verify.md`         | QA             | Run all quality gates: build, types, lint, tests.                                                 |
| `/e2e`            | `e2e.md`            | QA             | Write and run end-to-end tests.                                                                   |
| `/code-review`    | `code-review.md`    | Review         | Security audit (OWASP, RLS) and code quality review.                                              |
| `/build-fix`      | `build-fix.md`      | Debugging      | Incrementally fix build errors.                                                                   |
| `/refactor-clean` | `refactor-clean.md` | Cleanup        | Find and remove dead code, unused imports, stale files.                                           |
| `/ralph-loop`     | `ralph-loop.md`     | Full Auto      | Iterative autonomous implementation with self-verification.                                       |
| `/cancel-ralph`   | `cancel-ralph.md`   | Safety         | Stop a running Ralph Loop.                                                                        |
| `/checkpoint`     | `checkpoint.md`     | Safety         | Create a git restore point before risky operations.                                               |

## Step 5: Post-Installation Verification

After setup completes, verify the installation:

### Check files exist

```bash
ls -la CLAUDE.md AUTONOMOUS-WORKFLOW.md
ls -la .claude/settings.json .claude/guardrails.md
ls .claude/commands/
```

You should see all 10 command files.

### Test a command

Open Claude Code in your project and run:

```bash
/verify
```

This runs the quality gates and confirms that the build tools, linter, and test runner are configured correctly.

### Check hooks

Start a new Claude Code session. You should see:

- Git context (branch, uncommitted files, recent commits)
- Guardrails loaded (global and project-specific)

## Troubleshooting

### Commands not appearing

**Symptom**: Running `/plan` or other commands shows "command not found."

**Fix**: Ensure the files are in `.claude/commands/` (not `.claude/commands/subfolder/`). Claude Code looks for commands at the top level of `.claude/commands/`.

### Hooks not firing

**Symptom**: No auto-formatting, no CHANGELOG updates, no file protection.

**Fix**: Check `.claude/settings.json` exists and has valid JSON. Common issues:

- Trailing commas in JSON (not valid JSON)
- Missing quotes around strings
- Incorrect file paths in hook commands

### Permission errors

**Symptom**: Claude Code asks for permission for every file edit or bash command.

**Fix**: Check the `defaultMode` in `.claude/settings.json`. For Standard autonomy, it should be `"bypassPermissions"`. For Conservative, it should be `"allowEdits"`.

### Wrong formatter running

**Symptom**: Auto-format hook errors or formats with the wrong tool.

**Fix**: Check the `FORMATTER_GLOB` and `FORMATTER_COMMAND` placeholders were correctly substituted in `settings.json`. The glob pattern should match your file extensions.

### Quality gates failing on clean project

**Symptom**: `/verify` fails because build tools are not installed.

**Fix**: The workflow commands call your project's build tools. You need these installed first:

- **Next.js**: `pnpm install`
- **Python**: `pip install -e ".[dev]"` or `uv sync`
- **Swift**: Xcode Command Line Tools

### How to reinstall

Run `/setup` again from the autonomous-dev repo. Choose "Overwrite" when prompted about the existing `.claude/` directory.
