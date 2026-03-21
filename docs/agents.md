# Agent Specializations

## What Are Agent Specializations?

Agent specializations are Markdown files that define focused, expert personas for Claude Code subagents. Each specialization configures a dedicated agent with a specific technical domain, a curated system prompt, a tool set, and a model tier — so that when Claude Code spawns a subagent it immediately behaves like a senior specialist rather than a generalist.

Specializations are the primary mechanism for giving subagents in Effectum a distinct identity, scope, and skill set. They live under `system/agents/` and are referenced by name when spawning agents or composing teams.

---

## File Format

Every agent file is a Markdown document with a YAML frontmatter block followed by a detailed system prompt.

### Frontmatter

```yaml
---
name: <agent-slug>
description: "<one-sentence description used by the recommendation engine>"
tools: Read, Write, Edit, Bash, Glob, Grep
model: sonnet | opus | haiku
---
```

| Field | Type | Description |
|---|---|---|
| `name` | string | Unique slug. Must match the filename (without `.md`). |
| `description` | string | Natural-language description used by the recommendation engine to match the agent to incoming tasks. Should be specific and start with a trigger phrase like "Use this agent when…". |
| `tools` | CSV | Comma-separated list of Claude Code tools the agent is allowed to use. |
| `model` | enum | Model tier. `sonnet` for most tasks; `opus` for security/review work that benefits from deeper reasoning; `haiku` for lightweight tasks. |

### Body (System Prompt)

After the frontmatter, the file contains the full system prompt for the agent. Conventions include:

1. **Role statement** — A one-paragraph description of who the agent is.
2. **On-invoke checklist** — Numbered steps the agent executes when first called (e.g., "Query context manager", "Review requirements", …).
3. **Domain checklist** — Quality gates specific to the specialization (e.g., "Code coverage > 80%").
4. **Capability sections** — Structured lists covering the agent's areas of expertise.
5. **Communication Protocol** — JSON payloads the agent sends to the context manager for context retrieval.
6. **Development Workflow** — The three-phase execution model: planning, implementation, delivery.
7. **Integration with other agents** — Which peer agents this specialist collaborates with.

---

## All 19 Agent Specializations

| Agent | Model | Description |
|---|---|---|
| `api-designer` | sonnet | Designs REST/GraphQL APIs, OpenAPI specs, auth patterns, and versioning strategies. Invoke when creating or refactoring API architecture. |
| `backend-developer` | sonnet | Builds server-side APIs and microservices in Node.js 18+, Python 3.11+, and Go 1.21+. Focuses on scalability, security, and production-readiness. |
| `code-reviewer` | opus | Conducts comprehensive code reviews covering quality, security, performance, and maintainability. Provides actionable, constructive feedback with metrics. |
| `data-engineer` | sonnet | Builds ETL/ELT pipelines, data models, and data warehouses. Expert in SQL optimization, pandas/polars, Spark, and data quality engineering. |
| `debugger` | sonnet | Diagnoses bugs, analyzes stack traces, and identifies root causes. Specializes in systematic problem-solving and preventing recurrence. |
| `devops-engineer` | sonnet | Builds infrastructure automation, CI/CD pipelines, and containerization strategies. Covers IaC, Kubernetes, monitoring, and DevSecOps. |
| `docker-expert` | sonnet | Builds, optimizes, and secures Docker container images for production. Expert in multi-stage builds, image hardening, and CI/CD integration. |
| `frontend-developer` | sonnet | Builds complete frontend applications in React 18+, Vue 3+, and Angular 15+. Focuses on performance, accessibility, and maintainability. |
| `fullstack-developer` | sonnet | Implements end-to-end features spanning database, API, and UI layers as cohesive units. Bridges backend and frontend in a single workflow. |
| `mcp-developer` | sonnet | Builds and debugs Model Context Protocol (MCP) servers and clients that connect AI systems to external tools and data sources. |
| `mobile-developer` | sonnet | Develops mobile applications with React Native, Flutter, Expo, Swift/SwiftUI, and Kotlin/Jetpack Compose. Covers app store compliance and mobile performance. |
| `nextjs-developer` | sonnet | Architects and implements full-stack Next.js 14+ applications using App Router, server components, and edge runtime. Optimizes for Core Web Vitals and SEO. |
| `performance-engineer` | sonnet | Identifies and eliminates performance bottlenecks in applications, databases, and infrastructure. Specializes in profiling, load testing, and optimization. |
| `postgres-pro` | sonnet | Optimizes PostgreSQL performance, designs replication and HA strategies, and solves database issues at scale. Expert in query optimization and backup strategies. |
| `react-specialist` | sonnet | Optimizes existing React 18+ applications, implements advanced patterns, and solves complex state management and architectural challenges. |
| `security-engineer` | opus | Implements comprehensive security solutions, builds automated security controls into CI/CD, and establishes compliance and vulnerability management programs. |
| `test-automator` | sonnet | Builds automated test frameworks, creates test scripts, and integrates testing into CI/CD pipelines. Covers unit, integration, E2E, and performance testing. |
| `typescript-pro` | sonnet | Implements advanced TypeScript type patterns, complex generics, and end-to-end type safety across full-stack applications using TypeScript 5.0+. |
| `ui-designer` | sonnet | Designs visual interfaces, creates design systems, and builds component libraries. Ensures consistency, accessibility (WCAG 2.1 AA), and brand alignment. |

---

## Creating a New Agent

1. **Create the file** at `system/agents/<slug>.md`.

2. **Write the frontmatter**:
   ```yaml
   ---
   name: my-new-agent
   description: "Use this agent when <specific trigger condition>. Invoke for <key capabilities>."
   tools: Read, Write, Edit, Bash, Glob, Grep
   model: sonnet
   ---
   ```

3. **Write the system prompt body**. Follow the established conventions:
   - Open with a one-paragraph role statement: *"You are a senior X with expertise in Y…"*
   - Include an `When invoked:` numbered checklist
   - Add domain-specific quality checklists
   - Define a **Communication Protocol** section with the context manager query payload
   - Add a three-phase **Development Workflow** (planning → implementation → delivery)
   - Close with an **Integration with other agents** bullet list

4. **Choose the model tier**:
   - `sonnet` — default for most specialist work
   - `opus` — use only for tasks requiring deep analysis (security review, code review)
   - `haiku` — lightweight, fast tasks only

5. **Pick a precise description**. The description is the sole input to the recommendation engine. Make it unambiguous: start with "Use this agent when…" and list concrete trigger conditions. Vague descriptions cause misrouting.

---

## How the Recommendation Engine Works

When Claude Code receives a task and must decide which agent to invoke, it reads the `description` field of each agent file and semantically matches it against the task description or user prompt.

**Matching principles:**

- The engine performs fuzzy semantic matching, not keyword lookup. "Building a REST API" will match `api-designer` even without the exact words.
- More specific descriptions win over generic ones. If two descriptions both match, the more specific one is preferred.
- The `description` should name both the **trigger condition** ("Use when designing new APIs…") and **key capabilities** ("REST/GraphQL, OpenAPI, authentication patterns, versioning").
- Descriptions that begin with "Use this agent when…" or "Use when…" are idiomatic and perform best with the engine.

**Team-level routing** (when Agent Teams mode is active): the orchestrator reads all descriptions at the start of each `/orchestrate` call and assigns teammates based on file-ownership rules defined in `system/teams/profiles.md`. See `docs/teams.md` for details.
