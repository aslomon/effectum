# Prompt Templates for Handoff

Ready-to-use prompt templates for handing PRDs to Claude Code and other AI agents. Copy the appropriate template, fill in the placeholders, and paste into the agent.

---

## Standard Prompt

For normal Claude Code sessions using `/plan` → `/tdd` → `/verify`.

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
- DESIGN.md: [path to DESIGN.md]
</context>
```

**When to use:** Most features. You review the plan, then the agent executes autonomously with test-driven development. You stay in the loop at key checkpoints.

---

## Full-Auto Prompt

Agent makes its own decisions and commits when tests are green.

```
Implement the following feature fully autonomously. Make your own decisions.
Commit when all tests are green and the build passes.

<workflow>
1. Read the PRD and existing code
2. Plan implementation (no approval needed)
3. Implement with TDD (tests first, then code)
4. Run quality gates after each phase
5. When ALL gates pass: commit with a descriptive message
</workflow>

<quality_gates>
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
[ADD PROJECT-SPECIFIC GATES]
</quality_gates>

<autonomy_rules>
- Design: Follow DESIGN.md
- Libraries: Use existing dependencies only
- Architecture: Follow existing patterns in src/
- On ambiguity: Decide autonomously and document in code comments
</autonomy_rules>

<prd>
[INSERT COMPLETE PRD HERE]
</prd>
```

**When to use:** Small to medium features where you trust the agent's judgment. Best for well-defined PRDs with clear acceptance criteria.

---

## Ralph Loop Prompt

Full autonomy with structured iteration loop, quality gates, and a completion promise.

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
[INSERT Quality Gates section from PRD]

Example:
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
</quality_gates>

<autonomy_rules>
[INSERT Autonomy Rules section from PRD]

Example:
- Design: Follow DESIGN.md
- Libraries: Use existing dependencies only
- Architecture: Follow existing patterns in src/lib/
- File structure: Follow project conventions
- On ambiguity: Decide autonomously and document
</autonomy_rules>

<prd>
[INSERT COMPLETE PRD]
</prd>

--max-iterations [N] --completion-promise '[COMPLETION PROMISE]'
```

**When to use:** Complex features where you want fully autonomous execution with built-in guardrails. The agent iterates until the completion promise is satisfied or max iterations are reached.

---

## Express Prompt

For small features that do not need a full plan phase.

```
Quick feature implementation. Skip the plan phase, go straight to TDD.

<workflow>
1. /tdd — Write tests from acceptance criteria, then implement
2. /verify — Ensure everything passes
3. Do NOT commit — show the final git diff
</workflow>

<prd>
[INSERT PRD — can be minimal for small features]
</prd>
```

**When to use:** Tiny features (1-3 ACs), bugfixes with clear reproduction steps, or additions to existing patterns.

---

## Bugfix Prompt

For fixing a specific bug with a regression test.

```
Fix the following bug. Add a regression test that would have caught it.

<bug>
**What happens:** [Describe the current broken behavior]
**What should happen:** [Describe the expected correct behavior]
**Steps to reproduce:**
1. [Step 1]
2. [Step 2]
3. [Step 3]
**Error message / screenshot:** [If available]
</bug>

<workflow>
1. Write a failing test that reproduces the bug
2. Fix the bug (minimal change)
3. Verify the test passes
4. /verify — Ensure no regressions
5. Do NOT commit — show the final git diff
</workflow>

<context>
- Likely location: [file path or module where the bug probably lives]
- Related files: [other files that may be affected]
</context>
```

**When to use:** Known bugs with clear reproduction steps. The regression test ensures the bug does not return.

---

## Refactoring Prompt

For improving code quality without changing behavior.

```
Refactor the following code. All existing tests must continue to pass.
No behavior changes — only structural improvements.

<scope>
**Files to refactor:**
- [file path 1]
- [file path 2]

**Refactoring goals:**
- [Goal 1: e.g., Extract service layer from component]
- [Goal 2: e.g., Split file exceeding 300 lines]
- [Goal 3: e.g., Replace any types with proper types]
</scope>

<constraints>
- All existing tests must pass without modification
- No new dependencies
- No behavior changes (refactoring only)
- Follow existing project patterns
</constraints>

<workflow>
1. Run existing tests to establish baseline
2. Refactor incrementally (one change at a time)
3. Run tests after each change
4. /verify at the end
5. Do NOT commit — show the final git diff
</workflow>
```

**When to use:** Code cleanup, splitting large files, extracting services, improving types. Never combined with feature work.

---

## Max-Iterations Guide

How many iterations to allocate based on PRD complexity.

| PRD Complexity    | Suggested Max-Iterations | Rationale                       |
| ----------------- | ------------------------ | ------------------------------- |
| Bugfix            | 10                       | Find + Fix + Test               |
| Small (1-3 AC)    | 20                       | Single endpoint, simple UI      |
| Standard (4-8 AC) | 30                       | DB + API + Frontend + Tests     |
| Large (9+ AC)     | 50                       | Multi-domain, complex UI, E2E   |
| Refactoring       | 15                       | Scoped changes, little new code |

**Rule of thumb:** If the agent has not converged after 70% of max-iterations, something is wrong with the PRD or the approach. Stop and reassess.

---

## Completion Promise Examples

The completion promise is the exact phrase that must be 100% true before the agent declares the feature done.

| Feature Type  | Promise                                                                                   |
| ------------- | ----------------------------------------------------------------------------------------- |
| Standard      | "All tests pass, build succeeds, 0 lint errors, no console.log in production code"        |
| With E2E      | "All unit tests pass, all e2e tests pass, build succeeds, 0 lint errors"                  |
| Bugfix        | "Bug is fixed, regression test added and passing, build succeeds"                         |
| With Supabase | "Migration applied, RLS policies active, all tests pass, build succeeds, types generated" |
| Refactoring   | "All tests pass, no dead code, build succeeds, 0 lint errors"                             |

> **Note:** Any PRD that includes DB changes (new tables, schema modifications) should include "types generated" in the completion promise. This ensures the type-safety chain (DB schema → generated types → Zod schemas → API → frontend) remains intact. See the "With Supabase" row above for an example.

**Good promises are:**

- Verifiable by running commands (not subjective)
- Comprehensive (cover all quality gates)
- Specific (cannot be true if any AC fails)

---

## Iteration Planning (for features > 20 iterations)

For larger features, include an iteration plan in the prompt to guide the agent through phases.

```xml
<iteration_plan>
  <phase name="Database" iterations="1-5">
    - Create migration for new tables
    - Apply migration
    - Generate TypeScript types
    - Verify RLS policies
  </phase>

  <phase name="Service Layer" iterations="6-12">
    - Write service tests (failing)
    - Implement service functions
    - Validate with Zod schemas
    - Run tests (passing)
  </phase>

  <phase name="API Routes" iterations="13-18">
    - Write API route tests (failing)
    - Implement route handlers
    - Error handling and validation
    - Run tests (passing)
  </phase>

  <phase name="Frontend" iterations="19-25">
    - Write component tests (failing)
    - Implement UI components
    - Connect to API
    - Run tests (passing)
  </phase>

  <phase name="Integration" iterations="26-30">
    - E2E tests for critical paths
    - Final quality gate check
    - Code review pass
    - Output completion promise
  </phase>
</iteration_plan>
```

**When to use:** Features with 4+ acceptance criteria and multiple layers (DB, API, frontend). Helps the agent stay on track and avoid scope creep within a single iteration.
