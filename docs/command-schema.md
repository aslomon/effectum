# Command Frontmatter Schema

All command files in `.claude/commands/` and `system/commands/` must begin with a YAML frontmatter block. This document defines the schema for that block.

## Required Fields

| Field | Type | Description |
|-------|------|-------------|
| `name` | string | Canonical command name (e.g. `effect:dev:tdd`). Used by tooling and test validation. Must not be empty. |
| `description` | string | One-sentence description of when to use this command. Max 200 characters. |
| `allowed-tools` | string[] | List of Claude Code tools this command may invoke. See valid values below. |

## Optional Fields

| Field | Type | Allowed values | Description |
|-------|------|----------------|-------------|
| `effort` | string | `"low"` \| `"medium"` \| `"high"` | Rough indication of how context-intensive this command is. Helps `/effect:next` prioritize and warn users before expensive operations. **Required by convention** — omit only for README files and non-command documents. |
| `tags` | string[] | free-form | Semantic labels for discoverability and routing. Examples: `["debugging", "loop-control"]`, `["prd", "planning"]`. No schema enforcement; used for filtering and documentation. |

## Valid `allowed-tools` Values

Claude Code supports these tool identifiers:

```
Read, Write, Edit, MultiEdit, Bash, Glob, Grep, LS, Agent, WebFetch, WebSearch, TodoRead, TodoWrite
```

Most commands use a subset. Examples:

- **Read-only analysis**: `["Read", "Glob", "Grep", "Bash"]`
- **Implementation**: `["Read", "Write", "Edit", "Bash", "Glob", "Grep"]`
- **Orchestration**: `["Read", "Write", "Edit", "Bash", "Glob", "Grep", "Agent"]`

## Full Example

```yaml
---
name: "effect:dev:tdd"
description: "Test-driven implementation loop: write failing tests, implement to pass, refactor."
allowed-tools: ["Read", "Write", "Edit", "Bash", "Glob", "Grep"]
effort: "high"
tags: ["implementation", "testing", "tdd"]
---
```

## Minimal Valid Example

```yaml
---
name: "effect:dev:verify"
description: "Run all quality gates and report pass/fail status."
allowed-tools: ["Read", "Bash", "Glob", "Grep"]
effort: "low"
---
```

## Conventions

- `effort: "high"` should be set on commands that spawn agents, run long loops, or consume significant context: `/ralph-loop`, `/effect:dev:run`, `/effectum:explore`, `/effectum:onboard`, `/effect:dev:orchestrate`.
- `effort: "medium"` for commands that involve multiple steps but complete in a bounded time: most PRD commands, `/context:init`, `/effect:dev:tdd`.
- `effort: "low"` for single-step or read-only commands: `/effect:next`, `/effect:dev:verify`, `/effect:prd:status`.
- `tags` is optional and currently informational. Future versions of `/effect:next` may use tags for routing.

## Validation

The test suite (`test/frontmatter.test.js`) enforces:

- All `.md` files in `.claude/commands/` and `system/commands/` (excluding `README.md`) have valid YAML frontmatter
- Required fields: `name` (non-empty string), `description` (non-empty, ≤200 chars), `allowed-tools` (non-empty array)
- Optional fields: `effort` must be one of `low | medium | high` if present; `tags` must be an array of strings if present

## Exclusions

The following files are excluded from frontmatter validation:

- `README.md` in any commands directory — documentation index, not a command
- Files in `workshop/` subdirectories — project-specific, not part of the Effectum command set
