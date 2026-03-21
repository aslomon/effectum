# Contributing to Effectum

Thank you for your interest in contributing to Effectum! This document covers everything you need to get started.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Development Setup](#development-setup)
- [Project Structure](#project-structure)
- [Ways to Contribute](#ways-to-contribute)
- [Making a Pull Request](#making-a-pull-request)
- [Code Style](#code-style)
- [Testing](#testing)
- [Commit Messages](#commit-messages)

---

## Code of Conduct

Be respectful. Assume good intent. Focus on the code, not the person. Contributions from everyone are welcome — beginners included.

---

## Development Setup

### Prerequisites

- **Node.js** >= 18.0.0
- **npm** (bundled with Node.js)
- **Git**
- **Claude Code** (to test the installed output)

### Local Setup

```bash
# 1. Fork the repository on GitHub, then clone your fork
git clone https://github.com/<your-username>/effectum.git
cd effectum

# 2. Install dependencies
npm install

# 3. Run the CLI directly
node bin/effectum.js
node bin/effectum.js --help
node bin/effectum.js --version

# 4. Test a full interactive install in a scratch directory
mkdir /tmp/effectum-test && cd /tmp/effectum-test
node /path/to/effectum/bin/effectum.js
```

### Running the CLI Subcommands

```bash
# Interactive install (asks scope + runtime)
node bin/effectum.js

# Per-project init
node bin/effectum.js init

# Re-apply saved config
node bin/effectum.js reconfigure

# Dry-run (shows what would be written, nothing written)
node bin/effectum.js --dry-run
node bin/effectum.js reconfigure --dry-run
```

### Linking Locally (Optional)

If you want `effectum` to resolve from anywhere during development:

```bash
npm link
effectum --version
```

---

## Project Structure

```
effectum/
├── bin/                        CLI entry point and business logic
│   ├── effectum.js             Subcommand router (entry point)
│   ├── init.js                 `effectum init` — per-project initializer
│   ├── install.js              Core installer logic
│   ├── reconfigure.js          `effectum reconfigure` — re-applies saved config
│   └── lib/
│       ├── app-types.js        App type definitions and tags
│       ├── cli-tools.js        Reusable CLI UI helpers
│       ├── config.js           .effectum.json read/write
│       ├── constants.js        Shared constants (stacks, autonomy, MCP, formatters)
│       ├── detect.js           Project auto-detection (stack, language)
│       ├── foundation.js       Foundation files written to every install
│       ├── languages.js        Language choices and per-language instructions
│       ├── recommendation.js   Rules-based setup recommender
│       ├── specializations.js  Subagent specs and stack-to-agent mappings
│       ├── stack-parser.js     Reads and parses system/stacks/*.md presets
│       ├── template.js         Template rendering (placeholder substitution)
│       ├── tool-loader.js      Loads tool definitions from system/tools/
│       ├── ui.js               @clack/prompts wrapper
│       └── utils.js            Filesystem helpers, deep merge, etc.
│
├── system/                     The installable workflow (copied to .claude/)
│   ├── agents/                 Sub-agent persona files (*.md)
│   ├── commands/               Slash command definitions (*.md)
│   ├── hooks/                  Claude Code hook scripts
│   ├── skills/                 Skill definitions (SKILL.md per skill)
│   ├── stacks/                 Stack preset files (*.md)
│   ├── teams/                  Agent team configurations
│   ├── templates/              Parameterized template files (CLAUDE.md, settings.json, etc.)
│   └── tools/                  Tool definition files
│
├── workshop/                   PRD Workshop (specification writing tools)
│   ├── knowledge/              8 reference guides
│   ├── templates/              PRD and project templates
│   └── projects/               Spec project workspace (per branch)
│
├── docs/                       Documentation
│   ├── workflow-overview.md
│   ├── installation-guide.md
│   ├── prd-workshop-guide.md
│   ├── customization.md
│   └── troubleshooting.md
│
├── package.json
├── README.md
├── CONTRIBUTING.md             ← You are here
└── CLAUDE.md                   Makes Claude understand this repo
```

### Key Files to Understand

| File | Purpose |
|------|---------|
| `bin/lib/constants.js` | Stacks, autonomy levels, MCP servers, formatters — all in one place |
| `bin/lib/recommendation.js` | Rules engine: tags → commands/hooks/skills/agents |
| `bin/lib/specializations.js` | Subagent definitions and stack-to-agent mappings |
| `system/stacks/*.md` | Stack preset files (parsed by `stack-parser.js`) |
| `system/agents/*.md` | Sub-agent persona files (copied to `.claude/agents/`) |
| `system/skills/` | Skill directories (each with a `SKILL.md`) |

---

## Ways to Contribute

The highest-impact areas:

| Area | What to do |
|------|-----------|
| **Stack presets** | Add Go, Rust, Ruby on Rails, Django, etc. |
| **Agents** | Add specialized sub-agent personas |
| **Skills** | Add reusable skill directories |
| **CLI / Recommendation engine** | Improve tag matching, add new rules |
| **Workflow commands** | Improve or extend `/plan`, `/tdd`, `/ralph-loop`, etc. |
| **Documentation** | Clearer guides, examples, translations |
| **Bug fixes** | See open issues on GitHub |

---

## Making a Pull Request

1. **Fork** the repository and create a branch from `main`:
   ```bash
   git checkout -b feat/add-go-stack
   ```

2. **Make your changes.** Keep PRs focused — one feature or fix per PR.

3. **Test your changes** manually (see [Testing](#testing)).

4. **Commit** using [conventional commits](#commit-messages).

5. **Push** and open a PR against `main`:
   ```bash
   git push origin feat/add-go-stack
   ```

6. **Fill out the PR description:**
   - What does this change?
   - Why is it needed?
   - How was it tested?
   - Any breaking changes?

7. **Respond to review feedback** promptly.

### PR Checklist

- [ ] Code follows the project style (see [Code Style](#code-style))
- [ ] Manually tested the affected feature
- [ ] Documentation updated if behavior changed
- [ ] No console.log / debug output left in
- [ ] Single responsibility — one logical change per PR

---

## Code Style

Effectum uses **ESLint** and **Prettier** (configuration TBD — follow the patterns you see in existing files).

### General Rules

- **CommonJS modules** — `require()`/`module.exports`, not ESM `import/export` (Node.js CLI context)
- **`"use strict"`** at the top of every file
- **JSDoc comments** for all exported functions — include `@param` and `@returns` types
- **Descriptive names** — `recommendSkills()`, not `rs()`
- **No magic numbers** — put constants in `constants.js` or the relevant module
- **Consistent error messages** — start with the operation, end with a fix hint

### File Conventions

- Library files go in `bin/lib/`
- System files go in `system/` under the appropriate subdirectory
- Documentation goes in `docs/`
- Markdown files use ATX headings (`##`), not Setext

### CLI / UX Rules

- Use `@clack/prompts` for all interactive prompts (via `bin/lib/ui.js`)
- Never use `process.exit(1)` silently — always log an error first
- Non-interactive flags must work without any prompts (for scripting)

---

## Testing

> **Note:** Effectum does not yet have an automated test suite — this is a known gap and a great area to contribute. See the open issue.

### Manual Testing Protocol

Until automated tests exist, test manually before every PR:

```bash
# 1. Basic smoke test
node bin/effectum.js --version
node bin/effectum.js --help

# 2. Interactive install (global)
mkdir /tmp/test-global && cd /tmp/test-global
node /path/to/effectum/bin/effectum.js --global
ls ~/.claude/  # Verify files were installed

# 3. Interactive install (local)
mkdir /tmp/test-local && cd /tmp/test-local
node /path/to/effectum/bin/effectum.js --local
ls .claude/   # Verify files were installed

# 4. Non-interactive install
mkdir /tmp/test-noninteractive && cd /tmp/test-noninteractive
node /path/to/effectum/bin/effectum.js --global --claude --yes

# 5. Dry run (nothing should be written)
mkdir /tmp/test-dryrun && cd /tmp/test-dryrun
node /path/to/effectum/bin/effectum.js --dry-run

# 6. Reconfigure (needs a prior install with .effectum.json)
cd /tmp/test-local
node /path/to/effectum/bin/effectum.js reconfigure

# 7. Stack-specific: verify the chosen stack preset is applied
#    Check that CLAUDE.md contains the expected stack section
grep "TECH_STACK" .claude/CLAUDE.md
```

### What to Verify

- Files are written to the correct target directory
- Placeholders in templates are fully substituted (no `{{PROJECT_NAME}}` left)
- Stack-specific sections appear in `CLAUDE.md`
- `--dry-run` produces no file writes
- `reconfigure` reads `.effectum.json` and regenerates correctly

---

## Commit Messages

Use **Conventional Commits**:

```
<type>(<scope>): <short description>

[optional body]

[optional footer]
```

**Types:**

| Type | When to use |
|------|-------------|
| `feat` | New feature (stack preset, agent, skill, CLI flag) |
| `fix` | Bug fix |
| `docs` | Documentation only |
| `refactor` | Code change that's not a feature or fix |
| `chore` | Dependency updates, tooling, config |
| `test` | Adding or updating tests |

**Examples:**

```
feat(stacks): add Go + Gin stack preset
fix(template): prevent double-substitution of PROJECT_NAME
docs(contributing): add manual testing protocol
chore(deps): bump @clack/prompts to 1.2.0
```

---

## Questions?

Open a [GitHub Discussion](https://github.com/aslomon/effectum/discussions) or file an issue. We're happy to help.
