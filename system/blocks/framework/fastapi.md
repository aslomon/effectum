## FastAPI Framework

- FastAPI with Pydantic v2 for data validation and serialization
- Dependency injection via FastAPI's `Depends()` for all shared resources
- Pydantic BaseModel for ALL request/response schemas — never pass raw dicts
- Repository pattern: separate data access from business logic
- SQLAlchemy 2.0 with async support; Alembic for database migrations
- pytest + pytest-asyncio for testing; httpx for async test client
- Result pattern: typed results instead of exceptions for expected errors
- Structured logging with structlog — no `print()` in production
