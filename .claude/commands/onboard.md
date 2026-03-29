---
name: "onboard [DEPRECATED → effectum:onboard]"
description: "DEPRECATED: Use /effectum:onboard instead. This alias will be removed in v0.20."
allowed-tools: ["Read", "Write", "Edit", "Bash", "Glob", "Grep", "Agent"]
effort: "high"
---

> ⚠️ **Deprecated as of v0.18.0**
>
> `/onboard` has been renamed to `effectum:onboard`.
> This alias will be **removed in v0.20.0**.
>
> Please update your workflow: type `/effectum:onboard` going forward.
> (Running `effectum:onboard` now...)

---

# effectum:onboard — Reverse-Engineer an Existing Project into Effectum

You onboard an existing codebase into the Effectum autonomous development system. You analyze the project with 6 parallel agents, self-test the results, run a consistency review, and — only after everything passes — present verified PRDs to the user for confirmation before writing any files.

## Overview

| Step | Phase                                 | Output                          |
| ---- | ------------------------------------- | ------------------------------- |
| 1    | Parse & Validate                      | Validation result               |
| 2    | Launch 6 Agents                       | Parallel analysis               |
| 3    | Merge Results                         | Feature list + dependency graph |
| 4    | Self-Test (7 tests, max 5 iterations) | All-green self-test report      |
| 5    | Generate PRDs                         | Draft PRDs (not written yet)    |
| 6    | Consistency Review                    | Cross-PRD validation            |
| 7    | **User Confirmation**                 | You approve or correct          |
| 8    | Write Files                           | All artifacts written to disk   |

**Agents:** Stack, Architecture, API, Database, Frontend, Test
**Output:** PRDs in `workshop/projects/{slug}/prds/`

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
   - Update: abort and suggest `effect:prd:new` for adding new features.
3. Create the workspace: `workshop/projects/{slug}/` with subdirectories `prds/`, `prompts/`, `notes/`.
4. Create `PROJECT.md` with status `discovery` and today's date.

## Step 2: Launch 6 Parallel Analysis Agents

Launch all applicable agents in parallel using the Agent tool. Each agent receives a focused prompt and returns structured results.

**CRITICAL**: Launch all 6 agents in a SINGLE message with multiple Agent tool calls. Do NOT launch them sequentially.

Read the agent spec file and use its content as the prompt for each agent. Replace `{project-path}` with the actual path.

| #   | Agent                | Spec File                                       | Subagent Type |
| --- | -------------------- | ----------------------------------------------- | ------------- |
| 1   | Stack Analyst        | `system/agents/onboard-stack-analyst.md`        | Explore       |
| 2   | Architecture Analyst | `system/agents/onboard-architecture-analyst.md` | Explore       |
| 3   | API Analyst          | `system/agents/onboard-api-analyst.md`          | Explore       |
| 4   | Database Analyst     | `system/agents/onboard-database-analyst.md`     | Explore       |
| 5   | Frontend Analyst     | `system/agents/onboard-frontend-analyst.md`     | Explore       |
| 6   | Test Analyst         | `system/agents/onboard-test-analyst.md`         | Explore       |

- Skip Agent 5 (Frontend Analyst) if `--skip-frontend` flag is set.
- Skip Agent 6 (Test Analyst) if `--skip-tests` flag is set.

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

Run 7 automated self-tests in a loop. **Maximum 5 iterations.** No user interaction during this phase.

| #   | Test                    | Check                                 | Fix                                           |
| --- | ----------------------- | ------------------------------------- | --------------------------------------------- |
| 1   | DB Coverage             | Every table assigned to a feature     | Match by naming/FK, or create new feature     |
| 2   | API Coverage            | Every endpoint assigned to a feature  | Match by URL prefix, or create new feature    |
| 3   | Component Coverage      | Every page maps to a feature          | Match by directory/route, or assign to "Misc" |
| 4   | No Phantom Features     | Every feature has code evidence       | Remove features with zero artifacts           |
| 5   | Min Acceptance Criteria | Each feature has 3+ artifacts         | Merge small features with related ones        |
| 6   | Dependency Consistency  | All deps bidirectional, targets exist | Add missing reverse refs, remove dangling     |
| 7   | Structure Match         | All major directories have features   | Create entries or mark as shared utilities    |

Log results per iteration as a table (PASS/FAIL/WARN) to `workshop/projects/{slug}/notes/self-test-log.md`.

**Loop exits when**: All 7 tests PASS (WARN acceptable for Test 5 if feature has 2 artifacts).

## Step 5: Generate PRDs

Generate one PRD per feature area. Follow `workshop/knowledge/01-prd-template.md`.

**One PRD per feature.** Files named: `workshop/projects/{slug}/prds/{NNN}-{feature-slug}.md`

PRD frontmatter must include: `id`, `title`, `version: 1.0`, `status: implemented`, `onboarded: true`, `last_updated`, `depends_on`, `features` (with status `done`), and `connections`.

PRD rules:

- All ACs are checked `[x]` (they describe existing functionality)
- Include Data Model (tables, columns, RLS), API Design (endpoints), Scope (in/out), Quality Gates, and Completion Promise sections

Also generate:

- **Task Registry**: `workshop/projects/{slug}/tasks.md` — all tasks marked DONE (table with ID, PRD, Feature, Task, Status, Priority columns)
- **Network Map**: `workshop/projects/{slug}/network-map.mmd` per `workshop/knowledge/06-network-map-guide.md` — all features as `:::done` nodes, edges from dependency graph, grouped by PRD in subgraphs

## Step 6: Run Onboarding Review

Execute `effectum:onboard:review` automatically. This is a separate review step that checks cross-PRD consistency.

If the review finds issues, apply the suggested fixes automatically, then re-run the review. Maximum 3 review iterations.

Only proceed to user presentation when the review passes.

## Step 7: Present Results to User

Show the user a summary. Do NOT write any files yet. Include:

- Stack and architecture summary
- Feature table: name, confidence, tables, endpoints, pages, tests counts
- Uncertain features flagged for user input
- Coverage gaps (endpoints without tests, tables without RLS, pages without backing API)
- Generated artifact counts
- Self-test and review results

Ask: **"Does this look correct?"** The user can correct, merge, split features, or approve.

- If corrected: apply changes, re-run self-tests and review for affected areas, re-present.
- If approved: proceed to Step 8.

## Step 8: Write Output Files

Only after explicit user confirmation, write all files:

1. **`.effectum.json`** — project root: version, onboarded flag, slug, detected stack (framework, language, database, auth, deploy), PRD IDs, feature IDs
2. **`CLAUDE.md`** — project root: use stack presets from `system/stacks/` if available, otherwise generate with build/test/lint commands, project structure, conventions, PRD references
3. **`PROJECT.md`** — update status to `handed-off`
4. **PRDs** — `workshop/projects/{slug}/prds/001-*.md` through `{N}-*.md`
5. **`tasks.md`** — task registry with all tasks DONE
6. **`network-map.mmd`** — network map
7. **`DESIGN.md`** — only if Frontend Analyst found design tokens (colors, typography, spacing, border radii)

**Post-write verification**: Validate PRD frontmatter is parseable, all feature IDs in network map exist in PRDs, all `depends_on` references exist, `.effectum.json` is valid JSON, `CLAUDE.md` paths are correct.

## Error Recovery

- **Agent failure**: Log in `notes/analysis-report.md`, continue with remaining agents, mark affected areas as `uncertain`. Do NOT block on a single agent failure.
- **Self-test loop stuck** (5 iterations): Proceed with WARN/FAIL items documented. Flag to user.
- **Empty project** (< 2 features): Suggest `effect:prd:new` for manual documentation instead.

## Next Steps

After onboarding is complete:

- → `effect:prd:new` — Create a new PRD for the next feature you want to build
- → `effect:dev:plan` — Start planning implementation for an existing PRD
- → `effect:design` — Generate a DESIGN.md if the project has a frontend

ℹ️ Alternative: Run `effect:prd:status` to see a dashboard of all onboarded PRDs and their statuses.

## Communication

Follow the language settings defined in CLAUDE.md.
All file content (PRDs, configs, analysis reports) must be written in English.
User-facing communication uses the language configured in CLAUDE.md.
