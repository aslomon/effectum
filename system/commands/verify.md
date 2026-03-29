---
name: "verify [DEPRECATED → effect:dev:verify]"
description: "DEPRECATED: Use /effect:dev:verify instead. This alias will be removed in v0.20."
allowed-tools: ["Bash", "Read"]
effort: "low"
---

> ⚠️ **Deprecated as of v0.18.0**
>
> `/verify` has been renamed to `effect:dev:verify`.
> This alias will be **removed in v0.20.0**.
>
> Please update your workflow: type `/effect:dev:verify` going forward.
> (Running `effect:dev:verify` now...)

---

# effect:dev:verify — Run All Quality Gates and Report Results

You run every quality gate for the project and report a clear pass/fail summary. You do NOT fix failures automatically.

## Step 1: Determine Verification Scope

Parse `$ARGUMENTS` to determine the scope:

- **No arguments** (`effect:dev:verify`): Standard verification -- build + types + lint + tests.
- **`quick`** (`effect:dev:verify quick`): Minimal verification -- build + types only.
- **`full`** (`effect:dev:verify full`): Complete verification -- all gates including E2E, debug checks, and file size analysis.

## Step 2: Read Project Configuration

Read `CLAUDE.md` to identify the project's specific commands for each quality gate:

- Build command (e.g., compile, transpile, bundle).
- Type-check command (if separate from build).
- Lint command.
- Test command (unit + integration).
- E2E test command (for `full` scope only).

If CLAUDE.md does not specify a command for a gate, attempt to detect it from project configuration files (package.json, pyproject.toml, Makefile, Cargo.toml, etc.). If a gate cannot be detected, mark it as SKIPPED with a note.

## Step 3: Run Quality Gates

Run each gate sequentially. Collect the output and determine pass/fail for each.

### Standard Gates (always run)

1. **Build**: Run the project's build command. PASS = zero errors, zero exit code.
2. **Type Check**: Run the project's type-check command (if separate from build). PASS = zero type errors.
3. **Lint**: Run the project's lint command. PASS = zero errors (warnings are acceptable unless the project treats them as errors).
4. **Tests**: Run the project's test suite (unit + integration). PASS = all tests pass, zero exit code.

### Full Gates (only with `full` or `e2e` argument)

5. **E2E Tests**: Run the project's E2E test command. PASS = all tests pass.
6. **Debug Statements**: Search production source code for debug statements:
   - JavaScript/TypeScript: `console.log`, `console.debug`, `console.warn` (not in test files), `debugger`
   - Python: `print(`, `breakpoint()`, `pdb.set_trace()`
   - Other languages: adapt to common debug patterns.
   - PASS = zero debug statements found in production code.
7. **File Size**: Check all source files for length. Flag any file exceeding 300 lines. PASS = no oversized files.

## Step 4: Present Results

Present results as a clear table:

```
| Gate            | Status  | Details                          |
| --------------- | ------- | -------------------------------- |
| Build           | PASS    | Completed in 12s                 |
| Type Check      | PASS    | 0 errors                         |
| Lint            | FAIL    | 3 errors in src/lib/auth.ts      |
| Tests           | PASS    | 47/47 passed                     |
| E2E Tests       | SKIPPED | Not requested (use effect:dev:verify full) |
| Debug Statements| PASS    | 0 found                          |
| File Size       | WARNING | 2 files exceed 300 lines         |
```

## Step 5: Summary

- **All gates PASS**: Report success. The project is in a clean state.
- **Any gate FAIL**: Report which gates failed with the specific error details (file, line, error message). List the failures in priority order (build errors first, then types, then lint, then tests).
- **Do NOT attempt to fix failures automatically.** Present the findings and ask the user what to do. Suggest `effect:dev:fix` for build/type errors, or specific actions for other failures.

## Next Steps

After verification:

- → `effect:dev:review` — If all gates pass, run a security and quality audit before shipping
- → `effect:dev:fix` — If any gates failed, fix the errors incrementally

ℹ️ Alternative: If this is a final check before merge, proceed directly to committing and creating a PR.

## Communication

Follow the language settings defined in CLAUDE.md for user-facing communication.
All technical output (error messages, file paths, gate names) in English.
