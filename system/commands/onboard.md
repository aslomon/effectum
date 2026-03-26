# /onboard — Reverse-Engineer an Existing Project into Effectum

You onboard an existing codebase into the Effectum autonomous development system. You analyze the project with 6 parallel agents, self-test the results, run a consistency review, and — only after everything passes — present verified PRDs to the user for confirmation before writing any files.

## Step 1: Parse Arguments and Validate

Parse `$ARGUMENTS` for:

- **`project-path`**: Path to the existing project to onboard. If empty, use the current working directory.
- **`--slug NAME`**: Optional project slug override. If omitted, derive from the directory name (lowercase, hyphens).
- **`--skip-frontend`**: Skip the Frontend Analyst agent (for backend-only projects).
- **`--skip-tests`**: Skip the Test Analyst agent (if no test infrastructure exists).

### Validation

1. Verify the path exists and contains source code (check for `package.json`, `Cargo.toml`, `go.mod`, `pyproject.toml`, `Gemfile`, `pom.xml`, `build.gradle`, or `src/`/`app/`/`lib/` directories).
2. Check if the project is already onboarded: look for `.effectum.json` in the project root.
   - If found, ask: **"This project was already onboarded. Re-analyze from scratch or update incrementally?"**
   - Re-analyze: continue with full onboarding (overwrites existing PRDs).
   - Update: abort and suggest `/prd:new` for adding new features.
3. Create the workspace: `workshop/projects/{slug}/` with subdirectories `prds/`, `prompts/`, `notes/`.
4. Create `PROJECT.md` with status `discovery` and today's date.

## Step 2: Launch 6 Parallel Analysis Agents

Launch all applicable agents in parallel using the Agent tool. Each agent receives a focused prompt and returns structured results.

**CRITICAL**: Launch all 6 agents in a SINGLE message with multiple Agent tool calls. Do NOT launch them sequentially.

### Agent 1: Stack Analyst

```
Subagent type: Explore
Prompt: Analyze the project at {project-path} to identify the complete technology stack.

Scan these files (check all that exist):
- package.json, pnpm-lock.yaml, yarn.lock, package-lock.json (Node.js deps)
- tsconfig.json, jsconfig.json (TypeScript/JS config)
- next.config.*, nuxt.config.*, vite.config.*, webpack.config.* (Framework config)
- Dockerfile, docker-compose.yml, .dockerignore (Container setup)
- .env.example, .env.template (Environment variables — NOT .env itself)
- pyproject.toml, requirements.txt, Pipfile, setup.py (Python deps)
- go.mod, go.sum (Go deps)
- Cargo.toml (Rust deps)
- Gemfile (Ruby deps)
- pom.xml, build.gradle (Java deps)
- supabase/config.toml, prisma/schema.prisma, drizzle.config.* (DB config)
- vercel.json, netlify.toml, fly.toml, railway.json (Deploy config)
- .github/workflows/*.yml, .gitlab-ci.yml, Jenkinsfile (CI/CD)

Return a structured report with these sections:
1. FRAMEWORK: Primary framework name and version (e.g., "Next.js 15.1", "Django 5.0")
2. LANGUAGE: Primary language and version (e.g., "TypeScript 5.4", "Python 3.12")
3. DATABASE: Database system and ORM/client (e.g., "PostgreSQL via Supabase", "MySQL via Prisma")
4. AUTH: Authentication method (e.g., "Supabase Auth", "NextAuth.js", "Django allauth", "custom JWT")
5. STYLING: CSS framework/approach (e.g., "Tailwind CSS v4", "CSS Modules", "styled-components")
6. DEPLOYMENT: Where and how deployed (e.g., "Vercel", "Docker + Fly.io", "AWS ECS")
7. CI_CD: CI/CD pipeline details
8. PACKAGE_MANAGER: pnpm, npm, yarn, pip, cargo, etc.
9. KEY_DEPENDENCIES: List of significant dependencies (not utility libs) with their purpose
10. ENV_VARS: List of environment variable names from .env.example (NOT values)
```

### Agent 2: Architecture Analyst

```
Subagent type: Explore
Prompt: Analyze the project architecture at {project-path}.

1. Map the top-level directory structure (run: ls -la at root, then ls for each major directory).
2. Identify the architecture pattern:
   - MVC (models/, views/, controllers/)
   - Clean Architecture (domain/, application/, infrastructure/)
   - Feature-Based (features/auth/, features/billing/)
   - App Router (app/(groups)/page.tsx)
   - Monorepo (packages/, apps/)
   - Flat (everything in src/)
3. List all modules/domains found (e.g., auth, billing, dashboard, settings).
4. Identify shared code: utils/, lib/, helpers/, shared/, common/.
5. Identify middleware, plugins, or interceptors.
6. Check for monorepo tools: turborepo.json, nx.json, lerna.json, pnpm-workspace.yaml.

Return a structured report:
1. PATTERN: Architecture pattern name and confidence level
2. MODULES: List of modules/domains with their root directories
3. SHARED_CODE: Shared utilities and their locations
4. MIDDLEWARE: Any middleware or interceptors found
5. ENTRY_POINTS: Main entry files (e.g., app/layout.tsx, main.py, cmd/server/main.go)
6. CONFIG_FILES: Non-standard config files and their purpose
7. DIRECTORY_TREE: A clean tree of the top 3 levels of the project structure
```

### Agent 3: API Analyst

```
Subagent type: Explore
Prompt: Analyze all API endpoints in the project at {project-path}.

Scan for route definitions based on the framework:
- Next.js App Router: app/**/route.ts, app/api/**/route.ts
- Next.js Pages Router: pages/api/**/*.ts
- Express/Fastify: look for router.get/post/put/delete, app.get/post/put/delete
- Django: urls.py files, viewsets
- Flask: @app.route decorators
- Go: http.HandleFunc, gin/echo/chi route registrations
- Supabase Edge Functions: supabase/functions/*/index.ts

For EACH endpoint found, extract:
1. HTTP method (GET, POST, PUT, PATCH, DELETE)
2. Path (e.g., /api/users, /api/billing/subscribe)
3. Authentication: is auth required? (check for middleware, guards, decorators)
4. Request body schema (if inferable from Zod schemas, TypeScript types, or validation)
5. Response shape (if inferable from return statements)
6. Which module/feature this endpoint belongs to

Also scan for:
- Webhook endpoints
- WebSocket/Realtime connections
- GraphQL schemas and resolvers
- tRPC routers
- Supabase RPC functions (in migrations)

Return a structured ENDPOINT_MAP:
For each endpoint: { method, path, auth, module, description, request_shape, response_shape }
Group endpoints by module/feature area.
```

### Agent 4: Database Analyst

```
Subagent type: Explore
Prompt: Analyze the database schema in the project at {project-path}.

Scan for schema definitions:
- supabase/migrations/*.sql (Supabase migrations — read ALL of them in order)
- prisma/schema.prisma (Prisma schema)
- drizzle/schema.ts, src/**/schema.ts (Drizzle ORM)
- **/models.py, **/models/*.py (Django models)
- SQL files in db/, migrations/, database/
- TypeORM entities: **/*.entity.ts
- Sequelize models: **/models/*.js

For EACH table/model found, extract:
1. Table name
2. All columns with types and constraints (PK, FK, NOT NULL, UNIQUE, DEFAULT)
3. Foreign key relationships (belongs_to, has_many, many_to_many)
4. Indexes (unique, composite, partial)
5. RLS policies (if Supabase — extract policy names and rules)
6. Triggers and functions
7. Enums and custom types

Also identify:
- Multi-tenancy pattern: is there an org_id or tenant_id column?
- Soft delete pattern: is there a deleted_at column?
- Audit pattern: created_at, updated_at, created_by columns?
- Which feature/module each table belongs to

Return a structured DATA_MODEL:
1. TABLES: List of all tables with columns, types, constraints
2. RELATIONS: All foreign key relationships
3. RLS_POLICIES: All RLS policies (if any)
4. INDEXES: All non-primary indexes
5. ENUMS: All enum types
6. PATTERNS: Multi-tenancy, soft delete, audit, etc.
7. FEATURE_ASSIGNMENT: Which feature area each table belongs to
```

### Agent 5: Frontend Analyst (skip if `--skip-frontend`)

```
Subagent type: Explore
Prompt: Analyze the frontend structure of the project at {project-path}.

Scan for:
1. PAGES: All page/route components
   - Next.js: app/**/page.tsx, app/**/layout.tsx
   - React Router: route definitions in router config
   - Vue: pages/**/*.vue, views/**/*.vue
   - Angular: **/*.component.ts with route config
   List each page with its path and purpose.

2. COMPONENTS: All reusable components
   - components/**/*.tsx, components/**/*.vue, components/**/*.svelte
   - Categorize: UI primitives (Button, Input), feature components (UserCard, InvoiceTable), layout components (Sidebar, Header)
   - Note which components use client-side interactivity (hooks, state, event handlers)

3. DESIGN_TOKENS: Extract visual design information
   - Tailwind config: tailwind.config.ts (custom colors, fonts, spacing)
   - CSS variables: globals.css, :root definitions
   - Theme files: theme.ts, tokens.ts
   - Shadcn UI config: components.json
   - Brand colors, fonts, border radii, shadows

4. STATE_MANAGEMENT: How state is managed
   - React Context, Zustand, Redux, Jotai, Recoil
   - Server state: TanStack Query, SWR, server components

5. FEATURE_MAP: Group pages and components into feature areas
   For each feature area: { name, pages: [], components: [], routes: [] }

Return all findings structured by these 5 sections.
```

### Agent 6: Test Analyst (skip if `--skip-tests`)

```
Subagent type: Explore
Prompt: Analyze the test infrastructure of the project at {project-path}.

Scan for:
1. TEST_FRAMEWORK: Which testing tools are configured
   - vitest.config.ts, jest.config.ts, pytest.ini, conftest.py
   - playwright.config.ts, cypress.config.ts (E2E)
   - .storybook/ (visual testing)

2. TEST_FILES: All test files
   - **/*.test.ts, **/*.spec.ts, **/*.test.tsx
   - **/test_*.py, **/*_test.py, **/tests.py
   - **/*_test.go
   - e2e/**/*.spec.ts, tests/**/*.spec.ts (E2E tests)

3. COVERAGE_MAP: For each feature area, determine:
   - How many test files exist
   - What is tested (unit, integration, e2e)
   - What is NOT tested (gaps)
   - Approximate coverage level (well-tested, partially-tested, untested)

4. TEST_PATTERNS: How tests are written
   - Mocking strategy (MSW, jest.mock, vi.mock, factory functions)
   - Test database setup (in-memory, Docker, test schema)
   - Fixtures and factories
   - Custom test utilities

5. CI_INTEGRATION: How tests run in CI
   - Which tests run on PR, which on merge
   - Test commands from package.json scripts or CI config

Return a structured COVERAGE_MAP:
For each feature area: { name, unit_tests: N, integration_tests: N, e2e_tests: N, coverage_level, gaps: [] }
```

## Step 3: Merge Results and Extract Features

After ALL agents return, merge their results into a unified analysis.

### 3a. Build the Feature List

Cross-reference all agent outputs to build a consolidated feature list:

1. Start with the Architecture Analyst's module list.
2. Enrich each module with:
   - API endpoints from the API Analyst
   - Database tables from the Database Analyst
   - Pages and components from the Frontend Analyst
   - Test coverage from the Test Analyst
3. Each feature gets a **Confidence Score** based on how many sources confirm it:
   - 1 source = `uncertain` (only seen in one agent's output)
   - 2 sources = `likely` (e.g., has API routes AND database tables)
   - 3+ sources = `confirmed` (has routes, tables, AND frontend pages)
4. Features with confidence `uncertain` are flagged for the user later.

### 3b. Build the Dependency Graph

For each feature, identify dependencies:

- Feature A's API calls Feature B's service → A depends on B
- Feature A's table has FK to Feature B's table → A depends on B
- Feature A's frontend imports Feature B's components → A depends on B
- Ensure bidirectional consistency: if A depends on B, B should list A as a dependent.

### 3c. Identify Gaps

Scan for coverage gaps:

- **DB tables without API endpoints**: Table exists but no CRUD routes found
- **API endpoints without tests**: Route exists but no test covers it
- **Pages without backing API**: Frontend page has no corresponding backend route
- **Features without tests**: Feature area has zero test files
- **Routes without auth**: API endpoint has no authentication check (potential security gap)
- **Tables without RLS**: Database table has no Row Level Security policy (if Supabase)

Save the merged analysis to `workshop/projects/{slug}/notes/analysis-report.md`.

## Step 4: Self-Test Loop

Run 7 automated self-tests. The loop continues until ALL tests pass. No user interaction during this phase.

**Maximum 5 iterations.** If tests still fail after 5 iterations, proceed with warnings.

### Self-Tests

For each iteration, run ALL 7 tests and collect results:

#### Test 1: DB Coverage

- **Check**: For every table found by the Database Analyst, verify it is assigned to a feature in the feature list.
- **Fix**: If a table has no feature assignment, find the closest matching feature by naming convention and foreign key relationships. If no match, create a new feature entry for orphan tables.

#### Test 2: API Coverage

- **Check**: For every API endpoint found by the API Analyst, verify it is assigned to a feature in the feature list.
- **Fix**: If an endpoint has no feature assignment, match by URL path prefix (e.g., `/api/billing/*` → billing feature). If no match, create a new feature entry.

#### Test 3: Component Coverage

- **Check**: For every page component found by the Frontend Analyst, verify it maps to a feature.
- **Fix**: If a page has no feature assignment, match by directory structure or route path. If no match, assign to a "UI" or "Misc" feature.

#### Test 4: No Phantom Features

- **Check**: For every feature in the feature list, verify at least one code artifact exists (a table, an endpoint, a page, or a component).
- **Fix**: If a feature has zero code evidence, remove it from the feature list. It was incorrectly inferred.

#### Test 5: Minimum Acceptance Criteria

- **Check**: Each feature has enough substance for at least 3 acceptance criteria (at least 3 code artifacts: endpoints, tables, pages, or components).
- **Fix**: If a feature has fewer than 3 artifacts, consider merging it with a related feature.

#### Test 6: Dependency Consistency

- **Check**: For every dependency A→B, verify that B exists in the feature list. For every dependency A→B, verify B's dependents include A.
- **Fix**: Add missing reverse references. Remove dangling dependencies to non-existent features.

#### Test 7: Structure Match

- **Check**: The modules/directories identified by the Architecture Analyst all have corresponding features. No major directory is unaccounted for.
- **Fix**: Create feature entries for unaccounted directories, or mark them as "shared utilities" (not a feature).

### Self-Test Output Format

After each iteration, log the results:

```
## Self-Test Iteration {N}

| # | Test                    | Status | Details                           |
|---|-------------------------|--------|-----------------------------------|
| 1 | DB Coverage             | PASS   | 12/12 tables assigned             |
| 2 | API Coverage            | FAIL   | 2 endpoints unassigned            |
| 3 | Component Coverage      | PASS   | 8/8 pages assigned                |
| 4 | No Phantom Features     | PASS   | 0 phantoms found                  |
| 5 | Min Acceptance Criteria | WARN   | 1 feature has only 2 artifacts    |
| 6 | Dependency Consistency  | PASS   | All deps bidirectional            |
| 7 | Structure Match         | FAIL   | 1 directory unaccounted           |

Result: 5/7 PASS, 1 WARN, 1 FAIL → fixing and re-running...
```

Save the self-test log to `workshop/projects/{slug}/notes/self-test-log.md`.

**Loop exits when**: All 7 tests show PASS (WARN is acceptable for Test 5 only if the feature has 2 artifacts).

## Step 5: Generate PRDs

Generate one PRD per feature area. Follow the PRD template from `workshop/knowledge/01-prd-template.md`.

### PRD Generation Rules

1. **One PRD per feature area** — do NOT create a single monolithic PRD. A project with 7 features gets 7 PRDs.
2. **Frontmatter** must include:
   ```yaml
   ---
   id: PRD-{NNN}
   title: "{Feature Name}"
   version: 1.0
   status: implemented
   onboarded: true
   last_updated: { today }
   depends_on: [{ dependencies from the dependency graph }]
   features:
     - { id: { FEATURE_ID }, label: "{Feature Label}", status: done }
   connections:
     - { from: { ID }, to: { ID }, type: hard, label: "{relationship}" }
   ---
   ```
3. **Status is `implemented`** — these are existing features, not planned ones.
4. **`onboarded: true`** flag — marks this PRD as auto-generated from code analysis, not written from scratch.
5. **All Acceptance Criteria are checked `[x]`** — they describe what already exists and works.
6. **Data Model section** includes the actual tables, columns, and RLS policies from the Database Analyst.
7. **API Design section** includes the actual endpoints from the API Analyst.
8. **Include a Scope section** with In Scope (what this feature covers) and Out of Scope (what neighboring features handle).
9. **Include Quality Gates** appropriate for the detected stack.
10. **Include a Completion Promise** describing the current implemented state.

### PRD Naming

Files are named: `workshop/projects/{slug}/prds/{NNN}-{feature-slug}.md`

Example: `001-authentication.md`, `002-billing.md`, `003-dashboard.md`

### Task Registry

Generate `workshop/projects/{slug}/tasks.md` with ALL tasks marked as DONE:

```markdown
# Task Registry — {Project Name}

| ID    | PRD     | Feature | Task                   | Status | Priority |
| ----- | ------- | ------- | ---------------------- | ------ | -------- |
| T-001 | PRD-001 | AUTH    | Implement login flow   | DONE   | P0       |
| T-002 | PRD-001 | AUTH    | Add session management | DONE   | P0       |

...
```

### Network Map

Generate `workshop/projects/{slug}/network-map.mmd` following `workshop/knowledge/06-network-map-guide.md`:

- All features as nodes with `:::done` status (green)
- Edges from the dependency graph
- Features grouped by PRD in `subgraph` blocks
- Include external services (auth providers, payment, etc.) if detected

## Step 6: Run Onboarding Review

Execute `/onboard:review` automatically. This is a separate review step that checks cross-PRD consistency.

If the review finds issues, apply the suggested fixes automatically, then re-run the review. Maximum 3 review iterations.

Only proceed to user presentation when the review passes.

## Step 7: Present Results to User

Show the user a summary. Do NOT write any files yet.

### Summary Format

```
## Onboarding Complete — {Project Name}

**Stack**: {framework} + {database} + {auth} + {deploy}
**Architecture**: {pattern}

### Features Detected ({N} total)

| # | Feature | Confidence | Tables | Endpoints | Pages | Tests |
|---|---------|------------|--------|-----------|-------|-------|
| 1 | Auth    | confirmed  | 3      | 5         | 2     | 8     |
| 2 | Billing | confirmed  | 4      | 7         | 3     | 2     |
| 3 | ...     | ...        | ...    | ...       | ...   | ...   |

### Uncertain Features (need your input)

- {feature}: Only found in {source}. Is this a real feature or a utility?

### Coverage Gaps

- {N} endpoints without tests
- {N} tables without RLS policies
- {N} pages without backing API

### Generated Artifacts

- {N} PRDs (workshop/projects/{slug}/prds/)
- 1 Task Registry (all tasks DONE)
- 1 Network Map
- 1 CLAUDE.md (configured for {stack})
- 1 DESIGN.md (extracted design tokens) — only if UI project

### Self-Test Results: ALL PASS
### Review Results: ALL PASS
```

### User Interaction

After presenting the summary:

1. Ask: **"Does this look correct? You can:**
   - **Correct**: "Feature X is missing" or "That's not a feature, it's a utility"
   - **Merge**: "Combine Auth and User Management into one PRD"
   - **Split**: "Dashboard should be two separate features"
   - **Approve**: "Looks good, write the files"
2. If the user corrects:
   - Apply the correction to the feature list and PRDs.
   - Re-run self-tests (Step 4) for affected areas only.
   - Re-run review (Step 6).
   - Present updated summary.
3. If the user approves: proceed to Step 8.

## Step 8: Write Output Files

Only after explicit user confirmation, write all files.

### Files to Write

1. **`.effectum.json`** in the project root:

   ```json
   {
     "version": "1.0",
     "onboarded": true,
     "onboarded_at": "{ISO date}",
     "slug": "{slug}",
     "stack": {
       "framework": "{detected}",
       "language": "{detected}",
       "database": "{detected}",
       "auth": "{detected}",
       "deploy": "{detected}"
     },
     "prds": ["{list of PRD IDs}"],
     "features": ["{list of feature IDs}"]
   }
   ```

2. **`CLAUDE.md`** in the project root — generated based on the detected stack. Use the stack presets from `system/stacks/` if available, otherwise generate a minimal CLAUDE.md with:
   - Build, test, lint, type-check commands (from package.json scripts or equivalent)
   - Project structure description
   - Key conventions detected from the codebase
   - Reference to the PRDs in `workshop/projects/{slug}/prds/`

3. **`workshop/projects/{slug}/PROJECT.md`** — update status to `handed-off`.

4. **`workshop/projects/{slug}/prds/001-*.md` through `{N}-*.md`** — all generated PRDs.

5. **`workshop/projects/{slug}/tasks.md`** — task registry with all tasks DONE.

6. **`workshop/projects/{slug}/network-map.mmd`** — network map.

7. **`DESIGN.md`** in the project root (only if Frontend Analyst found design tokens):
   - Extracted color palette, typography, spacing, border radii
   - Component patterns detected
   - If no design tokens found, skip this file.

### Post-Write Verification

After writing all files, verify:

1. All PRD files have valid YAML frontmatter (parseable).
2. All feature IDs in the network map exist in PRDs.
3. All PRD IDs referenced in `depends_on` exist.
4. `.effectum.json` is valid JSON.
5. `CLAUDE.md` references correct file paths.

Report: **"All {N} files written and verified. The project is ready for autonomous development with `/prd:new` for new features."**

## Error Recovery

### Agent Failure

If an analysis agent fails or returns empty results:

- Log the failure in `notes/analysis-report.md`.
- Continue with remaining agents.
- Mark affected areas as `uncertain` in the feature list.
- Do NOT block the entire onboarding on a single agent failure.

### Self-Test Loop Stuck

If self-tests don't converge after 5 iterations:

- Proceed with remaining WARN/FAIL items documented.
- Flag them to the user: **"These items could not be auto-resolved: {list}"**
- The user can fix them manually or ignore them.

### Empty Project

If fewer than 2 features are detected:

- The project may be too small for onboarding.
- Suggest: **"This project has very few features. Consider using `/prd:new` to document it manually instead."**

## Next Steps

After onboarding is complete:

- → `/prd:new` — Create a new PRD for the next feature you want to build
- → `/plan` — Start planning implementation for an existing PRD
- → `/design` — Generate a DESIGN.md if the project has a frontend

ℹ️ Alternative: Run `/prd:status` to see a dashboard of all onboarded PRDs and their statuses.

## Communication

Follow the language settings defined in CLAUDE.md.
All file content (PRDs, configs, analysis reports) must be written in English.
User-facing communication uses the language configured in CLAUDE.md.
