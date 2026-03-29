# Agent Teams

## 1. Overview

Agent Teams let multiple Claude Code instances collaborate on the same project in parallel. Instead of a single session switching between frontend, backend, tests, and review, each teammate specializes in one domain and operates within defined file ownership boundaries.

**When Effectum recommends each execution tier:**

| Tier               | When to Use                                                                                                                                   |
| ------------------ | --------------------------------------------------------------------------------------------------------------------------------------------- |
| **Single Session** | ≤5 ACs, sequential dependencies, single domain                                                                                                |
| **Subagents**      | 4–9 independent ACs within one domain — focused parallel tasks where coordination overhead would exceed the benefit of peer-to-peer messaging |
| **Agent Teams**    | ≥10 ACs spanning ≥2 file domains — complex, cross-cutting features where parallelism is safe and specialization improves quality              |

Agent Teams cost 3–4× more than subagents. Use them when coordination complexity justifies the premium — typically fullstack features with schema migrations, new API surfaces, multi-component UI, and cross-cutting concerns like security.

---

## 2. Prerequisites

1. **Claude Code version**: ≥ v2.1.32 (Agent Teams shipped experimentally with Opus 4.6, March 2026).

2. **Feature flag**: Agent Teams are disabled by default. Enable in `.claude/settings.json`:

   ```json
   {
     "env": {
       "CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS": "1"
     }
   }
   ```

   Without this flag, all `/effect:dev:orchestrate` commands will fail with:

   > Error: Agent Teams is not enabled. Set CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1 in .claude/settings.json env to activate.

3. **Plan-first requirement**: An approved plan must exist before team creation. Run `/effect:dev:plan` first, then `/effect:dev:orchestrate`. You can skip this with `--plan-first=false` (not recommended).

---

## 3. Quick Start

**Step 1** — Create a plan:

```
/effect:dev:plan Add a shopping cart feature: users can add items, view cart, and checkout.
```

Review and approve the plan.

**Step 2** — Launch a team:

```
/effect:dev:orchestrate web-feature
```

The command prints a cost estimate and asks for confirmation before spawning teammates.

**Step 3** — Monitor and verify:
The lead distributes tasks from the PRD, coordinates phases, and runs `/effect:dev:verify` when all teammates complete. Hook scripts validate task completion and test coverage automatically.

---

## 4. Available Profiles

Team profiles live in `system/teams/*.yaml`. Four profiles are included:

### `web-feature` — 3 Teammates

Standard web feature with frontend, backend, and tests.

| Teammate | Agent                | Role                                                  | File Ownership                                                    |
| -------- | -------------------- | ----------------------------------------------------- | ----------------------------------------------------------------- |
| frontend | `frontend-developer` | UI components, pages, styling, responsive design      | `src/components/`, `src/app/**/page.tsx`, `src/app/**/layout.tsx` |
| backend  | `backend-developer`  | API routes, services, data layer, database migrations | `src/lib/`, `src/app/api/`, `supabase/`                           |
| testing  | `test-automator`     | Unit tests, integration tests, E2E tests              | `tests/`, `e2e/`, `**/*.test.*`                                   |

**Phases:** Database + Types → API + UI (parallel) → Tests

**Use cases:** Adding a new page with API backing, CRUD features, form flows with backend validation.

### `fullstack` — 5 Teammates

Complete full-stack feature with DB, API, UI, tests, and code review.

| Teammate | Agent                | Role                                                 | File Ownership                                                    |
| -------- | -------------------- | ---------------------------------------------------- | ----------------------------------------------------------------- |
| frontend | `frontend-developer` | UI components, pages, styling                        | `src/components/`, `src/app/**/page.tsx`, `src/app/**/layout.tsx` |
| backend  | `backend-developer`  | API routes, services, business logic                 | `src/lib/`, `src/app/api/`                                        |
| database | `postgres-pro`       | Migrations, RLS policies, type generation, seed data | `supabase/migrations/`, `supabase/seed.sql`                       |
| testing  | `test-automator`     | Unit tests, integration tests, E2E tests             | `tests/`, `e2e/`, `**/*.test.*`                                   |
| reviewer | `code-reviewer`      | Code quality review, security audit (read-only)      | —                                                                 |

**Phases:** Database + Types → API + UI (parallel) → Tests → Review

**Use cases:** Multi-layer features with schema changes, notification systems, billing integrations, any feature touching database + API + UI.

### `frontend-only` — 3 Teammates

Frontend-focused work with no backend changes.

| Teammate   | Agent                | Role                                               | File Ownership                                                                                   |
| ---------- | -------------------- | -------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| layout     | `nextjs-developer`   | Page structure, routing, layouts, navigation       | `src/app/**/layout.tsx`, `src/app/**/page.tsx`, `src/app/**/loading.tsx`, `src/app/**/error.tsx` |
| components | `react-specialist`   | UI components, forms, modals, interactive elements | `src/components/`, `src/hooks/`                                                                  |
| content    | `frontend-developer` | i18n, content, assets, accessibility               | `messages/`, `public/`, `src/styles/`                                                            |

**Phases:** Layout + Components (parallel) → Content + Polish

**Use cases:** Landing pages, design system overhauls, dashboard redesigns, accessibility audits with remediation.

### `review` — 2 Teammates

Parallel code review and security audit. Read-only — produces reports, not code changes.

| Teammate | Agent               | Role                                                       | File Ownership |
| -------- | ------------------- | ---------------------------------------------------------- | -------------- |
| quality  | `code-reviewer`     | Code quality, best practices, performance, maintainability | — (read-only)  |
| security | `security-engineer` | Security vulnerabilities, auth, RLS policies, OWASP top 10 | — (read-only)  |

**Phases:** Parallel Review (both teammates run simultaneously)

**Use cases:** Pre-merge audits, periodic security reviews, pre-release quality gates. Invoke with `--plan-first=false` since no implementation plan is needed.

---

## 5. Cost Estimation

### Formula

```
Per-teammate cost per iteration: ~10,000 tokens (Sonnet)
Lead overhead per iteration:     ~5,000 tokens (Opus)
Total tokens = (teammates × iterations × 10,000) + (iterations × 5,000)
```

### Profile Cost Table

| Profile         | Teammates | Min Iter | Max Iter | Min Tokens | Max Tokens | Est. Cost Range |
| --------------- | --------- | -------- | -------- | ---------- | ---------- | --------------- |
| `web-feature`   | 3         | 15       | 40       | 225k       | 600k       | ~$0.45–$1.20    |
| `fullstack`     | 5         | 25       | 60       | 375k       | 900k       | ~$0.75–$1.80    |
| `frontend-only` | 3         | 10       | 30       | 150k       | 450k       | ~$0.30–$0.90    |
| `review`        | 2         | 5        | 15       | 75k        | 225k       | ~$0.15–$0.45    |

Pricing based on Sonnet @ $3/Mtok input, $15/Mtok output; Opus @ $15/Mtok input, $75/Mtok output — blended estimate.

### `--max-cost` Flag

Pass `--max-cost <amount>` to `/effect:dev:orchestrate` to cap spending. The lead warns at 80% of the budget and stops all teammates at 100%.

**Rule of thumb:** Use Agent Teams when the feature involves ≥3 parallel workstreams across different file domains. For anything simpler, subagents or a single session will be faster and cheaper.

---

## 6. Hooks

Two hooks enforce quality during team execution. Both are configured in `.claude/settings.json` by `effectum install`.

### TeammateIdle

Fires when a teammate has no remaining tasks and signals idle. The hook:

1. Checks that all assigned task IDs are marked `DONE` in `tasks.md`.
2. Runs targeted tests for the teammate's `file_ownership` scope.
3. Returns exit `0` if clean (teammate can sleep) or exit `2` with feedback (teammate keeps working).

### TaskCompleted

Fires when a teammate marks a task as completed. The hook:

1. Cross-references the task against the PRD's acceptance criterion.
2. Verifies that at least one `*.test.*` file exists covering the affected files.
3. Returns exit `0` if valid or exit `2` with an actionable rejection message.

### Configuration

```json
{
  "hooks": {
    "TeammateIdle": [
      {
        "matcher": "*",
        "hooks": [
          {
            "type": "command",
            "command": "bash system/hooks/teammate-idle.sh"
          }
        ]
      }
    ],
    "TaskCompleted": [
      {
        "matcher": "*",
        "hooks": [
          {
            "type": "command",
            "command": "bash system/hooks/task-completed.sh"
          }
        ]
      }
    ]
  }
}
```

Hook scripts receive context via environment variables set by Claude Code:

- **TeammateIdle**: `TEAMMATE_NAME`, `TEAMMATE_AGENT`, `ASSIGNED_TASK_IDS`, `TEAMMATE_FILE_SCOPE`
- **TaskCompleted**: `TASK_ID`, `TASK_DESCRIPTION`, `AFFECTED_FILES`

Exit code semantics: `0` = OK, `2` = reject with feedback (message on stdout), `1` = script error (not used for flow control).

---

## 7. Custom Profiles

Create project-local team profiles in `.effectum/teams/{name}.yaml`. These take precedence over system profiles of the same name.

### YAML Schema

```yaml
name: my-custom-team
description: "One-line description of the team"
teammate_count: 3
min_acs: 6
recommended_for:
  app_types: [web-app]
  stacks: [nextjs-supabase]

lead:
  role: "What the lead does"
  instructions: "How the lead should coordinate"

teammates:
  - name: role-name
    agent: agent-definition-name # matches .claude/agents/{name}.md
    role: "What this teammate does"
    file_ownership:
      - "src/path/"
      - "**/*.pattern"
    model_hint: sonnet # sonnet | opus | haiku

phases:
  - name: "Phase Name"
    tasks_for: [role-name]
    quality_gate: "What must be true to proceed"
  - name: "Next Phase"
    tasks_for: [other-role]
    depends_on: ["Phase Name"]
    parallel: false
    quality_gate: "Exit criterion"

cost_estimate:
  min_iterations: 10
  max_iterations: 30
  estimated_tokens: "100k-300k"

hooks:
  TeammateIdle:
    check_tasks_completed: true
    check_tests_passing: true
  TaskCompleted:
    validate_acs_met: true
    validate_tests_exist: true
```

**Key rules:**

- `name` must be lowercase with hyphens, no spaces.
- `teammate_count` must match the length of `teammates[]`.
- `file_ownership` patterns must not overlap between teammates — no two teammates should own the same file path.
- `depends_on` in phases creates blocking dependencies. Phase N tasks are not dispatched until phase N-1's quality gate passes.
- `read_only: true` on a teammate means they produce reports, not code changes.

### Testing a Custom Profile

```bash
claude --print "/effect:dev:orchestrate my-custom-team --dry-run"
```

This prints the cost estimate and validates the profile without creating any team state.

---

## 8. Troubleshooting

### Feature flag not set

**Symptom:** `/effect:dev:orchestrate` prints "Error: Agent Teams is not enabled."

**Fix:** Add `"CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS": "1"` to the `env` block in `.claude/settings.json`. Restart Claude Code.

### No approved plan

**Symptom:** `/effect:dev:orchestrate` prints "Error: No approved plan found."

**Fix:** Run `/effect:dev:plan` first and approve it. Or pass `--plan-first=false` to skip the check (not recommended for implementation work — the plan-first gate prevents wasted tokens).

### Teammate stuck or looping

**Symptom:** A teammate repeats the same action or makes no progress.

**Cause:** The task is too large or ambiguous for a single teammate. Agent Teams work best with concrete, file-scoped tasks.

**Fix:** Break the stuck task into smaller subtasks. The lead can reassign via the task list. If a teammate stops on error, check `.claude/logs/team-activity.log` for the error details.

### File ownership conflict

**Symptom:** Two teammates edit the same file, causing merge conflicts.

**Cause:** Overlapping `file_ownership` patterns in the profile.

**Fix:** Review the profile YAML and ensure file ownership zones are disjoint. Run `--dry-run` to preview task distribution before spawning the team.

### Lead doing implementation work

**Symptom:** The lead writes code instead of delegating to teammates.

**Cause:** The lead's instructions are too vague, or there are ACs with no file ownership match.

**Fix:** Ensure every AC maps to a teammate's file ownership scope. ACs that don't match are assigned to the lead by default — if this happens frequently, adjust file ownership patterns or add a teammate to cover the gap.
