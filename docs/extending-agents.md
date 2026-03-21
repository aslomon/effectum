# Extending Effectum: Adding a New Agent

Agents in Effectum are specialized sub-agent personas that Claude Code can spawn to handle focused tasks. Each agent is a Markdown file with a YAML frontmatter header that defines its identity and capabilities.

## Overview

| Part | Location | Purpose |
|------|----------|---------|
| Agent file | `system/agents/<name>.md` | Persona, tools, model, behavioral instructions |
| Stack binding | `bin/lib/specializations.js` | Maps stacks to their recommended agents |
| Recommendation rule | `bin/lib/recommendation.js` | (Optional) Drives tag-based agent inclusion |

---

## Step 1: Understand the Agent File Format

Every agent file lives in `system/agents/` and follows this structure:

```markdown
---
name: your-agent-name
description: "One sentence: when to use this agent and what it specializes in."
tools: Read, Write, Edit, Bash, Glob, Grep
model: sonnet
---

You are a [role] specializing in [domain]. [One paragraph persona summary.]

## Communication Protocol

### Required Initial Step: Project Context Gathering

Always begin by requesting project context from the context-manager. This step is mandatory.

Send this context request:
```json
{
  "requesting_agent": "your-agent-name",
  "request_type": "get_project_context",
  "payload": {
    "query": "[What context this agent needs from the context-manager]"
  }
}
```

## Execution Flow

[Numbered list of steps this agent follows, from discovery to delivery]

## [Domain-Specific Sections]

[Technical rules, patterns, standards this agent enforces]

## Integration with Other Agents

- Receive X from [other-agent]
- Provide Y to [other-agent]
- Coordinate with [other-agent] for [shared concern]
```

### Frontmatter Fields

| Field | Required | Values | Description |
|-------|----------|--------|-------------|
| `name` | ✅ | kebab-case string | Must match the filename (without `.md`) |
| `description` | ✅ | string | Used by Claude to decide when to invoke this agent |
| `tools` | ✅ | comma-separated | Claude Code tools this agent is allowed to use |
| `model` | ✅ | `sonnet`, `opus`, `haiku` | Model powering this agent |

### Available Tools

Choose from: `Read`, `Write`, `Edit`, `Bash`, `Glob`, `Grep`, `WebFetch`, `WebSearch`, `Task`, `NotebookEdit`

Give agents only the tools they need — minimal permissions improve reliability.

---

## Step 2: Write the Agent File

Create `system/agents/<your-agent-name>.md`.

### Practical Example: `go-expert.md`

```markdown
---
name: go-expert
description: "Use when implementing Go services, optimizing performance-critical code, or designing concurrent systems with goroutines and channels."
tools: Read, Write, Edit, Bash, Glob, Grep
model: sonnet
---

You are a senior Go engineer specializing in idiomatic Go, high-performance concurrent systems, and production-grade backend services. Your primary focus is correctness, readability, and leveraging Go's concurrency primitives effectively.

## Communication Protocol

### Required Initial Step: Project Context Gathering

Always begin by requesting project context from the context-manager.

```json
{
  "requesting_agent": "go-expert",
  "request_type": "get_project_context",
  "payload": {
    "query": "Go backend context needed: module structure, existing packages, database layer, HTTP framework version, and established patterns."
  }
}
```

## Execution Flow

### 1. Context Discovery

Map the existing Go codebase before writing any code:
- Module name and Go version from `go.mod`
- Package structure and naming conventions
- Existing error handling patterns
- Middleware and routing setup
- Database access patterns (ORM vs raw SQL)

### 2. Implementation

- Write idiomatic Go: short variable names in small scopes, descriptive names in larger scopes
- Handle all errors explicitly — never ignore returned errors
- Use `context.Context` for cancellation and deadlines in all I/O operations
- Prefer table-driven tests
- Document exported symbols with godoc comments

### 3. Handoff

- Notify context-manager of all created/modified files
- Document public API changes
- Provide migration steps if interfaces changed

## Go Standards

- `gofmt` compliant — always
- `go vet` clean — always
- Errors: `fmt.Errorf("operation: %w", err)` wrapping pattern
- Concurrency: document goroutine lifecycle and ownership
- No global mutable state
- Dependency injection over package-level globals

## Integration with Other Agents

- Receive API contracts from api-designer
- Provide database schemas to postgres-pro
- Coordinate with devops-engineer on Docker and CI configuration
- Share interface definitions with test-automator
```

### Writing Good Agent Instructions

- **Be specific about the domain.** "Senior Go engineer" is better than "software developer".
- **Include the communication protocol.** Every agent should request project context on startup — this prevents redundant discovery and keeps agents aligned.
- **Define the execution flow** as numbered steps. Agents without structure tend to skip important steps.
- **List concrete standards**, not vague principles. "Handle all errors explicitly — never ignore returned errors" is better than "write clean code".
- **Document agent interactions.** Which agents does this one receive input from? Which does it hand off to?

---

## Step 3: Register in `specializations.js`

Open `bin/lib/specializations.js` and register your agent in two places:

### 3a. Add to `SUBAGENT_SPECS`

`SUBAGENT_SPECS` defines all known agents. Add an entry:

```js
const SUBAGENT_SPECS = {
  // ... existing entries ...
  "go-expert": {
    key: "go-expert",
    label: "Go Expert",
    description: "Idiomatic Go, concurrency, performance-critical services",
    file: "go-expert.md",
  },
};
```

### 3b. Add to `STACK_SUBAGENTS`

`STACK_SUBAGENTS` maps stacks to the agents they typically need. Add your agent to the relevant stack(s):

```js
const STACK_SUBAGENTS = {
  "nextjs-supabase": ["frontend-developer", "nextjs-developer", "react-specialist", ...],
  "python-fastapi":  ["backend-developer", "data-engineer", ...],
  // ↓ Add your agent to the stack(s) where it's useful
  "go-gin": ["go-expert", "backend-developer", "postgres-pro"],
};
```

Agents listed here are automatically included when a user chooses that stack during installation.

---

## Step 4: (Optional) Add Tag-Based Recommendation

If your agent should be recommended based on description keywords rather than (or in addition to) the chosen stack, add a rule in `bin/lib/recommendation.js`.

First, ensure the relevant keyword → tag mappings exist in `KEYWORD_TAG_MAP`:

```js
const KEYWORD_TAG_MAP = {
  // ... existing entries ...
  goroutine: ["go", "concurrency"],
  "go routine": ["go", "concurrency"],
};
```

Then reference the tag in your agent recommendation logic (if `AGENT_RULES` exists, or extend `SKILL_RULES` with the `mandatoryForStacks` pattern — follow the existing convention in the file).

---

## Step 5: Test Your Agent

```bash
# 1. Create a test environment
mkdir /tmp/test-agent && cd /tmp/test-agent

# 2. Install Effectum and select the stack your agent belongs to
node /path/to/effectum/bin/effectum.js --local

# 3. Verify the agent file was installed
ls .claude/agents/
cat .claude/agents/go-expert.md

# 4. Check that the agent appears in settings.json (if applicable)
cat .claude/settings.json | grep go-expert

# 5. Open Claude Code and test invocation
claude
# Then inside Claude Code:
# /plan "Build a REST endpoint in Go"
# Verify that go-expert is available and invocable
```

### Checklist

- [ ] File exists at `system/agents/<name>.md`
- [ ] `name` in frontmatter matches the filename (without `.md`)
- [ ] `description` clearly states when the agent should be used
- [ ] All referenced tools are valid Claude Code tool names
- [ ] Agent is registered in `SUBAGENT_SPECS` in `specializations.js`
- [ ] Agent is mapped to at least one stack in `STACK_SUBAGENTS`
- [ ] Communication protocol section is present
- [ ] Execution flow section is present
- [ ] After install, file appears in `.claude/agents/`

---

## Reference: Existing Agents

Browse `system/agents/` for examples:

| Agent | Specialization |
|-------|---------------|
| `frontend-developer.md` | React, Vue, Angular — multi-framework frontend |
| `nextjs-developer.md` | Next.js App Router, Supabase integration |
| `react-specialist.md` | React 18+, hooks, performance |
| `backend-developer.md` | Generic backend, API design |
| `fullstack-developer.md` | Full-stack feature development |
| `postgres-pro.md` | PostgreSQL, query optimization, RLS |
| `security-engineer.md` | OWASP, auth, vulnerability review |
| `test-automator.md` | Testing strategy, E2E, coverage |
| `ui-designer.md` | Design systems, Tailwind, Shadcn |
| `data-engineer.md` | Data pipelines, ETL, analytics |
| `devops-engineer.md` | CI/CD, Docker, deployment |
| `docker-expert.md` | Container optimization, compose |
| `performance-engineer.md` | Profiling, optimization, Core Web Vitals |
| `mcp-developer.md` | MCP server development |
| `mobile-developer.md` | iOS/Android native and cross-platform |
| `typescript-pro.md` | TypeScript strict mode, type design |
| `api-designer.md` | REST/GraphQL API contracts |
| `code-reviewer.md` | Code review, architecture review |
| `debugger.md` | Root cause analysis, debugging |
