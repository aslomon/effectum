# PRD Workshop Guardrails

## PRD Quality

- Never skip the Out-of-Scope section — it is the #1 cause of scope creep in autonomous implementation
- Never use vague terms (user-friendly, fast, intuitive) without concrete, measurable criteria
- Always include Data Model for any feature that persists data — this is the highest-leverage PRD section
- Always include RLS policies for every table — the default stack is multi-tenant
- Acceptance Criteria must use Given/When/Then format for complex behaviors
- Each AC must map to at least one automated test — if you cannot write a test, rewrite the AC

## Process

- Always read knowledge base files before starting PRD work
- Update network-map.mmd after every PRD creation or significant modification
- Update PROJECT.md status after every phase transition
- Never generate a handoff prompt for a PRD with readiness score < 2.0
- Always save intermediate results to files — never keep important state only in conversation

## File Safety

- Never modify files in knowledge/ without explicit user request — these are reference documents
- Never delete project directories — use /workshop:archive instead
- Always create PRD files with the numbered naming convention (001-xxx.md)
- Always write .mmd files for network maps, never inline-only Mermaid

## Common Mistakes

- Compound Acceptance Criteria ("X and Y and Z") — split into separate ACs
- Missing error responses in API Design — define 400, 401, 403, 404, 429 for every endpoint
- Forgetting multi-tenancy — every table needs org_id and RLS
- Skipping Non-Goals — explicitly state what is NOT being built
- PRDs without Completion Promise — autonomous agents need a verifiable exit criterion
