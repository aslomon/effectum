# Skills

## What Are Skills?

Skills are self-contained, reusable instruction sets that extend Claude Code's capabilities for specific tasks. A skill is loaded on-demand when a task matches its description: Claude reads the `SKILL.md` file and follows its instructions as if they were part of the system prompt.

Skills are fundamentally different from agents and commands:

| Concept | What it is | Invocation | Scope |
|---|---|---|---|
| **Skill** | A `SKILL.md` instruction set with optional scripts | Matched automatically from description, or invoked by name | Single Claude session; injects context into the current agent |
| **Command** | A `/slash-command` shortcut defined in `settings.json` or `.claude/commands/` | Explicit `/command` invocation by the user | Single turn; executes a canned prompt or script |
| **Agent** | A `.md` file defining a specialist subagent with its own model and tools | Spawned as a subagent (Task tool) or teammate | Separate Claude session; has independent context |

The key distinction: **a skill augments the current session**, while **an agent runs in an isolated subagent session**. Skills are for enriching Claude's knowledge and process; agents are for parallel or delegated execution.

---

## Directory Structure of a Skill

A skill lives in its own directory under `~/.claude/skills/` (global) or `.claude/skills/` (project-level). The only required file is `SKILL.md`.

```
skills/
└── my-skill/
    ├── SKILL.md          # Required — instruction set and frontmatter
    ├── scripts/          # Optional — helper scripts called by the skill
    │   ├── setup.sh
    │   └── validate.py
    ├── templates/        # Optional — code or doc templates referenced in SKILL.md
    ├── themes/           # Optional — data files (e.g., theme-factory color schemes)
    ├── assets/           # Optional — images, PDFs, or other binary assets
    └── LICENSE.txt       # Optional — if distributing the skill
```

### SKILL.md Frontmatter

```yaml
---
name: skill-name
description: "Trigger description — what this skill does and when to use it."
disable-model-invocation: true   # optional: skip LLM call, run scripts directly
argument-hint: "[arg1] [arg2]"   # optional: shown in /help
context: fork                    # optional: run in a forked context
agent: Explore                   # optional: agent mode hint
allowed-tools: Read, Grep        # optional: restrict tools when context: fork
---
```

Key frontmatter fields:

| Field | Description |
|---|---|
| `name` | Unique skill identifier. Used for direct invocation. |
| `description` | Natural-language description. The recommendation engine reads this to decide when to load the skill. |
| `disable-model-invocation` | If `true`, Claude executes the skill's scripts directly without an LLM call. Useful for deterministic code-generation workflows. |
| `argument-hint` | Shown in help output as a usage hint, e.g. `[HTTP method] [resource path]`. |
| `context: fork` | Runs the skill in a forked context with restricted tools (used for read-only audits). |
| `allowed-tools` | When used with `context: fork`, restricts which tools the forked context may call. |

---

## All Installed Skills

The following skills are installed in Effectum's `system/skills/` directory.

| Skill | Description |
|---|---|
| `agents` | Observer script and utilities for monitoring Claude Code agent activity. Includes `observer.md` and `start-observer.sh`. |
| `algorithmic-art` | Creates algorithmic/generative art using p5.js with seeded randomness, flow fields, and particle systems. |
| `api-endpoint` | Creates Next.js API Route Handlers with Zod validation, Supabase integration, typed responses, error handling, and tests. Agent-native by design. |
| `canvas-design` | Creates visual art and design documents (PNG, PDF) using design philosophy and composition principles. |
| `component` | Creates React components with TypeScript, Tailwind CSS, and optional tests. Handles Server vs. Client Component decisions and Shadcn patterns. |
| `doc-coauthoring` | Guides users through a structured co-authoring workflow: context gathering → refinement → reader testing. |
| `docx` | Creates, reads, edits, and manipulates Word (`.docx`) documents with professional formatting. |
| `feature` | Spec-driven feature implementation. Enforces the full workflow: spec → plan → database → implement → verify → review. |
| `frontend-design` | Creates distinctive, production-grade frontend interfaces with high design quality (React, HTML/CSS). |
| `hooks` | Contains the `observe.sh` hook script for capturing tool-use events (part of the continuous-learning system). |
| `mcp-builder` | Guides creation of high-quality MCP servers in Python (FastMCP) or TypeScript (MCP SDK). |
| `pdf` | Reads, creates, merges, splits, watermarks, and OCRs PDF files. |
| `pptx` | Creates, reads, edits, and exports PowerPoint (`.pptx`) slide decks. |
| `scripts` | Shared utility scripts: `scan.sh` (enumerate skills), `quick-diff.sh` (compare mtimes), `save-results.sh` (merge eval results). |
| `security-check` | Audits Supabase security — RLS policies, auth configuration, exposed secrets, and API surface. Runs in a forked read-only context. |
| `skill-creator` | Creates new skills, modifies existing ones, measures skill performance, and runs evals. |
| `supabase-migration` | Creates Supabase database migrations with RLS policies, indexes, and generated TypeScript types. |
| `theme-factory` | Applies themed color palettes and typography to artifacts. Ships 10 pre-set themes (sunset-boulevard, tech-innovation, arctic-frost, etc.). |
| `web-artifacts-builder` | Builds elaborate multi-component HTML artifacts using React, Tailwind CSS, and shadcn/ui. |
| `webapp-testing` | Interacts with and tests local web applications using Playwright. Captures screenshots and browser logs. |
| `xlsx` | Creates, reads, edits, and converts spreadsheet files (`.xlsx`, `.xlsm`, `.csv`, `.tsv`). |

---

## Creating a New Skill

### 1. Create the skill directory

```bash
mkdir -p ~/.claude/skills/my-skill
```

Or for a project-level skill:
```bash
mkdir -p .claude/skills/my-skill
```

### 2. Write `SKILL.md`

```markdown
---
name: my-skill
description: "What this skill does and when Claude should use it. Be specific."
argument-hint: "[arg1] [optional-arg2]"
---

# My Skill

Brief description of what this skill accomplishes.

## Process

1. Step one — describe what Claude should do first
2. Step two — …
3. Step three — …

## Rules

- Specific constraints Claude must follow
- Quality gates
- Output format requirements

## Examples

Optional: show example inputs and expected outputs.
```

### 3. Add helper scripts (optional)

Place any scripts the skill references in a `scripts/` subdirectory:
```bash
mkdir -p ~/.claude/skills/my-skill/scripts
```

Reference them in `SKILL.md` using relative paths (e.g., `scripts/validate.sh`). Claude Code will locate them relative to the skill directory.

### 4. Test the skill

Invoke the skill explicitly:
```
/my-skill [arguments]
```

Or verify the recommendation engine picks it up by describing a task that matches the `description` field. Check with:
```bash
# List all discovered skills
ls ~/.claude/skills/
ls .claude/skills/
```

### 5. Publish (optional)

Skills can be published to [clawhub.ai](https://clawhub.ai) using the `clawhub` CLI for sharing with other Effectum users.

---

## Security: Disabling Shell Execution in Skills (CI/CD)

By default, skill `SKILL.md` files may include inline shell commands that Claude executes as part of following the skill's instructions. In locked-down CI/CD environments, you may want to prevent this.

Add `disableSkillShellExecution: true` to your `.claude/settings.json` (available since Claude Code v2.1.91):

```json
{
  "disableSkillShellExecution": true
}
```

**What this affects:**
- Inline shell execution inside `SKILL.md` instruction sets ✅ blocked
- Inline shell inside custom slash commands (`.claude/commands/*.md`) ✅ blocked  
- Inline shell inside plugin command definitions ✅ blocked

**What this does NOT affect:**
- Regular `Bash(*)` tool calls Claude makes on its own initiative
- Scripts called via the Bash tool from outside skill definitions
- MCP server commands

Use this together with [Headless CI Mode](./installation-guide.md) and a restrictive `permissions.allow` list for fully locked-down non-interactive environments.

---

## Skills vs. Commands vs. Agents

Understanding when to use each extension point:

### Use a **Skill** when:
- You want to inject a reusable process or knowledge set into the current Claude session.
- The task is complex enough to warrant a multi-step instruction document.
- You want the behavior to be triggered automatically based on task context (recommendation engine).
- Examples: `supabase-migration`, `api-endpoint`, `feature`, `doc-coauthoring`.

### Use a **Command** when:
- You want a short, explicit shortcut (`/command`) for a repeated action.
- The action is simple enough to fit in a single prompt or one-liner bash command.
- You don't need the recommendation engine to auto-trigger it.
- Examples: `/commit`, `/format`, `/deploy`.

### Use an **Agent** when:
- You want work done in a parallel, isolated subagent session.
- The task is large enough to benefit from a dedicated specialist context.
- You're composing a team of multiple parallel workers.
- The agent needs its own model tier (e.g., `opus` for security review).
- Examples: spawning `code-reviewer` to review a PR, using `devops-engineer` for infrastructure work.

**Rule of thumb:** Skills add context to the current session. Agents split work into separate sessions. Commands are keyboard shortcuts.
