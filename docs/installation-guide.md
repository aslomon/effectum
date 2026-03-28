# Installation Guide

Step-by-step guide for installing Effectum into your project.

## Prerequisites

1. **Claude Code** installed and authenticated. See [Claude Code documentation](https://docs.anthropic.com/en/docs/claude-code) for setup.
2. **Node.js** >= 18.0.0 (check with `node --version`)
3. **A target project** (existing or new) where you want to install the workflow.

---

## Quick Start

```bash
npx @aslomon/effectum
```

The interactive configurator auto-detects your stack, asks a few questions, and sets up the full workflow in under a minute.

---

## Install Options

### Interactive (Recommended)

```bash
npx @aslomon/effectum
```

Walks you through all configuration choices. Detects your stack automatically.

### Global Install

Installs the workflow to `~/.claude/`, making it available across **all** your projects.

```bash
npx @aslomon/effectum --global
```

### Local Install

Installs the workflow to `./.claude/` in the **current project** only.

```bash
npx @aslomon/effectum --local
```

### Non-Interactive (CI / Scripts)

```bash
npx @aslomon/effectum --global --claude --yes
```

Skips all prompts and uses smart defaults. Combine with `--global` or `--local`.

---

## Configuration Questions

The interactive configurator asks these questions (and auto-detects as much as possible):

### 1. Scope

- **Global** (`~/.claude/`) — applies to all projects on this machine
- **Local** (`./.claude/`) — applies only to the current project

### 2. Tech Stack

Auto-detected from your project files:

| Preset             | Detected by                            | Includes                                                               |
| ------------------ | -------------------------------------- | ---------------------------------------------------------------------- |
| Next.js + Supabase | `package.json` with `"next"`           | App Router, TypeScript, Tailwind, Shadcn, Supabase, Vitest, Playwright |
| Python + FastAPI   | `pyproject.toml` or `requirements.txt` | FastAPI, Pydantic, SQLAlchemy, Alembic, pytest, ruff                   |
| Swift/SwiftUI      | `Package.swift`                        | SwiftUI, SwiftData, XCTest, swift-format                               |
| Generic            | No match                               | Stack-agnostic rules, configure tools manually                         |
| Custom             | User choice                            | Detailed questions about your specific stack                           |

### 3. Communication Language

Default is English. Other options include German (du/informal) or any language you prefer. This affects Claude's conversation language only — all code and documentation remain in English.

### 4. Autonomy Level

| Level                  | Behavior                                 | Best for                                  |
| ---------------------- | ---------------------------------------- | ----------------------------------------- |
| Conservative           | Claude asks before most actions          | Learning the workflow, sensitive projects |
| Standard (recommended) | Autonomous within guardrails             | Normal development                        |
| Full autonomy          | Decides everything, stops only on errors | Experienced users, well-defined tasks     |

---

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

### Workflow Commands

All installed to `.claude/commands/` and available as slash commands in Claude Code. See [Workflow Commands](workflow-overview.md) for the full list.

---

## Post-Installation Verification

After setup completes, verify the installation:

### Check files exist

```bash
ls -la CLAUDE.md AUTONOMOUS-WORKFLOW.md
ls -la .claude/settings.json .claude/guardrails.md
ls .claude/commands/
```

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

---

## Updating

To pull in new commands, updated templates, and the latest rules — while preserving your project configuration:

```bash
npx @aslomon/effectum update
```

The update command:

- Diffs your installed commands against the latest version
- Adds new commands and updates changed ones
- Refreshes the system-managed section of `CLAUDE.md`
- **Preserves** your project context (sentinel blocks are never overwritten)

---

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

Run the installer again from your project directory:

```bash
npx @aslomon/effectum
```

Choose "Overwrite" when prompted about the existing `.claude/` directory.
