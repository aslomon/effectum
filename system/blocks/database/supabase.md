## Supabase Database

- Supabase: DB (PostgreSQL), Auth, Storage, Edge Functions, Realtime
- RLS policies on EVERY table — no exceptions
- DB changes ONLY through migrations (`apply_migration`), never raw DDL
- Generate TypeScript types from Supabase schema — never hand-write DB types
- Use `createServerClient` in Server Components and Route Handlers
- Use `createBrowserClient` in Client Components
- Protect routes with middleware auth check
- Use Realtime subscriptions for live data, not polling
- Edge Functions: validate input with Zod, return typed responses
- MULTI-TENANT: include org_id from day one
