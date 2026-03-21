---
name: security-check
description: Audit Supabase security — RLS policies, auth configuration, exposed secrets, and API surface. Use after schema changes or periodically.
context: fork
agent: Explore
allowed-tools: Read, Grep, Glob, Bash(grep *), Bash(git diff *)
---

Run a security audit on the current project and its Supabase configuration.

## Checks to Perform

### 1. Supabase Security Advisors
- Call `get_advisors(type: "security")` on the project
- Report ALL findings with severity and remediation links

### 2. RLS Policy Coverage
- Call `list_tables(schemas: ["public"])` to get all tables
- For each table, run:
  ```sql
  SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public';
  ```
- Flag any table where `rowsecurity = false`
- For tables WITH RLS, check policy completeness:
  ```sql
  SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
  FROM pg_policies WHERE schemaname = 'public';
  ```
- Flag tables missing SELECT/INSERT/UPDATE/DELETE policies

### 3. Auth Configuration
- Check if middleware auth is implemented (search for `createServerClient` in middleware)
- Search for `createBrowserClient` — verify it's only used in Client Components
- Search for hardcoded API keys or tokens: grep for patterns like `sk_`, `key_`, `secret`, `password`, `token` in source files (exclude node_modules, .git)

### 4. Environment Variables
- Check `.env*` files are in `.gitignore`
- Search for `process.env` usage — verify all env vars are validated (Zod or runtime check)
- Flag any env var used directly without validation

### 5. API Surface
- List all Route Handlers in `src/app/api/`
- Check each has authentication (search for `getUser` or `getSession`)
- Flag any public endpoints (no auth check) — these need explicit justification

### 6. Client-Side Data Exposure
- Search for `"use client"` components that directly query Supabase
- Verify they only use `createBrowserClient` (never server client)
- Check that sensitive columns aren't selected in client-side queries

## Output Format

```
## Security Audit Report

### Critical (fix immediately)
- [ ] ...

### Warning (fix soon)
- [ ] ...

### Info (review)
- [ ] ...

### Passed
- [x] ...

### Summary
X critical, Y warnings, Z info items found.
```
