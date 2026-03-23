## JavaScript/TypeScript Conventions

- TypeScript strict mode, no `any`, no `as` casts (use type guards or Zod)
- Prefer `const` and immutable patterns; `let` only when mutation is required
- Named exports over default exports
- Prefer composition over inheritance
- No console.log in production code (use structured logger)
- No hardcoded strings for config/env values
- Functions: max 40 lines, single responsibility
- Files: max 300 lines, split if larger
