# Stack Preset: Next.js + Supabase

> Full-stack web applications with Next.js, TypeScript, Tailwind CSS, and Supabase.

## TECH_STACK

```
- Next.js >= 16, App Router ONLY (never Pages Router, never getServerSideProps/getStaticProps)
- TypeScript strict mode, no `any`, no `as` casts (use type guards or Zod)
- Tailwind CSS v4 + Shadcn UI components
- Framer Motion for animations
- Supabase: DB, Auth, Storage, Edge Functions, Realtime
- Zod for ALL external data validation (API inputs, env vars, form data)
- Vitest + Testing Library for unit/integration tests
- Playwright for E2E tests
- {{PACKAGE_MANAGER}} (never use a different package manager — it will create conflicting lock files)
- Vercel deployment, Docker Compose for local dev
```

## ARCHITECTURE_PRINCIPLES

```
- AGENT-NATIVE: every feature MUST expose clean REST/RPC APIs. Backend is modular, extensible, automatable.
- MULTI-TENANT: include tenant_id/org_id from day one. Never assume single-tenant.
- Supabase RLS policies on EVERY table, no exceptions. Run security advisors after DDL changes.
- DB changes ONLY through migrations (apply_migration), never raw DDL.
- Generate TypeScript types from Supabase schema. Never hand-write DB types.
- End-to-end type safety: DB schema -> generated types -> Zod schemas -> API -> frontend.
- Components -> Features -> Services separation. No business logic in components.
- Server Components by default. Client Components only when needed (interactivity, hooks, browser APIs).
- Colocate: keep tests, types, and utils next to the code they serve.
- Zod validation on ALL external boundaries (API inputs, env vars, form data).
- Result pattern { data, error } for all operations that can fail. Never throw for expected errors.
```

## PROJECT_STRUCTURE

````
```
src/
  app/                    # Next.js App Router (routes, layouts, pages)
    (auth)/               # Route groups
    api/                  # Route Handlers
  components/
    ui/                   # Shadcn/base components
    [feature]/            # Feature-specific components
  lib/
    supabase/             # Client, server client, middleware, types
    [domain]/             # Domain services (e.g., lib/billing/, lib/agents/)
  hooks/                  # Custom React hooks
  types/                  # Shared TypeScript types
  utils/                  # Pure utility functions
supabase/
  migrations/             # SQL migrations (timestamped)
  functions/              # Edge Functions (Deno)
tests/
  e2e/                    # Playwright tests
```
````

## QUALITY_GATES

```
- Build: `{{PACKAGE_MANAGER}} build` — 0 errors
- Types: `tsc --noEmit` — 0 errors
- Tests: `{{PACKAGE_MANAGER}} vitest run` — all pass, 80%+ coverage
- Lint: `{{PACKAGE_MANAGER}} lint` — 0 errors
- E2E: `npx playwright test` — all pass (if applicable)
- Code Review: `/code-review` — no security issues
- RLS Check: Supabase security advisor — all tables have RLS policies
- No Debug Logs: 0 console.log in production code (`grep -r "console.log" src/`)
- Type Safety: No `any`, no `as` casts in source code
- File Size: No file exceeds 300 lines
```

## FORMATTER

```
npx prettier --write
```

## FORMATTER_GLOB

```
ts|tsx|js|jsx|json|css|md
```

## PACKAGE_MANAGER

```
{{PACKAGE_MANAGER}}
```

## STACK_SPECIFIC_GUARDRAILS

```
- **{{PACKAGE_MANAGER}}, not alternatives**: This project uses {{PACKAGE_MANAGER}} exclusively. Other package managers will create conflicting lock files.
- **Check DESIGN.md first**: Before any UI/design work, read DESIGN.md. Making design decisions without it causes inconsistencies.
- **createServerClient in Server Components**: Always use `createServerClient` in Server Components and Route Handlers.
- **createBrowserClient in Client Components**: Always use `createBrowserClient` in Client Components.
- **Protect routes with middleware**: Use Supabase Auth middleware for all authenticated routes.
- **Edge Functions validate with Zod**: All Edge Function inputs must be validated with Zod schemas.
- **Realtime over polling**: Use Supabase Realtime subscriptions for live data, never polling.
- **Migrations only**: DB changes ONLY through `apply_migration`. Never run raw DDL.
- **Generated types only**: TypeScript types for DB schema MUST be generated via `generate_typescript_types`. Never hand-write DB types.
```

## TOOL_SPECIFIC_GUARDRAILS

```
- **Prettier runs automatically**: The PostToolUse hook auto-formats ts/tsx/js/jsx/json/css/md files. Don't run prettier manually — it wastes a tool call.
- **CHANGELOG is auto-updated**: The Stop hook handles CHANGELOG.md. Don't update it manually unless explicitly asked.
- **Lock files are protected**: Lock files cannot be written to directly. Use {{PACKAGE_MANAGER}} install/add commands.
```
