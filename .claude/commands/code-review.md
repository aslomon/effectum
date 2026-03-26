---
name: "Code Review"
description: "Security and code quality review of all changes with severity levels and suggested fixes."
allowed-tools: ["Read", "Bash", "Grep", "Glob"]
---

# /code-review -- Security and Quality Review

You perform a thorough security and code quality review of all changes. You report findings with severity levels and suggested fixes.

## Step 1: Identify Changes to Review

Determine the scope of the review:

1. Run `git diff` to see all uncommitted changes (staged + unstaged).
2. If on a feature branch: also run `git diff main...HEAD` (or the project's base branch) to see all branch changes.
3. If `$ARGUMENTS` specifies files or directories: focus the review on those.
4. List all changed files with their change type (added, modified, deleted).

## Step 2: Read All Changed Files

Read every changed file **completely** -- not just the diff hunks. Understanding the full file context is necessary for accurate review. Also read closely related files (imports, callers, types) when needed for context.

## Step 3: Security Review (OWASP Top 10)

Review all changes against these security criteria:

1. **Injection (SQL, NoSQL, Command)**
   - Are all database queries parameterized?
   - Are user inputs sanitized before use in commands or queries?
   - Are ORMs or query builders used correctly?

2. **Broken Authentication**
   - Are authentication checks present on all protected routes?
   - Are session tokens handled securely?
   - Are passwords hashed with a strong algorithm?

3. **Sensitive Data Exposure**
   - Are secrets, API keys, or credentials hardcoded in source code?
   - Is sensitive data logged or exposed in error messages?
   - Are environment variables used for configuration?

4. **Broken Access Control**
   - Are authorization checks present (role-based, ownership-based)?
   - Are database-level access controls in place (RLS policies, row ownership)?
   - Can users access resources that belong to other users or organizations?

5. **Cross-Site Scripting (XSS)**
   - Is user-generated content properly escaped/encoded before rendering?
   - Are `dangerouslySetInnerHTML` or equivalent patterns justified and sanitized?

6. **CSRF Protection**
   - Are state-changing operations protected against CSRF?
   - Are anti-CSRF tokens used where applicable?

7. **Security Misconfiguration**
   - Are CORS policies restrictive?
   - Are security headers set (CSP, X-Frame-Options, etc.)?
   - Are default credentials or debug modes disabled?

## Step 4: Code Quality Review

Review against these quality criteria:

1. **Function Length**: Flag functions exceeding 40 lines. Suggest extraction points.
2. **File Length**: Flag files exceeding 300 lines. Suggest splitting strategies.
3. **Naming**: Check for descriptive names. Flag abbreviations, single-letter variables (outside loops), or Hungarian notation.
4. **Error Handling**: Verify errors are handled explicitly (Result pattern, try-catch with meaningful handling). Flag swallowed errors (empty catch blocks, ignored return values).
5. **Debug Statements**: Flag `console.log`, `console.debug`, `print()`, `debugger`, `breakpoint()` in production code (not test files).
6. **Dead Code**: Flag unused imports, unreachable code, commented-out code blocks.
7. **Duplication**: Flag duplicated logic that should be extracted into shared utilities.

## Step 5: Type Safety Review

Review type usage:

1. **No `any` types**: Flag every use of `any` (or equivalent in the project's language). Suggest specific types, generics, or union types.
2. **No unsafe type casts**: Flag `as` casts (TypeScript), forced unwraps (Swift), or equivalent. Suggest type guards, validation schemas, or runtime checks.
3. **Null/undefined handling**: Verify proper handling of nullable values. Flag potential null dereferences.
4. **Validation at boundaries**: Verify that external data (API inputs, form data, environment variables) is validated with schemas before use.

## Step 6: Architecture Review

Review against project conventions:

1. Read `CLAUDE.md` for the project's architectural rules and patterns.
2. **Separation of concerns**: Flag business logic in UI components, data access in presentation layers.
3. **Convention compliance**: Verify file organization, naming patterns, import structure follow project conventions.
4. **Dependency direction**: Verify imports flow in the correct direction (components -> services -> utilities, not the reverse).

## Step 7: Present Findings

Present each finding with:

```
### [SEVERITY] Description

- **File**: path/to/file.ts
- **Line**: 42
- **Issue**: Detailed description of the problem.
- **Risk**: What could go wrong if this is not fixed.
- **Fix**: Specific, actionable suggestion for how to fix it.
```

Severity levels:

| Severity     | Meaning                                                             |
| ------------ | ------------------------------------------------------------------- |
| **CRITICAL** | Security vulnerability, data loss risk, or production-breaking bug. |
| **WARNING**  | Code quality issue, potential bug, or convention violation.         |
| **INFO**     | Suggestion for improvement, minor style issue, or optimization.     |

## Step 8: Summary

Provide a summary:

1. Total findings by severity: N CRITICAL, N WARNING, N INFO.
2. Overall assessment: Is this code ready to merge/deploy?
3. Priority actions: List the top 3 most important fixes.
4. If zero CRITICAL findings: "No blocking issues found. Code is ready for deployment pending WARNING fixes."
5. If CRITICAL findings exist: "Blocking issues found. These must be resolved before deployment."

## Next Steps

After code review:

- → Done — If zero CRITICAL findings, the code is ready for commit and PR
- → `/build-fix` — If review uncovered issues that need fixing, resolve them first
- → `/verify` — After fixing review findings, re-run quality gates to confirm

ℹ️ Alternative: For critical security findings, fix immediately and re-run `/code-review` to verify the fixes.

## Communication

Follow the language settings defined in CLAUDE.md for user-facing communication.
All technical findings (file paths, code snippets, issue descriptions) in English.
