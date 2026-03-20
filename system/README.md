# system/ — Autonomous Development System

Configuration templates, stack presets, and workflow definitions for the Claude Code autonomous development system.

## Directory Structure

```
system/
  templates/                    # Parameterized config templates
    CLAUDE.md.tmpl              # Project CLAUDE.md ({{PLACEHOLDER}} syntax)
    settings.json.tmpl          # Claude Code settings with hooks
    guardrails.md.tmpl          # Guardrails with stack-specific sections
    AUTONOMOUS-WORKFLOW.md      # Full workflow reference (not a template)
  stacks/                       # Stack presets (inject into templates)
    nextjs-supabase.md          # Next.js + TypeScript + Supabase
    python-fastapi.md           # Python + FastAPI + SQLAlchemy
    swift-ios.md                # Swift + SwiftUI + SwiftData
    generic.md                  # Stack-agnostic baseline
  commands/                     # Slash command definitions (future)
```

## How It Works

### 1. Templates

Files in `templates/` use `{{PLACEHOLDER}}` syntax for values that vary per project. During `/setup`, placeholders are substituted with values from the selected stack preset and user input.

**Template placeholders:**

| Placeholder                     | Source       | Example Value                           |
| ------------------------------- | ------------ | --------------------------------------- |
| `{{PROJECT_NAME}}`              | User input   | `TaskFlow SaaS`                         |
| `{{LANGUAGE}}`                  | User input   | `English` or `German (du/informal)`     |
| `{{TECH_STACK}}`                | Stack preset | Full tech stack description             |
| `{{ARCHITECTURE_PRINCIPLES}}`   | Stack preset | Architecture rules for the stack        |
| `{{PROJECT_STRUCTURE}}`         | Stack preset | Directory layout                        |
| `{{QUALITY_GATES}}`             | Stack preset | Build/test/lint commands                |
| `{{PACKAGE_MANAGER}}`           | Stack preset | `pnpm`, `uv`, `swift package`, etc.     |
| `{{FORMATTER}}`                 | Stack preset | `npx prettier --write`, `ruff format`   |
| `{{FORMATTER_COMMAND}}`         | Stack preset | Shell command for the formatter         |
| `{{FORMATTER_GLOB}}`            | Stack preset | File extensions to auto-format          |
| `{{STACK_SPECIFIC_GUARDRAILS}}` | Stack preset | Stack-specific rules                    |
| `{{TOOL_SPECIFIC_GUARDRAILS}}`  | Stack preset | Tool-specific rules                     |
| `{{AUTONOMY_PERMISSIONS}}`      | User input   | `bypassPermissions` or `askPermissions` |

### 2. Stack Presets

Files in `stacks/` define all stack-specific values as named sections. Each section corresponds to a template placeholder. The `/setup` command reads the selected preset and injects its values into the templates.

**Available presets:**

| Preset             | File                 | Use Case                            |
| ------------------ | -------------------- | ----------------------------------- |
| Next.js + Supabase | `nextjs-supabase.md` | Full-stack web apps                 |
| Python + FastAPI   | `python-fastapi.md`  | Backend services and APIs           |
| Swift + iOS        | `swift-ios.md`       | Native Apple platform apps          |
| Generic            | `generic.md`         | Any stack (user fills in specifics) |

**Adding a new preset:**

1. Copy `generic.md` as a starting point
2. Fill in all sections (TECH_STACK, ARCHITECTURE_PRINCIPLES, etc.)
3. Save as `stacks/{name}.md`
4. The preset is automatically available during `/setup`

### 3. Setup Flow

When `/setup` runs in a target project:

1. User selects a stack preset (or `generic`)
2. User provides project name and preferences
3. Templates are rendered with preset values + user input
4. Generated files are written to the target project:
   - `.claude/CLAUDE.md` (from `CLAUDE.md.tmpl`)
   - `.claude/settings.json` (from `settings.json.tmpl`)
   - `.claude/guardrails.md` (from `guardrails.md.tmpl`)
5. `AUTONOMOUS-WORKFLOW.md` is copied as-is (reference doc, no substitution)

### 4. Fixed vs. Templated Content

**Fixed (same in every project):**

- Code Quality Rules (40-line functions, 300-line files, naming conventions)
- Development Workflow (/plan, /tdd, /verify, /code-review)
- Available Commands table
- Context7 usage instructions
- Design System (DESIGN.md requirement)
- Agent Teams section
- Shell command rules (non-interactive only)
- Tool usage guidelines
- Commit conventions
- All hooks in settings.json (SessionStart, PreToolUse, PostToolUse, Stop, etc.)
- All error patterns and workflow lessons in guardrails

**Templated (varies per stack):**

- Tech stack description
- Architecture principles
- Project structure
- Quality gate commands
- Package manager
- Formatter command and file glob
- Stack-specific and tool-specific guardrails

## Relationship to AUTONOMOUS-WORKFLOW.md

The `AUTONOMOUS-WORKFLOW.md` file is a comprehensive reference document covering:

- PRD template and best practices
- Prompt templates (Standard, Express, Full-Auto, Ralph Loop)
- Workflow phases (Planning, DB, Backend, Frontend, E2E, Verification)
- Command chains by feature type
- Quality gates
- Agent Teams usage
- Ralph Loop configuration
- Lessons learned from real sessions

It is NOT a template — it is copied as-is into target projects as a workflow reference.
