# Autonomous Feature Implementation Guide

> Standard workflow for fully autonomous feature implementation with Claude Code -- from PRD to production.

## Overview

This document defines how to hand off a feature to Claude Code for fully autonomous implementation. It covers the PRD format, prompt templates, command chains, quality gates, and lessons learned from real sessions. The goal: you provide a PRD + prompt, Claude Code delivers production-ready code including tests, migrations, and security.

<important>
All PRDs, prompts, code, comments, commits, and documentation must be written in English. This ensures consistency across the codebase, better LLM comprehension, and avoids encoding or locale-related issues in tooling and CI/CD pipelines.
</important>

---

## 1. PRD Template

Every PRD must contain these sections. The more complete the PRD, the fewer interaction points and the more autonomous the implementation.

```markdown
# PRD: [Feature Name]

## Problem

What is the problem? Why does it need to be solved? Include business context.

## Goal

What should work when this is done? (1-3 sentences, measurable)

## User Stories

- As a [role], I want to [action], so that [benefit]
- As a [role], I want to [action], so that [benefit]

## Acceptance Criteria

- [ ] AC1: [Concrete, testable criterion]
- [ ] AC2: [Concrete, testable criterion]
- [ ] AC3: [Concrete, testable criterion]

## Scope

### In Scope

- Feature X, Screen Y, API Endpoint Z

### Out of Scope

- What should NOT be built (explicit boundaries)

## Data Model (optional but recommended)

- Tables, fields, relations, RLS requirements
- Include SQL migration sketches if possible

## UI/UX (optional)

- Wireframes, screenshots, Figma links, or text description
- Responsive requirements, breakpoints

## API Design (optional)

- Endpoints, HTTP methods, request/response shapes
- Authentication and authorization requirements

## Constraints

- Performance requirements (latency, throughput)
- Dependencies on existing features or services
- Technical or timeline constraints
```

### Why Each Section Matters

| Section              | If missing, Claude Code will...                        |
| -------------------- | ------------------------------------------------------ |
| Problem              | ...assume incorrect context and build the wrong thing  |
| Acceptance Criteria  | ...not know when "done" means done                     |
| Scope / Out of Scope | ...build too much or too little                        |
| Data Model           | ...ask for clarification or design its own schema      |
| Constraints          | ...use default assumptions that may not fit your needs |

### PRD Best Practices

- Write acceptance criteria as **testable assertions** -- each one should map to at least one automated test
- Define the data model upfront to eliminate architectural decision points and reduce interaction stops to zero
- List out-of-scope items explicitly -- this prevents scope creep more effectively than vague boundaries
- Include example request/response shapes for APIs -- this removes ambiguity about data contracts

### Agent-Ready PRD Extension (for effect:dev:run / Full Autonomy)

When using `effect:dev:run` (formerly /ralph-loop) or full-auto mode, add these three sections to your PRD. They bridge the gap between "what to build" and "how to verify it autonomously."

```markdown
### Quality Gates

Automated checks that MUST pass before the feature is considered done:

- Build: `pnpm build` -- 0 errors
- Types: `tsc --noEmit` -- 0 errors
- Tests: `pnpm vitest run` -- all pass, 80%+ coverage
- Lint: `pnpm lint` -- 0 errors
- E2E: `npx playwright test` -- all pass (if applicable)
- Custom: [project-specific checks]

### Autonomy Rules

Where Claude can make its own decisions vs. where it should follow strict guidelines:

- Design decisions: [yes/no + guidelines, e.g. "Follow DESIGN.md"]
- Library choices: [predefined or free]
- Architecture: [predefined or "follow existing patterns"]
- On ambiguity: [decide autonomously / stop and document]

### Completion Promise

Exact phrase for `effect:dev:run` (must be 100% true before outputting):

"All acceptance criteria met, build passes, tests pass, 0 lint errors"
```

**Why these fields matter for autonomy:**

| Field              | Without it, Claude will...                                                      |
| ------------------ | ------------------------------------------------------------------------------- |
| Quality Gates      | ...use default checks that may miss project-specific requirements               |
| Autonomy Rules     | ...stop and ask about decisions it could safely make on its own                 |
| Completion Promise | ...not know when to stop iterating (`effect:dev:run` runs until max-iterations) |

---

## 1.5 PRD -> effect:dev:run Conversion

### Quick Conversion

1. Write your PRD using the Agent-Ready template (Section 1 + extension)
2. Copy it into this `effect:dev:run` prompt template:

```
effect:dev:run Implement the following feature fully autonomously from database to frontend.

<workflow>
Each iteration:
1. Read the PRD and current project state
2. Check what was already done (git diff, existing files)
3. Implement the next logical step
4. Run quality gates after every significant change
5. When ALL acceptance criteria AND quality gates pass: output the completion promise
</workflow>

<quality_gates>
[INSERT Quality Gates from your PRD]
</quality_gates>

<autonomy_rules>
[INSERT Autonomy Rules from your PRD]
</autonomy_rules>

<prd>
[INSERT your complete PRD]
</prd>

--max-iterations [N] --completion-promise '[Completion Promise from your PRD]'
```

### Max-Iterations Selection

| Feature Type     | Max | Rationale                       |
| ---------------- | --- | ------------------------------- |
| Bugfix           | 10  | Find + Fix + Test               |
| Small feature    | 20  | CRUD, single endpoint           |
| Standard feature | 30  | DB + API + Frontend + Tests     |
| Large feature    | 50  | Multi-domain, E2E, complex UI   |
| Refactoring      | 15  | Scoped changes, little new code |

### Iteration Planning (recommended for features > 20 iterations)

Add an `<iteration_plan>` to give Claude a roadmap for sequencing work:

```xml
<iteration_plan>
Iterations 1-3: Setup -- DB migration, types, Zod schemas
Iterations 4-10: Backend -- API routes with TDD
Iterations 11-18: Frontend -- Components with TDD
Iterations 19-25: E2E Tests + Edge Cases
Iterations 26-30: Polish -- Code review, cleanup, final verification
</iteration_plan>
```

Adjust the ranges based on your max-iterations and feature complexity.

---

## 2. Prompt Templates

All prompts follow Anthropic's prompt engineering best practices: clear structure, explicit instructions, context for the "why", and positive directives (say what to do, not what to avoid).

### Standard Prompt (Recommended)

```
Implement the following feature autonomously from database to frontend.

<workflow>
1. effect:dev:plan -- Create an implementation plan and wait for my approval
2. After approval: Implement using effect:dev:tdd (tests first, then code)
3. effect:dev:verify after each phase
4. effect:dev:e2e for critical user journeys
5. effect:dev:review at the end
6. Do NOT commit -- show me the final git diff
</workflow>

<prd>
[Insert PRD here]
</prd>

<context>
- Project: [project name/path]
- Supabase Project ID: [ID] (if applicable)
- Follow existing patterns in: [relevant files/directories]
</context>
```

### Express Prompt (Small Features)

```
Implement: [1-2 sentence feature description]

<acceptance_criteria>
- [ ] [AC1]
- [ ] [AC2]
</acceptance_criteria>

Workflow: effect:dev:tdd -> effect:dev:verify -> effect:dev:review. Do not commit.
```

### Full-Auto Prompt (Maximum Autonomy)

```
Implement the following feature fully autonomously.
Make your own decisions on architecture and UI details.
Only ask when encountering breaking changes or genuinely ambiguous scope.

Workflow: effect:dev:plan -> effect:dev:tdd -> effect:dev:e2e -> effect:dev:verify -> effect:dev:review
Commit when all quality gates pass.

<prd>
[Insert PRD here]
</prd>
```

### Prompt Writing Guidelines

These guidelines are derived from Anthropic's official prompt engineering documentation:

1. **Be specific and direct** -- Treat Claude like a brilliant new team member who lacks context about your specific project norms and conventions
2. **Provide context for the "why"** -- Explain the reasoning behind constraints so Claude can generalize correctly to edge cases
3. **Use XML tags for structure** -- Wrap distinct sections (`<prd>`, `<workflow>`, `<context>`, `<acceptance_criteria>`) so Claude can parse complex prompts unambiguously
4. **Say what to do, not what to avoid** -- "Write concise functions under 40 lines" is more effective than "Don't write long functions"
5. **Reference existing patterns** -- "Follow the pattern in `src/lib/billing/` for the service layer" gives Claude a concrete example to generalize from
6. **Specify the autonomy level explicitly** -- Claude calibrates its interaction behavior based on your stated preference

### Workflow Mode Decision Matrix

Use this table to decide which workflow mode fits your situation:

| Criterion                 | Normal Session | Full-Auto Prompt | effect:dev:run    |
| ------------------------- | -------------- | ---------------- | ----------------- |
| Subjective UI decisions   | Yes            | No               | No                |
| Clear acceptance criteria | Optional       | Recommended      | **Required**      |
| PRD available             | Optional       | Recommended      | **Required**      |
| Quality gates defined     | Optional       | Recommended      | **Required**      |
| Autonomy rules defined    | N/A            | Optional         | **Recommended**   |
| You are present           | Yes            | Yes              | No (unattended)   |
| Iteration needed          | Manual         | Manual           | **Automatic**     |
| Completion promise        | N/A            | N/A              | **Required**      |
| Typical duration          | 30min-2h       | 1-3h             | 1-8h (unattended) |

**Quick recommendation:**

- **No PRD?** -> Normal Session
- **PRD without quality gates?** -> Full-Auto Prompt
- **PRD with quality gates + completion promise?** -> `effect:dev:run`
- **PRD + Agent Teams flag?** -> `effect:dev:orchestrate` (with Teams)

---

## 3. Autonomous Workflow Phases

### Phase 1: Analysis & Planning (`effect:dev:plan`)

```
Read PRD -> Explore codebase -> Identify risks -> Write plan -> STOP and wait for approval
```

- Reads the PRD and builds understanding of the problem context
- Explores the existing codebase (Glob, Grep, Read) to identify reusable patterns, utilities, and components
- Creates a step-by-step implementation plan with phases and dependencies
- Surfaces risks, open questions, and architectural decisions
- **STOPS and waits for explicit approval before writing any code**

### Phase 2: Database & Types

```
Write migration -> RLS policies -> Generate types -> Derive Zod schemas
```

- Supabase migrations via `apply_migration` (never raw DDL)
- RLS policies for every new table (multi-tenant with org_id)
- Security advisor check after DDL changes
- TypeScript types generated via `generate_typescript_types`
- Zod schemas derived for API validation

### Phase 3: Backend / API (`effect:dev:tdd`)

```
Write tests (RED) -> Implement API (GREEN) -> Refactor
```

- Route handlers in `src/app/api/`
- Server-side services in `src/lib/[domain]/`
- Zod validation for all inputs
- Result pattern `{ data, error }` for all operations that can fail
- Tests with Vitest + Testing Library

### Phase 4: Frontend (`effect:dev:tdd`)

```
Write component tests (RED) -> Implement components (GREEN) -> Refactor
```

- Server Components by default
- Client Components only when interactivity, hooks, or browser APIs are needed
- Shadcn UI + Tailwind CSS v4
- Feature components in `src/components/[feature]/`
- Hooks in `src/hooks/`

### Phase 5: E2E Tests (`effect:dev:e2e`)

```
Write Playwright tests -> Browser automation -> Verify user journeys
```

- Critical user journeys as E2E tests
- Accessibility-tree-based selectors (fast, reliable)
- Tests in `tests/e2e/`

<important>
Write a trivial smoke test immediately after scaffolding (Phase 2) to validate that the test environment works correctly -- routing is accessible, middleware fires, API responds. Do not wait until Phase 5 to discover infrastructure misconfigurations.
</important>

### Phase 6: Verification (`effect:dev:verify` + `effect:dev:review`)

```
Build -> Types -> Lint -> Tests -> Security -> Review
```

- TypeScript compilation (strict mode)
- ESLint/Biome check
- All tests (unit + integration + e2e)
- No console.log in production code
- Security review (OWASP Top 10, RLS check)
- Code quality review

---

## 4. Command Chains by Feature Type

### New Feature (Standard)

```
effect:dev:plan -> [approval] -> effect:dev:tdd -> effect:dev:verify -> effect:dev:e2e -> effect:dev:verify -> effect:dev:review
```

### Small Feature / Bugfix

```
effect:dev:tdd -> effect:dev:verify -> effect:dev:review
```

### Large Feature (Multi-Domain)

```
effect:dev:plan -> [approval] -> effect:dev:tdd (DB+API) -> effect:dev:verify -> effect:dev:tdd (Frontend) -> effect:dev:verify -> effect:dev:e2e -> effect:dev:review
```

### Refactoring

```
effect:dev:plan -> [approval] -> effect:dev:refactor -> effect:dev:verify -> effect:dev:review
```

### Performance Optimization

```
effect:dev:plan -> [approval] -> [profiling] -> effect:dev:tdd -> effect:dev:verify -> effect:dev:e2e
```

---

## 5. Interaction Points

These are the moments where Claude Code pauses and waits for your input.

| Point                   | Why                          | What you do                         |
| ----------------------- | ---------------------------- | ----------------------------------- |
| After `effect:dev:plan` | Plan approval required       | "OK", "Change X", or "Start over"   |
| Ambiguous scope         | PRD has gaps                 | Answer the question                 |
| Breaking change         | Existing API/DB modification | Confirm or choose alternative       |
| Architecture decision   | Multiple valid approaches    | Pick one                            |
| Test failure            | Unexpected error             | Provide context or allow workaround |

### How to Minimize Interaction Stops

- Write complete acceptance criteria with testable assertions
- Define explicit scope and out-of-scope boundaries
- Pre-define the data model (tables, fields, relations)
- State autonomy preference: "Make your own decisions, only ask about breaking changes"
- Include the Supabase Project ID so Claude can execute migrations and generate types directly

---

## 6. Quality Gates

Before Claude Code reports "done", it verifies all of these automatically:

| Gate          | Tool                | Criterion                             |
| ------------- | ------------------- | ------------------------------------- |
| Compilation   | `tsc --noEmit`      | 0 errors                              |
| Linting       | ESLint/Biome        | 0 errors, 0 warnings                  |
| Unit Tests    | Vitest              | 80%+ coverage, all passing            |
| E2E Tests     | Playwright          | All journeys passing                  |
| Security      | `effect:dev:review` | No OWASP vulnerabilities              |
| RLS Check     | Supabase Advisor    | All tables have RLS policies          |
| No Debug Logs | `effect:dev:verify` | 0 console.log hits in production code |
| Type Safety   | Zod + TS Strict     | No `any`, no `as` casts               |
| File Size     | Check               | No file exceeds 300 lines             |

---

## 7. Example PRDs

### Example A: Simple Feature

```markdown
# PRD: User Profile Avatar Upload

## Problem

Users cannot upload a profile picture. Their profiles show a generic placeholder,
making it harder for team members to identify each other.

## Goal

Users can upload a profile picture that is displayed across the application.

## User Stories

- As a user, I want to upload a profile picture so that others can recognize me

## Acceptance Criteria

- [ ] Upload accepts JPG/PNG/WebP files up to 5MB
- [ ] Image is stored in Supabase Storage
- [ ] Avatar URL is persisted in the user profile
- [ ] Preview is shown before upload confirmation
- [ ] Fallback avatar is displayed when no image is uploaded

## Scope

### In Scope

- Upload component, storage integration, profile display

### Out of Scope

- Image cropping, filters, social media import
```

**Prompt:**

```
Implement the avatar upload feature.
Workflow: effect:dev:plan -> effect:dev:tdd -> effect:dev:e2e -> effect:dev:verify -> effect:dev:review. Do not commit.

<prd>
[Insert PRD above]
</prd>
```

### Example B: Complex Feature

```markdown
# PRD: Team Invitation System

## Problem

New team members can only be added manually via direct database insertion.
This is error-prone, unauditable, and requires developer involvement.

## Goal

Admins can send email invitations. Invited users receive a magic link
and are automatically assigned to the team upon acceptance.

## User Stories

- As an admin, I want to invite team members via email
- As an invitee, I want to join via a link without manual registration
- As an admin, I want to see and revoke pending invitations

## Acceptance Criteria

- [ ] Admin can enter email addresses and assign a role
- [ ] Invitation generates a single-use token (valid for 24 hours)
- [ ] Email is sent via Supabase Edge Function
- [ ] Magic link leads to onboarding for new users
- [ ] Magic link assigns existing users directly to the team
- [ ] Admin sees a list of pending invitations with status
- [ ] Admin can revoke invitations
- [ ] Maximum 50 pending invitations per team
- [ ] Rate limit: 10 invitations per hour per admin

## Data Model

- `invitations` table: id, org_id, email, role, token, status,
  invited_by, expires_at, accepted_at, created_at
- RLS: Only admins of the same org can CRUD
- Index on token (unique) and org_id + status

## API Design

- POST /api/invitations -- Create invitation
- GET /api/invitations -- List for current org
- DELETE /api/invitations/:id -- Revoke invitation
- POST /api/invitations/accept -- Redeem token

## Constraints

- Use Supabase Auth for magic links
- Edge Function for email sending
- No external email providers (use Supabase built-in)
```

**Prompt:**

```
Implement the team invitation system fully autonomously.
Make your own decisions on UI details.
Only ask about architectural ambiguities.

Workflow: effect:dev:plan -> effect:dev:tdd -> effect:dev:e2e -> effect:dev:verify -> effect:dev:review
Commit when all quality gates pass.

<prd>
[Insert PRD above]
</prd>
```

### Example C: Bugfix

```markdown
# PRD: Fix -- Dashboard Does Not Load for New Users

## Problem

New users without projects see a spinner that never resolves.

## Reproduction Steps

1. Create a new account
2. Navigate to the dashboard route
3. Spinner spins indefinitely

## Expected Behavior

Empty state with a "Create your first project" CTA button.

## Acceptance Criteria

- [ ] New users without projects see an empty state
- [ ] Empty state has a "Create project" button
- [ ] Existing users with projects are unaffected
- [ ] Edge case: Users whose projects have all been deleted
```

**Prompt:**

```
Find and fix the dashboard bug for new users.
Workflow: effect:dev:tdd -> effect:dev:verify. Do not commit.

<prd>
[Insert PRD above]
</prd>
```

### Example D: Agent-Ready Frontend Feature (with effect:dev:run)

```markdown
# PRD: Dark Mode Toggle

## Problem

Users cannot switch between light and dark themes. The app only supports
light mode, which causes eye strain for users in low-light environments.

## Goal

Users can toggle between light and dark mode. The preference persists across sessions.

## Acceptance Criteria

- [ ] Toggle button in the header switches between light and dark mode
- [ ] Theme preference is saved to localStorage
- [ ] Theme is applied on page load (no flash of wrong theme)
- [ ] All components respect the active theme
- [ ] Respects system preference (prefers-color-scheme) as default

## Scope

### In Scope

- Theme toggle component, CSS variables, localStorage persistence

### Out of Scope

- Custom theme editor, per-component theme overrides, server-side preference storage

## Quality Gates

- Build: `pnpm build` -- 0 errors
- Types: `tsc --noEmit` -- 0 errors
- Tests: `pnpm vitest run` -- all pass, 80%+ coverage
- Lint: `pnpm lint` -- 0 errors

## Autonomy Rules

- Design decisions: Follow DESIGN.md color tokens
- Library choices: Use existing Tailwind dark mode (class strategy)
- Architecture: Follow existing patterns
- On ambiguity: Decide autonomously

## Completion Promise

"All acceptance criteria met, build passes, tests pass, 0 lint errors"
```

**effect:dev:run Prompt:**

```
effect:dev:run Implement dark mode toggle per the PRD below.

<workflow>
Each iteration:
1. Check current state (git diff, test results)
2. Implement the next logical step
3. Run quality gates after every significant change
4. When ALL criteria pass: output <promise>DARK MODE COMPLETE</promise>
</workflow>

<quality_gates>
- pnpm build: 0 errors
- tsc --noEmit: 0 errors
- pnpm vitest run: all pass, 80%+ coverage
- pnpm lint: 0 errors
</quality_gates>

<autonomy_rules>
- Follow DESIGN.md color tokens
- Use Tailwind dark mode (class strategy)
- Follow existing patterns
- Decide autonomously on ambiguity
</autonomy_rules>

<prd>
[Insert PRD above]
</prd>

--max-iterations 20 --completion-promise 'DARK MODE COMPLETE'
```

### Example E: Agent-Ready Full-Stack Feature (with effect:dev:run)

```markdown
# PRD: API Key Management

## Problem

Users cannot generate or manage API keys for programmatic access. All integrations
require manual token exchange, which is insecure and unscalable.

## Goal

Users can create, view, and revoke API keys from their settings page.
Each key has a name, scoped permissions, and expiration date.

## Acceptance Criteria

- [ ] User can generate a new API key with a name and expiration
- [ ] Full key is shown once after creation (never again)
- [ ] Key list shows name, prefix (first 8 chars), created date, and expiration
- [ ] User can revoke any key (immediate invalidation)
- [ ] API validates keys via middleware (Authorization: Bearer sk\_...)
- [ ] Rate limit: 100 requests/minute per key
- [ ] Maximum 10 active keys per user

## Scope

### In Scope

- API key CRUD, key validation middleware, settings page UI

### Out of Scope

- OAuth scopes, team-shared keys, usage analytics dashboard

## Data Model

- `api_keys` table: id, user_id, org_id, name, key_hash, key_prefix,
  permissions, expires_at, revoked_at, last_used_at, created_at
- RLS: Users can only manage their own keys within their org
- Index on key_hash (unique), user_id + org_id

## API Design

- POST /api/keys -- Create key (returns full key once)
- GET /api/keys -- List keys for current user
- DELETE /api/keys/:id -- Revoke key

## Quality Gates

- Build: `pnpm build` -- 0 errors
- Types: `tsc --noEmit` -- 0 errors
- Tests: `pnpm vitest run` -- all pass, 80%+ coverage
- Lint: `pnpm lint` -- 0 errors
- E2E: `npx playwright test` -- all pass
- RLS: Supabase security advisor -- no warnings

## Autonomy Rules

- Design decisions: Follow DESIGN.md
- Library choices: Use existing project dependencies
- Architecture: Follow existing patterns in src/lib/ and src/app/api/
- On ambiguity: Decide autonomously, document decisions in code comments

## Constraints

- Use crypto.randomBytes for key generation (not UUIDs)
- Store only bcrypt hash of key, never plaintext
- Key format: sk*live*[32 random chars]

## Completion Promise

"All acceptance criteria met, migration applied, RLS active, all tests pass, build succeeds, 0 lint errors"
```

**effect:dev:run Prompt:**

```
effect:dev:run Implement API key management per the PRD below.

<iteration_plan>
Iterations 1-5: DB migration, RLS, types, Zod schemas
Iterations 6-15: API routes with TDD (create, list, revoke, middleware)
Iterations 16-22: Settings page UI with TDD
Iterations 23-28: E2E tests + edge cases
Iterations 29-30: Polish, code review, final verification
</iteration_plan>

<quality_gates>
- pnpm build: 0 errors
- tsc --noEmit: 0 errors
- pnpm vitest run: all pass, 80%+ coverage
- pnpm lint: 0 errors
- npx playwright test: all pass
- Supabase security advisor: no warnings
</quality_gates>

<autonomy_rules>
- Follow DESIGN.md for UI
- Use existing project dependencies
- Follow existing patterns in src/lib/ and src/app/api/
- Decide autonomously, document decisions in code comments
</autonomy_rules>

<prd>
[Insert PRD above]
</prd>

--max-iterations 30 --completion-promise 'All acceptance criteria met, migration applied, RLS active, all tests pass, build succeeds, 0 lint errors'
```

---

## 8. Common Mistakes and How to Fix Them

### Vague prompts

```
# Ineffective -- Claude lacks context to make good decisions
"Build an invite system"

# Effective -- Clear scope, explicit workflow, referenced spec
"Implement the invite system per the attached PRD.
 Workflow: effect:dev:plan -> effect:dev:tdd -> effect:dev:verify"
```

### Missing acceptance criteria

```
# Ineffective -- No definition of "done"
"It should work"

# Effective -- Testable, measurable criteria
"AC: Upload JPG/PNG up to 5MB, show preview before upload, display fallback avatar"
```

### No workflow specified

```
# Ineffective -- Claude doesn't know whether to plan or code directly
"Just do it"

# Effective -- Explicit sequence of operations
"Workflow: effect:dev:plan -> effect:dev:tdd -> effect:dev:e2e -> effect:dev:verify"
```

### Unbounded scope

```
# Ineffective -- Could mean anything from CRUD to full RBAC
"User management feature"

# Effective -- Clear boundaries with explicit exclusions
"User invitation system. Out of scope: role management, permissions, user deactivation"
```

### Over-specifying implementation details

```
# Ineffective -- Micromanages file structure, function names, implementation
"Create a file src/lib/invite.ts with a function createInvitation
 that generates a token using crypto.randomUUID..."

# Effective -- States the goal, trusts Claude to follow project conventions
"Implement invitation creation with token generation.
 Follow the existing project structure and patterns."
```

### Unclear commit expectations

```
# Ineffective -- Claude defaults to never committing, or commits unexpectedly
(saying nothing about commits)

# Effective -- Explicit instruction
"Commit when all quality gates pass" OR "Do not commit -- show me the diff"
```

---

## 9. Tips for Maximum Autonomy

### The PRD is the single highest-leverage input

A well-written PRD eliminates most interaction stops. Spending 10 extra minutes on the PRD saves 5+ rounds of back-and-forth.

### Pre-define the data model

When you specify the database schema upfront, Claude makes zero architectural decisions and zero stops.

### State the autonomy level explicitly

- **Standard:** "Ask when unclear" -> 2-3 stops
- **High:** "Make your own decisions, only ask about breaking changes" -> 0-1 stops
- **Full Auto:** "Implement fully autonomously, commit when green" -> 0 stops

### Reference existing patterns in the codebase

```
"Follow the pattern in src/lib/billing/ for the service layer"
"Use the same form validation approach as src/components/auth/login-form.tsx"
```

### Provide infrastructure identifiers

When you include the Supabase Project ID, database connection details, or deployment targets in the prompt, Claude can execute migrations, generate types, and query the database directly -- without asking.

### Batch similar features

```
"Implement these 3 CRUD endpoints in one session:
1. /api/projects (PRD A)
2. /api/teams (PRD B)
3. /api/invitations (PRD C)
Use effect:dev:plan for the overall architecture, then effect:dev:tdd per endpoint."
```

---

## 9.5 Agent Teams -- Parallel Multi-Instance Orchestration

> **Feature-flagged.** Only active when `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1` is set in `~/.claude/settings.json` env. When disabled, everything uses Subagents (Task Tool) as before.

### Three Execution Tiers

| Tier                     | Mechanism                                     | Best For                                       |
| ------------------------ | --------------------------------------------- | ---------------------------------------------- |
| **Single-Agent**         | Main session works alone                      | Simple tasks, bugfixes, single-file changes    |
| **Subagents** (default)  | Task Tool spawns agents within session        | Parallel research, code reviews, focused tasks |
| **Agent Teams** (opt-in) | Independent Claude instances with own context | Complex features with 3+ parallel workstreams  |

### When to Use Agent Teams vs. Subagents

**Use Subagents (default) when:**

- Task is completable by 1-2 agents
- Results need to flow back to a coordinator
- Token budget is a concern
- Feature is small-to-medium scope

**Use Agent Teams when:**

- Feature spans 3+ independent workstreams (e.g., frontend + backend + tests)
- Teammates need to communicate directly (not just report back)
- Parallel implementation would save significant time
- Each Teammate has clear file ownership boundaries

The Recommendation Engine automatically suggests Agent Teams when a PRD has >10 ACs, >2 modules, and >2 parallelizable workstreams.

### The `effect:dev:orchestrate` Command

`effect:dev:orchestrate` is the central command for Agent Teams workflows. It handles the full lifecycle:

```
effect:dev:orchestrate [profile]           -- Create team and start work
effect:dev:orchestrate status              -- Show team progress and token usage
effect:dev:orchestrate nudge [teammate]    -- Prod a stuck teammate
effect:dev:orchestrate shutdown            -- Gracefully terminate all teammates
```

**Flags:**

| Flag           | Default | Description                                                  |
| -------------- | ------- | ------------------------------------------------------------ |
| `--plan-first` | `true`  | Require an approved effect:dev:plan before spawning the team |
| `--max-cost`   | none    | Token budget limit — warns at 80%, stops at 100%             |
| `--dry-run`    | `false` | Show cost estimate without creating the team                 |

**Full workflow:**

```
effect:dev:plan -> [approval] -> /tasks (with Teammate assignments) -> effect:dev:orchestrate [profile] -> [parallel work] -> effect:dev:verify -> effect:dev:review
```

**What `effect:dev:orchestrate` does internally:**

1. **Loads the YAML profile** from `system/teams/{profile}.yaml`
2. **Validates prerequisites** -- checks for approved effect:dev:plan, existing PRD/tasks
3. **Estimates cost** -- shows token budget and asks for confirmation
4. **Creates the team** and spawns teammates with role-specific instructions
5. **Distributes tasks** from the PRD — maps ACs to teammates based on file ownership
6. **Monitors progress** via TeammateIdle and TaskCompleted hooks
7. **Runs quality gates** at phase transitions
8. **Completes** with effect:dev:verify + effect:dev:review when all tasks are done

### Team Profiles (YAML)

Predefined profiles in `system/teams/` as YAML files:

| Profile           | Teammates | Use Case                                       |
| ----------------- | --------- | ---------------------------------------------- |
| `web-feature`     | 3         | Standard feature: frontend + backend + tests   |
| `fullstack`       | 5         | Full-stack with DB, API, UI, tests, review     |
| `frontend-only`   | 3         | UI-only: layout + components + content         |
| `review`          | 2         | Parallel code review + security audit          |
| `overnight-build` | 4         | Large unattended build with continuous testing |

Custom profiles can be added in `.effectum/teams/{name}.yaml`.

Each profile defines:

- **Teammates** -- name, agent specialization, role, file ownership, model hint
- **Phases** -- ordered stages with dependencies and quality gates
- **Cost estimate** -- expected iteration range and token budget
- **Hook config** -- per-profile TeammateIdle and TaskCompleted behavior

### Cost Awareness

Agent Teams cost 3-4x more than Subagents (N separate Claude instances). `effect:dev:orchestrate` always shows a cost estimate before starting:

```
Teammates: 3
Estimated iterations: 15–40
Estimated tokens: 150k–400k
Estimated cost: $1.50–$4.00

Model recommendation: Opus for Lead, Sonnet for Teammates
Proceed? (Y/n)
```

Use `--max-cost` to set a token budget. The system warns at 80% and initiates graceful shutdown at 100%.

### Best Practices

1. **3-5 Teammates** -- more creates coordination overhead that outweighs parallelism
2. **5-6 Tasks per Teammate** -- enough work to justify the context window cost
3. **Clear file ownership** -- never have two Teammates editing the same file
4. **Database first** -- schema changes must complete before other Teammates start
5. **Reviewer last** -- code review Teammate begins after implementation is done
6. **Use task dependencies** -- `blocked by:` prevents premature work
7. **Monitor costs** -- use `effect:dev:orchestrate status` to track token usage
8. **Plan first** -- never skip effect:dev:plan for Agent Teams workflows (default enforced)

### Display Modes

- **In-process**: All Teammates in same terminal. `Shift+Down` to cycle.
- **Split panes**: Each Teammate in own pane (requires tmux or iTerm2).

Configure via `"teammateMode": "in-process"` or `"tmux"` in settings.json.

---

## 10. effect:dev:run — Iterative Autonomy

### What is effect:dev:run?

`effect:dev:run` (formerly `/ralph-loop`) is a **self-referential agentic loop**: you start Claude Code once with a prompt, and it iterates autonomously over its own work -- until the quality criteria are met or the max-iterations limit is reached.

**Comparison with a normal session:**

|             | Normal Session                       | effect:dev:run                            |
| ----------- | ------------------------------------ | ----------------------------------------- |
| Interaction | You provide prompts, Claude responds | One prompt, Claude iterates alone         |
| Stops       | Possible at every phase              | Only at max-iterations or completion      |
| Feedback    | You review each step                 | Claude reviews itself via git/files       |
| Best for    | Exploratory work, design decisions   | Well-defined tasks with testable criteria |

### When to Use effect:dev:run

| Autonomy Level | Mode                              | Rationale                                                       |
| -------------- | --------------------------------- | --------------------------------------------------------------- |
| **Standard**   | Normal session                    | You want control over each step                                 |
| **High**       | Normal session + full-auto prompt | Few stops, but you're present                                   |
| **Full Auto**  | **effect:dev:run**                | Well-defined goal, measurable criteria, no subjective decisions |

**Use `effect:dev:run` when:**

- Acceptance criteria are 100% testable (tests, build, lint)
- No subjective UI/UX decisions are needed
- Task is well-defined (PRD with data model + API design)
- You want to run overnight or unattended

**Use a normal session instead when:**

- Design decisions are needed (subjective UI work)
- Scope is unclear or exploratory
- Production debugging with unknown root cause
- One-shot tasks (single change, no iteration needed)

### How to Start

```bash
effect:dev:run "PROMPT" --max-iterations N --completion-promise "PHRASE"
```

**Parameters:**

- **Prompt** -- The complete work order (PRD + workflow)
- **--max-iterations N** -- Safety limit (always set this)
- **--completion-promise "PHRASE"** -- Claude must output `<promise>PHRASE</promise>` when done

**To stop:**

```bash
effect:dev:stop
```

### Max-Iterations Recommendations

| Feature Type             | Max-Iterations | Rationale                                 |
| ------------------------ | -------------- | ----------------------------------------- |
| Bugfix                   | **10**         | Find cause + fix + test -- few iterations |
| Small feature            | **20**         | CRUD, single endpoint, simple UI          |
| Standard feature         | **30**         | DB + API + frontend + tests               |
| Large feature            | **50**         | Multi-domain, many endpoints, complex UI  |
| Refactoring              | **15**         | Scoped changes, little new code           |
| Performance optimization | **20**         | Profiling + optimization + verification   |

### Completion Promises

The completion promise must align with your quality gates. Claude may only output `<promise>...</promise>` **when the statement is 100% true**.

**Recommended promises by feature type:**

#### Standard Feature

```
--completion-promise "All tests pass, build succeeds, 0 lint errors, no console.log in production code"
```

#### Feature with E2E

```
--completion-promise "All unit tests pass, all e2e tests pass, build succeeds, 0 lint errors, code review complete"
```

#### Bugfix

```
--completion-promise "Bug is fixed, regression test added and passing, build succeeds"
```

#### Refactoring

```
--completion-promise "All tests pass, no dead code, build succeeds, 0 lint errors"
```

#### Full-Stack with Supabase

```
--completion-promise "Migration applied, RLS policies active, all tests pass, build succeeds, 0 lint errors, types generated"
```

### Complete effect:dev:run Prompt Examples

#### Standard Feature

```
effect:dev:run "
Implement the following feature fully autonomously from database to frontend.

<workflow>
Each iteration:
1. Check current state (git diff, test results)
2. Implement the next logical step
3. Run effect:dev:verify after every significant change
4. When all acceptance criteria are met: output <promise>COMPLETE</promise>
</workflow>

<quality_gates>
All of these must pass before outputting the completion promise:
- tsc --noEmit: 0 errors
- vitest: all tests green, 80%+ coverage
- eslint: 0 errors, 0 warnings
- No console.log in src/
- Playwright e2e: all journeys passing
</quality_gates>

<prd>
[Insert PRD here]
</prd>
" --max-iterations 30 --completion-promise "COMPLETE"
```

#### Bugfix

```
effect:dev:run "
Find and fix the following bug. Write a regression test.

<bug>
[Description + reproduction steps]
</bug>

<workflow>
Each iteration:
1. Analyze the bug (logs, code, stack trace)
2. Write a failing test that reproduces the bug
3. Implement the fix
4. Verify: test green, build OK, no regression
5. When fix is confirmed: output <promise>BUG FIXED</promise>
</workflow>
" --max-iterations 10 --completion-promise "BUG FIXED"
```

#### Large Feature (Overnight)

```
effect:dev:run "
Implement the team invitation system fully autonomously.
Make your own decisions on all details.

<iteration_plan>
Iterations 1-5: DB migration, RLS, types, Zod schemas
Iterations 6-15: API endpoints with TDD
Iterations 16-25: Frontend components with TDD
Iterations 26-35: E2E tests, edge cases
Iterations 36-50: Polish, code review, cleanup
</iteration_plan>

<quality_gates>
- All acceptance criteria met
- tsc: 0 errors
- vitest: 80%+ coverage
- playwright e2e: all journeys passing
- eslint: 0 errors
- effect:dev:review: no security issues
- No console.log, no hardcoded strings
</quality_gates>

<prd>
[Insert complete PRD here]
</prd>

When ALL quality gates pass: output <promise>FEATURE COMPLETE</promise>
" --max-iterations 50 --completion-promise "FEATURE COMPLETE"
```

### effect:dev:run Best Practices

1. **Always set --max-iterations** -- Safety net against infinite loops
2. **Make the completion promise specific** -- "COMPLETE" works, but "All tests pass and build succeeds" forces Claude to verify honestly
3. **Include an iteration plan** -- Gives Claude a roadmap for sequencing work
4. **List quality gates explicitly** -- Claude checks exactly these criteria before the promise
5. **Initialize a git repo first** -- Claude tracks its own progress via git diff/log
6. **Build in an escape hatch** -- "After 80% of max-iterations: document blockers and open items"

### Tasks as effect:dev:run Roadmap

When you run `/tasks` before `effect:dev:run`, Claude can use the generated tasks.md as a progress tracker across iterations:

```
effect:dev:run Implement all tasks from tasks.md in this project.

<workflow>
Each iteration:
1. Read tasks.md -- find the next uncompleted task
2. Implement it following TDD (RED -> GREEN -> REFACTOR)
3. Mark the task as complete in tasks.md
4. Run quality gates
5. When ALL tasks are complete and ALL quality gates pass:
   output <promise>ALL TASKS COMPLETE</promise>
</workflow>

<quality_gates>
[Insert Quality Gates]
</quality_gates>

--max-iterations [N] --completion-promise 'ALL TASKS COMPLETE'
```

**Advantage:** Claude sees which tasks are done and which are open across iterations via the tasks.md file -- no context loss between iterations.

### Error Recovery

When an iteration fails, Claude follows this recovery pattern:

1. **Build error** -> Next iteration fixes it automatically. Claude sees the error in terminal output and git diff.

2. **Same error 3 times** -> Try a different approach. If that also fails: document the blocker in `.claude/ralph-blockers.md` and move to the next task.

3. **Missing dependency** -> Install it (`pnpm add <package>`). Check package.json and project conventions before adding anything new.

4. **80% of iterations consumed** -> Write a status report to `.claude/ralph-status.md`:
   - What is done (with test results)
   - What remains
   - Blockers and open questions
   - Suggested next steps

5. **Flaky test** -> Investigate root cause (see Rule 5 in Lessons Learned). Do not retry blindly -- identify the stateful dependency causing flakiness.

---

## 11. Lessons Learned -- Common Pitfalls in Autonomous Development

These rules come from real autonomous sessions and prevent the most common time sinks. They apply to any project type -- web, mobile, backend, CLI, infrastructure.

### Rule 1: Test environment differs from development environment

**Problem:** Code works locally and passes manual testing, but automated tests fail.

Test runners (Playwright, Jest, pytest, XCTest) create their own execution contexts with their own defaults: locale, timezone, environment variables, permissions, network configuration. These defaults almost always differ from the development environment.

**Rule:** After scaffolding test infrastructure, **write a trivial smoke test that validates the environment** (e.g., "page loads", "API responds", "DB connection works") -- before writing any feature tests. If the smoke test fails, the problem is test configuration, not application code.

**Examples across stacks:**

- Browser test runner uses a different locale than the system -> i18n content renders unexpectedly
- CI pipeline has different environment variables -> configuration errors
- Test containers start with a different DB version -> SQL incompatibilities
- Mobile simulator has different permissions than a real device -> feature gates trigger

### Rule 2: Validate integration points immediately after scaffolding

**Problem:** A feature is fully implemented across all layers, but integration testing reveals a fundamental configuration error that should have been caught in phase 2.

When multiple systems interact (framework + middleware + routing + DB + auth + testing), the most expensive bugs occur at the **boundaries**, not within individual systems.

**Rule:** After scaffolding (Phase 2), **immediately test one end-to-end roundtrip** before building features on top. Do not wait until Phase 5 (E2E).

**Post-scaffolding checklist:**

- [ ] Routing: Are all planned routes accessible? (not 404)
- [ ] Middleware: Does it fire correctly on all paths?
- [ ] Auth: Does the login/logout flow work end-to-end?
- [ ] DB: Does migration run and are seed data readable?
- [ ] API: Does one request/response roundtrip succeed?
- [ ] Build: Does the production build complete without errors?

### Rule 3: Read diagnostics before attempting fixes

**Problem:** Test fails -> immediately adjust code/test -> still broken after 5 iterations.

Every test framework produces detailed diagnostic output: error context files, stack traces, screenshots, accessibility trees, log files. **These outputs almost always contain the answer** -- but they are often skipped in favor of trial-and-error.

**Rule:** On test failure, **always read the complete diagnostics first** (logs, traces, screenshots, error context) before changing any code. Diagnostic analysis saves an average of 3-5 debug iterations.

**Diagnostic priority:**

1. Error message + stack trace (what exactly failed?)
2. Framework-specific outputs (Playwright: error context, pytest: captured output, etc.)
3. Application logs (server logs, browser console)
4. Screenshots / DOM snapshots (visual state)

### Rule 4: Manual verification is not the same as automated testing

**Problem:** Feature manually tested -> works. Automated test -> fails. "But it works!"

Manual tests and automated tests run in **different execution contexts**. A human waits intuitively; a test does not. The browser has stored cookies; the test runner starts clean. The IDE forwards ports; the CI runner does not.

**Rule:** "Manually tested" does not count as verification. Only a **passing automated test** confirms the feature works. When manual and automated results disagree, the cause is almost always in the **execution context**, not the code.

**Common context differences:**

- Timing: Humans wait intuitively; tests have fixed timeouts
- State: Browser has caches/cookies; test runner starts clean
- Locale/timezone: System settings vs. test runner defaults
- Network: Local ports vs. container network
- Permissions: Dev user vs. service account

### Rule 5: Stateful dependencies cause flaky tests

**Problem:** Test passes the first time, fails the second -- with no code changes.

Any stateful component (rate limiter, in-memory cache, queue, session store, connection pool) retains state between test runs. When tests modify this state without resetting it, subsequent tests become unreliable.

**Rule:** Identify stateful dependencies and reset them per test run. Alternatively, **guarantee isolation** in tests against stateful services (own instance, reset endpoint, mocking).

**Common candidates:**

- Rate limiters (in-memory maps, Redis keys)
- Caches (CDN, application cache, browser cache)
- Queues (unprocessed messages from previous runs)
- Database state (seed data, auto-increment counters)
- File system (temp files, upload directories)
- External APIs (sandbox limits, quotas)

### Rule 6: Use precise identifiers from the start

**Problem:** Tests use vague selectors ("find text X") -> break on every UI change because X appears in multiple places.

Vague selectors (`getByText("Save")`, `querySelector(".btn")`, `find_element_by_class`) are fragile. As soon as the page or app changes, they match too many or the wrong elements.

**Rule:** Write tests with **scoped, specific identifiers** from the beginning:

- Element IDs or data-testid attributes
- Scoped queries (search within a container, not globally)
- Exact matches instead of partial/regex when possible
- `.first()` / `[0]` only as a last resort -- prefer refining the selector

### Autonomous Debug Loop

When a test fails during autonomous development, follow this sequence:

```
Test fails
  |
  v
1. STOP -- Do not attempt a fix immediately
  |
  v
2. Read diagnostics (error context, logs, traces, screenshots)
  |
  v
3. Check execution context (locale, env vars, state, timing)
  |
  v
4. Identify root cause (config? code? test? infrastructure?)
  |
  v
5. Apply a targeted fix (one change per iteration)
  |
  v
6. Re-run the test
```

---

## 12. Available Tools -- Reference

### Commands (usable in prompts)

| Command               | Phase          | Function                                                                                                    |
| --------------------- | -------------- | ----------------------------------------------------------------------------------------------------------- |
| `effect:dev:plan`     | Start          | Analysis + plan + **waits for approval**                                                                    |
| `effect:dev:tdd`      | Implementation | Tests first -> code -> refactor                                                                             |
| `effect:dev:verify`   | QA             | Build + types + lint + tests                                                                                |
| `effect:dev:e2e`      | QA             | Playwright E2E tests                                                                                        |
| `effect:dev:review`   | Review         | Security + quality audit                                                                                    |
| `effect:dev:fix`      | Debugging      | Incremental error resolution                                                                                |
| `effect:dev:refactor` | Cleanup        | Remove dead code                                                                                            |
| `effect:dev:save`     | Safety         | Create a restore point                                                                                      |
| `effect:dev:diagnose` | Diagnosis      | Post-mortem analysis for stuck/failed runs — explains what went wrong and why                               |
| `effectum:init`       | Setup          | Teach Claude about your domain model, naming conventions, and key business rules — persisted across updates |
| `effectum:explore`    | Onboarding     | Drops 4 parallel agents to produce 7 structured knowledge documents about an existing codebase              |

### v0.16 Autonomous Loop Features

| Feature                    | Description                                                                                                                                                                                                                                                                         |
| -------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Context Budget Monitor** | Tracks estimated context usage each iteration. At 80% capacity, the loop writes `HANDOFF.md` with a clean resume point and stops — preventing corrupted or truncated runs.                                                                                                          |
| **Stuck Detection**        | Compares the current error against the previous iteration's error. If the **same error appears 2 consecutive times**, the loop writes `STUCK.md` with a diagnosis and stops. Two repetitions means the approach is fundamentally wrong.                                             |
| **Loop State**             | After every iteration, the loop persists its full state to `.effectum/loop-state.json` (iteration, task, last error, artifacts, status). On a new run, if an incomplete state file is found, Claude offers to resume or start fresh — enabling crash recovery for overnight builds. |

### MCP Servers (automatically available)

| Server                  | Function                                         |
| ----------------------- | ------------------------------------------------ |
| **Supabase**            | Migrations, SQL, types, Edge Functions, branches |
| **Playwright**          | Browser automation, E2E testing                  |
| **Sequential Thinking** | Structured reasoning                             |

> **Headless / `-p` Mode:** Set `MCP_CONNECTION_NONBLOCKING=true` to skip MCP connection wait during headless starts. Without this, `--mcp-config` server connections block up to 30s. With it, connections are attempted in the background (capped at 5s) — significantly faster Ralph Loop starts in CI.
>
> ```bash
> MCP_CONNECTION_NONBLOCKING=true claude --print /ralph-loop
> ```
>
> Added in Claude Code v2.1.89. Recommended for all Effectum headless/CI setups.

### Specialized Agents (automatically selected)

| Agent               | Use Case                        |
| ------------------- | ------------------------------- |
| fullstack-developer | Features spanning all layers    |
| postgres-pro        | DB schema, queries, performance |
| security-engineer   | Auth, RLS, vulnerabilities      |
| test-automator      | Test strategy, coverage         |
| ui-designer         | Component design, UX            |
