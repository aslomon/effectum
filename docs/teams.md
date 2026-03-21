# Agent Teams

## What Are Agent Teams?

Agent Teams is an experimental Claude Code feature that enables **parallel, coordinated execution by multiple specialized agents** — called *teammates* — within a single task. Instead of one agent sequentially handling every layer of a feature, the orchestrator assigns teammates to specific scopes (e.g., frontend, backend, database, testing) and they work concurrently under shared coordination hooks.

Agent Teams is distinct from ad-hoc subagent spawning: teams are declared upfront with explicit file ownership, task dependencies, and role assignments. This prevents conflicts, reduces coordination overhead, and makes large multi-layer features tractable in a single session.

---

## How Team Profiles Work

Team profiles are predefined teammate compositions stored in `system/teams/profiles.md`. Each profile maps a workflow type to a set of teammates, where every teammate has:

- **A role name** — the internal label used in task assignment and logs
- **A responsibility description** — what this teammate owns in the feature
- **An agent specialization** — which agent `.md` file defines the teammate's persona and skills

### Profile format (from `profiles.md`)

```markdown
## profile-name (N Teammates)

Short description of the workflow this profile suits.

| Teammate | Role                        | Agent Specialization |
| -------- | --------------------------- | -------------------- |
| frontend | UI components, pages        | frontend-developer   |
| backend  | API routes, services        | backend-developer    |

**Use when:** <trigger condition>
**File ownership:** <who owns which directories>
```

### File ownership

Every profile declares explicit file ownership to prevent teammates from editing the same files simultaneously (which would cause merge conflicts or inconsistent state):

- `frontend` owns `src/components/`, `src/app/` pages
- `backend` owns `src/lib/`, `src/app/api/`
- `database` owns `supabase/migrations/`
- `testing` owns `tests/`, `*.test.*` files
- `reviewer` is read-only until implementation is complete

---

## Predefined Profiles

### `web-feature` — 3 Teammates

Standard web feature spanning UI and API layers.

| Teammate | Specialization | Owns |
|---|---|---|
| frontend | `frontend-developer` | `src/components/`, `src/app/` pages |
| backend | `backend-developer` | `src/lib/`, `src/app/api/` |
| testing | `test-automator` | `tests/`, `*.test.*` files |

**Use when:** Adding a feature that requires both UI components and API routes.

---

### `fullstack` — 5 Teammates

Complete full-stack feature including schema changes, API, UI, tests, and code review.

| Teammate | Specialization | Owns |
|---|---|---|
| frontend | `frontend-developer` | `src/components/`, `src/app/` pages |
| backend | `backend-developer` | `src/lib/`, `src/app/api/` |
| database | `postgres-pro` | `supabase/migrations/` |
| testing | `test-automator` | `tests/`, `*.test.*` files |
| reviewer | `code-reviewer` + `security-engineer` | Read-only (produces reports) |

**Use when:** New feature requiring database schema changes, API design, and UI in a single coordinated workflow.

**Sequencing note:** The `database` teammate must complete migrations before other teammates begin, since they depend on the generated TypeScript types. The `reviewer` teammate starts only after all implementation teammates have finished.

---

### `frontend-only` — 3 Teammates

Frontend-focused work without backend changes.

| Teammate | Specialization | Owns |
|---|---|---|
| layout | `nextjs-developer` | `src/app/` layouts and pages |
| components | `react-specialist` | `src/components/` |
| content | `frontend-developer` | `messages/`, `public/` |

**Use when:** Building pages, landing sections, or UI-only features with no API or schema changes (e.g., a marketing page, a static section, an i18n update).

---

### `review` — 2 Teammates

Parallel code review and security audit.

| Teammate | Specialization | Owns |
|---|---|---|
| quality | `code-reviewer` | Read-only |
| security | `security-engineer` | Read-only |

**Use when:** Pre-merge review of a large feature branch. Both teammates produce reports rather than code changes.

---

### `custom` — User-defined

When no predefined profile fits the task, specify teammates explicitly:

```
/orchestrate custom "frontend-developer,backend-developer,postgres-pro" "Feature description"
```

---

## When to Use Teams vs. Subagents

| Situation | Use Teams | Use Subagents |
|---|---|---|
| Feature spans multiple technical layers (DB + API + UI) | ✅ | — |
| Parallel work possible with clear file ownership | ✅ | — |
| 3–6 distinct specialists needed simultaneously | ✅ | — |
| Pre-merge review: quality + security in parallel | ✅ | — |
| Single specialist task (e.g., "write tests for this module") | — | ✅ |
| Sequential dependent tasks | — | ✅ |
| Quick delegation to one expert | — | ✅ |
| Exploratory / research task | — | ✅ |
| Only one or two layers involved | — | ✅ |

**Rule of thumb:**
- Use **teams** when the work is genuinely parallel, involves multiple technical domains, and benefits from strict file ownership enforcement.
- Use **subagents** (via the `Task` tool) for focused, sequential, or single-specialist delegation.
- Teams with more than 5–6 teammates introduce coordination overhead that typically outweighs the parallelism benefit.

### Coordination hooks that only apply to teams

The following hooks fire exclusively in Agent Teams mode and have no effect when using plain subagents:

| Hook | Purpose |
|---|---|
| `TeammateIdle` | Fires when a teammate finishes assigned tasks; allows reassignment of unclaimed work |
| `TaskCompleted` | Fires when a teammate marks a task done; logs to team activity log |

---

## How to Activate Agent Teams

Agent Teams is controlled by the `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS` environment variable in `settings.json`.

### Enable Agent Teams

In `.claude/settings.json` (project) or `~/.claude/settings.json` (global):

```json
{
  "env": {
    "CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS": "1"
  }
}
```

### Disable Agent Teams (default)

```json
{
  "env": {
    "CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS": "0"
  }
}
```

The Effectum template ships with `"0"` (disabled) because Agent Teams is experimental. Enable it per project when you want to use `/orchestrate`.

### Invoking a team

Once Agent Teams is enabled, use the `/orchestrate` command:

```
# Use a predefined profile
/orchestrate web-feature "Add user notification preferences page"

# Use the fullstack profile
/orchestrate fullstack "Add subscription billing with Stripe"

# Custom team
/orchestrate custom "nextjs-developer,postgres-pro,test-automator" "Add search with full-text indexing"
```

### Best practices

- **3–5 teammates** is optimal for most workflows. More than 5 creates coordination overhead.
- **5–6 tasks per teammate** is the sweet spot for throughput.
- **Define clear file ownership** in custom teams. Ambiguous ownership leads to conflicts.
- **Database first** — if schema changes are needed, the database teammate must complete before others start (they depend on generated types).
- **Reviewer last** — the reviewer teammate should start after all implementation teammates finish.
- **Use `blocked by:`** in task definitions to declare dependencies explicitly. This prevents a teammate from starting work that depends on incomplete upstream tasks.
