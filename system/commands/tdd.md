---
name: "TDD"
description: "Test-driven development: write failing tests first, then implement minimal code to pass."
allowed-tools: ["Read", "Write", "Edit", "Bash", "Glob", "Grep"]
effort: "medium"
---

# /tdd -- Test-Driven Development: RED -> GREEN -> REFACTOR

You implement features using strict Test-Driven Development. Every piece of functionality starts with a failing test.

## Step 1: Establish Context

1. Read `CLAUDE.md` for the project's test framework, test conventions, and file organization.
2. Read `$ARGUMENTS` for the feature context: PRD reference, specific functionality, or conversation context.
3. If a PRD is referenced, read it to understand the acceptance criteria.
4. Read existing test files to understand patterns: test structure, naming, helpers, fixtures, mocking approach.
5. **Task Registry**: Check for `tasks.md` in the project (`workshop/projects/*/tasks.md` or project root). If found:
   - Read it and identify the next `📋 TODO` or `⚠️ STALE` task related to the current work.
   - Update the task status to `🔄 IN_PROGRESS` before starting.

## Step 2: Identify the Next Unit of Work

Break the feature into small, independently testable pieces of functionality. Pick the next piece that:

- Has no unmet dependencies on other unimplemented pieces.
- Represents a single, clearly defined behavior.
- Can be expressed as one or more test assertions.

If all pieces are implemented, skip to Step 6.

## Step 3: RED -- Write a Failing Test

1. Create or open the test file following project conventions (colocated with source or in a tests directory).
2. Write a test that describes the expected behavior of the next piece of functionality.
   - Use descriptive test names that explain WHAT is being tested and WHAT the expected outcome is.
   - Test one behavior per test case.
   - Use the project's test framework and assertion style as specified in CLAUDE.md.
3. Run the test using the project's test command (as specified in CLAUDE.md).
4. **Verify it fails for the RIGHT reason:**
   - The test should fail because the functionality does not exist yet (e.g., missing function, missing module, wrong return value).
   - If it fails for the WRONG reason (import error, syntax error, misconfigured test), fix the test setup first.
   - If it passes unexpectedly, the behavior already exists -- move to the next piece.

## Step 4: GREEN -- Write Minimum Code to Pass

1. Write the simplest implementation that makes the failing test pass.
   - Follow project conventions, patterns, and architectural rules from CLAUDE.md.
   - Use existing utilities, components, and services where applicable.
   - Do NOT add functionality beyond what the test requires.
2. Run the test using the project's test command.
3. **Verify it passes.** If it still fails:
   - Read the error output completely before attempting a fix.
   - Apply a targeted fix (one change at a time).
   - Re-run the test.

## Step 5: REFACTOR -- Improve While Green

With the test passing, improve the code quality:

1. Extract common patterns into shared utilities or helpers.
2. Improve naming for clarity.
3. Reduce duplication (DRY) -- within the current feature and against existing code.
4. Ensure functions stay under 40 lines and files under 300 lines.
5. Ensure error handling follows project conventions (e.g., Result pattern).
6. Run the full test suite (not just the current test) to verify nothing is broken.
7. If any test breaks during refactoring: revert the refactoring change and investigate.

## Step 6: Repeat

Go back to Step 2 and pick the next piece of functionality. Continue until all acceptance criteria from the PRD or feature description are covered by passing tests.

## Step 7: Final Verification

When the feature is fully implemented:

1. Run the complete test suite to confirm all tests pass.
2. Run the project's build command to confirm compilation succeeds.
3. Run the project's type-check command (if separate from build) to confirm type safety.
4. Run the project's linter to confirm code style compliance.
5. **Task Registry**: If `tasks.md` was found in Step 1, update all tasks worked on during this TDD session:
   - Tasks with all ACs implemented and tests passing: `🔄 IN_PROGRESS` → `✅ DONE`
   - Write the file to disk immediately.
6. Report results: what was implemented, how many tests were written, and the pass/fail status of each quality gate.
7. Suggest running `/verify` for the full quality gate check or `/e2e` for end-to-end tests.

## Error Recovery

- **Import/module errors**: Check if the module path, export name, or package installation is correct.
- **Type errors**: Use type guards or validation schemas instead of type assertions.
- **Flaky tests**: Investigate the root cause (stateful dependency, timing, test isolation) -- do not retry blindly.
- **Same error 3 times**: Try a fundamentally different approach. Document what was tried and why it failed.

## Next Steps

After TDD implementation is complete:

- → `/verify` — Run all quality gates (build, types, lint, tests) to confirm everything passes
- → `/build-fix` — If any build or type errors remain, fix them incrementally

ℹ️ Alternative: If all tests pass and build is clean, proceed to `/code-review` for a security and quality audit.

## Communication

Follow the language settings defined in CLAUDE.md for user-facing communication.
All code, test names, and technical content in English.
