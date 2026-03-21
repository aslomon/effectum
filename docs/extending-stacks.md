# Extending Effectum: Adding a New Stack Preset

This guide walks you through adding a new stack preset to Effectum from scratch. By the end, a user choosing your stack during setup will get a fully configured `CLAUDE.md`, correct formatter/linter hooks, and appropriate tool and skill recommendations.

## Overview

A stack preset in Effectum consists of four parts:

| Part | Location | Purpose |
|------|----------|---------|
| Preset file | `system/stacks/<stack-key>.md` | Tech stack rules Claude follows (architecture, quality gates, etc.) |
| Stack constant | `bin/lib/constants.js` | Registration in `STACK_CHOICES` and `FORMATTER_MAP` |
| Recommendation tags | `bin/lib/recommendation.js` | Drives which skills/agents/hooks get recommended |
| (Optional) Tools | `system/tools/` | Tool definitions specific to this stack |

---

## Step 1: Choose a Stack Key

Pick a kebab-case identifier for your stack. This key is used everywhere — file names, constants, config files.

**Examples:** `go-gin`, `ruby-rails`, `django`, `nuxt-postgres`, `tauri-react`

Use the key consistently throughout all steps below.

---

## Step 2: Create the Stack Preset File

Create `system/stacks/<your-stack-key>.md`. This file is parsed and injected into `CLAUDE.md` during installation.

### File Format

The file uses a set of named sections. Each section is enclosed in a fenced code block. The section name is the heading immediately above it.

```markdown
# Stack Preset: Your Stack Name

> One-line description of the stack and its use case.

## TECH_STACK

```
- List of technologies, versions, key libraries
- Conventions (e.g., which package manager to use)
- Test frameworks, linters, formatters
```

## ARCHITECTURE_PRINCIPLES

```
- Core architectural rules Claude must follow
- Data flow conventions
- Security requirements
- Separation of concerns
```

## PROJECT_STRUCTURE

````
```
src/
  ...annotated directory tree...
```
````

## QUALITY_GATES

```
- Build: <build command> — 0 errors
- Types: <type check command> — 0 errors
- Tests: <test command> — all pass, 80%+ coverage
- Lint: <lint command> — 0 errors
- ... add stack-specific gates
```

## FORMATTER

```
<formatter command, e.g. "gofmt -w">
```

## FORMATTER_GLOB

```
<file extension pattern, e.g. "go">
```

## PACKAGE_MANAGER

```
<package manager, e.g. "go mod" / "pip" / "cargo">
```

## STACK_SPECIFIC_GUARDRAILS

```
- **Rule name**: Explanation of the rule and why it matters.
- ...
```

## TOOL_SPECIFIC_GUARDRAILS

```
- **Hook name**: What the hook does so Claude doesn't redo it manually.
- ...
```
```

### Real Example: `system/stacks/nextjs-supabase.md`

See [`system/stacks/nextjs-supabase.md`](../system/stacks/nextjs-supabase.md) for a complete, production-grade example.

### Rules for Writing a Good Preset

- **Be prescriptive, not descriptive.** Write rules as imperatives: "Always use X", "Never do Y", not "X is available".
- **Include versions.** `Go >= 1.22`, not just `Go`.
- **List anti-patterns explicitly.** If a common mistake exists, name it and forbid it.
- **Quality gates must be runnable commands.** Claude will literally run them.
- **STACK_SPECIFIC_GUARDRAILS** = rules about the stack's conventions. **TOOL_SPECIFIC_GUARDRAILS** = rules about Effectum's hooks (to prevent Claude from doing something the hook already handles automatically).

---

## Step 3: Register the Stack in `constants.js`

Open `bin/lib/constants.js` and add your stack to two objects:

### 3a. Add to `STACK_CHOICES`

```js
const STACK_CHOICES = [
  { value: "nextjs-supabase", label: "Next.js + Supabase", hint: "..." },
  { value: "python-fastapi",  label: "Python + FastAPI",   hint: "..." },
  { value: "swift-ios",       label: "Swift / SwiftUI",    hint: "..." },
  { value: "generic",         label: "Generic",            hint: "..." },
  // ↓ Add your stack here
  {
    value: "go-gin",
    label: "Go + Gin",
    hint: "REST APIs with Go, Gin, GORM, PostgreSQL",
  },
];
```

### 3b. Add to `FORMATTER_MAP`

```js
const FORMATTER_MAP = {
  "nextjs-supabase": { command: "npx prettier --write", name: "Prettier", glob: "ts|tsx|js|jsx|json|css|md" },
  "python-fastapi":  { command: "ruff format",           name: "Ruff",     glob: "py" },
  "swift-ios":       { command: "swift-format format -i", name: "swift-format", glob: "swift" },
  "generic":         { command: "echo no-formatter-configured", name: "None", glob: "*" },
  // ↓ Add your formatter here
  "go-gin": {
    command: "gofmt -w",
    name: "gofmt",
    glob: "go",
  },
};
```

The `glob` field is the file extension pattern used by the PostToolUse hook to auto-format files after edits.

---

## Step 4: Add Recommendation Tags

Open `bin/lib/recommendation.js` and register your stack's tags in `STACK_TAGS`:

```js
const STACK_TAGS = {
  "nextjs-supabase": ["nextjs", "react", "supabase", "typescript", "frontend-heavy", "db-needed", "postgres"],
  "python-fastapi":  ["python", "api-first", "backend-heavy"],
  "swift-ios":       ["swift", "native-ui", "frontend-heavy"],
  "generic":         [],
  // ↓ Add your stack here
  "go-gin": ["go", "api-first", "backend-heavy", "db-needed", "postgres"],
};
```

### How Tags Work

Tags are the recommendation engine's vocabulary. When a user installs Effectum with your stack:

1. `extractTags()` collects tags from the chosen stack + app type + description keywords.
2. `COMMAND_RULES`, `HOOK_RULES`, `SKILL_RULES`, and `MCP_RULES` are filtered — any rule whose tags overlap with the extracted tags gets included.

### Available Tags (non-exhaustive)

| Tag | Meaning |
|-----|---------|
| `frontend-heavy` | Recommends frontend-design skill, web testing |
| `backend-heavy` | Backend-oriented tooling |
| `api-first` | REST/API focused |
| `db-needed` | Database setup, migration tools |
| `auth-needed` | Authentication, security checks |
| `realtime` | WebSocket, Supabase Realtime, etc. |
| `testing-heavy` | Enhanced test coverage tools |
| `docs-needed` | Documentation generation |
| `ai-agent` | LLM integration, Claude API |
| `payments` | Stripe, payment flows |
| `multi-tenant` | Multi-org architecture |
| `devops` | CI/CD, Docker, deployment |

Add your own tags freely — they only have effect if referenced in `COMMAND_RULES`, `HOOK_RULES`, `SKILL_RULES`, or `MCP_RULES`.

### Making a Skill Mandatory for Your Stack

If a skill should always be included for your stack (regardless of description keywords), use `mandatoryForStacks`:

```js
// In SKILL_RULES inside recommendation.js
const SKILL_RULES = [
  {
    key: "some-skill",
    label: "Some Skill",
    tags: ["some-tag"],
    mandatoryForStacks: ["nextjs-supabase", "go-gin"],  // ← add your stack
  },
  // ...
];
```

---

## Step 5: (Optional) Add Tool Definitions

If your stack uses Claude Code tools (MCP tools, custom scripts), add them to `system/tools/`. Check `bin/lib/tool-loader.js` for how tools are discovered and applied.

---

## Step 6: (Optional) Add a Stack-Specific Agent

If your stack benefits from a specialized sub-agent, create one in `system/agents/`. See [extending-agents.md](./extending-agents.md) for details.

Then register the agent in `bin/lib/specializations.js` under `STACK_SUBAGENTS`:

```js
const STACK_SUBAGENTS = {
  "nextjs-supabase": ["frontend-developer", "nextjs-developer", ...],
  // ↓ Add your stack here
  "go-gin": ["backend-developer", "go-expert"],
};
```

---

## Step 7: Test Your Stack

```bash
# 1. Create a test directory
mkdir /tmp/test-go-gin && cd /tmp/test-go-gin

# 2. Run the installer
node /path/to/effectum/bin/effectum.js --local

# 3. Select your new stack during the interactive prompts

# 4. Verify the output
# Check that CLAUDE.md contains your TECH_STACK section
grep "TECH_STACK" .claude/CLAUDE.md

# Check your ARCHITECTURE_PRINCIPLES are present
grep "ARCHITECTURE_PRINCIPLES" .claude/CLAUDE.md

# Check the formatter is correct
cat .claude/settings.json | grep -A3 "PostToolUse"

# 5. Test non-interactive install
cd /tmp/test-go-gin-2
node /path/to/effectum/bin/effectum.js --local --yes
# (verify it doesn't break with defaults)

# 6. Test dry-run
node /path/to/effectum/bin/effectum.js --local --dry-run
# Should print what would be written, but write nothing
```

### Checklist

- [ ] `system/stacks/<key>.md` exists with all required sections
- [ ] Stack appears in the interactive prompt's stack list
- [ ] `CLAUDE.md` after install contains correct tech stack rules
- [ ] Formatter hook uses the correct command and glob
- [ ] `FORMATTER_MAP` has no typos
- [ ] Tags in `STACK_TAGS` accurately represent the stack's domain
- [ ] `--dry-run` completes without errors
- [ ] `reconfigure` re-applies the preset correctly from `.effectum.json`

---

## Reference: Parsed Section Names

`bin/lib/stack-parser.js` reads these section headings from your preset file. Headings not listed here are ignored.

| Heading | Injected into |
|---------|--------------|
| `## TECH_STACK` | `CLAUDE.md` TECH_STACK block |
| `## ARCHITECTURE_PRINCIPLES` | `CLAUDE.md` ARCHITECTURE block |
| `## PROJECT_STRUCTURE` | `CLAUDE.md` PROJECT_STRUCTURE block |
| `## QUALITY_GATES` | `CLAUDE.md` QUALITY_GATES block |
| `## FORMATTER` | Hook configuration |
| `## FORMATTER_GLOB` | PostToolUse hook file filter |
| `## PACKAGE_MANAGER` | `CLAUDE.md` toolchain section |
| `## STACK_SPECIFIC_GUARDRAILS` | `CLAUDE.md` guardrails section |
| `## TOOL_SPECIFIC_GUARDRAILS` | `CLAUDE.md` tool rules section |
