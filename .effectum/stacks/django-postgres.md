# Stack Preset: Django + PostgreSQL

> Full-featured web applications and APIs with Django, Django REST Framework, and PostgreSQL.

## TECH_STACK

```
- Python 3.12+
- Django 5+ (latest stable)
- PostgreSQL (via psycopg3 or psycopg2-binary)
- Django REST Framework (DRF) for API endpoints
- django-filter for query filtering
- pytest-django for testing
- factory_boy for test fixtures
- ruff for linting and formatting
- mypy + django-stubs for type checking
- uv for package management (fallback: pip)
- Docker + Docker Compose for local PostgreSQL and deployment
```

## ARCHITECTURE_PRINCIPLES

```
- DJANGO CONVENTIONS: follow Django's "batteries included" philosophy. Use the ORM, admin, forms, and middleware as intended.
- FAT MODELS / THIN VIEWS: business logic belongs in models and managers. Views and serializers should be thin orchestrators.
- DRF SERIALIZERS: use DRF ModelSerializer for all API request/response handling. Never pass raw QuerySets or dicts across API boundaries.
- CUSTOM MANAGERS: encapsulate complex QuerySet logic in custom managers and QuerySets. Never scatter raw filter() calls across views.
- SIGNALS SPARINGLY: use Django signals only for genuine decoupling across apps. Prefer explicit method calls for same-app logic.
- TYPE HINTS EVERYWHERE: all function signatures, return types, and model methods must have type annotations.
- MULTI-TENANT: include tenant/organization foreign keys in all data models from day one.
- MIGRATIONS ONLY: DB schema changes through Django migrations exclusively. Never run raw DDL or ALTER TABLE.
- SETTINGS VIA ENV: all configuration through environment variables. Use django-environ or python-decouple for env var validation.
- STRUCTURED LOGGING: use Python's logging with structured formatters. No print() in production code.
```

## PROJECT_STRUCTURE

````
```
manage.py
pyproject.toml
Dockerfile
docker-compose.yml
{project_name}/              # Django project config package
  __init__.py
  settings/
    __init__.py
    base.py                  # Shared settings
    local.py                 # Local dev overrides
    production.py            # Production settings
  urls.py                    # Root URL conf
  wsgi.py
  asgi.py
apps/
  {domain}/                  # One app per domain (e.g., users/, orders/)
    __init__.py
    admin.py                 # ModelAdmin registrations
    apps.py                  # AppConfig
    managers.py              # Custom QuerySet and Manager classes
    models.py                # Django ORM models
    serializers.py           # DRF serializers
    views.py                 # DRF ViewSets / APIViews (thin!)
    urls.py                  # App-level URL patterns
    services.py              # Business logic (called from views)
    signals.py               # Signal handlers (use sparingly)
    migrations/
      __init__.py
      0001_initial.py
    tests/
      __init__.py
      test_models.py
      test_views.py
      test_serializers.py
templates/                   # Django HTML templates
static/                      # Static assets (CSS, JS, images)
tests/
  conftest.py                # pytest-django fixtures (db, client, users)
```
````

## QUALITY_GATES

```
- Config Check: `python manage.py check --deploy` — 0 errors, 0 warnings
- Types: `mypy .` — 0 errors (with django-stubs)
- Tests: `pytest --cov=apps --cov-report=term-missing` — all pass, 80%+ coverage
- Lint: `ruff check .` — 0 errors
- Format: `ruff format --check .` — 0 differences
- Migrations: `python manage.py migrate --check` — no unapplied migrations
- Missing Migrations: `python manage.py makemigrations --check --dry-run` — no changes detected
- No Debug Logs: 0 print() statements in apps/ (`grep -r "print(" apps/`)
- Security: `python manage.py check --tag security` — 0 issues
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
- **Migrations are sacred**: Every model change must produce a migration. Run `python manage.py makemigrations` after any model change. Commit migrations with the code that requires them.
- **Never fake or squash in prod**: Do not use `--fake` migrations or squash without a clear plan. Migration history is the source of truth.
- **Settings split**: Never put secrets or environment-specific values in base.py. Use local.py / production.py + env vars.
- **SECRET_KEY from env**: SECRET_KEY must always come from environment variables. Never hardcode it.
- **DEBUG=False in prod**: Always explicitly set DEBUG=False via env in production. Default should be False.
- **DRF permissions explicit**: Every ViewSet must declare permission_classes explicitly. Never rely on global defaults silently.
- **Custom user model upfront**: Always use a custom AUTH_USER_MODEL from the start. Changing it later requires resetting migrations.
- **Fat models, thin views**: If a view method is longer than ~20 lines, the logic belongs in a model method, manager, or service.
- **Signals only for cross-app**: Use signals only when app A genuinely cannot import from app B. Otherwise, call the method directly.
- **No raw SQL without comment**: Raw SQL queries must include a comment explaining why the ORM cannot handle it.
- **PostgreSQL-specific features**: Use JSONField, ArrayField, and db_index freely — this stack is PostgreSQL-only. No SQLite compatibility required.
```

## TOOL_SPECIFIC_GUARDRAILS

```
- **ruff runs automatically**: The PostToolUse hook auto-formats .py files with ruff format. Don't run ruff format manually.
- **CHANGELOG is auto-updated**: The Stop hook handles CHANGELOG.md. Don't update it manually unless explicitly asked.
- **Lock files are protected**: pyproject.toml lock data cannot be written to directly. Use `uv add`/`uv remove` commands.
- **Docker for PostgreSQL**: Local development requires `docker compose up -d db` before running the Django dev server. Never use SQLite as a dev database for this stack.
```
