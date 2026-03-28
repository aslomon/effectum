---
name: "PRD Discuss"
description: "Conduct an in-depth discussion about a specific PRD to clarify all details."
allowed-tools: ["Read", "Write"]
effort: "medium"
---

# /prd:discuss — Deep-Dive Discussion for a Specific PRD (Phase 4)

You conduct an in-depth discussion about a specific PRD. Goal: maximum understanding, clarify all details.

## Step 1: Load PRD

Interpret `$ARGUMENTS`:

- Format `project-slug/001` → Read `workshop/projects/{project-slug}/prds/001-*.md`
- Format as file path → Read the file directly
- If empty or unclear: List available projects and PRDs, ask the user.

Read the PRD completely.

## Step 2: Load Questioning Framework

Read `workshop/knowledge/02-questioning-framework.md`, specifically the Phase 4 section (Feature Deep-Dive).

## Step 3: Identify Feature Type

Determine the primary feature type of the PRD:

- **UI/Frontend**: Screens, components, interactions, responsive behavior
- **API/Backend**: Endpoints, business logic, data processing
- **Data/Storage**: Data models, migrations, queries, caching
- **Integration**: Third-party services, webhooks, OAuth, external APIs
- **AI/ML**: Prompts, models, pipelines, feedback loops

## Step 4: Ask Type-Specific Questions

Ask questions appropriate to the feature type. There is no fixed limit — ask as many questions as needed until the feature is fully understood.

Rules for the discussion:

- Ask 2-3 questions per round, no more.
- Accept all response formats:
  - Detailed answers → process fully.
  - Short answers ("yes", "standard", "as usual") → derive sensible defaults.
  - "Skip that" → mark as `[NEEDS CLARIFICATION]` in the PRD and move on.
- Summarize your current understanding after each round.
- Let the user correct before proceeding.
- Go deep where needed — superficiality is worse than too many questions.

## Step 5: Update PRD

After the discussion (or after significant insights in between):

1. Update the PRD with the new details.
2. Replace existing `[ASSUMPTION]` markers with clarified information.
3. Add new `[ASSUMPTION]` or `[NEEDS CLARIFICATION]` markers where needed.
4. Update Acceptance Criteria, Scope, Data Model, etc.

## Step 6: Check Network Map

Read `workshop/projects/{slug}/network-map.mmd` if it exists.
If the discussion uncovered new connections, dependencies, or components:

- Update `network-map.mmd` accordingly.
- Inform the user about the changes.

## Next Steps

After the deep-dive discussion:

- → `/prd:review {slug}/{number}` — Score the PRD for handoff readiness
- → `/prd:discuss {slug}/{next}` — Continue deep-diving the next PRD in the project
- → `/prd:handoff {slug}/{number}` — Export the PRD as a handoff package

## Communication

Follow the language settings defined in CLAUDE.md.
All file content must be written in English.
User-facing communication uses the language configured in CLAUDE.md.
