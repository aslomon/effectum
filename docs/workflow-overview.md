# Autonomous Development Workflow — Complete Overview

## What It Is

The Autonomous Development Workflow is a structured system that transforms Product Requirements Documents (PRDs) into production-ready code using Claude Code. It provides a complete pipeline from idea to verified implementation: you write a PRD, hand it to Claude Code, and get back working code with tests, migrations, security checks, and documentation. The workflow enforces quality at every step through automated gates, test-first development, and self-verifying loops.

## Philosophy

Three principles drive every decision in this workflow:

1. **Spec-driven development**: Every feature starts with a specification (PRD) that defines what "done" means. No coding begins without testable acceptance criteria.
2. **Test-first implementation**: Code is written to make failing tests pass, not the other way around. Tests are the source of truth for feature correctness.
3. **Quality gates as exit criteria**: A feature is not done when the code is written. It is done when compilation, type checking, linting, unit tests, integration tests, E2E tests, and security review all pass with zero errors.

## The 6 Phases

Every feature moves through six ordered phases. Each phase has a dedicated command and clear entry/exit criteria.

### Phase 1: Analysis and Planning (`/effect:dev:plan`)

**Input**: PRD or feature description.
**Process**: Claude reads the PRD, explores the codebase, identifies reusable patterns, creates a step-by-step plan with phases, dependencies, and risks.
**Output**: Implementation plan with complexity estimates.
**Exit**: User approves the plan.

This is the only phase where Claude stops and waits for explicit approval. All subsequent phases run autonomously (with guardrails).

### Phase 2: Database and Types

**Input**: Approved plan.
**Process**: Write database migrations, define RLS policies, generate TypeScript/Pydantic types, create Zod/Pydantic validation schemas.
**Output**: Schema, types, and validation ready.
**Exit**: Migration applied, types generated, smoke test passes.

A smoke test runs immediately after scaffolding to validate that the integration points (routing, middleware, database) work before building features on top.

### Phase 3: Backend TDD (`/effect:dev:tdd`)

**Input**: Types and schemas from Phase 2.
**Process**: Write failing tests (RED), implement API routes and services (GREEN), refactor.
**Output**: Working backend with tests.
**Exit**: All backend tests pass, `/effect:dev:verify` green.

### Phase 4: Frontend TDD (`/effect:dev:tdd`)

**Input**: Working API from Phase 3.
**Process**: Write failing component tests (RED), implement UI components (GREEN), refactor.
**Output**: Working frontend with tests.
**Exit**: All frontend tests pass, `/effect:dev:verify` green.

### Phase 5: E2E Tests (`/effect:dev:e2e`)

**Input**: Working frontend and backend.
**Process**: Write end-to-end tests that exercise critical user journeys through the browser.
**Output**: E2E test suite.
**Exit**: All E2E tests pass.

### Phase 6: Verification and Review (`/effect:dev:verify` + `/effect:dev:review`)

**Input**: Complete implementation.
**Process**: Run all quality gates (build, types, lint, tests, E2E), then perform security and quality audit.
**Output**: Verification report and code review findings.
**Exit**: All gates pass, no security issues, code review approved.

## Command Chains by Scenario

### New Feature (Standard)

```
/effect:dev:plan -> [approval] -> /effect:dev:tdd -> /effect:dev:verify -> /effect:dev:e2e -> /effect:dev:verify -> /effect:dev:review
```

### Small Feature or Bugfix

```
/effect:dev:tdd -> /effect:dev:verify -> /effect:dev:review
```

### Large Feature (Multi-Domain)

```
/effect:dev:plan -> [approval] -> /effect:dev:tdd (DB+API) -> /effect:dev:verify -> /effect:dev:tdd (Frontend) -> /effect:dev:verify -> /effect:dev:e2e -> /effect:dev:review
```

### Refactoring

```
/effect:dev:plan -> [approval] -> /effect:dev:refactor -> /effect:dev:verify -> /effect:dev:review
```

### Full Autonomy (Overnight)

```
/ralph-loop "PRD + workflow + quality gates" --max-iterations 30 --completion-promise "COMPLETE"
```

## Ralph Loop — Self-Referential Autonomy

Ralph Loop is the highest level of automation. You give Claude a single prompt containing a PRD, quality gates, and a completion promise. Claude then iterates autonomously over its own work until the completion promise is satisfied or the max-iterations limit is reached.

**How it works:**

1. Claude reads the PRD and current project state.
2. Implements the next logical step.
3. Runs quality gates after every significant change.
4. Checks if all acceptance criteria and quality gates pass.
5. If yes: outputs the completion promise. If no: starts the next iteration.

**When to use it:**

- Acceptance criteria are 100% testable (no subjective UI decisions).
- PRD includes data model, API design, and quality gates.
- You want to run unattended (overnight, during meetings).

**When NOT to use it:**

- Design decisions are needed (subjective UI work).
- Scope is unclear or exploratory.
- You want to review each step.

**Safety mechanisms:**

- `--max-iterations` prevents infinite loops.
- `--completion-promise` forces honest self-verification.
- Iteration plans give Claude a roadmap.
- Error recovery writes status reports at 80% of iterations consumed.
- `/effect:dev:stop` stops a running loop.

## Quality Gates

Every feature must pass ALL applicable gates before it is considered done.

| #   | Gate          | Tool                | Criterion                        |
| --- | ------------- | ------------------- | -------------------------------- |
| 1   | Compilation   | Build command       | 0 errors                         |
| 2   | Type checking | Type checker        | 0 errors                         |
| 3   | Linting       | Linter              | 0 errors, 0 warnings             |
| 4   | Unit tests    | Test runner         | All passing, 80%+ coverage       |
| 5   | E2E tests     | Playwright/XCUITest | All journeys passing             |
| 6   | Security      | `/effect:dev:review`      | No OWASP vulnerabilities         |
| 7   | RLS check     | Supabase Advisor    | All tables have RLS policies     |
| 8   | Debug logs    | `/effect:dev:verify`           | 0 debug statements in production |
| 9   | Type safety   | Review              | No escape hatches (any, as)      |
| 10  | File size     | Review              | No file exceeds 300 lines        |

## Lessons Learned

These rules come from real autonomous sessions. Each one prevents a common time sink.

### Rule 1: Test environment differs from development

Test runners create their own execution contexts with different defaults (locale, timezone, permissions). Write a smoke test immediately after scaffolding to catch environment issues early.

### Rule 2: Validate integration points immediately

After scaffolding, test one end-to-end roundtrip before building features. Do not wait until Phase 5 to discover that routing, middleware, or database connections are misconfigured.

### Rule 3: Read diagnostics before attempting fixes

On test failure, always read the complete diagnostics (logs, traces, screenshots, error context) before changing code. Diagnostic analysis saves 3-5 debug iterations on average.

### Rule 4: Manual verification is not automated testing

"I tested it manually" does not count. Only passing automated tests confirm correctness. When manual and automated results disagree, the cause is almost always execution context (timing, state, permissions).

### Rule 5: Stateful dependencies cause flaky tests

Rate limiters, caches, queues, and database state persist between test runs. Identify and reset stateful dependencies, or isolate tests with mocking.

### Rule 6: Use precise identifiers from the start

Vague selectors (`getByText("Save")`, `querySelector(".btn")`) break on UI changes. Use scoped, specific identifiers (data-testid, element IDs, scoped queries) from the beginning.

## Interaction Points

These are the moments when Claude stops and asks for input.

| Point                 | Why                          | What you do                         |
| --------------------- | ---------------------------- | ----------------------------------- |
| After `/effect:dev:plan`         | Plan approval required       | "OK", "Change X", or "Start over"   |
| Ambiguous scope       | PRD has gaps                 | Answer the question                 |
| Breaking change       | Existing API/DB modification | Confirm or choose alternative       |
| Architecture decision | Multiple valid approaches    | Pick one                            |
| Test failure          | Unexpected, persistent error | Provide context or allow workaround |

**To minimize stops:** Write complete acceptance criteria. Define the data model upfront. State the autonomy level explicitly. Include infrastructure identifiers (Supabase Project ID, deployment targets).
