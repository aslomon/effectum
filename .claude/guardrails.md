# Project Guardrails

Curated lessons from past development sessions. These are injected at every session start.
Follow these strictly — each exists because ignoring it caused real problems.

## Error Patterns

- **Test env != dev env**: Never assume test and dev environments behave identically. Validate integration points early with the actual environment.
- **Read diagnostics before fixing**: Always read the full error message/stack trace before attempting a fix. Guessing wastes iterations.
- **Manual != automated**: Code that works when run manually may fail in automated contexts (CI, hooks, subagents). Test automation paths explicitly.
- **Stateful deps cause flaky tests**: External state (DB, files, network) makes tests non-deterministic. Mock or isolate stateful dependencies.
- **Use precise identifiers**: When searching/replacing code, use unique identifiers. Ambiguous patterns cause wrong matches.

## Workflow Lessons

- **Validate integration points early**: Don't build the full feature before testing that the integration (API, DB, auth) actually works.
- **Non-interactive commands only**: AI agents cannot handle stdin prompts. Always use `-y`, `--yes`, `--non-interactive` flags.
- **Check DESIGN.md first**: Before any UI/design work, read DESIGN.md. Making design decisions without it causes inconsistencies that are expensive to fix.

## Code Quality

- Functions: max 40 lines. Split immediately if exceeded.
- Files: max 300 lines. Split into logical modules if exceeded.
- No hardcoded strings for configuration values — use environment variables.
- Error handling: always use Result pattern `{ data, error }` for operations that can fail. Never swallow errors.

## Safety

- Never modify protected files (.env, .env.local, .env.production, secrets/, .git/, lock files) directly.
- Never run destructive commands (rm -rf /, DROP TABLE, --force push, reset --hard).
- Only commit when explicitly asked. Prefer specific file staging over `git add .`.

## Stack-Specific

- [Add project-specific guardrails here]
- [e.g., "Use X package manager, not Y"]
- [e.g., "Always validate input with Z library"]
- [e.g., "Follow existing patterns in src/domain/"]

## Tool-Specific

- **Formatter runs automatically**: The PostToolUse hook auto-formats files. Don't run the formatter manually.
- **CHANGELOG is auto-updated**: The Stop hook handles CHANGELOG.md. Don't update it manually unless explicitly asked.
- **Lock files are protected**: Dependency lock files cannot be written to directly. Use package manager commands.
