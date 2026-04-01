# Stack Preset: Generic

> Stack-agnostic baseline. Use this when no specific stack preset matches, or as a starting point for custom stacks.

## TECH_STACK

```
- Language: [SPECIFY — e.g., TypeScript, Python, Go, Rust, Java]
- Framework: [SPECIFY — e.g., Express, Django, Gin, Actix, Spring Boot]
- Database: [SPECIFY — e.g., PostgreSQL, MySQL, SQLite, MongoDB]
- Testing: [SPECIFY — e.g., Jest, pytest, go test, cargo test]
- Linting: [SPECIFY — e.g., ESLint, ruff, golangci-lint, clippy]
- Package Manager: [SPECIFY — e.g., npm, pip, go mod, cargo]
- Deployment: [SPECIFY — e.g., Docker, Kubernetes, serverless]
```

## ARCHITECTURE_PRINCIPLES

```
- Separation of concerns: keep data access, business logic, and presentation in distinct layers.
- Dependency injection: pass dependencies explicitly. Avoid global state and singletons.
- Type safety: use the strongest type system your language offers. Avoid escape hatches (any, Object, interface{}).
- Validation at boundaries: validate all external input (API requests, env vars, file I/O) at the entry point.
- Error handling: use explicit error types or Result patterns. Never swallow errors silently.
- Configuration from environment: no hardcoded secrets or environment-specific values in source code.
- Immutability by default: prefer const/final/readonly. Mutate only when necessary.
- Tests are first-class: colocate tests with source code. Test behavior, not implementation.
```

## PROJECT_STRUCTURE

````
```
src/                        # Application source code
  [domain]/                 # Domain-specific modules
    models/                 # Data models / entities
    services/               # Business logic
    handlers/               # Request handlers / controllers
    repositories/           # Data access layer
  shared/                   # Cross-cutting concerns
    config/                 # Configuration loading and validation
    errors/                 # Custom error types
    middleware/             # Middleware / interceptors
    utils/                  # Pure utility functions
tests/                      # Test files (mirrors src/ structure)
scripts/                    # Build, deploy, and maintenance scripts
docs/                       # Documentation (if needed)
```
````

## QUALITY_GATES

```
- Build: [BUILD_COMMAND] — 0 errors
- Types: [TYPE_CHECK_COMMAND] — 0 errors (if applicable)
- Tests: [TEST_COMMAND] — all pass, target 80%+ coverage
- Lint: [LINT_COMMAND] — 0 errors
- Format: [FORMAT_CHECK_COMMAND] — 0 differences
- No Debug Logs: 0 debug print/log statements in production code
- File Size: No file exceeds 300 lines
```

## FORMATTER

```
[SPECIFY — e.g., prettier, ruff format, gofmt, rustfmt, google-java-format]
```

## FORMATTER_GLOB

```
[SPECIFY — e.g., ts|tsx|js|jsx, py, go, rs, java]
```

## PACKAGE_MANAGER

```
{{PACKAGE_MANAGER}}
```

## STACK_SPECIFIC_GUARDRAILS

```
- [Add project-specific guardrails here]
- [e.g., "Use X package manager, not Y"]
- [e.g., "Always validate input with Z library"]
- [e.g., "Follow existing patterns in src/domain/"]
```

## TOOL_SPECIFIC_GUARDRAILS

```
- **Formatter runs automatically**: The PostToolUse hook auto-formats files. Don't run the formatter manually.
- **CHANGELOG is auto-updated**: The Stop hook handles CHANGELOG.md. Don't update it manually unless explicitly asked.
- **Lock files are protected**: Dependency lock files cannot be written to directly. Use package manager commands.
```

## ENVIRONMENT_VARIABLES

```
# Recommended for headless / CI runs (Claude Code v2.1.89+)
MCP_CONNECTION_NONBLOCKING=true   # Skip blocking MCP connection wait in -p / --print mode
EFFECTUM_HEADLESS=1               # Enable headless approver hook (auto-approve safe tools)
EFFECTUM_MAX_SUBAGENTS=5          # Max concurrent subagents in Agent Teams (default: 5)
```
