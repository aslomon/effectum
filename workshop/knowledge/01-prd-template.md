# PRD Template — Agent-Ready

This template produces PRDs that can be handed directly to Claude Code, GSD, or any AI coding agent for autonomous implementation.

---

## PRD Frontmatter

Every PRD starts with a YAML frontmatter block. This structured metadata enables machine-readable PRD processing, automatic versioning, task registry synchronization, and deterministic network map generation.

### Schema

```yaml
---
id: PRD-001 # Unique identifier within the project
title: "Feature Name" # Human-readable title
version: 1.0 # Semver-like version (1.0, 1.1, 1.2)
status: drafting # drafting | ready | in-progress | done | archived
last_updated: 2026-03-21 # ISO date of last modification
depends_on: [] # List of PRD IDs this depends on (e.g., [PRD-001])
features: # Feature registry for task tracking and network map
  - { id: AUTH, label: "Authentication Module", status: planned }
  - { id: LOGIN, label: "Login Flow", status: planned }
connections: # Cross-feature and cross-PRD dependencies
  - { from: AUTH, to: DASHBOARD, type: hard, label: "requires auth" }
---
```

### Field Reference

| Field          | Type   | Required | Description                                                                                                                    |
| -------------- | ------ | -------- | ------------------------------------------------------------------------------------------------------------------------------ |
| `id`           | string | Yes      | Format: `PRD-{NUMBER}`. Must be unique within the project.                                                                     |
| `title`        | string | Yes      | Human-readable feature name. Used in task registry and handoff prompts.                                                        |
| `version`      | number | Yes      | Starts at `1.0`. Bumped by `/prd:update`: minor for additive/modified changes, major reserved for breaking restructures.       |
| `status`       | enum   | Yes      | One of: `drafting`, `ready`, `in-progress`, `done`, `archived`. Updated by workflow commands.                                  |
| `last_updated` | date   | Yes      | ISO 8601 date (`YYYY-MM-DD`). Auto-updated by `/prd:new` and `/prd:update`.                                                    |
| `depends_on`   | list   | Yes      | PRD IDs that must be completed before this PRD can be implemented. Empty list `[]` if none.                                    |
| `features`     | list   | Yes      | Each feature has `id` (uppercase, unique), `label` (human-readable), and `status` (`planned`, `in-progress`, `done`).          |
| `connections`  | list   | Yes      | Each connection has `from` (feature ID), `to` (feature ID), `type` (`hard` or `soft`), and `label` (relationship description). |

### Feature Status Values

| Status        | Meaning                  | Set By                    |
| ------------- | ------------------------ | ------------------------- |
| `planned`     | Not yet implemented      | `/prd:new`, `/prd:update` |
| `in-progress` | Currently being built    | Ralph Loop                |
| `done`        | Implemented and verified | Ralph Loop                |

### Version Bumping Rules

| Change Type                 | Version Bump | Example   |
| --------------------------- | ------------ | --------- |
| ADDITIVE (new AC/feature)   | Minor (+0.1) | 1.0 → 1.1 |
| MODIFIED (changed AC)       | Minor (+0.1) | 1.1 → 1.2 |
| REMOVED (deleted AC)        | Minor (+0.1) | 1.2 → 1.3 |
| DESIGN (UI-only)            | Minor (+0.1) | 1.3 → 1.4 |
| STRUCTURAL (data model/API) | Minor (+0.1) | 1.4 → 1.5 |

### Changelog Section

Immediately after the frontmatter, every PRD contains a `## Changelog` section:

```markdown
## Changelog

| Version | Date       | Summary                                                              |
| ------- | ---------- | -------------------------------------------------------------------- |
| 1.2     | 2026-03-25 | Added Google OAuth (AC7), rate-limited password reset (AC3 modified) |
| 1.1     | 2026-03-22 | Added session management (AC4), removed SMS login (AC5)              |
| 1.0     | 2026-03-20 | Initial PRD                                                          |
```

Rules:

- Newest entries at the top
- `/prd:update` adds entries automatically
- Removed ACs are marked as `~~REMOVED in vX.Y~~` with reason in the AC list, not deleted from the file
- The changelog provides a human-readable history; git provides the machine-readable diff

---

## Standard PRD Template

````markdown
# PRD: [Feature Name]

## Problem

What is the problem? Why does it need to be solved? Include business context and who is affected.

[2-4 sentences. Be specific about the pain point and its impact.]

## Goal

What should work when this is done? Measurable outcome.

[1-3 sentences. Include success metrics if possible.]

## User Stories

- As a [role], I want to [action], so that [benefit]
- As a [role], I want to [action], so that [benefit]
- As a [role], I want to [action], so that [benefit]

[Use Jobs-to-be-Done framing: focus on the motivation behind the action, not just the action itself.]

## Acceptance Criteria

Each criterion must be independently testable. Use Given/When/Then format for complex criteria.

- [ ] AC1: [Concrete, testable criterion]
- [ ] AC2: [Concrete, testable criterion]
- [ ] AC3: Given [precondition], When [action], Then [expected result]
- [ ] AC4: Given [precondition], When [action], Then [expected result]

[Every criterion must map to at least one automated test. If you cannot write a test for it, it is not concrete enough.]

## Scope

### In Scope

- Feature X
- Screen Y
- API Endpoint Z
- [List everything that IS being built]

### Out of Scope

- What should NOT be built (explicit boundaries)
- Future features that are intentionally deferred
- Related functionality that belongs to a different PRD
- [Be explicit — vague boundaries cause scope creep]

## Data Model

### Tables

#### [table_name]

| Column     | Type        | Constraints                     | Description           |
| ---------- | ----------- | ------------------------------- | --------------------- |
| id         | uuid        | PK, default gen_random_uuid()   | Primary key           |
| org_id     | uuid        | FK → organizations.id, NOT NULL | Tenant isolation      |
| [field]    | [type]      | [constraints]                   | [description]         |
| created_at | timestamptz | NOT NULL, default now()         | Creation timestamp    |
| updated_at | timestamptz | NOT NULL, default now()         | Last update timestamp |

### Relations

- [table_a] belongs to [table_b] via [foreign_key]
- [table_a] has many [table_c] via [foreign_key]

### RLS Policies

- [table_name]: Users can only [SELECT/INSERT/UPDATE/DELETE] rows where org_id matches their organization
- [table_name]: Only admins can [specific operation]

### Indexes

- [table_name]: unique index on [columns]
- [table_name]: index on [columns] (query pattern: [describe])

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
````

**Response (200):**

```json
{
  "data": {
    "id": "uuid",
    "field": "value"
  }
}
```

**Error Responses:**

- 400: [When and why]
- 401: [When and why]
- 403: [When and why]
- 404: [When and why]
- 429: [Rate limit details]

[Repeat for each endpoint]

## UI/UX

- [Layout description or Figma link]
- [Responsive requirements and breakpoints]
- [Key interaction patterns]
- [Empty states, loading states, error states]

## Constraints

- Performance: [latency, throughput requirements]
- Dependencies: [external services, existing features]
- Security: [specific security requirements beyond standard]
- Timeline: [if applicable]

````

---

## Agent-Ready Extension

For autonomous implementation (Ralph Loop, GSD, or full-auto Claude Code), add these three sections to the PRD:

```markdown
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

Where the AI agent can make its own decisions vs. where it must follow strict guidelines:

- Design decisions: [Follow DESIGN.md / use best judgment / ask]
- Library choices: [use existing dependencies only / free to add / predefined list]
- Architecture: [follow existing patterns in src/lib/ / free to decide]
- File structure: [follow project conventions / free to organize]
- Error messages: [follow i18n patterns / English only / free to decide]
- On ambiguity: [decide autonomously and document / stop and ask]

## Completion Promise

The exact phrase that must be 100% true before the agent may declare the feature done:

"[All acceptance criteria met, build passes, all tests pass, 0 lint errors, no console.log in production code]"

[This phrase is used as the --completion-promise for Ralph Loop or as the exit criterion for GSD execute-phase.]
````

---

## Prompt Templates for Handoff

### Standard Prompt (for Claude Code)

```
Implement the following feature autonomously from database to frontend.

<workflow>
1. /plan — Create implementation plan, wait for approval
2. After approval: /tdd (tests first, then code)
3. /verify after each phase
4. /e2e for critical user journeys
5. /code-review at the end
6. Do NOT commit — show the final git diff
</workflow>

<prd>
[INSERT COMPLETE PRD HERE]
</prd>

<context>
- Project: [project name/path]
- Supabase Project ID: [ID] (if applicable)
- Follow existing patterns in: [relevant files/directories]
</context>
```

### Ralph Loop Prompt (for full autonomy)

```
/ralph-loop Implement [feature name] per the PRD below.

<workflow>
Each iteration:
1. Check current state (git diff, test results)
2. Implement the next logical step
3. Run quality gates after every significant change
4. When ALL criteria pass: output <promise>[COMPLETION PROMISE]</promise>
</workflow>

<quality_gates>
[INSERT Quality Gates from PRD]
</quality_gates>

<autonomy_rules>
[INSERT Autonomy Rules from PRD]
</autonomy_rules>

<prd>
[INSERT COMPLETE PRD]
</prd>

--max-iterations [N] --completion-promise '[COMPLETION PROMISE]'
```

### GSD Prompt (for GSD framework)

```
/gsd:new-project

[Paste the PRD when GSD asks for project description.
GSD will handle the rest: research, planning, execution, verification.]
```

---

## Max-Iterations Guide

| PRD Complexity    | Suggested Max-Iterations | Rationale                       |
| ----------------- | ------------------------ | ------------------------------- |
| Bugfix            | 10                       | Find + Fix + Test               |
| Small (1-3 AC)    | 20                       | Single endpoint, simple UI      |
| Standard (4-8 AC) | 30                       | DB + API + Frontend + Tests     |
| Large (9+ AC)     | 50                       | Multi-domain, complex UI, E2E   |
| Refactoring       | 15                       | Scoped changes, little new code |

---

## Completion Promise Examples

| Feature Type  | Promise                                                                                   |
| ------------- | ----------------------------------------------------------------------------------------- |
| Standard      | "All tests pass, build succeeds, 0 lint errors, no console.log in production code"        |
| With E2E      | "All unit tests pass, all e2e tests pass, build succeeds, 0 lint errors"                  |
| Bugfix        | "Bug is fixed, regression test added and passing, build succeeds"                         |
| With Supabase | "Migration applied, RLS policies active, all tests pass, build succeeds, types generated" |
| Refactoring   | "All tests pass, no dead code, build succeeds, 0 lint errors"                             |

> **Note:** Any PRD that includes DB changes (new tables, schema modifications) should include "types generated" in the completion promise. This ensures the type-safety chain (DB schema → generated types → Zod schemas → API → frontend) remains intact. See the "With Supabase" row above for an example.
