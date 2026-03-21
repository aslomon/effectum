---
name: feature
description: Spec-driven feature implementation from requirements to verified code. Enforces the full workflow — spec, plan, tests, implement, verify, review.
disable-model-invocation: true
argument-hint: "[feature description]"
---

Implement feature: $ARGUMENTS

## Workflow — Execute each phase sequentially. Do NOT skip phases.

### Phase 1: Spec
Write a short spec (10-20 lines max) covering:
- **What**: What exactly will be built
- **Why**: What problem it solves
- **Acceptance criteria**: Concrete, testable conditions (bullet list)
- **Edge cases**: What could go wrong
- **Out of scope**: What this does NOT include

Present the spec to the user. Wait for confirmation before proceeding.

### Phase 2: Plan
Explore the codebase to understand:
- Which files need to change
- Which existing patterns/utilities to reuse
- Database schema changes needed (if any)

Create a step-by-step implementation plan. Keep it concise:
- List files to create/modify
- Note dependencies between steps
- Identify the riskiest part

Present the plan. Wait for confirmation.

### Phase 3: Database (if needed)
If the feature needs schema changes:
- Use `/supabase-migration` skill pattern
- Apply migration via `apply_migration`
- Verify RLS policies
- Generate TypeScript types

### Phase 4: Tests First
Write failing tests BEFORE implementation:
- Unit tests with Vitest for business logic
- Component tests with Testing Library for UI
- Test the acceptance criteria from the spec
- Test edge cases

Run tests — they SHOULD fail (red phase).

### Phase 5: Implement
Write the minimum code to make tests pass:
- Follow the project structure convention from CLAUDE.md
- Server Components by default, Client Components only when needed
- Zod validation on all external inputs
- Result pattern `{ data, error }` for operations that can fail
- No business logic in components — extract to lib/[domain]/

### Phase 6: Verify
Run the full verification suite:
- `tsc --noEmit` — No type errors
- `eslint .` — No lint errors
- `vitest run` — All tests pass
- Check that ALL acceptance criteria from Phase 1 are met

If anything fails, fix it before proceeding.

### Phase 7: Summary
Report to the user:
- What was built (files created/modified)
- All acceptance criteria: PASS/FAIL
- Any decisions made during implementation
- Suggested follow-up work (if any)
