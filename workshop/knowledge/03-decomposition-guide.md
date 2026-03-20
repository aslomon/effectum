# Project Decomposition Guide

When and how to split a large project into multiple PRDs.

---

## When to Split

A project needs multiple PRDs when ANY of these signals are present:

| Signal                    | Threshold                       | Example                                                      |
| ------------------------- | ------------------------------- | ------------------------------------------------------------ |
| Acceptance Criteria count | > 8-10 for v1                   | 15 ACs across auth, billing, and dashboard                   |
| Independent user journeys | 2+ distinct user types          | Admin flow vs. end-user flow                                 |
| Bounded contexts          | 2+ domains with own data        | Auth (users, sessions) vs. Billing (invoices, subscriptions) |
| Phased delivery           | Natural milestones              | "Auth must work before we build teams"                       |
| Team parallelization      | 2+ teams can work independently | Frontend team + backend team + data team                     |
| Context window risk       | PRD > 5 pages of core content   | Agent quality degrades with oversized specs                  |

## When NOT to Split

- Simple CRUD features (even with 6-8 ACs) — keep in one PRD
- Features that share the same data model — splitting creates unnecessary API contracts
- Features that cannot be tested independently — keep together
- "Just in case" splitting — only split when there is a clear benefit

---

## Decomposition Strategies

### 1. Domain-Based (recommended for most projects)

Split by bounded context. Each domain gets its own PRD with its own data model.

```
Project: SaaS Platform
├── PRD-001: Authentication & Authorization
│   └── users, sessions, roles, permissions
├── PRD-002: Team Management
│   └── teams, memberships, invitations
├── PRD-003: Billing & Subscriptions
│   └── plans, subscriptions, invoices, payments
└── PRD-004: Core Product Feature
    └── [domain-specific tables]
```

Best when: Clear domain boundaries, different data models, can be developed in parallel.

### 2. User-Journey-Based

Split by complete user flow. Each PRD delivers a full vertical slice.

```
Project: E-Commerce
├── PRD-001: Product Browsing & Search
│   └── Browse → Search → Filter → View Product
├── PRD-002: Cart & Checkout
│   └── Add to Cart → Review → Payment → Confirmation
├── PRD-003: Order Management
│   └── View Orders → Track → Return → Refund
└── PRD-004: Seller Dashboard
    └── List Products → Manage Inventory → View Sales
```

Best when: Different user personas, independent flows, phased rollout.

### 3. Layer-Based (use sparingly)

Split by architecture layer. Only when teams are organized this way.

```
Project: Data Pipeline
├── PRD-001: Data Ingestion API
├── PRD-002: Processing Pipeline
├── PRD-003: Storage & Query Layer
└── PRD-004: Dashboard & Reporting UI
```

Best when: Specialized teams (data engineering, frontend, infrastructure). Warning: Creates integration risk — test interfaces early.

### 4. Phase-Based

Split by delivery milestone. Each phase builds on the previous.

```
Project: Collaboration Tool
├── PRD-001: Phase 1 — Core (Users, Auth, Workspaces)
├── PRD-002: Phase 2 — Collaboration (Real-time, Comments, Mentions)
├── PRD-003: Phase 3 — Integrations (Slack, GitHub, Calendar)
└── PRD-004: Phase 4 — Analytics (Usage, Reporting, Exports)
```

Best when: Clear dependency chain, incremental value delivery, MVP-first approach.

---

## Dependency Types Between PRDs

| Type            | Symbol | Meaning                                | Example                            |
| --------------- | ------ | -------------------------------------- | ---------------------------------- |
| Finish-to-Start | A → B  | B cannot start until A is complete     | Auth → Team Management             |
| Start-to-Start  | A ↔ B  | A and B can start simultaneously       | Product Catalog ↔ Search           |
| Shared Contract | A ⇆ B  | Both use the same API or data model    | Cart ⇆ Checkout (share cart model) |
| Milestone Gate  | A ⊳ B  | B Phase 2 waits for A Phase 1 approval | Core MVP ⊳ Integrations            |

---

## Output Documents for Multi-PRD Projects

### 1. Project Vision Document

One page that connects everything. Created BEFORE individual PRDs.

```markdown
# Project Vision: [Project Name]

## Problem

[2-3 sentences: What problem are we solving?]

## Goal

[1-2 sentences: What does success look like?]

## Target Users

- [Persona 1]: [role, goal, context]
- [Persona 2]: [role, goal, context]

## Tech Stack

- Frontend: [framework]
- Backend: [framework/platform]
- Database: [database]
- Hosting: [platform]
- Auth: [provider]

## Constraints

- [Timeline, budget, regulatory, technical constraints]

## PRD Overview

| PRD | Name            | Description                                | Dependencies  |
| --- | --------------- | ------------------------------------------ | ------------- |
| 001 | Authentication  | User registration, login, password reset   | None          |
| 002 | Team Management | Create teams, invite members, manage roles | 001           |
| 003 | Core Feature X  | [description]                              | 001, 002      |
| 004 | Admin Dashboard | Organization settings, billing, analytics  | 001, 002, 003 |

## Dependency Graph
```

001-Auth ──────► 002-Teams ──────► 004-Admin
│ │
└────────────────┴──────► 003-Core Feature

```

## Roadmap

| Phase | PRDs | Milestone | Estimated Effort |
|-------|------|-----------|-----------------|
| 1 | 001 | Users can register and log in | [size] |
| 2 | 002, 003 (parallel) | Teams and core feature functional | [size] |
| 3 | 004 | Admin dashboard complete | [size] |
```

### 2. Requirements Map

All requirements with PRD assignment and priority.

```markdown
# Requirements Map

## v1 (Must-Have)

| ID    | Requirement                  | PRD       | Priority |
| ----- | ---------------------------- | --------- | -------- |
| R-001 | User registration with email | 001-Auth  | P0       |
| R-002 | Password reset flow          | 001-Auth  | P0       |
| R-003 | Team creation                | 002-Teams | P0       |
| R-004 | Member invitation            | 002-Teams | P1       |
| ...   | ...                          | ...       | ...      |

## v2 (Nice-to-Have)

| ID    | Requirement                  | PRD      | Priority |
| ----- | ---------------------------- | -------- | -------- |
| R-010 | OAuth login (Google, GitHub) | 001-Auth | P2       |
| ...   | ...                          | ...      | ...      |

## Out of Scope

- [Explicit list of what is NOT being built]
```

### 3. Shared Contracts (if PRDs share data models or APIs)

```markdown
# Shared Contracts

## Shared Data Models

### User (owned by PRD-001, consumed by all)

| Field  | Type | Used By            |
| ------ | ---- | ------------------ |
| id     | uuid | 001, 002, 003, 004 |
| email  | text | 001                |
| org_id | uuid | 001, 002, 003, 004 |

## Shared API Contracts

### GET /api/users/me

- Owner: PRD-001
- Consumers: PRD-002, PRD-003, PRD-004
- Response shape: [define once, use everywhere]
```

---

## Decomposition Checklist

Before finalizing the split:

- [ ] Each PRD can be implemented and tested independently
- [ ] Each PRD delivers measurable user value on its own
- [ ] Dependencies between PRDs are documented and minimal
- [ ] Shared data models and APIs are identified and assigned to an owner PRD
- [ ] No two PRDs modify the same database table (one owner, multiple consumers)
- [ ] The implementation order is clear (dependency graph has no cycles)
- [ ] Each PRD fits comfortably in a single AI agent context window (< 5 pages core content)
