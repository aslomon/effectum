---
name: "effectum:onboard:review"
description: "Review onboarded PRDs for cross-PRD consistency, duplicates, and best practices."
allowed-tools: ["Read", "Write"]
effort: "medium"
---

> ⚠️ **`/onboard:review` is deprecated → use `/effectum:onboard:review`** (removed in v0.20)


# effectum:onboard:review — Onboarding Consistency Review

You review onboarded PRDs for cross-PRD consistency, duplicates, simplification opportunities, and best practices. This command runs automatically as part of `effectum:onboard` (Step 6) but can also be invoked standalone on any project that has been onboarded.

## Step 1: Parse Arguments

Parse `$ARGUMENTS` for:

- **`project-slug`**: Required. The project slug to review. If empty, list available projects under `workshop/projects/` and ask.
- **`--fix`**: Optional. When present, automatically apply suggested fixes instead of just reporting them. Default behavior during `effectum:onboard` is `--fix`.
- **`--strict`**: Optional. Treat WARN results as FAIL (useful for high-quality onboarding).

If no arguments and this is called from within `effectum:onboard`, use the current project slug automatically.

## Step 2: Load All PRDs

1. Read `workshop/projects/{slug}/PROJECT.md` to verify the project exists and is onboarded.
2. Read ALL PRD files under `workshop/projects/{slug}/prds/*.md`.
3. Parse YAML frontmatter from each PRD to extract: `id`, `title`, `status`, `onboarded`, `features[]`, `connections[]`, `depends_on[]`.
4. Read `workshop/projects/{slug}/tasks.md` if it exists.
5. Read `workshop/projects/{slug}/network-map.mmd` if it exists.
6. Read `workshop/projects/{slug}/notes/analysis-report.md` if it exists (for context on the original analysis).

## Step 3: Run Review Checks

Run all 6 checks. Collect results for each.

### Check 1: Cross-PRD Consistency

**Goal**: Same entities use the same names and shapes across all PRDs.

- Extract all entity names from Data Model sections across all PRDs (table names, column names, type definitions).
- Extract all endpoint paths from API Design sections across all PRDs.
- Check for inconsistencies:
  - Same table referenced with different names (e.g., `users` in PRD-001 vs `user` in PRD-003).
  - Same column with different types across PRDs (e.g., `status: text` in PRD-001 vs `status: enum` in PRD-002).
  - Same endpoint with different paths (e.g., `/api/users` vs `/api/user`).
  - Same concept with different naming patterns (e.g., `created_at` vs `createdAt` vs `create_date`).
- **Result**: PASS if no inconsistencies. WARN if minor naming variations. FAIL if type mismatches or conflicting definitions.
- **Fix**: Standardize to the most common pattern found in the codebase. Update all PRDs to use consistent names.

### Check 2: Duplicate Features

**Goal**: Each feature is described in exactly one PRD.

- Build a feature inventory: for each feature ID across all PRDs, track which PRDs reference it.
- Check for:
  - A feature ID appearing in multiple PRDs' `features[]` lists.
  - Overlapping acceptance criteria (same behavior described in two different PRDs).
  - Same database table appearing in multiple PRDs' Data Model sections as a primary (owned) table (not as a referenced foreign table).
  - Same API endpoint appearing in multiple PRDs' API Design sections.
- **Result**: PASS if no duplicates. WARN if shared references exist but are clearly cross-references (FK references, not ownership). FAIL if true duplicates found.
- **Fix**: Move the duplicated feature to the most appropriate PRD (the one with the most related features). Update the other PRD to reference it via `connections[]` instead.

### Check 3: Simplification Opportunities

**Goal**: PRDs should be meaningful units, not too small and not too large.

- Count features per PRD.
- Check for:
  - **Too small**: PRD has fewer than 3 features and fewer than 3 acceptance criteria. Could be merged with a related PRD.
  - **Too large**: PRD has more than 10 features or more than 15 acceptance criteria. Could be split into focused PRDs.
  - **Orphan PRD**: PRD has no `connections[]` and no `depends_on[]` — completely isolated from the rest of the project.
  - **Merge candidates**: Two PRDs that share more than 50% of their dependencies and cover closely related domain concepts (e.g., "User Profile" and "User Settings").
- **Result**: PASS if all PRDs are well-sized. WARN if merge/split candidates found. FAIL if a PRD has only 1 feature.
- **Fix for too small**: Merge the small PRD into its most connected neighbor. Renumber remaining PRDs. Update all cross-references.
- **Fix for too large**: Suggest split boundaries but do NOT auto-split (this requires user input). Flag for user review.

### Check 4: Scope Clarity

**Goal**: Every PRD has clear, non-overlapping scope boundaries.

- Read the "In Scope" and "Out of Scope" sections of each PRD.
- Check for:
  - **Missing scope**: PRD has no In Scope or Out of Scope section.
  - **Vague scope**: Scope items use vague language ("user-friendly", "fast", "intuitive") without measurable criteria.
  - **Overlapping scope**: Item listed as "In Scope" in PRD-A is also "In Scope" in PRD-B.
  - **Contradicting scope**: Item listed as "In Scope" in PRD-A is listed as "Out of Scope" in PRD-B but PRD-A depends on PRD-B.
- **Result**: PASS if all scopes are clear and non-overlapping. WARN if vague language found. FAIL if overlapping or contradicting scopes.
- **Fix**: Add missing scope sections. Make vague items concrete. Resolve overlaps by assigning each item to exactly one PRD.

### Check 5: Naming Convention Consistency

**Goal**: All identifiers follow consistent patterns across the project.

- Check feature IDs: Should be uppercase, no spaces, underscores for separation (e.g., `AUTH`, `USER_MGMT`, `BILLING`).
- Check table names: Should follow the same pattern (snake_case, singular vs plural — match what the codebase actually uses).
- Check endpoint paths: Should follow RESTful conventions consistently (e.g., always `/api/{resource}` not mixed with `/api/{action}`).
- Check PRD numbering: Should be sequential with no gaps (001, 002, 003).
- Check task IDs: Should be sequential (T-001, T-002, ...).
- **Result**: PASS if all naming is consistent. WARN if minor variations. FAIL if naming is chaotic.
- **Fix**: Standardize all identifiers. Update PRDs, task registry, and network map.

### Check 6: Full Coverage

**Goal**: Every significant code area is covered by at least one PRD.

- Compare the directory structure from the analysis report against PRD coverage.
- Check for:
  - Source directories that no PRD covers (e.g., `src/lib/notifications/` exists but no PRD mentions notifications).
  - Database tables not referenced in any PRD.
  - API route files not covered by any PRD.
  - Test files that test functionality not described in any PRD.
- **Result**: PASS if all code areas are covered. WARN if only utility/helper code is uncovered. FAIL if feature code is uncovered.
- **Fix**: Create a new PRD for uncovered feature areas. If it's utility code, note it in the analysis report as "shared infrastructure, not a feature."

## Step 4: Generate Review Report

Compile all check results into a structured report:

```
## Onboarding Review — {project-slug}

### Results

| # | Check                   | Status | Details                                          |
|---|-------------------------|--------|--------------------------------------------------|
| 1 | Cross-PRD Consistency   | PASS   | All entities consistent                          |
| 2 | Duplicate Features      | WARN   | 1 shared table (users) — cross-reference, not dup |
| 3 | Simplification          | PASS   | All PRDs well-sized (3-8 features)               |
| 4 | Scope Clarity           | PASS   | All scopes defined and non-overlapping           |
| 5 | Naming Conventions      | WARN   | Mixed snake_case/camelCase in 2 feature IDs      |
| 6 | Full Coverage           | PASS   | All code areas covered                           |

### Overall: {PASS | WARN | FAIL}

### Fixes Applied (if --fix)

1. Standardized feature IDs USER_MGMT and userMgmt → USER_MGMT
2. ...

### Remaining Issues (manual review needed)

1. PRD-005 has 12 features — consider splitting (too large to auto-fix)
2. ...
```

## Step 5: Apply Fixes (if `--fix` or called from `effectum:onboard`)

For each check that returned WARN or FAIL with an auto-fixable issue:

1. Apply the fix described in the check.
2. Write the updated PRD files.
3. Update the task registry if task references changed.
4. Update the network map if feature IDs or connections changed.
5. Re-run the affected check to verify the fix worked.

**Do NOT apply fixes that require user judgment** (e.g., splitting large PRDs, resolving ambiguous feature ownership). Flag these for user review instead.

## Step 6: Save Report

Save the review report to `workshop/projects/{slug}/notes/review-report.md`.

If called from `effectum:onboard`:

- Return the overall status (PASS/WARN/FAIL) to the calling command.
- PASS or WARN → proceed to user presentation.
- FAIL → apply fixes and re-run (up to 3 iterations).

If called standalone:

- Display the report to the user.
- If `--fix` was used, show what was changed.
- If issues remain, suggest next steps.

## Next Steps

After onboarding review:

- → `effect:prd:new` — Create new PRDs for features not yet covered
- → `effect:prd:handoff` — Hand off a reviewed PRD for implementation

ℹ️ Alternative: If the review found issues, fix them and re-run `effectum:onboard:review` to verify.

## Communication

Follow the language settings defined in CLAUDE.md.
All file content (reports, PRD updates) must be written in English.
User-facing communication uses the language configured in CLAUDE.md.
