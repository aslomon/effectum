# /plan -- Analyze Requirements and Create Implementation Plan

You create a detailed implementation plan for a feature, then STOP and wait for explicit approval before writing any code.

## Step 1: Parse Input

Read `$ARGUMENTS` for the feature description, PRD reference, or prompt.

- If `$ARGUMENTS` references a PRD file path: read the entire PRD file.
- If `$ARGUMENTS` contains inline requirements: use them directly.
- If `$ARGUMENTS` is empty: ask the user what they want to implement and wait for a response.

## Step 2: Explore the Codebase

Systematically explore the project to build context:

1. Read `CLAUDE.md` in the project root for stack, conventions, and project-specific rules.
2. Read `DESIGN.md` if it exists for visual/design conventions.
3. Glob for the project structure: `**/*.{ts,tsx,py,swift,go,rs}` (adapt to the project's language).
4. Grep for patterns relevant to the feature (existing services, components, utilities, types).
5. Read key files: entry points, existing similar features, shared utilities, configuration files.
6. Check for existing tests to understand testing patterns and conventions.

## Step 3: Identify Reusable Assets

Document what already exists that the implementation can leverage:

- Existing components, hooks, or utilities that can be reused or extended.
- Established patterns for data fetching, error handling, state management, and validation.
- Shared types, schemas, or interfaces relevant to the feature.
- Test helpers, fixtures, or factories.

## Step 4: Create the Implementation Plan

Structure the plan in ordered phases with clear dependencies:

### Phase 1: Data Layer (if applicable)

- Database migrations, schema changes, type generation.
- Validation schemas for new data structures.
- Estimated complexity: [Low / Medium / High]

### Phase 2: Backend / Services

- API routes, server-side services, business logic.
- Integration with existing services.
- Estimated complexity: [Low / Medium / High]

### Phase 3: Frontend / UI (if applicable)

- Components, pages, layouts.
- Client-side state and interactions.
- Estimated complexity: [Low / Medium / High]

### Phase 4: Testing

- Unit tests for services and utilities.
- Integration tests for API routes.
- Component tests for UI.
- Estimated complexity: [Low / Medium / High]

### Phase 5: E2E Tests (if applicable)

- Critical user journeys.
- Edge cases and error scenarios.
- Estimated complexity: [Low / Medium / High]

### Phase 6: Verification

- Build, type check, lint, full test suite.
- Code review checklist items.

For each phase, specify:

- What will be created or modified (files, functions, components).
- Dependencies on other phases.
- Acceptance criteria that will be verified.

## Step 5: Surface Risks and Open Questions

List explicitly:

- **Risks**: Potential complications, performance concerns, breaking changes.
- **Open Questions**: Ambiguities in the requirements that need clarification.
- **Assumptions**: Decisions you would make autonomously (and why).
- **Dependencies**: External services, libraries, or features this depends on.

## Step 6: Present the Plan

Present the complete plan to the user in a clear, structured format. Include:

1. Summary (1-2 sentences: what this implements and why).
2. Phased plan with estimated complexity per phase.
3. Reusable assets identified.
4. Risks, open questions, and assumptions.
5. Total estimated complexity.

## Step 7: STOP and Wait

**STOP HERE.** Do NOT write any code, create any files, or make any changes.

Wait for explicit approval from the user:

- **"OK"** or **"Go"** or **"Start"** -> Proceed with implementation (typically via `/tdd`).
- **"Change X"** -> Revise the plan based on feedback, present again, wait again.
- **"Start over"** -> Discard the plan and restart from Step 1.

## Communication

Follow the language settings defined in CLAUDE.md for user-facing communication.
All technical content (code, file paths, plan details) in English.
