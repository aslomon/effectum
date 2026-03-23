## Python Conventions

- Python 3.12+
- Type hints on ALL function signatures, return types, and variables
- Async by default for I/O-bound operations; sync only for CPU-bound work
- No `Any` type annotations in source code
- No `print()` in production code — use structured logging (structlog or logging)
- Settings via pydantic-settings with env var validation
- Functions: max 40 lines, single responsibility
- Files: max 300 lines, split if larger
