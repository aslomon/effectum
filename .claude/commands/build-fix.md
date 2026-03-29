---
name: "effect:dev:fix"
description: "Incrementally fix build and type errors one at a time, re-running after each fix."
allowed-tools: ["Bash", "Read", "Edit"]
effort: "medium"
---

> ⚠️ **`/build-fix` is deprecated → use `/effect:dev:fix`** (removed in v0.20)


# effect:dev:fix — Incrementally Fix Build and Type Errors

You fix build and type errors one at a time, re-running the build after each fix. You never suppress errors or skip warnings to force a passing build.

## Step 1: Run the Build

1. Read `CLAUDE.md` to identify the project's build command and type-check command.
2. Run the build command.
3. If the build succeeds with zero errors: report success and stop.

## Step 2: Analyze Build Output

If the build fails:

1. Read the **complete** error output -- every error, every warning.
2. Count the total number of errors.
3. Categorize the errors:
   - **Type errors**: Missing types, incompatible types, missing properties.
   - **Import errors**: Missing modules, wrong paths, circular dependencies.
   - **Syntax errors**: Malformed code, missing brackets, invalid expressions.
   - **Configuration errors**: Missing environment variables, wrong settings.
   - **Dependency errors**: Missing packages, version conflicts.

## Step 3: Fix One Error at a Time

Pick the **first** error in the output (errors often cascade -- fixing the first frequently resolves downstream errors).

1. Read the source file referenced in the error.
2. Understand the error: what is expected vs. what exists.
3. Apply a **targeted fix** -- change only what is necessary to resolve this specific error.
   - For type errors: add correct types, fix interfaces, use type guards. Never use `any` or unsafe casts.
   - For import errors: fix the import path, add the missing export, or install the missing package.
   - For syntax errors: fix the syntax.
   - For configuration errors: check CLAUDE.md and project config files for the correct values.
   - For dependency errors: install the missing package using the project's package manager (as specified in CLAUDE.md).

4. **Do NOT**:
   - Add `// @ts-ignore`, `// @ts-expect-error`, or equivalent suppressions.
   - Change `strict` mode settings or compiler options to be more permissive.
   - Delete code to make errors disappear.
   - Add `any` types to bypass type checking.

## Step 4: Re-Run the Build

1. Run the build command again after the fix.
2. Compare the error count to the previous run:
   - Fewer errors: good -- the fix worked and may have resolved cascading errors.
   - Same number: the fix resolved one error but uncovered another.
   - More errors: the fix introduced new problems -- revert it and try a different approach.

## Step 5: Repeat

Go back to Step 3 with the next error. Continue until:

- **Build passes**: Report success. List the fixes applied.
- **10 fix attempts reached**: Stop and report the current state:
  - How many errors were fixed.
  - How many errors remain.
  - The remaining error messages with file paths and line numbers.
  - Ask the user for guidance on the remaining errors.

## Step 6: Also Run Type Check (if separate)

If the project has a separate type-check command (distinct from the build command):

1. Run the type-check command after the build passes.
2. If type errors exist: repeat Steps 3-5 for type errors.

## Step 7: Report

Present a summary:

```
| Metric             | Value                    |
| ------------------ | ------------------------ |
| Initial errors     | 12                       |
| Errors fixed       | 12                       |
| Remaining errors   | 0                        |
| Fix attempts       | 8 (some fixes cascaded)  |
| Build status       | PASS                     |
| Type check status  | PASS                     |
```

If errors remain, list each one with file, line, error message, and what was attempted.

## Next Steps

After build errors are resolved:

- → `effect:dev:verify` — Run all quality gates to confirm everything passes
- → `effect:dev:tdd` — If new functionality is needed, continue with test-driven development

ℹ️ Alternative: If errors persist after 10 attempts, ask the user for guidance on the remaining issues.

## Communication

Follow the language settings defined in CLAUDE.md for user-facing communication.
All error messages and technical content in English.
