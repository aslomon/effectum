# Customization Guide

How to customize the autonomous development workflow after installation.

## Editing CLAUDE.md

`CLAUDE.md` is the primary configuration file. Claude reads it at every session start. Changes take effect immediately in the next session.

### Adding Project-Specific Rules

Add rules to the relevant section. Common additions:

```markdown
## Project-Specific Rules

- All API responses must include a `request_id` header for tracing
- Use [specific library] for [specific purpose] — do not introduce alternatives
- Follow the naming convention in `src/lib/billing/` for all new services
- Database queries must use parameterized queries, never string interpolation
- All new components must support both light and dark mode
```

### Changing the Tech Stack Description

If your project uses additional tools or diverges from the preset, update the `## Tech Stack` section. Be specific about versions and preferences:

```markdown
## Tech Stack

- Next.js 16 with App Router (NOT Pages Router)
- TypeScript 5.7 strict mode
- Tailwind CSS v4 + Shadcn UI (NOT Material UI, NOT Chakra)
- React Query v5 for server state management
- Zustand for client state (NOT Redux)
```

### Adjusting Commands

The `## Available Commands` table is informational. To change what a command does, edit the corresponding `.md` file in `.claude/commands/`. To add new commands, create new `.md` files there.

### Changing Communication Language

Edit the `## Communication` section:

```markdown
## Communication

- Speak German (du/informal) with the user.
- All code, comments, commits, and documentation in English.
```

Or for English:

```markdown
## Communication

- Communicate in English.
- Be direct. No unnecessary confirmations.
```

## Modifying settings.json

`.claude/settings.json` contains hook definitions, permissions, and behavior settings.

### Adjusting Permissions

The `permissions` section controls what Claude can do without asking:

```json
{
  "permissions": {
    "defaultMode": "bypassPermissions"
  }
}
```

Options:

| Mode                  | Behavior                                                                              |
| --------------------- | ------------------------------------------------------------------------------------- |
| `"allowEdits"`        | Claude asks for permission before file edits and bash commands. Conservative.         |
| `"bypassPermissions"` | Claude operates autonomously within the allow/deny rules. Standard and Full autonomy. |

### Adding Allowed Tools

Add MCP servers or tools to the `allow` list:

```json
{
  "permissions": {
    "allow": ["Bash(*)", "Read(*)", "mcp__your-custom-server"]
  }
}
```

### Adding Denied Patterns

Block specific commands:

```json
{
  "permissions": {
    "deny": ["Bash(rm -rf /)", "Bash(docker system prune)"]
  }
}
```

### Disabling Hooks

To disable a specific hook, remove it from the `hooks` section. For example, to disable the CHANGELOG auto-update, remove the agent hook from the `Stop` section.

To disable all hooks, set `"hooks": {}`.

### Enabling Agent Teams

Set the environment variable:

```json
{
  "env": {
    "CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS": "1"
  }
}
```

This enables `/orchestrate` for parallel multi-agent implementation.

## Creating Custom Guardrails

`.claude/guardrails.md` is injected at every session start and after context compaction. Add project-specific lessons here.

### Structure

```markdown
# Project Guardrails

## Error Patterns

- [Pattern observed] → [How to avoid it]

## Workflow Lessons

- [Lesson from past sessions]

## Stack-Specific

- [Framework/library-specific rules]

## Tool-Specific

- [Tool behavior notes]
```

### Good Guardrails

Guardrails should be concrete and actionable:

```markdown
## Error Patterns

- **API rate limiting**: The Stripe API sandbox has a limit of 25 requests/second.
  Use the test clock instead of real-time API calls in integration tests.

- **Database connection pool**: The Supabase free tier limits to 20 concurrent connections.
  Tests must use a single connection or mock the database.

## Stack-Specific

- **Tailwind v4 breaking change**: `@apply` works differently in v4.
  Use CSS variables instead of @apply for dynamic theming.
```

### Bad Guardrails

Avoid vague or generic rules that add noise:

```markdown
# Avoid these:

- Be careful with the code
- Test everything
- Follow best practices
```

## Adding Stack-Specific Commands

Create new `.md` files in `.claude/commands/` to add custom slash commands.

### Command File Structure

```markdown
# /my-command — Short Description

Detailed instructions for what Claude should do when this command is invoked.

## Step 1: [First step]

[Instructions]

## Step 2: [Second step]

[Instructions]

## Communication

Follow the language settings defined in CLAUDE.md.
```

### Example: Database Seed Command

Create `.claude/commands/seed.md`:

```markdown
# /seed — Seed the Database

Populate the development database with realistic test data.

## Step 1: Check Current State

Run `pnpm supabase status` to verify the database is running.

## Step 2: Generate Seed Data

Create seed files in `supabase/seed/`:

- 3 organizations
- 5 users per organization (with different roles)
- 10-20 sample records per domain entity

## Step 3: Apply Seeds

Run `pnpm supabase db reset` to apply migrations and seeds.

## Step 4: Verify

Query each seeded table and confirm row counts match expectations.
```

## Adjusting Quality Gates

Quality gates are defined in two places:

### In CLAUDE.md

The `## Quality Gates` section lists the gates and their commands. Edit this to change which tools run and what thresholds apply:

```markdown
## Quality Gates

| Gate  | Command           | Criterion                  |
| ----- | ----------------- | -------------------------- |
| Build | `pnpm build`      | 0 errors                   |
| Types | `tsc --noEmit`    | 0 errors                   |
| Tests | `pnpm vitest run` | All passing, 90%+ coverage |
| Lint  | `pnpm lint`       | 0 errors                   |
```

### In PRDs

Each PRD can define its own quality gates that add to or override the project defaults:

```markdown
### Quality Gates

- All project-level gates apply
- Custom: `pnpm test:integration -- --filter=invitations` — all invitation tests pass
```

## Changing Autonomy Level

The autonomy level affects two things:

### 1. Permission Mode (settings.json)

```json
{
  "permissions": {
    "defaultMode": "allowEdits"
  }
}
```

Change to `"bypassPermissions"` for higher autonomy.

### 2. Behavioral Instructions (CLAUDE.md)

Add explicit instructions about when to stop and ask:

```markdown
## Autonomy

- Make your own decisions on implementation details.
- Only stop and ask for: breaking changes to existing APIs, new third-party dependencies, and architectural decisions with > 2 valid approaches.
- Design decisions: follow DESIGN.md. If no guidance exists, decide autonomously and document the decision.
```

## Adding Team-Specific Conventions

For teams sharing a project, add conventions to CLAUDE.md:

```markdown
## Team Conventions

- Branch naming: `feature/{ticket-id}-{short-description}`
- Commit format: `feat(scope): description` (conventional commits)
- PR template: always include test plan and screenshots for UI changes
- Code owners: changes to `src/lib/auth/` require security team review
- Deployment: never deploy on Fridays
```

## Advanced: Custom Hook Types

The settings.json supports several hook types:

| Type      | Purpose               | Use Case                                |
| --------- | --------------------- | --------------------------------------- |
| `command` | Run a shell command   | File protection, formatting, logging    |
| `prompt`  | Ask Claude a question | Quality verification, work assessment   |
| `agent`   | Spawn a subagent      | CHANGELOG updates, complex verification |

### Example: Custom Post-Commit Hook

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "command": "bash -c 'CMD=$(jq -r \".tool_input.command\" <<< \"$(cat)\"); if echo \"$CMD\" | grep -q \"git commit\"; then echo \"Commit detected. Run tests next.\"; fi'",
            "async": true
          }
        ]
      }
    ]
  }
}
```
