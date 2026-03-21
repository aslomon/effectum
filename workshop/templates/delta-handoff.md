# Delta Implementation: {PRD Title} v{OLD_VERSION} → v{NEW_VERSION}

> This is a delta handoff — NOT a full implementation. The feature has already been partially or fully built.
> Your job is to apply only the changes described below while preserving all existing work.

## Protection Rules (DO NOT modify)

These acceptance criteria are DONE. Their implementation and tests MUST remain intact.
Any regression in these areas is a critical failure.

| AC   | Description                | Tests             |
| ---- | -------------------------- | ----------------- |
| AC-1 | [Completed AC description] | [Test file/suite] |
| AC-2 | [Completed AC description] | [Test file/suite] |

**Mandate**: All tests for protected ACs must remain green after your changes. Run the full test suite after every significant modification.

## Stale Tasks (needs rework)

These ACs were modified in v{NEW_VERSION}. The existing implementation needs updating to match the new requirements.

### AC-{N}: {AC Title}

**Was (v{OLD_VERSION}):** [Previous AC text]

**Now (v{NEW_VERSION}):** [Updated AC text]

**What changed:** [Concise description of the delta]

**Action required:** Update implementation and tests to match the new AC. Do NOT rebuild from scratch unless the change is fundamental.

## New Tasks (build fresh)

These ACs are new in v{NEW_VERSION}. Implement from scratch.

- [ ] AC-{N}: [New AC description]
- [ ] AC-{N}: [New AC description]

## Cancelled Tasks (remove if implemented)

These ACs were removed in v{NEW_VERSION}. Delete the corresponding code, tests, and any related artifacts.

| AC     | Description              | Reason for removal   |
| ------ | ------------------------ | -------------------- |
| AC-{N} | [Removed AC description] | [Why it was removed] |

**Hard Remove policy**: Delete the code entirely. Do not feature-flag or comment out.

## Quality Gates

Same gates as the original PRD:

- Build: `pnpm build` — 0 errors
- Types: `tsc --noEmit` — 0 errors
- Tests: `pnpm vitest run` — all pass, 80%+ coverage on new/modified code
- Lint: `pnpm lint` — 0 errors, 0 warnings
- E2E: `npx playwright test` — all pass (if applicable)
- Regression: ALL existing tests must still pass

## Completion Promise

"All modified and new ACs implemented, all cancelled code removed, all existing tests still pass, all Quality Gates green, no regressions introduced"
