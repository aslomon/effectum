# effectum — Claude Code Configuration

## Communication

- Speak English with the user. All code, comments, commits, and docs in English.
- Be direct. Act autonomously. No unnecessary confirmations.
- Think step-by-step for complex problems. Use plan mode for multi-file changes.
- Use subagents (Task tool) for parallel and independent work.

## Tech Stack

- Language: [SPECIFY — e.g., TypeScript, Python, Go, Rust, Java]
- Framework: [SPECIFY — e.g., Express, Django, Gin, Actix, Spring Boot]
- Database: [SPECIFY — e.g., PostgreSQL, MySQL, SQLite, MongoDB]
- Testing: [SPECIFY — e.g., Jest, pytest, go test, cargo test]
- Linting: [SPECIFY — e.g., ESLint, ruff, golangci-lint, clippy]
- Package Manager: [SPECIFY — e.g., npm, pip, go mod, cargo]
- Deployment: [SPECIFY — e.g., Docker, Kubernetes, serverless]

## Architecture Principles

- Separation of concerns: keep data access, business logic, and presentation in distinct layers.
- Dependency injection: pass dependencies explicitly. Avoid global state and singletons.
- Type safety: use the strongest type system your language offers. Avoid escape hatches (any, Object, interface{}).
- Validation at boundaries: validate all external input (API requests, env vars, file I/O) at the entry point.
- Error handling: use explicit error types or Result patterns. Never swallow errors silently.
- Configuration from environment: no hardcoded secrets or environment-specific values in source code.
- Immutability by default: prefer const/final/readonly. Mutate only when necessary.
- Tests are first-class: colocate tests with source code. Test behavior, not implementation.

## Project Structure

[Not configured]

## Code Quality Rules

- Functions: max 40 lines, single responsibility
- Files: max 300 lines, split if larger
- Naming: descriptive, no abbreviations, no Hungarian notation
- Error handling: use Result pattern (`{ data, error }`) for operations that can fail. Never swallow errors.
- No console.log in production code (use structured logger)
- No hardcoded strings for config/env values
- Prefer `const` and immutable patterns
- Prefer named exports over default exports
- Prefer composition over inheritance

## Quality Gates

- Build: [BUILD_COMMAND] — 0 errors
- Types: [TYPE_CHECK_COMMAND] — 0 errors (if applicable)
- Tests: [TEST_COMMAND] — all pass, target 80%+ coverage
- Lint: [LINT_COMMAND] — 0 errors
- Format: [FORMAT_CHECK_COMMAND] — 0 differences
- No Debug Logs: 0 debug print/log statements in production code
- File Size: No file exceeds 300 lines

## Design System — MANDATORY

- ALWAYS use the `frontend-design` skill for ANY design-related work: UI components, pages, layouts, styling, visual polish, landing pages, dashboards, posters, artifacts — everything visual.
- Every project MUST have a `DESIGN.md` file in the project root. This is non-negotiable.
  - If it does not exist, create it before doing any design work.
  - If it exists, read and study it thoroughly before making any design decisions.
  - Update it when new design decisions are made (colors, typography, spacing, patterns, components).
- `DESIGN.md` must document: color palette, typography (fonts, sizes, weights), spacing system, border radii, shadows, animation conventions, component patterns, brand guidelines, tone/mood, and any project-specific visual rules.
- Never make visual/design decisions that contradict `DESIGN.md`. When in doubt, consult the document first.
- This applies across ALL projects — web, mobile, CLI, docs, presentations, artifacts.

## Development Workflow

- SPEC-DRIVEN: define requirements and acceptance criteria before coding
- TEST-FIRST: write failing tests, then implement (use /tdd)
- DONE = compiles + tests pass + linter clean (use /verify)
- Plan complex features before implementing (use /plan)
- Review changes before committing (use /code-review)
- Fix build errors incrementally (use /build-fix)
- Clean dead code periodically (use /refactor-clean)
- Only commit when explicitly asked. Prefer specific file staging over `git add .`

## Task Registry (MANDATORY when present)

- If a `tasks.md` file exists in the project (usually `workshop/projects/*/tasks.md`), you MUST use it.
- Before starting work: read `tasks.md` to find the next TODO or STALE task.
- After completing a task: update its status in `tasks.md` immediately (TODO → IN_PROGRESS → DONE).
- NEVER skip updating `tasks.md`. It is the source of truth for what has been done.
- Task statuses: 📋 TODO | 🔄 IN_PROGRESS | ✅ DONE | ⚠️ STALE | ❌ CANCELLED

## Available Commands

| Command           | Phase          | Function                                 |
| ----------------- | -------------- | ---------------------------------------- |
| `/plan`           | Start          | Analysis + plan + **waits for approval** |
| `/tdd`            | Implementation | Tests first -> code -> refactor          |
| `/verify`         | QA             | Build + types + lint + tests             |
| `/e2e`            | QA             | E2E tests (Playwright / XCTest UI)       |
| `/code-review`    | Review         | Security + quality audit                 |
| `/build-fix`      | Debugging      | Incremental error resolution             |
| `/refactor-clean` | Cleanup        | Remove dead code                         |
| `/checkpoint`     | Safety         | Create a restore point                   |
| `/ralph-loop`     | Full Auto      | Iterative autonomous implementation      |
| `/forensics`      | Diagnosis      | Post-mortem analysis of loop failures    |
| `/effectum:init`  | Setup          | Populate project context in CLAUDE.md    |
| `/map-codebase`   | Setup          | 4 parallel agents → 7 knowledge docs    |


## Available CLI Tools

- **git** (installed): Version control — required for all projects
- **claude** (installed): AI coding agent — the core of the autonomous workflow
- **gh** (installed): GitHub: Issues, PRs, Code Search, CI status
- **jq** (installed): JSON processing on the command line

## Context7 — Always Use for Research

- Always use Context7 MCP (`resolve_library_id` -> `get_library_docs`) when:
  - Planning features that involve libraries, frameworks, or APIs
  - Exploring documentation for setup, configuration, or integration
  - Generating code that uses external dependencies
  - Checking current API signatures, options, or best practices
  - Comparing approaches or evaluating library capabilities
- This applies to ALL stacks
- Fetch docs proactively — do not rely on training data for library-specific details

## Active Hooks — Be Aware

The following hooks run automatically. Do NOT duplicate their behavior:

- **Auto-Format**: echo no-formatter-configured runs after every Edit/Write. Do not manually run the formatter.
- **CHANGELOG**: A Stop hook auto-updates CHANGELOG.md with [Unreleased] entries after meaningful changes. Do not manually update CHANGELOG.md unless the user explicitly asks.
- **Commit Message Gate**: Commit messages must be >= 10 characters and descriptive. The hook blocks short messages.
- **Stop Quality Gate**: A prompt hook verifies all tasks are completed before stopping. If it returns `ok: false`, continue working on what's missing.
- **Subagent Quality Gate**: Subagent output is verified. Ensure subagents complete their tasks fully, not just report findings.
- **Error Learning**: Tool failures are logged to `.claude/logs/tool-failures.jsonl`. Check this file at session start to learn from past mistakes and avoid repeating them.
- **Guardrails Injection**: At session start and after compaction, `~/.claude/guardrails.md` (global) and `$PROJECT/.claude/guardrails.md` (project) are loaded. Follow them strictly.
- **Transcript Backup**: Transcripts are backed up before context compaction to `.claude/backups/`.
- **Protected Files**: `.env`, `.env.local`, `.env.production`, `secrets/`, `.git/`, lock files cannot be written to. Use Bash for env file operations if absolutely needed.
- **Secret Detection**: Before `git commit` and `git push`, staged changes are scanned for API keys, tokens, and passwords. Blocked if secrets found.
- **TDD Enforcement**: Before stopping, checks that test files were modified alongside source files. Blocks if source changed without tests.
- **Destructive Command Blocker**: `rm -rf /`, `DROP TABLE`, `--force push`, `reset --hard` are blocked.
- **Desktop Notifications**: User gets OS notifications on permission prompts and task completion.

## Stack-Specific Rules

- [Add project-specific guardrails here]
- [e.g., "Use X package manager, not Y"]
- [e.g., "Always validate input with Z library"]
- [e.g., "Follow existing patterns in src/domain/"]

## Agent Teams — Opt-In

Agent Teams are DISABLED by default. Enable in settings.json:
`"env": { "CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS": "1" }`

Three execution tiers exist — use the simplest that fits:

| Tier                 | Mechanism                           | When                                           |
| -------------------- | ----------------------------------- | ---------------------------------------------- |
| Single-Agent         | Main session alone                  | Simple tasks, bugfixes, single-file changes    |
| Subagents (default)  | Task Tool spawns specialized agents | Parallel research, code reviews, focused tasks |
| Agent Teams (opt-in) | Independent Claude instances        | Complex features with 3+ parallel workstreams  |

## Shell Commands — Non-Interactive Only

- ALWAYS use non-interactive flags for shell commands. AI agents cannot interact with stdin prompts.
- Examples: `npm install --yes`, `rm -rf`, `apt install -y`
- Never use interactive commands: `git rebase -i`, `git add -i`, `less`, `vim`, `nano`, `top`
- If a command might prompt for input, find and use its non-interactive equivalent or pass defaults via flags/env vars.

## Tool Usage

- Use dedicated tools (Read, Grep, Glob) over Bash equivalents
- Use Context7 MCP for up-to-date library/framework documentation
- Use git worktrees for risky or exploratory changes
- Parallelize independent tool calls
- When blocked, investigate root cause. Never brute-force or retry blindly.
- Never use destructive git operations as shortcuts

## Commit Conventions

- Conventional commits: `feat:`, `fix:`, `docs:`, `chore:`, `refactor:`, `test:`
- Include scope when applicable: `feat(auth): add login flow`
- Commit messages must be >= 10 characters and descriptive
- Prefer specific file staging over `git add .`
- Only commit when explicitly asked

<!-- effectum:project-context:start -->
<!-- Project-specific context goes here. This block is preserved across effectum updates.
     Use /effectum:init to populate this section interactively, or edit manually.
     Content between these sentinel markers will NOT be overwritten by effectum update. -->
<!-- effectum:project-context:end -->
