# Project Network Map Guide

The Project Network Map is a living Mermaid diagram that visualizes the entire project architecture: features, modules, data entities, connections, and dependencies. It grows with every PRD and every new insight.

---

## Purpose

The Network Map answers these questions at a glance:

1. **What exists?** — All features, modules, and data entities
2. **How does it connect?** — Dependencies, data flows, API calls, user journeys
3. **What belongs together?** — Bounded contexts, PRD boundaries
4. **What comes first?** — Build order based on dependencies
5. **Where is complexity?** — Nodes with many connections = high risk, plan carefully

---

## Mermaid Syntax Reference

### Basic Graph Structure

```mermaid
graph TB
    %% Direction: TB (top-bottom), LR (left-right)

    %% === NODES ===
    %% Rectangles for features/modules
    AUTH[Authentication]
    TEAMS[Team Management]
    TASKS[Task CRUD]

    %% Rounded for UI components
    AUTH_UI(Login Page)
    DASH_UI(Dashboard)

    %% Cylinders for data/storage
    DB_USERS[(users)]
    DB_TEAMS[(teams)]

    %% Hexagons for external services
    SUPA{{Supabase Auth}}
    EMAIL{{Email Service}}

    %% Stadiums for API endpoints
    API_AUTH([POST /api/auth/login])
    API_TEAMS([GET /api/teams])

    %% === CONNECTIONS ===
    AUTH --> TEAMS
    TEAMS --> TASKS
    AUTH_UI --> API_AUTH
    API_AUTH --> DB_USERS
    SUPA --> AUTH
```

### Styling for Status and PRD Assignment

```mermaid
graph TB
    %% Status colors
    classDef planned fill:#f3f4f6,stroke:#9ca3af,stroke-width:2px,color:#374151
    classDef inProgress fill:#dbeafe,stroke:#3b82f6,stroke-width:2px,color:#1e40af
    classDef done fill:#dcfce7,stroke:#22c55e,stroke-width:2px,color:#166534

    %% PRD colors (use for subgraph borders)
    classDef prd001 fill:#fef3c7,stroke:#f59e0b,stroke-width:2px
    classDef prd002 fill:#e0e7ff,stroke:#6366f1,stroke-width:2px
    classDef prd003 fill:#fce7f3,stroke:#ec4899,stroke-width:2px

    %% Nodes with status
    AUTH[Authentication]:::done
    TEAMS[Team Management]:::inProgress
    BILLING[Billing]:::planned

    %% PRD grouping via subgraphs
    subgraph PRD-001 [PRD-001: Auth & Users]
        AUTH
        PROFILES[User Profiles]
        ROLES[Role Management]
    end

    subgraph PRD-002 [PRD-002: Teams]
        TEAMS
        INVITES[Invitations]
        MEMBERS[Member Management]
    end
```

### Connection Types

```mermaid
graph LR
    %% Solid arrow: direct dependency (A must exist before B)
    A[Auth] --> B[Teams]

    %% Dashed arrow: optional/soft dependency
    C[Dashboard] -.-> D[Analytics]

    %% Thick arrow: data flow
    E[API] ==> F[(Database)]

    %% Labeled connections
    G[Frontend] -->|REST API| H[Backend]
    I[Backend] -->|Realtime| J[WebSocket]

    %% Bidirectional
    K[Service A] <--> L[Service B]
```

---

## Map Evolution Stages

### Stage 1: After Scope Definition (Phase 2)

High-level feature overview. No technical details yet.

```mermaid
graph TB
    subgraph Core
        AUTH[Authentication]
        PROJECTS[Projects]
        TASKS[Tasks]
    end

    subgraph Extended
        NOTIF[Notifications]
        AI[AI Insights]
    end

    AUTH --> PROJECTS
    AUTH --> TASKS
    PROJECTS --> TASKS
    TASKS --> NOTIF
    TASKS --> AI

    classDef planned fill:#f3f4f6,stroke:#9ca3af,stroke-width:2px,color:#374151
    class AUTH,PROJECTS,TASKS,NOTIF,AI planned
```

### Stage 2: After Decomposition (Phase 3)

PRD boundaries and dependencies visible.

```mermaid
graph TB
    subgraph PRD-001 [PRD-001: Auth & Org Setup]
        AUTH[Authentication]
        ORG[Organizations]
        MEMBERS[Member Management]
    end

    subgraph PRD-002 [PRD-002: Projects & Tasks]
        PROJECTS[Projects]
        TASKS[Tasks]
        KANBAN[Kanban Board]
    end

    subgraph PRD-003 [PRD-003: AI Insights]
        SUMMARY[Project Summary]
        RISK[Risk Detection]
    end

    subgraph PRD-004 [PRD-004: Notifications]
        NOTIF_PUSH[Push Notifications]
        NOTIF_EMAIL[Email Digest]
        ACTIVITY[Activity Feed]
    end

    %% Cross-PRD dependencies
    AUTH --> PROJECTS
    AUTH --> MEMBERS
    ORG --> PROJECTS
    PROJECTS --> TASKS
    TASKS --> KANBAN
    TASKS --> SUMMARY
    TASKS --> RISK
    TASKS --> ACTIVITY
    MEMBERS --> NOTIF_PUSH

    %% Build order arrows
    PRD-001 --> PRD-002
    PRD-002 --> PRD-003
    PRD-002 --> PRD-004

    classDef planned fill:#f3f4f6,stroke:#9ca3af,stroke-width:2px,color:#374151
    classDef inProgress fill:#dbeafe,stroke:#3b82f6,stroke-width:2px,color:#1e40af
    classDef done fill:#dcfce7,stroke:#22c55e,stroke-width:2px,color:#166534

    class AUTH,ORG,MEMBERS done
    class PROJECTS,TASKS,KANBAN inProgress
    class SUMMARY,RISK,NOTIF_PUSH,NOTIF_EMAIL,ACTIVITY planned
```

### Stage 3: After PRD Details (Phase 5)

Full technical detail: data entities, API endpoints, UI components.

```mermaid
graph TB
    subgraph PRD-001 [PRD-001: Auth & Org Setup]
        direction TB

        subgraph AUTH_UI [UI Layer]
            LOGIN(Login Page)
            REGISTER(Register Page)
            SETTINGS(Org Settings)
        end

        subgraph AUTH_API [API Layer]
            API_LOGIN([POST /api/auth/login])
            API_REGISTER([POST /api/auth/register])
            API_INVITE([POST /api/invitations])
        end

        subgraph AUTH_DATA [Data Layer]
            DB_USERS[(users)]
            DB_ORGS[(organizations)]
            DB_MEMBERS[(memberships)]
            DB_INVITES[(invitations)]
        end

        subgraph AUTH_EXT [External]
            SUPA_AUTH{{Supabase Auth}}
            EMAIL_SVC{{Email Service}}
        end

        LOGIN --> API_LOGIN
        REGISTER --> API_REGISTER
        SETTINGS --> API_INVITE
        API_LOGIN --> DB_USERS
        API_LOGIN --> SUPA_AUTH
        API_REGISTER --> DB_USERS
        API_REGISTER --> DB_ORGS
        API_INVITE --> DB_INVITES
        API_INVITE --> EMAIL_SVC
        DB_USERS --> DB_MEMBERS
        DB_ORGS --> DB_MEMBERS
    end

    subgraph PRD-002 [PRD-002: Projects & Tasks]
        direction TB
        PROJ_LIST(Project List)
        TASK_BOARD(Kanban Board)
        API_PROJ([CRUD /api/projects])
        API_TASKS([CRUD /api/tasks])
        DB_PROJ[(projects)]
        DB_TASKS[(tasks)]

        PROJ_LIST --> API_PROJ
        TASK_BOARD --> API_TASKS
        API_PROJ --> DB_PROJ
        API_TASKS --> DB_TASKS
        DB_PROJ --> DB_TASKS
    end

    %% Cross-PRD connections
    DB_USERS -.->|created_by| DB_PROJ
    DB_MEMBERS -.->|assignee| DB_TASKS
    DB_ORGS -.->|org_id| DB_PROJ

    classDef done fill:#dcfce7,stroke:#22c55e,stroke-width:2px,color:#166534
    classDef inProgress fill:#dbeafe,stroke:#3b82f6,stroke-width:2px,color:#1e40af

    class LOGIN,REGISTER,SETTINGS,API_LOGIN,API_REGISTER,API_INVITE,DB_USERS,DB_ORGS,DB_MEMBERS,DB_INVITES,SUPA_AUTH,EMAIL_SVC done
    class PROJ_LIST,TASK_BOARD,API_PROJ,API_TASKS,DB_PROJ,DB_TASKS inProgress
```

---

## Node Type Conventions

| Shape     | Mermaid Syntax | Represents               | Example                 |
| --------- | -------------- | ------------------------ | ----------------------- |
| Rectangle | `A[text]`      | Feature / Module         | `AUTH[Authentication]`  |
| Rounded   | `A(text)`      | UI Component / Page      | `LOGIN(Login Page)`     |
| Cylinder  | `A[(text)]`    | Database Table / Storage | `DB_USERS[(users)]`     |
| Hexagon   | `A{{text}}`    | External Service         | `SUPA{{Supabase Auth}}` |
| Stadium   | `A([text])`    | API Endpoint             | `API([POST /api/auth])` |
| Diamond   | `A{text}`      | Decision Point           | `CHECK{Has Account?}`   |
| Circle    | `A((text))`    | Event / Trigger          | `EVT((user.created))`   |

## Connection Type Conventions

| Style         | Mermaid Syntax    | Represents                              |
| ------------- | ----------------- | --------------------------------------- |
| Solid arrow   | `A --> B`         | Hard dependency (A must exist before B) |
| Dashed arrow  | `A -.-> B`        | Soft/optional dependency                |
| Thick arrow   | `A ==> B`         | Primary data flow                       |
| Labeled       | `A --\|label\| B` | Specific relationship type              |
| Bidirectional | `A <--> B`        | Two-way communication                   |

## Color Conventions

| Color           | Class        | Meaning                   |
| --------------- | ------------ | ------------------------- |
| Gray (#f3f4f6)  | `planned`    | Not yet started           |
| Blue (#dbeafe)  | `inProgress` | Currently being developed |
| Green (#dcfce7) | `done`       | Implemented and verified  |
| Yellow border   | —            | PRD-001 subgraph          |
| Indigo border   | —            | PRD-002 subgraph          |
| Pink border     | —            | PRD-003 subgraph          |

---

## Best Practices

1. **Start simple, grow complex** — Stage 1 maps have 5-10 nodes. Stage 3 maps have 30-50. Never start at Stage 3.
2. **Update after every PRD** — The map should always reflect the latest understanding.
3. **Use subgraphs for PRD boundaries** — Makes it instantly clear which PRD owns what.
4. **Cross-PRD connections are critical** — These are the integration points that need the most attention.
5. **Status colors = progress tracking** — Flip nodes from planned → inProgress → done as work progresses.
6. **Direction matters** — Use `TB` (top-bottom) for hierarchical views, `LR` (left-right) for flow/sequence views.
7. **Keep labels short** — Node labels should be 1-3 words. Use the PRD for details.
8. **Highlight complexity** — If a node has 5+ connections, it is a complexity hotspot. Call it out.

---

## Example: Complete Map for a SaaS MVP

```mermaid
graph TB
    subgraph PRD-001 [PRD-001: Auth]
        AUTH[Authentication]:::done
        PROFILES[User Profiles]:::done
        ORGS[Organizations]:::done
        INVITES[Invitations]:::inProgress
    end

    subgraph PRD-002 [PRD-002: Core Product]
        PROJECTS[Projects]:::planned
        TASKS[Task Management]:::planned
        KANBAN(Kanban Board):::planned
        TIMELINE(Timeline View):::planned
    end

    subgraph PRD-003 [PRD-003: AI Layer]
        AI_SUMMARY[Project Summary]:::planned
        AI_RISK[Risk Detection]:::planned
        AI_SUGGEST[Task Suggestions]:::planned
    end

    subgraph PRD-004 [PRD-004: Notifications]
        NOTIF_PUSH[Push]:::planned
        NOTIF_EMAIL[Email Digest]:::planned
        FEED(Activity Feed):::planned
    end

    subgraph Data [Shared Data Layer]
        DB_USERS[(users)]:::done
        DB_ORGS[(organizations)]:::done
        DB_PROJECTS[(projects)]:::planned
        DB_TASKS[(tasks)]:::planned
    end

    subgraph External [External Services]
        SUPA{{Supabase}}
        CLAUDE_API{{Claude API}}
        RESEND{{Email Provider}}
    end

    %% Auth dependencies
    AUTH --> PROFILES
    AUTH --> ORGS
    ORGS --> INVITES
    INVITES --> RESEND

    %% Core dependencies
    ORGS --> PROJECTS
    PROJECTS --> TASKS
    TASKS --> KANBAN
    TASKS --> TIMELINE

    %% AI dependencies
    TASKS ==> AI_SUMMARY
    TASKS ==> AI_RISK
    AI_RISK --> AI_SUGGEST
    AI_SUMMARY --> CLAUDE_API
    AI_RISK --> CLAUDE_API

    %% Notification dependencies
    TASKS -.-> NOTIF_PUSH
    TASKS -.-> FEED
    AI_RISK -.-> NOTIF_EMAIL

    %% Data layer
    AUTH --> DB_USERS
    ORGS --> DB_ORGS
    PROJECTS --> DB_PROJECTS
    TASKS --> DB_TASKS
    DB_USERS -.-> DB_PROJECTS
    DB_ORGS -.-> DB_PROJECTS
    DB_PROJECTS --> DB_TASKS

    %% Supabase
    DB_USERS --> SUPA
    DB_ORGS --> SUPA
    DB_PROJECTS --> SUPA
    DB_TASKS --> SUPA

    classDef planned fill:#f3f4f6,stroke:#9ca3af,stroke-width:2px,color:#374151
    classDef inProgress fill:#dbeafe,stroke:#3b82f6,stroke-width:2px,color:#1e40af
    classDef done fill:#dcfce7,stroke:#22c55e,stroke-width:2px,color:#166534
```

This map shows at a glance:

- PRD-001 is mostly done (green), with Invitations still in progress (blue)
- PRD-002, 003, 004 are planned (gray)
- The Tasks node is a complexity hotspot (5+ connections)
- Claude API is only needed by PRD-003 (AI Layer)
- Build order: Auth → Core → AI + Notifications (parallel)

---

## Auto-Sync Behavior

The network map is automatically updated by several workflow commands. You rarely need to edit it manually.

### When Auto-Sync Happens

| Trigger                 | What Changes                                                       | Command                       |
| ----------------------- | ------------------------------------------------------------------ | ----------------------------- |
| PRD created             | New feature nodes added with `:::planned`, grouped in PRD subgraph | `/prd:new`                    |
| PRD updated             | New nodes added, removed nodes deleted, connections updated        | `/prd:update`                 |
| Implementation starts   | Feature node flips from `:::planned` to `:::inProgress`            | Ralph Loop                    |
| Implementation complete | Feature node flips from `:::inProgress` to `:::done`               | Ralph Loop                    |
| Validation requested    | No changes — reports issues found                                  | `/prd:network-map --validate` |

### Frontmatter-Driven Generation

When PRDs have YAML frontmatter (the default since v0.6), the network map is generated deterministically from frontmatter data:

1. **Nodes** come from `features[]` across all PRDs in the project.
2. **Edges** come from `connections[]` across all PRDs.
3. **Subgraph boundaries** come from PRD `id` groupings.
4. **Cross-PRD edges** come from `depends_on[]`.
5. **Status colors** come from feature `status` field.

This means: if you update the frontmatter, the map updates automatically on the next `/prd:network-map` or `/prd:update` run. You don't need to manually edit the `.mmd` file.

### Validation

Run `/prd:network-map {slug} --validate` to check for:

- **Circular dependencies** between features or PRDs
- **Isolated nodes** with no connections (possible missing relationships)
- **Orphaned references** in connections that point to non-existent features
- **Status mismatches** between frontmatter and task registry
- **Completeness** — all frontmatter features present in the map

---

## Mermaid Syntax Safety Rules (MANDATORY)

When generating any Mermaid diagram, ALWAYS follow these rules to prevent parser errors:

### 1. Quote Labels with Special Characters
Labels containing `/`, `&`, `<`, `>`, `(`, `)`, `#`, or `@` MUST be wrapped in double quotes:

```mermaid
%% WRONG — will cause parse error:
DOCS_HOME[/docs/getting-started]:::done

%% CORRECT:
DOCS_HOME["/docs/getting-started"]:::done
```

### 2. Node IDs: Alphanumeric + Underscore Only
Node IDs must contain only letters, numbers, and underscores. No dots, slashes, hyphens, or spaces:

```mermaid
%% WRONG:
docs-home[Label]
api.users[Label]

%% CORRECT:
DOCS_HOME[Label]
API_USERS[Label]
```

### 3. Edge Labels with Special Characters
Edge labels containing special characters must also be quoted:

```mermaid
%% WRONG:
A -->|POST /api/users| B

%% CORRECT:
A -->|"POST /api/users"| B
```

### 4. Subgraph Names
Subgraph names can contain spaces but avoid special characters:

```mermaid
%% CORRECT:
subgraph PRD-001 [PRD-001: Authentication System]
```

### 5. Validate Before Writing
Before writing any `.mmd` file, mentally check: would this parse on mermaid.live without errors? If unsure, quote all labels.

**Rule of thumb: When in doubt, quote it.**
