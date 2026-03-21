# PRD: CLI Tool Integration + New Hooks + New Agents

## Problem

Effectum configures Claude Code with commands, skills, agents, and MCP servers — but ignores the CLI tools that Claude Code actually uses to work autonomously. A Next.js + Supabase project needs `supabase`, `vercel`, `gh` installed and authenticated. Non-technical users don't know this.

Additionally, two critical hooks are missing from the foundation:
1. No secret detection before commits (security risk)
2. No TDD enforcement at stop (code ships without tests)

And two agent specializations are missing for supported app types:
1. No mobile-developer agent for "Mobile App" projects
2. No data-engineer agent for "Data / ML Tool" projects

## Goal

In one release:
1. Add CLI tool check + guided installation + auth check as a new configurator step
2. Add secret detection hook (PreToolUse) to foundation
3. Add TDD enforcement hook (Stop) to foundation
4. Add mobile-developer and data-engineer agent specializations
5. Update CLAUDE.md template to document available tools

## Acceptance Criteria

### CLI Tool Integration

- [ ] AC1: New module `bin/lib/cli-tools.js` defines all CLI tools with: binary name, install commands (per platform), auth command, description, stack compatibility
- [ ] AC2: Foundation tools (git, gh) are always checked regardless of stack
- [ ] AC3: Stack-specific tools are checked based on selected stack: supabase + vercel for nextjs-supabase, uv + docker for python-fastapi, xcodebuild for swift-ios
- [ ] AC4: `checkTool(name)` uses `which` to detect if a tool is installed
- [ ] AC5: Interactive mode shows a CLI Tool Check step after the recommended setup preview
- [ ] AC6: Missing tools are listed with install commands per platform (darwin/linux)
- [ ] AC7: User can choose: "Install all missing" / "Skip" / "Show commands only"
- [ ] AC8: Auto-install runs the platform-appropriate install command (brew/apt/npm/curl)
- [ ] AC9: After install, auth status is checked for tools that need authentication
- [ ] AC10: Auth check shows: authenticated (✅) or not authenticated (❌) with the auth command
- [ ] AC11: User can choose to run auth commands or skip
- [ ] AC12: Non-interactive mode (`--yes`) skips tool installation and auth (just checks and reports)
- [ ] AC13: CLAUDE.md template gets a new `{{AVAILABLE_TOOLS}}` section documenting which tools are available
- [ ] AC14: `.effectum.json` stores detected tools and their status

### Secret Detection Hook

- [ ] AC15: A new PreToolUse hook (matcher: "Bash") scans for common secret patterns before `git commit` and `git push`
- [ ] AC16: Patterns detected: API keys (sk-*, sk_*, AKIA*), tokens (ghp_*, gho_*, glpat-*), passwords in URLs, .env file contents
- [ ] AC17: If a secret is detected, the hook exits with code 2 (blocks the commit) and shows a warning
- [ ] AC18: The hook is part of the foundation (always installed, not optional)
- [ ] AC19: StatusMessage: "Scanning for secrets..."

### TDD Enforcement Hook

- [ ] AC20: A new Stop hook (type: "prompt") checks if tests were written for code changes
- [ ] AC21: The hook reads `git diff --stat` and checks if test files were modified/created alongside source files
- [ ] AC22: If source files changed but no test files changed, it returns `{ok: false, reason: "No tests written for changed source files"}`
- [ ] AC23: The hook respects `stop_hook_active` flag (lenient on second pass)
- [ ] AC24: The hook is part of the foundation (always installed)

### New Agent Specializations

- [ ] AC25: `mobile-developer.md` agent file exists in `system/agents/`
- [ ] AC26: mobile-developer covers: React Native, Flutter, Expo, native iOS/Android, responsive design, app store guidelines
- [ ] AC27: `data-engineer.md` agent file exists in `system/agents/`
- [ ] AC28: data-engineer covers: ETL pipelines, data modeling, SQL optimization, pandas/polars, Spark, data validation, schema design
- [ ] AC29: Both agents follow the same format as existing agents (frontmatter with name, description, tools, model)
- [ ] AC30: Recommendation engine maps mobile-developer to app type "mobile" and data-engineer to app type "data-ml"

## Scope

### In Scope
- `bin/lib/cli-tools.js` module
- CLI tool check step in interactive and non-interactive flows
- Platform-aware install commands (darwin via brew, linux via apt, universal via npm/curl)
- Auth check for tools that need it
- Secret detection PreToolUse hook in settings.json template
- TDD enforcement Stop hook in settings.json template
- mobile-developer.md and data-engineer.md agent files
- Recommendation engine updates for new agents
- CLAUDE.md template update with available tools section
- .effectum.json schema update

### Out of Scope
- Automatic tool authentication (user must run auth commands themselves)
- Windows support for tool installation
- MCP server additions (CLI tools are preferred)
- New skills
- CI/CD pipeline

## Technical Design

### CLI Tools Definition

```javascript
// bin/lib/cli-tools.js
const CLI_TOOLS = [
  // Foundation (always recommended)
  {
    key: "git", bin: "git",
    install: { darwin: "xcode-select --install", linux: "sudo apt install -y git" },
    auth: 'git config user.name && git config user.email',
    authSetup: 'git config --global user.name "Your Name" && git config --global user.email "you@example.com"',
    why: "Version control — required for all projects",
    foundation: true,
  },
  {
    key: "gh", bin: "gh",
    install: { darwin: "brew install gh", linux: "sudo apt install -y gh" },
    auth: "gh auth status",
    authSetup: "gh auth login",
    why: "GitHub: Issues, PRs, Code Search, CI status",
    foundation: true,
  },
  // Stack-specific
  {
    key: "supabase", bin: "supabase",
    install: { darwin: "brew install supabase/tap/supabase", linux: "npm i -g supabase" },
    auth: "supabase projects list",
    authSetup: "supabase login",
    why: "Database migrations, type generation, edge functions",
    stacks: ["nextjs-supabase"],
  },
  {
    key: "vercel", bin: "vercel",
    install: { all: "npm i -g vercel" },
    auth: "vercel whoami",
    authSetup: "vercel login",
    why: "Deployment to Vercel",
    stacks: ["nextjs-supabase"],
  },
  {
    key: "docker", bin: "docker",
    install: { darwin: "brew install --cask docker", linux: "sudo apt install -y docker.io" },
    auth: null,
    why: "Container management, local dev environment",
    stacks: ["python-fastapi", "generic"],
  },
  {
    key: "uv", bin: "uv",
    install: { all: "curl -LsSf https://astral.sh/uv/install.sh | sh" },
    auth: null,
    why: "Fast Python package management",
    stacks: ["python-fastapi"],
  },
  {
    key: "ruff", bin: "ruff",
    install: { all: "pip install ruff" },
    auth: null,
    why: "Python linting and formatting",
    stacks: ["python-fastapi"],
  },
];
```

### Secret Detection Hook

```json
{
  "matcher": "Bash",
  "hooks": [{
    "type": "command",
    "command": "bash -c 'CMD=$(jq -r \".tool_input.command\" <<< \"$(cat)\"); if echo \"$CMD\" | grep -qE \"^git (commit|push)\"; then DIFF=$(git diff --cached --diff-filter=ACM 2>/dev/null || git diff HEAD 2>/dev/null); if echo \"$DIFF\" | grep -qEi \"(sk-[a-zA-Z0-9]{20,}|sk_live_|sk_test_|AKIA[A-Z0-9]{16}|ghp_[a-zA-Z0-9]{36}|gho_[a-zA-Z0-9]{36}|glpat-[a-zA-Z0-9-]{20}|xox[bpras]-[a-zA-Z0-9-]+|password\\s*[:=]\\s*[\\x27\\\"][^\\x27\\\"]{8,})\"; then echo \"⚠️  Potential secret detected in staged changes! Review before committing.\" >&2; exit 2; fi; fi; exit 0'",
    "statusMessage": "Scanning for secrets..."
  }]
}
```

### TDD Enforcement Stop Hook

```json
{
  "type": "prompt",
  "prompt": "Check if tests were written for code changes. Run: git diff --name-only HEAD 2>/dev/null\n\nAnalyze the changed files:\n1. Identify source code files (not config, not docs, not tests)\n2. Check if corresponding test files were also changed or created\n3. If source files changed but NO test files changed, respond {\"ok\": false, \"reason\": \"Source files were modified but no tests were written. Write tests before stopping.\"}\n4. If tests exist for the changes, or only config/docs changed, respond {\"ok\": true}\n5. If stop_hook_active is true in input, be lenient — only block for completely untested new features.\n\nContext: $ARGUMENTS",
  "timeout": 30,
  "statusMessage": "Checking test coverage..."
}
```

## Quality Gates

- CLI tool check works on macOS (darwin) with brew
- CLI tool check gracefully handles missing brew/apt
- Secret detection blocks a commit containing `sk-test123abc...`
- Secret detection does NOT block normal commits
- TDD enforcement blocks stop when .ts files changed but no .test.ts files
- TDD enforcement allows stop when only config/docs changed
- mobile-developer agent is recommended for app type "mobile"
- data-engineer agent is recommended for app type "data-ml"
- Non-interactive mode reports tool status without blocking

## Completion Promise

"CLI tool check with guided installation, secret detection hook, TDD enforcement hook, mobile-developer agent, and data-engineer agent are all implemented, tested, and installable via the Effectum configurator"
