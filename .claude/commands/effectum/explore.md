---
name: "effectum:explore"
description: "Spawn 4 parallel analysis agents to produce structured codebase knowledge documents."
allowed-tools: ["Read", "Write", "Edit", "Bash", "Glob", "Grep", "Agent"]
effort: "high"
---

# effectum:explore — Parallel Codebase Analysis

Spawns 4 specialized analysis agents in parallel to produce structured knowledge documents about the codebase. Each agent writes its output to `knowledge/codebase/`.

## Step 1: Prepare Output Directory

```bash
mkdir -p knowledge/codebase
```

## Step 2: Launch 4 Parallel Agents

Spawn all 4 agents simultaneously using the Agent tool. Each agent receives a focused prompt and writes its own output files.

### Agent 1: ArchitectureMapper

**Prompt for agent:**

```
You are the ArchitectureMapper agent. Analyze the codebase architecture and write your findings to knowledge/codebase/ARCHITECTURE.md.

Your analysis must cover:

1. **High-Level Architecture**: What pattern does this codebase follow? (monolith, microservices, modular monolith, serverless, etc.)
2. **Module/Package Structure**: How is the code organized? What are the top-level directories and their purposes?
3. **Dependency Graph**: Which modules depend on which? Are there circular dependencies?
4. **Entry Points**: Where does execution start? (main files, route handlers, event listeners)
5. **Data Flow**: How does data flow through the system? (request → handler → service → DB, etc.)
6. **Layering**: Are there clear layers (presentation, business logic, data access)? Are boundaries respected?
7. **Key Patterns**: Design patterns in use (repository, factory, observer, middleware chain, etc.)

Read the codebase thoroughly. Check package.json/go.mod/Cargo.toml for dependencies. Read the directory structure. Sample key files to understand patterns.

Write the output as a well-structured markdown document at knowledge/codebase/ARCHITECTURE.md with clear headings and code examples where helpful.
```

### Agent 2: StackMapper

**Prompt for agent:**

```
You are the StackMapper agent. Analyze the technology stack, project structure, and coding conventions. Write your findings to THREE files:

1. **knowledge/codebase/STACK.md** — Technology stack analysis:
   - Language(s) and version(s)
   - Framework(s) and version(s)
   - Database(s) and ORM(s)
   - Build tools and bundlers
   - Package manager and dependency count
   - Runtime environment (Node, Deno, browser, native)
   - Key third-party libraries and their purposes

2. **knowledge/codebase/STRUCTURE.md** — Project structure map:
   - Directory tree (top 3 levels)
   - Purpose of each major directory
   - File naming conventions
   - Where to find: routes, components, services, utils, types, tests, config
   - Important files and their roles (entry points, config, schemas)

3. **knowledge/codebase/CONVENTIONS.md** — Coding conventions:
   - Naming patterns (camelCase, snake_case, PascalCase — where each is used)
   - Import/export style (named vs default, barrel files)
   - Error handling patterns (try/catch, Result type, error codes)
   - State management approach
   - Configuration approach (env vars, config files, constants)
   - Logging approach
   - Code formatting rules (from config files like .prettierrc, .eslintrc)

Read package manifests, config files, and sample source files. Base findings on actual code, not assumptions.
```

### Agent 3: QualityMapper

**Prompt for agent:**

```
You are the QualityMapper agent. Analyze testing infrastructure and code quality concerns. Write your findings to TWO files:

1. **knowledge/codebase/TESTING.md** — Testing analysis:
   - Test framework(s) in use
   - Test directory structure and naming conventions
   - Types of tests present (unit, integration, e2e, snapshot)
   - Test configuration (jest.config, vitest.config, pytest.ini, etc.)
   - Coverage configuration and thresholds (if any)
   - Test utilities, fixtures, mocks, and factories
   - CI/CD test pipeline (if detectable from config)
   - Approximate test count and coverage level
   - Test commands (from package.json scripts or Makefile)

2. **knowledge/codebase/CONCERNS.md** — Code quality concerns:
   - Files that are unusually large (>300 lines)
   - Complex functions (deeply nested, many branches)
   - TODO/FIXME/HACK comments found in code
   - Potential security concerns (hardcoded secrets, SQL injection risk, XSS vectors)
   - Dependency health (outdated major versions, known vulnerabilities if detectable)
   - Dead code indicators (unused exports, unreachable branches)
   - Type safety gaps (any casts, missing types, loose generics)

Scan the full codebase. Run test commands in dry-run mode if available. Check linter configs.
```

### Agent 4: IntegrationMapper

**Prompt for agent:**

```
You are the IntegrationMapper agent. Analyze all external integrations and API surfaces. Write your findings to knowledge/codebase/INTEGRATIONS.md.

Your analysis must cover:

1. **API Endpoints**: List all REST/GraphQL/RPC endpoints the application exposes
   - Method, path, handler location
   - Authentication requirements
   - Request/response shapes (if typed)

2. **External Services**: What third-party services does this app connect to?
   - Database connections (connection strings, pool config)
   - API clients (HTTP calls to external services)
   - Message queues (Kafka, RabbitMQ, SQS)
   - Storage services (S3, GCS, local filesystem)
   - Auth providers (OAuth, SAML, API keys)
   - Email/SMS/notification services

3. **Environment Variables**: What env vars are required?
   - List all referenced env vars with their purpose
   - Which are required vs optional
   - Which have defaults

4. **Webhooks & Events**: Does the app receive or send webhooks?

5. **Internal APIs**: How do internal modules communicate? (function calls, events, shared state)

Search for: fetch(), axios, http client usage, database client instantiation, env var references (process.env, os.environ), SDK initializations.
```

## Step 3: Wait and Collect Results

Wait for all 4 agents to complete. Each agent writes its files directly.

## Step 4: Print Summary

After all agents finish, print a summary table:

```
Codebase mapping complete.

| Agent              | Files Written                                  | Status |
|--------------------|------------------------------------------------|--------|
| ArchitectureMapper | knowledge/codebase/ARCHITECTURE.md             | ✅     |
| StackMapper        | STACK.md, STRUCTURE.md, CONVENTIONS.md         | ✅     |
| QualityMapper      | TESTING.md, CONCERNS.md                        | ✅     |
| IntegrationMapper  | knowledge/codebase/INTEGRATIONS.md             | ✅     |

Total: 7 knowledge documents generated.
```

Verify each expected file exists. If any agent failed, report which files are missing.

## Next Steps

After codebase mapping is complete:

- → `effectum:init` — Use the analysis to populate project context in CLAUDE.md
- → `effect:prd:new` — Start a PRD session with full architectural understanding
- → `effect:dev:plan` — Create an implementation plan informed by the knowledge documents

ℹ️ Knowledge documents in `knowledge/codebase/` can be referenced by agents in subsequent sessions.

## Communication

Follow the language settings defined in CLAUDE.md for user-facing communication.
All generated knowledge documents in English.
