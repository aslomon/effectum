# Shared Contracts: [Project Name]

Defines shared data models and API contracts between PRDs. Each model/endpoint has a single owner PRD. Other PRDs consume but do not modify.

---

## Shared Data Models

### [Model Name] (owned by PRD-[NNN], consumed by [list])

| Field      | Type        | Used By    | Description           |
| ---------- | ----------- | ---------- | --------------------- |
| id         | uuid        | all        | Primary key           |
| org_id     | uuid        | all        | Tenant isolation      |
| [field]    | [type]      | [PRD list] | [description]         |
| created_at | timestamptz | all        | Creation timestamp    |
| updated_at | timestamptz | all        | Last update timestamp |

**Rules:**

- Only PRD-[NNN] may add columns or modify the table schema
- Consumers may read via RLS-protected queries
- Schema changes require updating this contract and notifying consumers

### [Model Name] (owned by PRD-[NNN], consumed by [list])

| Field   | Type   | Used By    | Description   |
| ------- | ------ | ---------- | ------------- |
| id      | uuid   | all        | Primary key   |
| [field] | [type] | [PRD list] | [description] |

---

## Shared API Contracts

### [HTTP_METHOD] /api/[resource]

- **Owner:** PRD-[NNN]
- **Consumers:** PRD-[NNN], PRD-[NNN]
- **Authentication:** Required
- **Purpose:** [What this endpoint provides]

**Response shape:**

```json
{
  "data": {
    "id": "uuid",
    "[field]": "[type]"
  }
}
```

**Contract rules:**

- Response shape must not change without updating this document
- New optional fields may be added (backward compatible)
- Required fields must not be removed or renamed

### [HTTP_METHOD] /api/[resource]

- **Owner:** PRD-[NNN]
- **Consumers:** PRD-[NNN]
- **Purpose:** [What this endpoint provides]

**Response shape:**

```json
{
  "data": {}
}
```

---

## Shared Events (if using Realtime/Webhooks)

| Event Name   | Producer  | Consumers            | Payload            |
| ------------ | --------- | -------------------- | ------------------ |
| [event.name] | PRD-[NNN] | PRD-[NNN], PRD-[NNN] | `{ id, [fields] }` |

---

## Contract Change Process

1. Owner PRD proposes change in this document
2. All consumer PRDs are listed and reviewed
3. Breaking changes require version bump or migration plan
4. Non-breaking additions (new optional fields) can be made directly
