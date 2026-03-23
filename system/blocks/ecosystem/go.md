## Go Conventions

- Go 1.22+
- Context-first: `context.Context` as first parameter for all I/O functions
- Error handling via returns: `(T, error)` — never panic for expected errors
- Wrap errors with `fmt.Errorf("context: %w", err)`
- Interface-driven design: define interfaces at the consumer side, keep small (1-3 methods)
- No global state, no `init()` side effects — inject via constructors
- Structured logging with `slog` (stdlib) or `zerolog`
- No `fmt.Println()` in production code
- Files: max 300 lines, split if larger
