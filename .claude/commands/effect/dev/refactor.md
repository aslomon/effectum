---
name: "effect:dev:refactor"
description: "Remove dead code and improve quality without changing observable behavior."
allowed-tools: ["Read", "Edit", "Bash", "Glob", "Grep"]
effort: "medium"
---

# effect:dev:refactor — Remove Dead Code and Improve Quality

You clean up the codebase by removing dead code and improving quality, without changing any observable behavior. Every change is validated by the test suite.

## Step 1: Establish a Passing Baseline

1. Read `CLAUDE.md` for the project's test command, build command, and lint command.
2. Run the full test suite.
3. **If any tests fail: STOP immediately.** Do not refactor a codebase with failing tests. Report the failures and suggest running `effect:dev:fix` or `effect:dev:tdd` first.
4. Record the test count and pass rate as the baseline.

## Step 2: Analyze the Codebase

Scan for refactoring opportunities across these categories:

### Dead Code

- **Unused imports**: Imports that are not referenced anywhere in the file.
- **Unused variables and functions**: Declared but never called or read.
- **Unused files**: Files that are not imported by any other file.
- **Commented-out code blocks**: Old code left in comments (not explanatory comments).
- **Unreachable code**: Code after return/throw statements, never-true conditions.

### Oversized Files

- Files exceeding 300 lines. Identify natural split points (separate concerns, distinct feature areas).

### Duplicated Logic

- Functions or code blocks that appear in multiple places with minor variations. Identify candidates for extraction into shared utilities.

### Overly Complex Functions

- Functions exceeding 40 lines. Identify extraction points (helper functions, early returns, guard clauses).

### Inconsistent Naming

- Variables, functions, or files that don't follow the project's naming conventions (as defined in CLAUDE.md).

## Step 3: Create a Refactoring Plan

Present the findings as a prioritized list:

```
| # | Category       | Location                    | Description                          | Risk |
| - | -------------- | --------------------------- | ------------------------------------ | ---- |
| 1 | Dead code      | src/lib/utils/old-helper.ts | File not imported anywhere           | Low  |
| 2 | Oversized file | src/lib/auth/service.ts     | 412 lines, split auth + session      | Med  |
| 3 | Duplication    | src/components/form/*.tsx    | Validation logic duplicated 3 times  | Low  |
| 4 | Complex fn     | src/lib/billing/calc.ts     | calculateTotal: 67 lines             | Med  |
```

**Wait for user approval before proceeding.** The user may exclude specific items or reprioritize.

## Step 4: Refactor One Thing at a Time

For each approved refactoring item:

1. **Make the change**: Apply the refactoring (delete dead code, extract function, rename, split file).
2. **Run the full test suite**: Verify all tests still pass.
3. **If tests pass**: Move to the next item.
4. **If tests fail**: Revert the change immediately. Investigate why the "dead" code or refactoring broke something. Report the finding -- it may indicate a test gap or hidden dependency.

### Refactoring Patterns

- **Remove dead code**: Delete the unused import, variable, function, or file. If a file is deleted, check for any remaining references.
- **Split oversized file**: Extract related functions/classes into a new file. Update all import paths. Ensure the public API surface remains identical.
- **Extract duplicated logic**: Create a shared utility function. Replace all instances with calls to the shared function. Verify behavior is identical.
- **Simplify complex functions**: Extract helper functions, use early returns to reduce nesting, separate concerns into distinct functions.
- **Fix naming**: Rename using the IDE/tool's rename capability or update all references manually. Verify no references are missed.

## Step 5: Final Verification

After all refactoring is complete:

1. Run the full test suite -- verify all tests pass (same count as baseline, no new failures).
2. Run the build command -- verify it passes.
3. Run the lint command -- verify it passes.
4. Compare the codebase metrics:
   - Total lines of code (before vs. after).
   - Number of files (before vs. after).
   - Largest file size (before vs. after).

## Step 6: Report

Present a summary:

```
| Metric                | Before | After  |
| --------------------- | ------ | ------ |
| Total source files    | 87     | 84     |
| Total lines of code   | 12,450 | 11,200 |
| Largest file (lines)  | 412    | 245    |
| Tests passing         | 142    | 142    |
| Build status          | PASS   | PASS   |
| Lint status           | PASS   | PASS   |
```

List each refactoring that was applied and its impact. Suggest running `effect:dev:verify` for a full quality gate check.

## Next Steps

After refactoring is complete:

- → `effect:dev:verify` — Run full quality gates to confirm no regressions
- → `effect:dev:review` — Review the cleaned-up code for any remaining issues

ℹ️ Alternative: If refactoring uncovered test gaps, run `effect:dev:tdd` to add missing tests first.

## Communication

Follow the language settings defined in CLAUDE.md for user-facing communication.
All code, file paths, and technical content in English.
