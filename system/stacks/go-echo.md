# Stack Preset: Go + Echo

> Backend services and APIs with Go, Echo v4, GORM, and PostgreSQL.

## TECH_STACK

```
- Go 1.22+
- Echo v4 (labstack/echo) — HTTP framework
- GORM v2 with PostgreSQL driver
- PostgreSQL (primary database)
- Air — hot reload for local development
- golangci-lint — comprehensive linter suite
- go test — built-in testing with race detector and coverage
- golang-migrate — database migrations
- Docker + Docker Compose for local dev and deployment
```

## ARCHITECTURE_PRINCIPLES

```
- CLEAN ARCHITECTURE: strict layer separation — handlers, services, repositories. No business logic in handlers.
- DEPENDENCY INJECTION: pass dependencies explicitly via constructors. No global state, no init() side effects.
- ERROR HANDLING VIA RETURNS: Go-idiomatic error handling. Return (T, error) — never panic for expected errors. Wrap errors with fmt.Errorf("context: %w", err).
- CONTEXT PROPAGATION: pass context.Context as the first argument to every function that does I/O. Never store context in structs.
- INTERFACE-DRIVEN DESIGN: define interfaces at the consumer side, not the provider. Keep interfaces small (1–3 methods). Use interfaces for all repository and service boundaries.
- MULTI-TENANT: include tenant_id in all domain models from day one. Never assume single-tenant.
- MIGRATIONS ONLY: DB changes through golang-migrate exclusively. Never run raw DDL outside migrations.
- STRUCTURED LOGGING: use slog (stdlib) or zerolog. No fmt.Println() in production code.
- CONFIGURATION VIA ENV: all config through environment variables with validation at startup. Fail fast on missing required config.
- RESULT CONSISTENCY: all HTTP responses follow a consistent envelope { data, error, meta }.
```

## PROJECT_STRUCTURE

````
```
cmd/
  server/
    main.go               # Entry point — wire dependencies, start server
  migrate/
    main.go               # Migration runner CLI
internal/
  config/
    config.go             # App configuration (env vars, validation)
  domain/
    {entity}.go           # Domain models and business rules
  handler/
    {domain}/
      handler.go          # Echo route handlers
      handler_test.go     # Handler tests (httptest)
  service/
    {domain}/
      service.go          # Business logic
      service_test.go     # Service unit tests
  repository/
    {domain}/
      repository.go       # Data access (GORM queries)
      repository_test.go  # Repository integration tests
  middleware/
    auth.go               # JWT / session middleware
    logging.go            # Request logging
    recovery.go           # Panic recovery
  db/
    db.go                 # GORM connection setup
    migrations.go         # Migration helpers
pkg/
  apierror/
    errors.go             # Typed API error responses
  validator/
    validator.go          # Custom Echo validator (go-playground/validator)
  logger/
    logger.go             # Structured logger setup
api/
  openapi.yaml            # OpenAPI 3.x spec (optional)
migrations/
  000001_init.up.sql
  000001_init.down.sql
Dockerfile
docker-compose.yml
.air.toml                 # Air hot reload config
.golangci.yml             # golangci-lint config
```
````

## QUALITY_GATES

```
- Build:    `go build ./...` — 0 errors
- Vet:      `go vet ./...` — 0 issues
- Lint:     `golangci-lint run ./...` — 0 errors
- Tests:    `go test -race -cover ./...` — all pass, 80%+ coverage
- Format:   `gofmt -l .` — 0 unformatted files (or `goimports -l .`)
- Security: `govulncheck ./...` — no known vulnerabilities
- No Debug: 0 fmt.Println() in production code (`grep -r "fmt.Println" internal/ cmd/`)
- No TODO:  Review open TODO/FIXME before shipping (`grep -r "TODO\|FIXME" internal/`)
- File Size: No file exceeds 300 lines
```

## FORMATTER

```
gofmt -w
```

## FORMATTER_GLOB

```
go
```

## PACKAGE_MANAGER

```
go
```

## STACK_SPECIFIC_GUARDRAILS

```
- **go modules only**: Use `go get` / `go mod tidy` for dependency management. Never vendor manually or edit go.sum by hand.
- **Context first**: context.Context must be the first parameter of every function that performs I/O or calls downstream services. Never store a context in a struct field.
- **Interfaces at call site**: Define interfaces where they are consumed, not where they are implemented. Keep interfaces minimal — prefer 1–3 methods.
- **Error wrapping**: Always wrap errors with context using `fmt.Errorf("operation: %w", err)`. Never discard errors with `_`.
- **No global state**: No package-level var for DB connections, loggers, or config. Inject via constructors.
- **GORM + migrations split**: Use GORM for queries only — never AutoMigrate in production. All schema changes go through golang-migrate files in migrations/.
- **Panic is not an error**: Use panic only for truly unrecoverable situations (e.g., missing required config at startup). All expected errors are returned, never panicked.
- **Echo validator**: Register a custom validator (go-playground/validator) on the Echo instance. Always call `c.Validate(req)` in handlers before processing input.
- **Structured JSON responses**: All API responses use a consistent envelope. Use pkg/apierror for typed error responses with HTTP status codes.
- **Air for dev only**: Air hot reload is a dev tool. Production builds use `go build` directly. Never commit .air.toml with production settings.
```

## TOOL_SPECIFIC_GUARDRAILS

```
- **gofmt runs automatically**: The PostToolUse hook auto-formats .go files with gofmt -w. Don't run gofmt manually — it wastes a tool call.
- **CHANGELOG is auto-updated**: The Stop hook handles CHANGELOG.md. Don't update it manually unless explicitly asked.
- **go.sum is protected**: Never edit go.sum directly. Run `go mod tidy` to regenerate.
```
