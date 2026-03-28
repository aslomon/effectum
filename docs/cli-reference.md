# Effectum CLI Reference

Complete reference for all Effectum CLI commands, flags, and exit codes.

## Table of Contents

- [Installation](#installation)
- [Commands](#commands)
  - [`effectum` (default install)](#effectum-default-install)
  - [`effectum init`](#effectum-init)
  - [`effectum reconfigure`](#effectum-reconfigure)
  - [`effectum update`](#effectum-update)
- [Flags](#flags)
- [Examples](#examples)
- [Exit Codes](#exit-codes)
- [Config File](#config-file)

---

## Installation

```bash
# Run without installing (recommended)
npx @aslomon/effectum [command] [flags]

# Install globally
npm install -g @aslomon/effectum
effectum [command] [flags]
```

**Node.js requirement:** >= 18.0.0

---

## Commands

### `effectum` (default install)

**Usage:** `npx @aslomon/effectum [flags]`

The default command. Runs the interactive installer that sets up Effectum for Claude Code. Prompts for:

1. **Scope** — global (`~/.claude/`) or local (`./.claude/`)
2. **Runtime** — Claude Code (currently the only supported runtime)
3. **Stack** — your technology stack
4. **App type** — the kind of application you're building
5. **Description** — a brief description of your project (drives smart recommendations)
6. **Autonomy level** — how much Claude decides on its own
7. **Language** — primary development language
8. **MCP servers** — which MCP servers to configure
9. **Playwright** — whether to install Playwright browsers

After gathering answers, the installer:
- Writes `CLAUDE.md` to the target `.claude/` directory
- Writes `settings.json` with hooks and permissions
- Installs workflow commands to `.claude/commands/`
- Installs agents to `.claude/agents/`
- Installs skills to `.claude/skills/`
- Configures MCP servers in `settings.json`
- Saves configuration to `.effectum.json`

**Flags:** All flags described in the [Flags](#flags) section apply.

---

### `effectum init`

**Usage:** `npx @aslomon/effectum init [flags]`

Per-project initializer. Identical to the default installer in behavior, but semantically intended for initializing a specific project after a global install.

When run without flags, defaults to **local scope** (`./.claude/`) in interactive mode.

**Use case:** You installed Effectum globally once (`--global`), and now you want to configure a specific project.

```bash
cd ~/my-project
npx @aslomon/effectum init
```

**Flags:** Accepts all the same flags as the default command.

---

### `effectum reconfigure`

**Usage:** `npx @aslomon/effectum reconfigure [flags]`

Re-applies Effectum configuration from the saved `.effectum.json` file in the current directory.

Use this when:
- You upgrade Effectum and want to regenerate `CLAUDE.md` and `settings.json` with the new templates
- You manually edited `.effectum.json` and want to apply the changes
- Files in `.claude/` were accidentally deleted or corrupted

**Requires:** A valid `.effectum.json` in the current directory (created by the installer).

**Flags:**
- `--dry-run` — show what would be written without writing

**Error:** If no `.effectum.json` is found, exits with code `1` and prints an error.

---

### `effectum update`

**Usage:** `npx @aslomon/effectum update`

Updates the Effectum workflow files in the current project to the latest version. Reads the installed `.effectum.json` to determine scope and configuration, then:

- **Diffs commands** — shows new and changed commands available in the latest version
- **Adds new commands** — copies any commands that don't yet exist in `.claude/commands/`
- **Updates changed commands** — overwrites command files that have changed upstream
- **Refreshes CLAUDE.md** — updates the system-managed section while **preserving** your project context (sentinel blocks are never touched)
- **Preserves config** — never overwrites `.effectum.json`, `guardrails.md`, or your custom content

```bash
cd ~/my-project
npx @aslomon/effectum update
```

Example output:

```
✔ Checking for updates...
ℹ 3 new command(s) available: /forensics, /effectum:init, /map-codebase
ℹ 5 command(s) with updates
✔ Updated: 3 new command(s) added, 5 command(s) updated, CLAUDE.md refreshed
```

**Flags:**
- `--dry-run` — show what would be updated without writing any files

**Error:** If no `.effectum.json` is found in the current directory, exits with code `1`.

---

## Flags

All flags are optional. When no scope flag is given and no `--yes` is set, the installer runs in interactive mode.

| Flag | Short | Description |
|------|-------|-------------|
| `--global` | `-g` | Install to `~/.claude/` — applies to all projects |
| `--local` | `-l` | Install to `./.claude/` — applies to current project only |
| `--yes` | `-y` | Skip interactive prompts; use smart defaults |
| `--dry-run` | | Show planned output without writing any files |
| `--output-format` | | Output format: `claude-md` (default), `agents-md`, or `both` |
| `--claude` | | Select Claude Code runtime (non-interactive, currently the only runtime) |
| `--with-mcp` | | Install and configure MCP servers |
| `--with-playwright` | | Install Playwright browsers |
| `--version` | `-v` | Print the installed Effectum version and exit |
| `--help` | `-h` | Print help text and exit |

### Flag Details

#### `--global` / `-g`

Installs Effectum to `~/.claude/`. Configuration applies to every project opened in Claude Code on this machine.

```bash
npx @aslomon/effectum --global
```

#### `--local` / `-l`

Installs Effectum to `./.claude/` in the current working directory. Configuration applies only to this project.

```bash
cd ~/my-project
npx @aslomon/effectum --local
```

#### `--yes` / `-y`

Skips all interactive prompts and uses smart defaults. Combine with `--global` or `--local` for fully non-interactive installs.

Defaults when `--yes` is used:
- **Scope:** local (unless `--global` is also specified)
- **Runtime:** Claude Code
- **Stack:** `generic`
- **Autonomy:** `standard`

```bash
npx @aslomon/effectum --global --yes
```

#### `--output-format`

Controls which project instruction file(s) Effectum generates.

| Value | Generates |
|-------|-----------|
| `claude-md` | `CLAUDE.md` only *(default)* |
| `agents-md` | `AGENTS.md` only (generic, works with any AI coding tool) |
| `both` | Both `CLAUDE.md` and `AGENTS.md` |

`AGENTS.md` uses generic language — no tool-specific references — so it works with Claude Code, Codex, Gemini CLI, and any other agent that reads project instruction files.

If an `AGENTS.md` already exists in your project root, Effectum auto-detects it and generates/updates `AGENTS.md` regardless of this flag.

```bash
# Generate AGENTS.md for multi-agent / tool-agnostic projects
npx @aslomon/effectum --yes --output-format agents-md

# Generate both files (recommended when migrating)
npx @aslomon/effectum --yes --output-format both
```

#### `--dry-run`

Prints everything that _would_ be written — file paths, content summaries — without actually creating or modifying any files.

Useful for:
- Previewing an install before committing
- Debugging unexpected behavior
- CI/CD pipelines that verify config generation

```bash
npx @aslomon/effectum --local --dry-run
npx @aslomon/effectum reconfigure --dry-run
```

#### `--claude`

Explicitly selects the Claude Code runtime. Currently the only supported runtime; included for forward compatibility with future runtime support (Codex, Gemini CLI, etc.).

```bash
npx @aslomon/effectum --global --claude
```

#### `--with-mcp`

Forces MCP server installation during a non-interactive install. Without this flag, the installer may skip MCP setup in non-interactive mode depending on the detected environment.

```bash
npx @aslomon/effectum --global --claude --with-mcp
```

#### `--with-playwright`

Forces Playwright browser installation (`npx playwright install`). Without this flag, the installer may skip browser installation in non-interactive mode.

```bash
npx @aslomon/effectum --global --with-playwright
```

#### `--version` / `-v`

Prints the version number and exits immediately. No other flags are processed.

```bash
npx @aslomon/effectum --version
# → effectum v0.4.0
```

#### `--help` / `-h`

Prints the help text and exits. No other flags are processed.

```bash
npx @aslomon/effectum --help
```

---

## Examples

### Interactive install (recommended for first-time setup)

```bash
cd ~/my-project
npx @aslomon/effectum
```

Prompts for all settings, then writes everything to `./.claude/`.

### Non-interactive global install with Claude Code

```bash
npx @aslomon/effectum --global --claude --yes
```

Installs globally with smart defaults. No prompts.

### Non-interactive local install with MCP and Playwright

```bash
cd ~/my-project
npx @aslomon/effectum --local --claude --with-mcp --with-playwright --yes
```

Full install for a project that will use E2E testing and MCP servers.

### Preview what would be installed (dry run)

```bash
cd ~/my-project
npx @aslomon/effectum --local --dry-run
```

Shows all files that would be created. Nothing is written.

### Initialize a new project after a global install

```bash
# Already installed globally — now configure this specific project
cd ~/new-project
npx @aslomon/effectum init
```

Interactive, defaults to local scope.

### Re-apply config after upgrading Effectum

```bash
cd ~/my-project
npx @aslomon/effectum reconfigure
```

Reads `.effectum.json` and regenerates `CLAUDE.md`, `settings.json`, and related files using the latest templates.

### Check version

```bash
npx @aslomon/effectum --version
# → effectum v0.4.0
```

### CI/CD: Install in a pipeline

```bash
# In a CI script, install without any interaction
npx @aslomon/effectum --local --yes --with-mcp
```

---

## Exit Codes

| Code | Meaning |
|------|---------|
| `0` | Success — installation or operation completed normally |
| `1` | Error — installation failed, configuration not found, or unrecoverable error |

### When exit code 1 is returned

- `reconfigure` run without a `.effectum.json` present
- Unhandled exception during installation
- Required dependency (e.g., npm) not available when MCP install is attempted
- File write permission denied on the target directory

### When exit code 0 is returned

- Successful interactive or non-interactive install
- `--help` or `--version` flag used (prints and exits cleanly)
- `--dry-run` completes (no files written, but not an error)
- `reconfigure` completes successfully

---

## Config File

Effectum saves installation settings to `.effectum.json` in the target directory after a successful install. This file is used by `reconfigure` to regenerate files without re-prompting.

### Schema (v0.4.0)

```json
{
  "version": "0.4.0",
  "scope": "local",
  "stack": "nextjs-supabase",
  "appType": "saas",
  "description": "A multi-tenant SaaS CRM for small businesses",
  "autonomy": "standard",
  "language": "en",
  "runtime": "claude",
  "mcps": ["context7", "playwright", "sequential-thinking"],
  "agents": ["frontend-developer", "nextjs-developer"],
  "skills": ["frontend-design", "webapp-testing"],
  "hooks": ["commit-gate", "changelog-update", "completion-verifier"]
}
```

**Do not edit `.effectum.json` manually unless you understand the schema.** Use `reconfigure` to apply changes.

`.effectum.json` should be committed to version control so teammates can run `reconfigure` to get the same setup.
