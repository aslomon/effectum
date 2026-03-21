---
id: PRD-{NUMBER}
title: "{Feature Name}"
version: 1.0
status: drafting # drafting | ready | in-progress | done | archived
last_updated: { DATE }
depends_on: []
features:
  - { id: FEAT_ID, label: "Feature Label", status: planned }
connections:
  - { from: FEAT_ID, to: OTHER_ID, type: hard, label: "relationship" }
---

# PRD: {Feature Name}

## Changelog

| Version | Date   | Summary     |
| ------- | ------ | ----------- |
| 1.0     | {DATE} | Initial PRD |

## Problem

[2-4 sentences. What is the problem? Why does it need to be solved? Who is affected? Include business context.]

## Goal

[1-3 sentences. What should work when this is done? Include measurable success criteria.]

## User Stories

- As a [role], I want to [action], so that [benefit]
- As a [role], I want to [action], so that [benefit]
- As a [role], I want to [action], so that [benefit]

## Acceptance Criteria

- [ ] AC1: [Concrete, testable criterion]
- [ ] AC2: [Concrete, testable criterion]
- [ ] AC3: Given [precondition], When [action], Then [expected result]
- [ ] AC4: Given [precondition], When [action], Then [expected result]

## Scope

### In Scope

- [Feature/component being built]
- [Feature/component being built]

### Out of Scope

- [Explicit exclusion]
- [Explicit exclusion]

### Non-Goals

- [Something someone might expect, but is intentionally excluded]

## Data Model

### [table_name]

| Column     | Type        | Constraints                     | Description           |
| ---------- | ----------- | ------------------------------- | --------------------- |
| id         | uuid        | PK, default gen_random_uuid()   | Primary key           |
| org_id     | uuid        | FK → organizations.id, NOT NULL | Tenant isolation      |
| [field]    | [type]      | [constraints]                   | [description]         |
| created_at | timestamptz | NOT NULL, default now()         | Creation timestamp    |
| updated_at | timestamptz | NOT NULL, default now()         | Last update timestamp |

### Relations

- [table_a] belongs to [table_b] via [foreign_key]

### RLS Policies

- [table_name]: [policy description]

### Indexes

- [table_name]: [index description]

## API Design

### [HTTP_METHOD] /api/[resource]

**Purpose:** [What this endpoint does]

**Authentication:** Required / Public

**Request:**

```json
{
  "field": "type — description"
}
```

**Response (200):**

```json
{
  "data": {}
}
```

**Error Responses:**

- 400: [When and why]
- 401: [When and why]
- 403: [When and why]
- 404: [When and why]

## UI/UX

- [Layout description or Figma link]
- [Responsive requirements]
- [Key interaction patterns]
- [Empty states, loading states, error states]

## Constraints

- Performance: [requirements]
- Dependencies: [external services, existing features]
- Security: [specific requirements]

## Quality Gates

Automated checks that MUST pass before the feature is considered done:

- Build: `pnpm build` — 0 errors
- Types: `tsc --noEmit` — 0 errors
- Tests: `pnpm vitest run` — all pass, 80%+ coverage on new code
- Lint: `pnpm lint` — 0 errors, 0 warnings
- E2E: `npx playwright test` — all pass (if applicable)
- Security: `/code-review` — no OWASP vulnerabilities
- RLS: Supabase security advisor — no warnings (if DB changes)
- No Debug Logs: 0 `console.log` in production code
- Type Safety: no `any`, no `as` casts in new code
- File Size: no file exceeds 300 lines
- Custom: [project-specific checks]

## Autonomy Rules

- Design: [Follow DESIGN.md / use best judgment / ask]
- Libraries: [use existing dependencies only / free to add]
- Architecture: [follow existing patterns in src/lib/ / free to decide]
- On ambiguity: [decide autonomously and document / stop and ask]

## Completion Promise

"[All acceptance criteria met, build passes, all tests pass, 0 lint errors, no console.log in production code]"
