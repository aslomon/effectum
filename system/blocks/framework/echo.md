## Echo Framework (Go)

- Echo v4 (labstack/echo) HTTP framework
- Clean Architecture: strict layer separation — handlers, services, repositories
- Dependency injection via constructors — no global state
- GORM v2 with PostgreSQL driver for data access
- golang-migrate for database migrations (never AutoMigrate in production)
- Register custom validator (go-playground/validator) on Echo instance
- Consistent JSON response envelope `{ data, error, meta }`
- `go test -race -cover` for testing with race detector
- Air for hot reload in local development
