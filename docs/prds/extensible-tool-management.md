# PRD: Extensible Tool Management System

## Problem

Effectum's CLI tool management is hardcoded in `bin/lib/cli-tools.js`. Adding a new stack or tool requires modifying JavaScript code. This doesn't scale for community contributions, new stacks, or the vision of "npx effectum = everything you need."

Additionally, the current system:
- Doesn't install system basics (Homebrew, Claude Code)
- Doesn't show a consolidated installation plan
- Asks about each tool individually instead of one confirmation
- Has no concept of "manual-only" tools (Docker, Xcode)
- Doesn't support community tool definitions

## Goal

Replace the hardcoded tool system with a **JSON-file-based, extensible architecture** where:
- Tool definitions live as JSON files in `system/tools/`
- New stack = new JSON file, zero code changes
- Community can add tools via `.effectum/tools/`
- The installer shows a consolidated plan and installs everything with one confirmation
- Large downloads (Docker, Xcode) are recommended with links, not auto-installed

## Acceptance Criteria

### JSON-based Tool Definitions

- [ ] AC1: Tool definitions are JSON files in `system/tools/` directory
- [ ] AC2: `foundation.json` defines always-required tools: git, gh, claude
- [ ] AC3: `nextjs-supabase.json` defines: pnpm, supabase CLI, vercel CLI
- [ ] AC4: `python-fastapi.json` defines: uv, ruff, docker (manual)
- [ ] AC5: `swift-ios.json` defines: xcode-select, swift-format
- [ ] AC6: `generic.json` defines minimal tools: jq (optional)
- [ ] AC7: Each tool has: key, bin, displayName, category, install commands per platform, auth config, why description, priority
- [ ] AC8: Tools can be marked `"autoInstall": false` for large downloads (Docker, Xcode)

### Dynamic Tool Loader

- [ ] AC9: New module `bin/lib/tool-loader.js` loads all JSON definitions dynamically
- [ ] AC10: Loader merges: foundation.json + stack-specific.json + app-type tools
- [ ] AC11: Community tools from `.effectum/tools/*.json` and `~/.effectum/tools/*.json` are also loaded
- [ ] AC12: Duplicate tool keys: local overrides bundled

### System Basics Check (Before Configuration)

- [ ] AC13: Before the configuration flow starts, check for system basics: Homebrew (macOS), Git, Node.js
- [ ] AC14: If Homebrew is missing on macOS, offer to install it
- [ ] AC15: If Git is missing, offer to install via brew/apt
- [ ] AC16: Claude Code check: if `claude` is not installed, offer `npm i -g @anthropic-ai/claude-code`

### Consolidated Installation Plan

- [ ] AC17: After configuration (stack chosen, app type selected), show ONE consolidated plan
- [ ] AC18: Plan shows: "Will install:" (auto-installable tools) + "Manual setup needed:" (large/complex tools with links)
- [ ] AC19: User confirms ONCE for all auto-installations
- [ ] AC20: Installation runs sequentially with progress spinners

### Platform Support

- [ ] AC21: macOS: Homebrew-based installation (`brew install`)
- [ ] AC22: Linux: apt-based installation (`sudo apt install -y`) or npm/curl fallbacks
- [ ] AC23: Platform is auto-detected via `process.platform`
- [ ] AC24: Tools without install commands for current platform show "Not available on this platform"

### Auth Flow

- [ ] AC25: After tool installation, check auth status for tools that need it
- [ ] AC26: Show auth status: ✅ authenticated / ❌ not authenticated
- [ ] AC27: For unauthenticated tools, show the auth command and optional URL
- [ ] AC28: User can run auth or skip

### Backward Compatibility

- [ ] AC29: Existing `--yes` mode works (checks tools, reports status, doesn't block)
- [ ] AC30: Existing `--with-mcp` and `--with-playwright` flags still work
- [ ] AC31: `.effectum.json` stores detected tools with status

### Extensibility

- [ ] AC32: Adding a new stack only requires creating a new JSON file in `system/tools/`
- [ ] AC33: Community can add custom tool definitions in `.effectum/tools/` or `~/.effectum/tools/`
- [ ] AC34: Tool JSON schema is documented in a README or schema file

## Scope

### In Scope
- `system/tools/*.json` — tool definition files for all stacks
- `bin/lib/tool-loader.js` — dynamic JSON loader + merger
- Refactor `bin/lib/cli-tools.js` to use tool-loader
- System basics check (Homebrew, Git, Claude Code) before config
- Consolidated installation plan UX
- Platform-aware install commands
- Auth check flow
- Community tool extensibility

### Out of Scope
- Windows support (document but don't implement in v1)
- Version management (nvm/mise integration)
- Automatic Docker/Xcode installation (always manual)
- Tool removal/uninstall

## Technical Design

### JSON Schema for Tool Definitions

```json
{
  "tools": [
    {
      "key": "supabase",
      "bin": "supabase",
      "displayName": "Supabase CLI",
      "category": "stack",
      "why": "Database migrations, type generation, edge functions",
      "priority": 1,
      "autoInstall": true,
      "install": {
        "darwin": "brew install supabase/tap/supabase",
        "linux": "npm i -g supabase"
      },
      "check": "supabase --version",
      "auth": {
        "check": "supabase projects list 2>&1 | head -1",
        "setup": "supabase login",
        "url": "https://supabase.com/dashboard/account/tokens"
      }
    }
  ]
}
```

### File Structure

```
system/tools/
  _schema.json          ← JSON schema documentation
  foundation.json       ← git, gh, claude (always loaded)
  nextjs-supabase.json  ← supabase, vercel, pnpm
  python-fastapi.json   ← uv, ruff, docker
  swift-ios.json        ← xcode-select, swift-format
  generic.json          ← minimal optional tools
```

### Installer Flow Update

```
Phase 1: System Basics
  → Check Homebrew, Git, Node, Claude Code
  → Install if missing (with consent)

Phase 2: Configuration (existing 9-step flow)
  → Stack, App Type, Description, Language, Autonomy
  → Recommended Setup Preview

Phase 3: Consolidated Tool Plan
  → Load foundation.json + stack-specific.json
  → Check which tools are installed
  → Show plan: "Will install: X, Y, Z" + "Manual: Docker"
  → One confirmation → install all

Phase 4: Auth
  → Check auth for installed tools
  → Guide through auth or skip

Phase 5: File Installation
  → CLAUDE.md, settings.json, guardrails.md, commands, skills, agents, teams
```

### tool-loader.js

```javascript
function loadToolDefinitions(stack, appType, targetDir) {
  const tools = [];
  
  // 1. Foundation (always)
  tools.push(...loadJson("system/tools/foundation.json"));
  
  // 2. Stack-specific
  const stackFile = `system/tools/${stack}.json`;
  if (exists(stackFile)) tools.push(...loadJson(stackFile));
  
  // 3. Community (local overrides)
  const localTools = `${targetDir}/.effectum/tools/`;
  const globalTools = `~/.effectum/tools/`;
  // ... load and merge
  
  // Deduplicate by key (local > bundled)
  return deduplicateByKey(tools);
}
```

## Quality Gates

- Foundation tools (git, gh, claude) are always checked
- Stack tools are only loaded for matching stack
- `--dry-run` shows the installation plan without executing
- `--yes` mode checks and reports but doesn't install
- New stack JSON can be added without code changes
- Community tools in `.effectum/tools/` override bundled ones
- Large tools (Docker) are never auto-installed
- Auth check correctly identifies authenticated vs not

## Completion Promise

"Tool management is fully JSON-driven, extensible without code changes, shows a consolidated install plan, handles system basics, and supports community tool definitions"
