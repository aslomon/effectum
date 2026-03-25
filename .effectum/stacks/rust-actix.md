# Stack Preset: Rust + Actix-Web

> High-performance backend services and APIs with Rust, Actix-web 4, SQLx, and PostgreSQL.

## TECH_STACK

```
- Rust (stable, latest)
- Actix-web 4 — high-performance async HTTP framework
- SQLx — compile-time checked async SQL (PostgreSQL)
- PostgreSQL (primary database)
- Tokio — async runtime
- serde + serde_json — serialization/deserialization
- cargo-watch — hot reload for local development
- clippy — official Rust linter
- rustfmt — official Rust formatter
- sqlx-cli — database migrations
- Docker + Docker Compose for local PostgreSQL and deployment
```

## ARCHITECTURE_PRINCIPLES

```
- LAYERED ARCHITECTURE: handler → service → repository. Never call DB from handler directly.
- TYPES AS CONTRACTS: use strong types everywhere. Avoid String/serde_json::Value as function boundaries.
- ERROR HANDLING: use custom error types (thiserror or anyhow). Never unwrap() in production code.
- ASYNC ALL THE WAY: all I/O is async. Use tokio::spawn only for truly independent tasks.
- EXTRACTORS FIRST: use Actix-web extractors (Path, Query, Json, Data) for handler inputs — no manual request parsing.
- NO GLOBAL STATE: use Actix-web's App::app_data for shared state (DB pool, config). No lazy_static.
- ZERO COST ABSTRACTIONS: trust the compiler. Write idiomatic Rust, avoid premature optimization.
- VALIDATED INPUTS: use the validator crate or custom From impls to validate request bodies at the boundary.
- STRUCTURED LOGGING: use tracing + tracing-subscriber. No println! in production code.
- COMPILE-TIME SQL: SQLx macros (sqlx::query!, sqlx::query_as!) catch SQL errors at compile time — use them.
```

## PROJECT_STRUCTURE

````
```
Cargo.toml
Cargo.lock
Dockerfile
docker-compose.yml
.env.example
src/
  main.rs                  # App entry point: config, DB pool, routes, server start
  config.rs                # Environment config (dotenvy + custom Config struct)
  errors.rs                # Custom AppError type (thiserror) + Actix ResponseError impl
  db.rs                    # DB pool initialization (PgPool)
  routes.rs                # Route registration (all handlers wired here)
  handlers/                # HTTP layer — thin, uses services
    mod.rs
    {domain}.rs            # e.g. users.rs, orders.rs
  services/                # Business logic — no HTTP types here
    mod.rs
    {domain}.rs
  repositories/            # DB layer — SQL queries via SQLx
    mod.rs
    {domain}.rs
  models/                  # Shared data types (structs for DB rows, API requests/responses)
    mod.rs
    {domain}.rs
  middleware/              # Custom Actix-web middleware (auth, logging, tracing)
    mod.rs
migrations/                # SQL migration files managed by sqlx-cli
  001_initial.sql
tests/
  integration/             # Integration tests against real DB
    mod.rs
    {domain}_test.rs
```
````

## QUALITY_GATES

```
- Build: `cargo build --release` — 0 errors, 0 warnings
- Clippy: `cargo clippy -- -D warnings` — 0 warnings, 0 errors
- Format: `cargo fmt --check` — 0 differences
- Tests: `cargo test` — all pass
- Migrations: `sqlx migrate run` — no pending migrations
- Audit: `cargo audit` — 0 vulnerabilities (run if cargo-audit installed)
- No unwrap: `grep -r "\.unwrap()" src/` — 0 results (except tests)
- No println: `grep -r "println!" src/` — 0 results
```

## FORMATTER

```
rustfmt
```

## FORMATTER_GLOB

```
rs
```

## PACKAGE_MANAGER

```
cargo
```

## STACK_SPECIFIC_GUARDRAILS

```
- **cargo, not manual edits**: Always use `cargo add` to add dependencies. Never edit Cargo.toml dep versions by hand.
- **Compile-time SQL**: Use sqlx::query! and sqlx::query_as! macros. Run `cargo sqlx prepare` before committing to keep .sqlx/ snapshots up to date.
- **Error propagation**: Use `?` operator throughout. Custom error types with thiserror. Never unwrap() outside tests.
- **No blocking in async**: Never call blocking I/O in async context. Use tokio::task::spawn_blocking if needed.
- **Extractors only**: Handler functions receive data via Actix extractors. No req.body().await manual parsing.
- **PgPool, not single conn**: Always use sqlx::PgPool. Never hold a single connection across requests.
- **Migrations forward-only**: Write forward-only SQL migrations. Every schema change needs a new migration file.
- **Secrets from env**: All secrets (DATABASE_URL, JWT_SECRET, etc.) from environment variables. Never hardcode.
- **Tracing, not log**: Use the tracing crate for all logging. Instrument async functions with #[tracing::instrument].
- **Clone sparingly**: Prefer Arc<T> for shared state. Avoid .clone() on large data — profile first.
- **Cargo.lock committed**: Commit Cargo.lock for applications (not libraries). Reproducible builds matter.
```

## TOOL_SPECIFIC_GUARDRAILS

```
- **rustfmt runs automatically**: The PostToolUse hook auto-formats .rs files with rustfmt. Don't run rustfmt manually.
- **CHANGELOG is auto-updated**: The Stop hook handles CHANGELOG.md. Don't update it manually unless explicitly asked.
- **cargo sqlx prepare**: Run this before committing if you changed any SQL queries — keeps .sqlx/ offline snapshots fresh for CI.
- **Docker for PostgreSQL**: Local development requires `docker compose up -d db` before running the server. Never use SQLite — SQLx is configured for PostgreSQL.
- **cargo-watch for dev**: Use `cargo watch -x run` for local dev hot-reload. Don't restart manually.
```
