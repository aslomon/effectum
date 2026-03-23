## Django Framework

- Django 5+ with Django REST Framework (DRF) for API endpoints
- Fat models, thin views — business logic in models and managers
- DRF ModelSerializer for all API request/response handling
- Custom managers for complex QuerySet logic
- Django signals only for genuine cross-app decoupling
- pytest-django for testing, factory_boy for test fixtures
- mypy + django-stubs for type checking
- Migrations only — never run raw DDL or ALTER TABLE
- Settings via environment variables (django-environ or python-decouple)
- Custom AUTH_USER_MODEL from the start
