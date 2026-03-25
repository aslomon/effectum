# Stack Preset: Python + FastAPI

> Backend services and APIs with Python, FastAPI, Pydantic, and SQLAlchemy.

## TECH_STACK

```
- Python 3.12+
- FastAPI (latest stable)
- Pydantic v2 for data validation and serialization
- SQLAlchemy 2.0 with async support
- Alembic for database migrations
- pytest + pytest-asyncio for testing
- httpx for async test client
- ruff for linting and formatting
- uv for package management (fallback: pip)
- Docker + Docker Compose for local dev and deployment
```

## ARCHITECTURE_PRINCIPLES

```
- ASYNC BY DEFAULT: use async/await for all I/O-bound operations. Sync only for CPU-bound work.
- TYPE HINTS EVERYWHERE: all function signatures, return types, and variables must have type annotations.
- DEPENDENCY INJECTION: use FastAPI's Depends() for all shared resources (DB sessions, auth, config).
- PYDANTIC MODELS: use Pydantic BaseModel for ALL request/response schemas. Never pass raw dicts across boundaries.
- REPOSITORY PATTERN: separate data access from business logic. Services call repositories, not ORM directly.
- MULTI-TENANT: include tenant_id/org_id in all data models from day one.
- MIGRATIONS ONLY: DB changes through Alembic migrations exclusively. Never run raw DDL.
- RESULT PATTERN: return typed results instead of raising exceptions for expected errors. Use exceptions only for truly exceptional situations.
- SETTINGS VIA PYDANTIC: all configuration through pydantic-settings with env var validation.
- STRUCTURED LOGGING: use structlog or similar. No print() or bare logging.info() in production.
```

## PROJECT_STRUCTURE

````
```
src/
  {project_name}/
    __init__.py
    main.py                 # FastAPI app factory
    config.py               # Pydantic Settings
    dependencies.py         # Shared FastAPI dependencies
    api/
      __init__.py
      v1/
        __init__.py
        router.py           # API version router
        endpoints/           # Route handlers by domain
    models/
      __init__.py
      base.py               # SQLAlchemy Base, mixins
      {domain}.py            # Domain models (e.g., user.py, team.py)
    schemas/
      __init__.py
      {domain}.py            # Pydantic request/response schemas
    services/
      __init__.py
      {domain}.py            # Business logic
    repositories/
      __init__.py
      {domain}.py            # Data access layer
    core/
      __init__.py
      security.py            # Auth, JWT, permissions
      exceptions.py          # Custom exception classes
      middleware.py           # Custom middleware
    db/
      __init__.py
      session.py             # Async session factory
      migrations.py          # Alembic helpers
alembic/
  versions/                  # Migration files
  env.py
  alembic.ini
tests/
  conftest.py                # Fixtures (test DB, client, auth)
  test_{domain}/
    test_endpoints.py
    test_services.py
    test_repositories.py
pyproject.toml
Dockerfile
docker-compose.yml
```
````

## QUALITY_GATES

```
- Build: `python -m build` or `uv build` — 0 errors
- Types: `mypy src/` — 0 errors
- Tests: `pytest --cov=src --cov-report=term-missing` — all pass, 80%+ coverage
- Lint: `ruff check src/ tests/` — 0 errors
- Format: `ruff format --check src/ tests/` — 0 differences
- Security: `bandit -r src/` — no high-severity issues
- Import Order: `ruff check --select I src/` — sorted
- No Debug Logs: 0 print() statements in src/ (`grep -r "print(" src/`)
- Type Safety: No `Any` type annotations in source code
- File Size: No file exceeds 300 lines
```

## FORMATTER

```
ruff format
```

## FORMATTER_GLOB

```
py
```

## PACKAGE_MANAGER

```
uv
```

## STACK_SPECIFIC_GUARDRAILS

```
- **uv, not pip**: This project uses uv for package management. Avoid bare pip install — use `uv add` or `uv pip install`.
- **Async by default**: All endpoint handlers, service methods, and repository methods must be async unless CPU-bound.
- **Pydantic v2 syntax**: Use model_validator, field_validator (not validator, root_validator from v1).
- **SQLAlchemy 2.0 style**: Use Mapped[], mapped_column(), select() — not legacy Column(), query() patterns.
- **Alembic for all migrations**: Never modify the database schema outside of Alembic. Run `alembic revision --autogenerate` for changes.
- **Settings validation**: All env vars must go through pydantic-settings. No raw os.getenv() in application code.
- **Dependency injection**: Never instantiate DB sessions or config directly. Use FastAPI Depends().
```

## TOOL_SPECIFIC_GUARDRAILS

```
- **ruff runs automatically**: The PostToolUse hook auto-formats .py files with ruff format. Don't run ruff format manually.
- **CHANGELOG is auto-updated**: The Stop hook handles CHANGELOG.md. Don't update it manually unless explicitly asked.
- **Lock files are protected**: poetry.lock, Pipfile.lock cannot be written to directly. Use uv/pip/poetry commands.
```
