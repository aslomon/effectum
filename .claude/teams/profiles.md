# Agent Team Profiles

Predefined team compositions for `/orchestrate` in Agent Teams mode.
Each profile maps workflow types to specialized teammates.

## web-feature (3 Teammates)

Standard web feature with frontend, backend, and tests.

| Teammate | Role                                      | Agent Specialization |
| -------- | ----------------------------------------- | -------------------- |
| frontend | UI components, pages, styling, responsive | frontend-developer   |
| backend  | API routes, services, data layer          | backend-developer    |
| testing  | Unit + integration + E2E tests            | test-automator       |

**Use when:** Adding a feature that spans UI and API layers.
**File ownership:** frontend owns `src/components/`, `src/app/` pages. Backend owns `src/lib/`, `src/app/api/`. Testing owns `tests/`, `*.test.*` files.

## fullstack (5 Teammates)

Full-stack feature with DB, API, UI, tests, and review.

| Teammate | Role                                      | Agent Specialization             |
| -------- | ----------------------------------------- | -------------------------------- |
| frontend | UI components, pages                      | frontend-developer               |
| backend  | API routes, services                      | backend-developer                |
| database | Migrations, RLS policies, type generation | postgres-pro                     |
| testing  | All test layers                           | test-automator                   |
| reviewer | Code review + security audit              | code-reviewer, security-engineer |

**Use when:** New feature requiring schema changes, API, and UI.
**File ownership:** Database owns `supabase/migrations/`. Reviewer works read-only until implementation phase complete.

## frontend-only (3 Teammates)

Frontend-focused work — layout, components, content.

| Teammate   | Role                                               | Agent Specialization |
| ---------- | -------------------------------------------------- | -------------------- |
| layout     | Page structure, routing, layouts, navigation       | nextjs-developer     |
| components | UI components, forms, modals, interactive elements | react-specialist     |
| content    | i18n translations, content, assets, accessibility  | frontend-developer   |

**Use when:** Building pages/UI without backend changes (e.g., landing page, static site).
**File ownership:** Layout owns `src/app/` layouts and pages. Components owns `src/components/`. Content owns `messages/`, `public/`.

## review (2 Teammates)

Parallel code review and security audit.

| Teammate | Role                                       | Agent Specialization |
| -------- | ------------------------------------------ | -------------------- |
| quality  | Code quality, best practices, performance  | code-reviewer        |
| security | Security vulnerabilities, auth, RLS, OWASP | security-engineer    |

**Use when:** Pre-merge review of a large feature branch.
**File ownership:** Both read-only — produce reports, not code changes.

## custom

User-defined team composition.

```
/orchestrate custom "frontend-developer,backend-developer,postgres-pro" "Feature description"
```

**Use when:** No predefined profile fits the task.

## Best Practices

- **3-5 Teammates** for most workflows — more creates coordination overhead
- **5-6 Tasks per Teammate** for optimal throughput
- **Clear file ownership** — avoid two Teammates editing the same file
- **Database first** — if schema changes needed, database Teammate completes before others start
- **Reviewer last** — reviewer Teammate starts after implementation Teammates finish
- **Use dependencies** — `blocked by:` in tasks.md prevents premature work
