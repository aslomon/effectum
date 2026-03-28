---
name: "E2E Tests"
description: "Write and run end-to-end tests for critical user journeys using Playwright or similar."
allowed-tools: ["Read", "Write", "Edit", "Bash", "Glob", "Grep"]
effort: "medium"
---

# /e2e -- Write and Run End-to-End Tests

You write and execute end-to-end tests for critical user journeys. Focus on testing the application as a real user would interact with it.

## Step 1: Determine Test Targets

1. Read `CLAUDE.md` for the project's E2E framework, test directory, and conventions.
2. Parse `$ARGUMENTS`:
   - If specific test targets are provided (e.g., "login flow", "checkout"): focus on those.
   - If acceptance criteria are provided: derive test cases from them.
   - If empty: identify critical user journeys from the PRD, recent changes (`git diff`), or the application's core functionality.

## Step 2: Study Existing Patterns

1. Read existing E2E test files to understand:
   - Test structure and organization.
   - Helper functions, fixtures, and page objects.
   - Authentication and setup patterns.
   - Selector conventions (data-testid, roles, labels).
   - Configuration (base URL, timeouts, browser settings).
2. Read the E2E framework configuration file for project-specific settings.

## Step 3: Plan Test Cases

For each user journey, plan:

1. **Happy path**: The primary success scenario the user is expected to follow.
2. **Error cases**: Invalid inputs, permission denied, network errors, empty states.
3. **Edge cases**: Boundary values, concurrent actions, rapid interactions.

Each test must be independent -- no shared state between tests. Each test should set up its own preconditions and clean up after itself.

## Step 4: Write E2E Tests

Write tests using the project's E2E framework (as specified in CLAUDE.md). Follow these principles:

1. **Selectors** (in priority order):
   - Accessibility-tree-based: `getByRole`, `getByLabel`, `getByPlaceholder` -- most reliable, resilient to UI changes.
   - `data-testid` attributes -- stable, explicit contract between test and implementation.
   - Scoped queries -- search within a container element, not globally.
   - Avoid: CSS classes, tag names, XPath, or text selectors that match multiple elements.

2. **Test structure**:
   - Descriptive test names that explain the user journey.
   - Arrange (set up preconditions) -> Act (perform user actions) -> Assert (verify outcomes).
   - Use the framework's built-in waiting mechanisms instead of hardcoded waits.
   - Add `data-testid` attributes to source components when no suitable accessible selector exists.

3. **Test isolation**:
   - Each test starts from a known state (fresh session, seeded data).
   - Tests do not depend on the execution order of other tests.
   - Clean up any data or state created during the test.

## Step 5: Run Tests

1. Run the E2E tests using the project's E2E test command (as specified in CLAUDE.md).
2. Collect the results: pass/fail per test, total duration, any screenshots or traces.

## Step 6: Handle Failures

On test failure, follow the diagnostic sequence **before** attempting any fix:

1. **Read the error message and stack trace** completely.
2. **Read framework-specific diagnostics**: screenshots, traces, video recordings, accessibility snapshots, HTML snapshots.
3. **Check execution context**: Is the application running? Are environment variables set? Is the test database seeded?
4. **Identify root cause**: Is this a test issue (wrong selector, timing) or an application bug?
5. **Apply a targeted fix** (one change per attempt). Re-run the failing test.
6. If the same test fails 3 times with different fixes: document the issue and move on. Report it as a blocker.

## Step 7: Report Results

Present results per test:

```
| Test                          | Status | Duration |
| ----------------------------- | ------ | -------- |
| User can sign up and log in   | PASS   | 3.2s     |
| User sees error on invalid    | PASS   | 1.8s     |
| Dashboard loads for new user  | FAIL   | 5.0s     |
```

For failures, include:

- The exact error message.
- The step that failed.
- Any diagnostic artifacts (screenshot paths, trace paths).
- Suggested root cause and fix.

## Next Steps

After E2E tests:

- → `/verify` — Run the full quality gate suite including the new E2E tests
- → `/code-review` — If all tests pass, proceed to security and quality audit

ℹ️ Alternative: If E2E tests fail due to application bugs, fix them with `/build-fix` or `/tdd` first.

## Communication

Follow the language settings defined in CLAUDE.md for user-facing communication.
All test names, code, and technical content in English.
