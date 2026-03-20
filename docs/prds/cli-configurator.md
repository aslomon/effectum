# PRD: Interactive CLI Configurator

## Problem

Effectum's setup is currently split into two disconnected steps:
1. `npx @aslomon/effectum` — copies files (commands, templates, stacks)
2. `/setup .` in Claude Code — configures the project (substitutes placeholders)

This causes multiple issues:
- **Placeholder residue**: `{{FORMATTER}}`, `{{PACKAGE_MANAGER}}`, `{{AUTONOMY_PERMISSIONS}}` are never substituted, leaving broken config files
- **Permission mode never set**: `defaultMode` stays `"default"` regardless of chosen autonomy level
- **Formatter hook broken**: PostToolUse hook has `echo formatter-not-configured` that's never replaced
- **guardrails.md stays generic**: Stack-specific and tool-specific sections say "Run /setup to configure"
- **No config persistence**: Settings are lost; re-running `npx` overwrites everything
- **No upgrade path**: New versions can't update commands without destroying user config
- **Poor UX**: readline-based prompts, no arrow key navigation, no multi-select
- **Non-technical users can't use it**: Too many manual steps, too much assumed knowledge

## Goal

Merge the installer and `/setup` into a single interactive CLI experience that produces fully configured, ready-to-use Claude Code project files — no manual editing required. Non-technical users should be able to set up their entire dev environment by answering guided questions.

## User Stories

- As a developer, I want to run `npx @aslomon/effectum` in my project and have everything configured in one step, so I can immediately start using `/plan` and `/prd:new`
- As a non-technical user, I want arrow-key navigation and clear descriptions for each option, so I understand what I'm choosing
- As a developer, I want my configuration saved in `.effectum.json`, so updates don't destroy my settings
- As a developer, I want to run `npx @aslomon/effectum reconfigure` to re-apply or change settings without reinstalling
- As a developer, I want to select individual MCP servers via multi-select, not all-or-nothing
- As a developer, I want a `--dry-run` flag to see what would happen before committing

## Acceptance Criteria

- [ ] AC1: Running `npx @aslomon/effectum` in a project directory starts an interactive TUI with arrow-key navigation (using @clack/prompts)
- [ ] AC2: The CLI auto-detects project name (from directory), tech stack (from package.json/pyproject.toml/Package.swift), and package manager — presenting detected values as defaults
- [ ] AC3: User can select from available stacks via single-select with arrow keys (Next.js + Supabase, Python + FastAPI, Swift/SwiftUI, Generic, Custom)
- [ ] AC4: User can select communication language (English, German/du, Custom)
- [ ] AC5: User can select autonomy level (Conservative, Standard, Full Autonomy) with clear descriptions
- [ ] AC6: Autonomy level correctly maps to settings.json `defaultMode`: Conservative → `"default"`, Standard → `"default"` with expanded allow list, Full → `"bypassPermissions"`
- [ ] AC7: User can multi-select MCP servers (Context7, Playwright, Sequential Thinking, Filesystem) via space-to-toggle interface
- [ ] AC8: User can optionally create a new git branch (suggested name: `effectum-setup`)
- [ ] AC9: Stack selection correctly substitutes ALL placeholders in CLAUDE.md: `{{PROJECT_NAME}}`, `{{LANGUAGE}}`, `{{TECH_STACK}}`, `{{ARCHITECTURE_PRINCIPLES}}`, `{{PROJECT_STRUCTURE}}`, `{{QUALITY_GATES}}`, `{{STACK_SPECIFIC_GUARDRAILS}}`, `{{FORMATTER}}`, `{{PACKAGE_MANAGER}}`
- [ ] AC10: PostToolUse formatter hook is correctly set based on stack (prettier for Next.js, ruff for Python, swift-format for Swift, echo for Generic)
- [ ] AC11: guardrails.md stack-specific section is populated from stack preset
- [ ] AC12: All configuration is saved to `.effectum.json` in the project root
- [ ] AC13: `npx @aslomon/effectum reconfigure` reads `.effectum.json` and re-applies all settings (re-generates CLAUDE.md, settings.json, guardrails.md from templates + saved config)
- [ ] AC14: `npx @aslomon/effectum --dry-run` shows planned file operations without writing anything
- [ ] AC15: Global install (`--global`) installs only base files (commands, AUTONOMOUS-WORKFLOW.md) — project config requires `npx @aslomon/effectum init` per project
- [ ] AC16: Generated CLAUDE.md has ZERO remaining `{{...}}` placeholders
- [ ] AC17: Generated settings.json has correct `defaultMode` and no placeholder values
- [ ] AC18: All existing CLI flags remain backward-compatible (`--global`, `--local`, `--claude`, `--with-mcp`, `--with-playwright`, `--yes`)
- [ ] AC19: Non-interactive mode (`--yes` or CI detection) uses smart defaults: auto-detected stack, English, Standard autonomy, all MCP servers
- [ ] AC20: Summary screen at the end shows all created/modified files with a configuration recap

## Scope

### In Scope

- Rewrite of `bin/install.js` with @clack/prompts for interactive TUI
- Template substitution engine (reads stack presets, substitutes all placeholders)
- Stack preset parser (extracts TECH_STACK, ARCHITECTURE_PRINCIPLES, etc. from markdown)
- `.effectum.json` config file (write on install, read on reconfigure)
- `reconfigure` subcommand
- `init` subcommand (for per-project setup after global install)
- `--dry-run` flag
- Git branch creation (optional step)
- Auto-detection: project name, stack, package manager
- Correct autonomy level → permission mode mapping
- Correct stack → formatter mapping in PostToolUse hook

### Out of Scope

- Custom stack creation wizard (users can manually add `.effectum/stacks/my-stack.md`)
- DESIGN.md generation (handled by Claude Code in generative process)
- PRD Workshop changes (no modifications to workshop/ knowledge files)
- MCP server installation logic changes (keep existing npm check + install)
- Playwright browser installation changes (keep existing logic)
- New stack presets (only use existing 4: nextjs-supabase, python-fastapi, swift-ios, generic)
- Agent Teams configuration (keep existing opt-in flag)
- `/setup` slash command removal (keep as legacy/advanced override, but mark as optional)

## Data Model

### `.effectum.json` Schema

```json
{
  "version": "0.2.0",
  "projectName": "my-project",
  "stack": "nextjs-supabase",
  "language": "english",
  "autonomyLevel": "standard",
  "packageManager": "pnpm",
  "formatter": "prettier",
  "mcpServers": ["context7", "playwright", "sequential-thinking", "filesystem"],
  "playwrightBrowsers": true,
  "installScope": "local",
  "createdAt": "2026-03-20T17:00:00Z",
  "updatedAt": "2026-03-20T17:00:00Z"
}
```

## Technical Design

### Dependencies

- `@clack/prompts` — Interactive TUI (single dependency, <15 KB, TypeScript-first)
- All existing Node.js built-ins remain

### Subcommand Router

```
npx @aslomon/effectum              → install (default, interactive)
npx @aslomon/effectum init         → per-project init (after global install)
npx @aslomon/effectum reconfigure  → re-apply from .effectum.json
npx @aslomon/effectum --help       → help text
```

### File Architecture

```
bin/
  effectum.js          → Subcommand router (entry point)
  install.js           → Main installer (rewritten with @clack/prompts)
  init.js              → Per-project initializer
  reconfigure.js       → Re-apply from .effectum.json
  lib/
    detect.js          → Auto-detection (stack, project name, package manager)
    template.js        → Template substitution engine
    stack-parser.js    → Parse stack preset .md files → key-value map
    config.js          → Read/write .effectum.json
    ui.js              → Shared @clack/prompts helpers
    constants.js       → Autonomy level mappings, formatter mappings, etc.
```

### Autonomy Level Mapping

```javascript
const AUTONOMY_MAP = {
  conservative: {
    defaultMode: "default",
    permissions: { allow: ["Read(*)", "Glob(*)", "Grep(*)", "WebFetch(*)", "WebSearch(*)"] }
  },
  standard: {
    defaultMode: "default",
    permissions: { allow: ["Bash(*)", "Read(*)", "Write(*)", "Edit(*)", "Glob(*)", "Grep(*)", "WebFetch(*)", "WebSearch(*)", "Task(*)", "NotebookEdit(*)"] }
  },
  full: {
    defaultMode: "bypassPermissions",
    permissions: { allow: ["Bash(*)", "Read(*)", "Write(*)", "Edit(*)", "Glob(*)", "Grep(*)", "WebFetch(*)", "WebSearch(*)", "Task(*)", "NotebookEdit(*)"] }
  }
};
```

### Formatter Mapping

```javascript
const FORMATTER_MAP = {
  "nextjs-supabase": { command: "npx prettier --write", name: "Prettier" },
  "python-fastapi": { command: "ruff format", name: "Ruff" },
  "swift-ios": { command: "swift-format format --in-place", name: "swift-format" },
  "generic": { command: "echo no-formatter-configured", name: "None" }
};
```

### Stack Preset Parser

Stack presets use this format:
```markdown
## KEY_NAME
\```
value content here
\```
```

Parser extracts key-value pairs via regex:
```javascript
function parseStackPreset(content) {
  const sections = {};
  const regex = /^## (\w+)\s*\n```\n([\s\S]*?)```/gm;
  let match;
  while ((match = regex.exec(content)) !== null) {
    sections[match[1]] = match[2].trim();
  }
  return sections;
}
```

## Constraints

- Zero breaking changes to existing CLI flags
- Must work with Node.js >= 18 (same as current)
- `@clack/prompts` is the ONLY new dependency
- All file content (CLAUDE.md, settings.json, guardrails.md, commands) stays in English
- Template substitution must handle all 9 placeholders without residue
- `.effectum.json` must be human-readable and manually editable

## Quality Gates

- Build: `node bin/effectum.js --help` exits 0
- Types: No TypeScript (pure JS), but JSDoc annotations for IDE support
- Lint: `npx eslint bin/` — 0 errors (if eslint configured)
- Tests: Manual testing of all interactive flows (TUI is hard to unit test)
- Smoke test: `npx @aslomon/effectum --dry-run` in a Next.js project shows correct file plan
- Regression: All existing flags (`--global`, `--local`, `--yes`, `--with-mcp`, `--with-playwright`) work as before
- Placeholder check: `grep -r '{{' <generated-files>` returns 0 matches

## Completion Promise

"All acceptance criteria met, CLI runs interactively with arrow keys, all placeholders substituted, .effectum.json written, reconfigure works, dry-run works, backward compatible"
