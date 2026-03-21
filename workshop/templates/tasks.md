# Task Registry: {project-slug}

> Auto-managed by `/prd:update` and Ralph Loop. Manual edits are allowed but will be reconciled on next update.

## PRD-{NUMBER}: {PRD Title} (v{VERSION})

| ID  | AC   | Description                | Status  | Since |
| --- | ---- | -------------------------- | ------- | ----- |
| T1  | AC-1 | [Task description from AC] | 📋 TODO | v1.0  |
| T2  | AC-2 | [Task description from AC] | 📋 TODO | v1.0  |

### Status Legend

| Icon | Status      | Meaning                                           | Set By        |
| ---- | ----------- | ------------------------------------------------- | ------------- |
| 📋   | TODO        | Not yet started                                   | `/prd:update` |
| 🔄   | IN_PROGRESS | Currently being implemented                       | Ralph Loop    |
| ✅   | DONE        | Implemented and verified                          | Ralph Loop    |
| ⚠️   | STALE       | AC was modified — implementation needs rework     | `/prd:update` |
| ❌   | CANCELLED   | AC was removed — implementation should be deleted | `/prd:update` |

### Rules

1. **Task IDs are stable**: Once assigned, a task ID never changes. New tasks get the next available ID.
2. **One task per AC**: Each acceptance criterion maps to exactly one task.
3. **STALE = rework needed**: When `/prd:update` modifies an AC, the corresponding task becomes STALE. Ralph Loop treats STALE tasks like TODO but knows existing code needs updating, not a fresh build.
4. **CANCELLED = remove code**: When `/prd:update` removes an AC, the task becomes CANCELLED. The delta handoff instructs the agent to delete the corresponding implementation.
5. **Version tracking**: The "Since" column shows when the task was created or last status-changed by `/prd:update`. Ralph Loop does not change this column.
