---
name: "Setup"
description: "Install the complete Effectum autonomous development workflow into a target project."
allowed-tools: ["Read", "Write", "Bash", "Glob"]
---

# /setup — Install Autonomous Development Workflow

Install the complete autonomous development workflow into a target project.

## Step 1: Determine Target

If `$ARGUMENTS` contains a path, use it as the target project path.
If `$ARGUMENTS` is empty, ask: **[in configured language] "What is the path to your project?"** — wait for a response.

Validate:

- The path exists. If not, ask: "This directory does not exist. Should I create it?"
- Check for an existing `.claude/` directory at the target path.
  - If found, ask: **"A .claude/ directory already exists. Overwrite, merge, or abort?"**
    - **Overwrite**: Replace CONFIGURATION files only (`CLAUDE.md`, `.claude/settings.json`, `.claude/guardrails.md`) but **keep all commands** already in `.claude/commands/`.
    - **Merge**: Keep existing files, only add missing ones. Warn about conflicts.
    - **Abort**: Stop the installation.

## Step 2: Gather Configuration

Ask these questions one at a time. Skip any that you can auto-detect from the project.

### 2.1 Project Name

Derive from the directory name. Confirm with the user:
**"Project name: {derived-name} — correct?"**

### 2.2 Tech Stack

Auto-detect first:

- If `package.json` exists with `"next"` dependency → suggest **Next.js + Supabase**
- If `pyproject.toml` or `requirements.txt` exists → suggest **Python + FastAPI**
- If `Package.swift` exists → suggest **Swift/SwiftUI**
- If none match → suggest **Generic**

Offer presets:

1. **Next.js + Supabase** — Full-stack web (TypeScript, App Router, Tailwind, Shadcn, Supabase)
2. **Python + FastAPI** — Backend/API (Python 3.12+, FastAPI, SQLAlchemy, pytest)
3. **Swift/SwiftUI** — iOS/macOS (Swift 6, SwiftUI, SwiftData, XCTest)
4. **Generic** — Stack-agnostic (universal quality rules, no framework-specific config)
5. **Custom** — Ask detailed questions about the stack

### 2.3 Communication Language

**"Communication language? (default: English)"**
Options: English, German (du/informal), or specify another.

### 2.4 Autonomy Level

**"Autonomy level?"**

1. **Conservative** — Claude asks before most actions. Best for learning the workflow or sensitive projects.
2. **Standard** (recommended) — Autonomous within guardrails. Stops for plan approval, ambiguous scope, and breaking changes.
3. **Full autonomy** — Decides everything. Only stops on errors or genuinely ambiguous scope.

## Step 3: Read Templates and Stack Preset

Read the template files — check these locations **in order** and use the first one found:

1. `.effectum/templates/` — local install (created by `npx @aslomon/effectum --local`)
2. `~/.effectum/templates/` — global install (created by `npx @aslomon/effectum --global`)
3. `system/templates/` — development (running directly from the repo)

Templates to read:

- `CLAUDE.md.tmpl` — Main configuration template
- `settings.json.tmpl` — Settings template
- `guardrails.md.tmpl` — Guardrails template

Read the stack preset file — check these locations **in order** and use the first one found:

1. `.effectum/stacks/{selected-stack}.md`
2. `~/.effectum/stacks/{selected-stack}.md`
3. `system/stacks/{selected-stack}.md`

Available stacks: `nextjs-supabase.md`, `python-fastapi.md`, `swift-ios.md`, `generic.md`

The stack preset file contains values for these placeholders:

- `{{TECH_STACK}}` — Technology list
- `{{ARCHITECTURE_PRINCIPLES}}` — Architecture rules
- `{{PROJECT_STRUCTURE}}` — Directory layout
- `{{QUALITY_GATES}}` — Build/test/lint commands
- `{{STACK_SPECIFIC_GUARDRAILS}}` — Framework-specific guardrails
- `{{FORMATTER}}` — Code formatter name
- `{{PACKAGE_MANAGER}}` — Package manager command

## Step 4: Generate and Install Files

Substitute all `{{PLACEHOLDER}}` values with the gathered configuration and stack preset values:

| Placeholder                     | Source                                                                                |
| ------------------------------- | ------------------------------------------------------------------------------------- |
| `{{PROJECT_NAME}}`              | Step 2.1                                                                              |
| `{{LANGUAGE}}`                  | Step 2.3 (formatted as instruction, e.g., "Speak German (du/informal) with the user") |
| `{{TECH_STACK}}`                | Stack preset                                                                          |
| `{{ARCHITECTURE_PRINCIPLES}}`   | Stack preset                                                                          |
| `{{PROJECT_STRUCTURE}}`         | Stack preset                                                                          |
| `{{QUALITY_GATES}}`             | Stack preset                                                                          |
| `{{STACK_SPECIFIC_GUARDRAILS}}` | Stack preset                                                                          |
| `{{FORMATTER}}`                 | Stack preset                                                                          |
| `{{PACKAGE_MANAGER}}`           | Stack preset                                                                          |

Create these files in the target project:

### Configuration Files (3)

1. **`{target}/CLAUDE.md`** — From `CLAUDE.md.tmpl` with all placeholders substituted
2. **`{target}/.claude/settings.json`** — From `settings.json.tmpl` with placeholders substituted
3. **`{target}/.claude/guardrails.md`** — From `guardrails.md.tmpl` with placeholders substituted

### Reference Guide (1)

4. **`{target}/AUTONOMOUS-WORKFLOW.md`** — Copy `system/templates/AUTONOMOUS-WORKFLOW.md` as-is

### Workflow Commands (10)

Copy ALL files from `system/commands/` to `{target}/.claude/commands/`:

5. `plan.md` — Analysis + implementation plan + wait for approval
6. `tdd.md` — Test-first development (RED → GREEN → REFACTOR)
7. `verify.md` — Build + types + lint + tests verification
8. `e2e.md` — End-to-end test creation and execution
9. `code-review.md` — Security + quality audit
10. `build-fix.md` — Incremental build error resolution
11. `refactor-clean.md` — Dead code removal and cleanup
12. `ralph-loop.md` — Iterative autonomous implementation loop
13. `cancel-ralph.md` — Stop a running Ralph Loop
14. `checkpoint.md` — Create a git restore point

## Step 5: Verify Installation

List all created files with their absolute paths in a table:

```
| # | File | Status |
|---|------|--------|
| 1 | {target}/CLAUDE.md | Created |
| 2 | {target}/.claude/settings.json | Created |
| ... | ... | ... |
```

Show a configuration summary:

```
| Setting | Value |
|---------|-------|
| Project | {name} |
| Stack | {stack} |
| Language | {language} |
| Autonomy | {level} |
| Commands installed | 10 |
| Files created | {total count} |
```

## Step 6: Next Steps

Tell the user:

1. **"Open Claude Code in `{target}` to use the workflow"**
2. **Available commands:** `/plan`, `/tdd`, `/verify`, `/e2e`, `/code-review`, `/build-fix`, `/refactor-clean`, `/ralph-loop`, `/cancel-ralph`, `/checkpoint`
3. **"To create a PRD: come back to this repo and run `/prd:new`"**
4. **"Read `AUTONOMOUS-WORKFLOW.md` for the complete reference guide"**
5. **"Customize `CLAUDE.md` to match your specific project conventions"**

## Next Steps

After setup is complete:

- → `/plan` — Create an implementation plan for your first feature
- → `/prd:new` — Start a new PRD to define requirements before coding
- → `/design` — Generate a DESIGN.md for frontend projects

ℹ️ Alternative: Read `AUTONOMOUS-WORKFLOW.md` for the complete reference guide on all available commands.

## Communication

Follow the language settings defined in CLAUDE.md for user-facing communication.
All installed file content must be in English.
