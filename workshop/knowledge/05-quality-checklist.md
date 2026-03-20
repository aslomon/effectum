# PRD Quality Checklist

Verification checklist to ensure a PRD is complete, consistent, and agent-ready before handoff.

---

## Completeness Check

### Problem & Goal

- [ ] Problem statement explains WHO is affected and WHY it matters
- [ ] Goal is measurable (you can verify it was achieved)
- [ ] Business context is provided (not just technical motivation)

### User Stories

- [ ] Each story follows "As a [role], I want to [action], so that [benefit]"
- [ ] All identified user personas have at least one story
- [ ] Stories cover the happy path AND error/edge cases

### Acceptance Criteria

- [ ] Each criterion is independently testable by an automated test
- [ ] Complex criteria use Given/When/Then format
- [ ] No vague terms ("user-friendly", "fast", "intuitive") — replaced with concrete metrics
- [ ] Edge cases are covered (empty state, max limits, invalid input, concurrent access)
- [ ] Error scenarios are specified (what happens when things go wrong)
- [ ] Each criterion maps to exactly one behavior (no compound "X and Y" criteria)

### Scope

- [ ] In-scope list is exhaustive (everything being built is listed)
- [ ] Out-of-scope list includes items someone might reasonably expect
- [ ] No overlap between in-scope and out-of-scope
- [ ] Non-Goals are explicitly stated

### Data Model

- [ ] All tables are defined with columns, types, and constraints
- [ ] Primary keys, foreign keys, and indexes are specified
- [ ] Multi-tenant isolation is addressed (org_id where needed)
- [ ] RLS policies are defined for every table
- [ ] Timestamps (created_at, updated_at) are included
- [ ] Soft delete vs. hard delete strategy is documented
- [ ] Relations between tables are documented

### API Design

- [ ] Every CRUD operation has a defined endpoint
- [ ] Request and response shapes are specified with field types
- [ ] Error responses are documented (400, 401, 403, 404, 429, 500)
- [ ] Authentication requirements are stated per endpoint
- [ ] Rate limiting is specified where applicable
- [ ] Pagination strategy is defined for list endpoints

---

## Consistency Check

- [ ] Acceptance criteria align with user stories (every story has criteria)
- [ ] Data model supports all acceptance criteria (no missing fields/tables)
- [ ] API endpoints cover all acceptance criteria (no missing operations)
- [ ] Scope boundaries match acceptance criteria (nothing in AC that is out of scope)
- [ ] Constraints are reflected in the data model and API design

---

## Agent-Ready Check

### Quality Gates

- [ ] Build command is specified (e.g., `pnpm build`)
- [ ] Type check command is specified (e.g., `tsc --noEmit`)
- [ ] Test command is specified (e.g., `pnpm vitest run`)
- [ ] Lint command is specified (e.g., `pnpm lint`)
- [ ] E2E test command is specified (if applicable)
- [ ] Coverage threshold is defined (e.g., 80%+)
- [ ] Project-specific checks are listed

### Autonomy Rules

- [ ] Design decision authority is clear (follow DESIGN.md / free to decide / ask)
- [ ] Library choice authority is clear (existing only / free to add / predefined)
- [ ] Architecture pattern references are provided (e.g., "follow src/lib/billing/")
- [ ] Ambiguity handling is defined (decide autonomously / stop and ask)

### Completion Promise

- [ ] Promise is a single, verifiable statement
- [ ] Promise covers ALL quality gates
- [ ] Promise is specific enough that it cannot be true if any AC fails
- [ ] Promise format works with the target system (Ralph Loop / GSD / manual)

---

## Architecture Compliance

These checks ensure the PRD aligns with the autonomous workflow's architecture principles.

- [ ] DB changes specify migration approach (`apply_migration`, not raw DDL)
- [ ] TypeScript types will be generated from schema (not hand-written)
- [ ] Type-safety chain is documented: DB schema → generated types → Zod schemas → API → frontend
- [ ] Multi-tenancy is addressed: `org_id` on relevant tables with RLS
- [ ] Service layer is separated from UI components (no business logic in components)
- [ ] Server Components are the default; Client Components are justified with reason
- [ ] All API inputs are validated with Zod
- [ ] Result pattern `{ data, error }` is used for operations that can fail
- [ ] API endpoints expose clean REST/RPC interfaces (agent-native principle)

---

## Red Flags — Issues That Will Cause Implementation Problems

| Red Flag                     | Problem                      | Fix                                            |
| ---------------------------- | ---------------------------- | ---------------------------------------------- |
| "Should be fast"             | Not testable                 | Define: "API response < 200ms at p95"          |
| "Nice UI"                    | Subjective                   | Reference DESIGN.md or provide wireframes      |
| "Handle errors gracefully"   | Vague                        | Specify each error case with expected behavior |
| No data model                | Agent must guess schema      | Define tables, fields, types, relations        |
| No out-of-scope              | Scope creep guaranteed       | List 3-5 explicit exclusions                   |
| Compound AC: "X and Y and Z" | Untestable as single unit    | Split into separate criteria                   |
| "Similar to [product]"       | Ambiguous without specifics  | Describe exact behaviors to replicate          |
| No API error responses       | Agent invents error handling | Define status codes and messages               |
| Missing auth requirements    | Agent guesses access control | Specify per-endpoint authentication            |
| No RLS policies              | Security gap                 | Define row-level security for every table      |

---

## Final Verification Questions

Ask these before declaring the PRD complete:

1. **Can a developer implement this without asking a single question?**
   If not, what is missing?

2. **Can every acceptance criterion be verified by running a command?**
   If not, rewrite the criterion to be testable.

3. **Is it clear what is NOT being built?**
   If not, add explicit out-of-scope items.

4. **Could two developers read this PRD and build the same thing?**
   If not, add specificity where interpretations diverge.

5. **Does the data model support every acceptance criterion?**
   Trace each AC to the fields and tables it requires.

6. **Are all [ASSUMPTION] and [NEEDS CLARIFICATION] tags resolved?**
   If not, resolve them before handoff.

---

## PRD Readiness Scoring

| Category                    | Weight | Score (0-3) | Notes                                                     |
| --------------------------- | ------ | ----------- | --------------------------------------------------------- |
| Problem clarity             | 10%    |             | 0=missing, 1=vague, 2=clear, 3=compelling                 |
| Acceptance criteria quality | 20%    |             | 0=missing, 1=vague, 2=testable, 3=Given/When/Then         |
| Scope definition            | 10%    |             | 0=missing, 1=in-scope only, 2=+out-of-scope, 3=+non-goals |
| Data model completeness     | 20%    |             | 0=missing, 1=tables only, 2=+relations, 3=+RLS+indexes    |
| API design                  | 15%    |             | 0=missing, 1=endpoints only, 2=+shapes, 3=+errors+auth    |
| Agent-ready extension       | 15%    |             | 0=missing, 1=quality gates, 2=+autonomy, 3=+promise       |
| Architecture compliance     | 10%    |             | 0=missing, 1=partial, 2=most checks, 3=all checks pass    |

**Minimum for handoff: Average score >= 2.0**
**Recommended for autonomous execution: Average score >= 2.5**
