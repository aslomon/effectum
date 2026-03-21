# Recommendation Engine

> `bin/lib/recommendation.js`

The Effectum Recommendation Engine derives a complete Claude Code setup from five user-supplied inputs. It is a purely rules-based, deterministic system — no ML, no heuristics that depend on runtime state. Given the same inputs, it always produces the same outputs.

---

## Overview

```
Inputs ──► extractTags() ──► tags[] ──► recommend*() ──────► Output
  stack                                   recommendCommands()  commands[]
  appType                                 recommendHooks()     hooks[]
  description                             recommendSkills()    skills[]
  autonomyLevel   (passed through)        recommendMcps()      mcps[]
  language        (passed through)        recommendSubagents() subagents[]
                                                               agentTeams
                                                               tags[]
```

The engine **does not** consume `autonomyLevel` or `language` during tag extraction or recommendation rule matching. Those inputs are used downstream by the template engine and config writer, respectively.

---

## Inputs

| Field | Type | Example |
|---|---|---|
| `stack` | `string` (enum key) | `"nextjs-supabase"` |
| `appType` | `string` (enum key) | `"web-app"` |
| `description` | `string` (free text) | `"A CRM with Stripe payments and realtime chat"` |
| `autonomyLevel` | `string` (enum key) | `"standard"` |
| `language` | `string` (enum key or `"custom"`) | `"german"` |

Valid values for each enum are defined in:

- **stack** → `STACK_CHOICES` in `constants.js`: `nextjs-supabase`, `python-fastapi`, `swift-ios`, `generic`
- **appType** → `APP_TYPE_CHOICES` in `app-types.js`: `web-app`, `api-backend`, `mobile-app`, `desktop-app`, `cli-tool`, `automation-agent`, `data-ml`, `library-sdk`, `other`
- **autonomyLevel** → `AUTONOMY_CHOICES` in `constants.js`: `conservative`, `standard`, `full`
- **language** → `LANGUAGE_CHOICES` in `languages.js`: `english`, `german`, `french`, …, `custom`

---

## Tag Extraction

`extractTags({ appType, stack, description })` produces a deduplicated array of intent tags from three independent sources:

### 1. App-Type Tags (`APP_TYPE_TAGS` in `app-types.js`)

Each app type carries a fixed set of implicit tags:

| App Type | Implicit Tags |
|---|---|
| `web-app` | `frontend-heavy`, `auth-needed`, `db-needed`, `multi-user`, `ui-design` |
| `api-backend` | `api-first`, `db-needed`, `auth-needed`, `backend-heavy`, `docs-needed` |
| `mobile-app` | `frontend-heavy`, `native-ui`, `offline-capable`, `ui-design` |
| `desktop-app` | `frontend-heavy`, `native-ui`, `local-storage`, `ui-design` |
| `cli-tool` | `terminal-ui`, `scripting`, `no-frontend`, `docs-needed` |
| `automation-agent` | `ai-agent`, `automation`, `api-first`, `background-jobs` |
| `data-ml` | `data-pipeline`, `analytics`, `backend-heavy`, `compute-heavy`, `docs-needed` |
| `library-sdk` | `api-design`, `testing-heavy`, `docs-needed`, `no-frontend` |
| `other` | *(none)* |

### 2. Stack Tags (`STACK_TAGS` in `recommendation.js`)

Each stack preset adds technology-specific tags:

| Stack | Tags Added |
|---|---|
| `nextjs-supabase` | `nextjs`, `react`, `supabase`, `typescript`, `frontend-heavy`, `db-needed`, `postgres` |
| `python-fastapi` | `python`, `api-first`, `backend-heavy` |
| `swift-ios` | `swift`, `native-ui`, `frontend-heavy` |
| `generic` | *(none)* |

### 3. Description Keyword Tags (`KEYWORD_TAG_MAP` in `recommendation.js`)

The description is lowercased and scanned for substring matches. Every matched keyword injects its associated tags. Selected examples:

| Keyword | Tags Injected |
|---|---|
| `crm` | `crm`, `internal-tool`, `auth-needed`, `db-needed`, `multi-user` |
| `dashboard` | `dashboard`, `frontend-heavy`, `data-visualization` |
| `saas` | `multi-user`, `auth-needed`, `db-needed`, `payments`, `multi-tenant` |
| `stripe` / `payment` | `payments`, `auth-needed` |
| `chat` | `realtime`, `websocket`, `multi-user` |
| `ai` / `agent` / `llm` | `ai-agent` |
| `supabase` | `supabase`, `db-needed` |
| `graphql` | `api-first`, `graphql` |
| `e2e` | `testing-heavy`, `e2e` |
| `docker` / `kubernetes` | `devops`, `automation` |
| `mcp` | `mcp`, `ai-agent` |
| `upload` / `image` / `file` | `storage`, `file-handling` |

See the full `KEYWORD_TAG_MAP` in `recommendation.js` for all ~60+ keyword entries.

All three tag sets are merged into a single `Set<string>`, then spread to a plain array. Duplicates are automatically eliminated.

---

## Mapping Tags to Components

### Commands (`recommendCommands`)

Commands are matched from `COMMAND_RULES`. A command is included when `r.always === true` **or** when any of its `r.tags` appears in the tag set.

All nine core commands carry `always: true` and are therefore **always** recommended regardless of inputs:

| Command | Key |
|---|---|
| `/plan` | `plan` |
| `/tdd` | `tdd` |
| `/verify` | `verify` |
| `/code-review` | `code-review` |
| `/build-fix` | `build-fix` |
| `/refactor-clean` | `refactor-clean` |
| `/e2e` | `e2e` |
| `/ralph-loop` | `ralph-loop` |
| `/checkpoint` | `checkpoint` |

Tag-conditional commands:

| Command | Trigger Tags |
|---|---|
| `/update-docs` | `docs-needed` |
| `/test-coverage` | `testing-heavy` |
| `/simplify` | `backend-heavy` or `frontend-heavy` |

### Hooks (`recommendHooks`)

All five hooks defined in `HOOK_RULES` carry `always: true`:

| Hook | Key |
|---|---|
| Commit Message Gate | `commit-gate` |
| CHANGELOG Auto-Update | `changelog-update` |
| Completion Verifier | `completion-verifier` |
| Subagent Quality Gate | `subagent-verifier` |
| Desktop Notifications | `desktop-notifications` |

These are **optional** hooks added on top of the Foundation. See `foundation-model.md` for the always-active Foundation hooks that users cannot deselect.

### Skills (`recommendSkills`)

Skills are included when **either** a tag matches **or** the stack appears in `mandatoryForStacks`:

| Skill | Trigger Tags | Mandatory For Stacks |
|---|---|---|
| Frontend Design | `frontend-heavy`, `ui-design` | `nextjs-supabase` |
| Security Check | `auth-needed`, `multi-user`, `payments`, `security` | — |
| Web App Testing | `frontend-heavy`, `e2e` | `nextjs-supabase` |
| Doc Co-Authoring | `docs-needed` | — |
| Claude API | `ai-agent` | — |
| MCP Builder | `mcp`, `ai-agent` | — |

`mandatoryForStacks` ensures that skills critical to a stack are always included even if the description doesn't hint at them.

### MCP Servers (`recommendMcps`)

MCP servers are matched from `MCP_RULES`. A server must have a matching entry in `MCP_SERVERS` (defined in `constants.js`) to be included in the output.

| MCP Server | Always? | Trigger Tags |
|---|---|---|
| `context7` | ✅ | — |
| `playwright` | ✅ | — |
| `sequential-thinking` | ✅ | — |
| `filesystem` | ❌ | `file-handling`, `storage` |

### Subagents (`recommendSubagents`)

Subagent selection has two independent inputs:

1. **Stack base set** (`STACK_SUBAGENTS` in `specializations.js`): always included for the given stack.
2. **Tag-based additions** (`SUBAGENT_SPECS` in `specializations.js`): added when any of the spec's `tags` appears in the tag set.

Results are merged into a `Set` to eliminate duplicates.

**Stack base sets:**

| Stack | Always-included Subagents |
|---|---|
| `nextjs-supabase` | `frontend-developer`, `backend-developer`, `postgres-pro`, `security-engineer`, `test-automator` |
| `python-fastapi` | `backend-developer`, `debugger`, `security-engineer`, `test-automator`, `api-designer` |
| `swift-ios` | `ui-designer`, `test-automator`, `mobile-developer` |
| `generic` | `debugger`, `test-automator` |

**Tag-conditional subagents (selected examples):**

| Subagent | Trigger Tags |
|---|---|
| `frontend-developer` | `frontend-heavy`, `ui-design` |
| `backend-developer` | `backend-heavy`, `api-first`, `db-needed` |
| `fullstack-developer` | `frontend-heavy`, `db-needed` |
| `react-specialist` | `nextjs`, `react` |
| `postgres-pro` | `db-needed`, `supabase`, `postgres` |
| `security-engineer` | `auth-needed`, `multi-user`, `payments` |
| `devops-engineer` | `automation`, `background-jobs`, `devops` |
| `mcp-developer` | `ai-agent`, `mcp` |
| `data-engineer` | `data-pipeline`, `compute-heavy`, `analytics` |

---

## Worked Example: Next.js + Web App + CRM

**Inputs:**
```
stack:       nextjs-supabase
appType:     web-app
description: "A CRM with Stripe payments and realtime chat"
```

**Tag extraction:**

| Source | Tags Added |
|---|---|
| App-type (`web-app`) | `frontend-heavy`, `auth-needed`, `db-needed`, `multi-user`, `ui-design` |
| Stack (`nextjs-supabase`) | `nextjs`, `react`, `supabase`, `typescript`, `frontend-heavy`, `db-needed`, `postgres` |
| Keyword `crm` | `crm`, `internal-tool`, `auth-needed`, `db-needed`, `multi-user` |
| Keyword `stripe` | `payments`, `auth-needed` |
| Keyword `realtime` | `realtime`, `websocket` |
| Keyword `chat` | `realtime`, `websocket`, `multi-user` |

**Final tag set** (deduplicated):
`frontend-heavy`, `auth-needed`, `db-needed`, `multi-user`, `ui-design`, `nextjs`, `react`, `supabase`, `typescript`, `postgres`, `crm`, `internal-tool`, `payments`, `realtime`, `websocket`

**Recommendations produced:**

- **Commands:** all 9 core + `/simplify` (from `frontend-heavy`) = 10 commands
- **Hooks:** all 5 (all `always: true`)
- **Skills:** `frontend-design` (`frontend-heavy` + mandatory for stack), `security-check` (`auth-needed`, `payments`), `webapp-testing` (`frontend-heavy` + mandatory for stack)
- **MCPs:** `context7`, `playwright`, `sequential-thinking` (all `always`)
- **Subagents:** `frontend-developer`, `backend-developer`, `postgres-pro`, `security-engineer`, `test-automator` (stack base) + `fullstack-developer` (`frontend-heavy`, `db-needed`), `react-specialist` (`nextjs`, `react`) = 7 subagents (after dedup)

---

## Adding New Rules

### New keyword → tags

Edit `KEYWORD_TAG_MAP` in `recommendation.js`:

```js
const KEYWORD_TAG_MAP = {
  // existing entries …
  "vector-db": ["vector-search", "ai-agent", "db-needed"],
  pinecone:    ["vector-search", "ai-agent", "db-needed"],
};
```

### New tag → command

Add an entry to `COMMAND_RULES`:

```js
{ key: "db-migrate", label: "/db-migrate", tags: ["db-needed"] },
```

### New tag → skill

Add an entry to `SKILL_RULES`. Set `mandatoryForStacks` if the skill must always activate for a specific stack:

```js
{
  key: "i18n-checker",
  label: "i18n Checker",
  tags: ["multi-language"],
  mandatoryForStacks: ["nextjs-supabase"],
},
```

### New tag → MCP server

1. Add the server definition to `MCP_SERVERS` in `constants.js`.
2. Add a rule to `MCP_RULES` in `recommendation.js`:

```js
{ key: "my-mcp", tags: ["vector-search"] },
```

### New tag → subagent

Add an entry to `SUBAGENT_SPECS` in `specializations.js`:

```js
{
  key: "vector-search-engineer",
  label: "Vector Search Engineer",
  tags: ["vector-search"],
},
```

### New stack → subagent base set

Add a key to `STACK_SUBAGENTS` in `specializations.js`:

```js
"python-django": [
  "backend-developer",
  "fullstack-developer",
  "postgres-pro",
  "security-engineer",
  "test-automator",
],
```

### New app-type tag set

Add a key to `APP_TYPE_TAGS` in `app-types.js` and a matching entry to `APP_TYPE_CHOICES`:

```js
// app-types.js
const APP_TYPE_TAGS = {
  // …
  "browser-extension": ["frontend-heavy", "scripting", "no-backend"],
};

const APP_TYPE_CHOICES = [
  // …
  { value: "browser-extension", label: "Browser Extension", hint: "Chrome/Firefox extension" },
];
```

---

## Catalog Accessors

The engine exports helper functions for manual/customize mode (used by the CLI's interactive picker):

| Function | Returns |
|---|---|
| `getAllCommands()` | `{ key, label }[]` — all defined commands |
| `getAllHooks()` | `{ key, label }[]` — all optional hooks |
| `getAllSkills()` | `{ key, label }[]` — all skills |
| `getAllMcps()` | `{ key, label, desc }[]` — all MCP servers |
| `getAllSubagents()` | `{ key, label }[]` — all subagent specs |

These always reflect the complete catalog regardless of any tag set.
