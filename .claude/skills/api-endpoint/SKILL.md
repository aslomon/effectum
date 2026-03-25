---
name: api-endpoint
description: Create a new Next.js API Route Handler with Zod validation, Supabase integration, typed responses, error handling, and tests. Agent-native — every endpoint is discoverable and callable by AI agents.
disable-model-invocation: true
argument-hint: "[HTTP method] [resource path] [description]"
---

Create API endpoint: $ARGUMENTS

## Process

1. **Parse the request** — Extract HTTP method, resource path, and purpose
2. **Check existing patterns** — Find similar endpoints in `src/app/api/` to match conventions
3. **Create the endpoint** — Route Handler + Zod schemas + tests
4. **Verify** — Types compile, tests pass

## File Structure

For endpoint `GET /api/[resource]`:
```
src/app/api/[resource]/
  route.ts              # Route Handler
src/lib/[resource]/
  schemas.ts            # Zod schemas (input + output)
  service.ts            # Business logic (if complex)
  [resource].test.ts    # Tests
```

## Route Handler Template

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { [Schema]Request, [Schema]Response } from '@/lib/[resource]/schemas'

export async function [METHOD](request: NextRequest) {
  try {
    // 1. Parse and validate input
    const body = await request.json()
    const input = [Schema]Request.parse(body)

    // 2. Auth
    const supabase = await createServerClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 3. Business logic (RLS handles tenant isolation)
    const { data, error } = await supabase
      .from('[table]')
      .select('*')
      .eq('id', input.id)
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    // 4. Validate output and return
    return NextResponse.json({ data })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 422 }
      )
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
```

## Rules

### Input Validation
- ALWAYS validate with Zod — never trust raw input
- Parse path params, query params, and body separately
- Return 422 with Zod error details on validation failure

### Authentication
- ALWAYS check auth via `supabase.auth.getUser()`
- Return 401 for unauthenticated requests
- Let RLS handle authorization (tenant isolation)

### Response Format
- Success: `{ data: T }` with 200/201
- Client error: `{ error: string, details?: any }` with 400/401/404/422
- Server error: `{ error: 'Internal server error' }` with 500
- Never leak internal error details to clients

### Agent-Native Design
- Predictable URL pattern: `/api/[resource]` for collections, `/api/[resource]/[id]` for items
- Support filtering via query params: `?status=active&limit=10`
- Return pagination metadata: `{ data, count, page, pageSize }`
- Every endpoint MUST be callable without UI context

### Testing
- Test happy path for each HTTP method
- Test validation failures (bad input)
- Test auth failures (no token, invalid token)
- Test not found cases
- Mock Supabase client in tests
