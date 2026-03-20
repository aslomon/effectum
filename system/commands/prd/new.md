# /prd:new — Start a New Project or PRD

You start a new PRD workshop session. Work interactively and adaptively with the user.

## Step 1: Check Input

If `$ARGUMENTS` is empty, ask: **[in configured language] "What do you want to build?"** — wait for a response before proceeding.

If `$ARGUMENTS` is provided, analyze the input:

- **Workshop Mode** (vague description, idea, problem): Start the full workshop process with Phase 1.
- **Express Mode** (specific feature with clear scope): Redirect to `/prd:express`.

## Step 2: Create New Project or Use Existing One

Check if a matching project already exists under `workshop/projects/`.

- **New project**: Create the project structure following the `/workshop:init` pattern:
  1. Derive a slug from the project name (lowercase, hyphens, no spaces).
  2. Create `workshop/projects/{slug}/` with subdirectories `prds/`, `prompts/`, `notes/`.
  3. Create `PROJECT.md` from `workshop/templates/PROJECT.md` with slug and today's date.
  4. Create `notes/discovery-log.md` and `notes/decisions.md` as empty files.
  5. Set status to `discovery`.

- **Existing project**: Read `PROJECT.md` and determine the current state.

## Step 3: Start Discovery Phase (Phase 1 — Vision & Problem Discovery)

Read `workshop/knowledge/02-questioning-framework.md` for the question progression.

Begin Phase 1 with adaptive questions:

- Ask 2-3 questions at a time, no more.
- Adapt follow-up questions to the responses.
- Accept short answers ("yes", "standard", "skip that").
- Summarize your understanding after each round and let the user correct.
- Record key insights in `notes/discovery-log.md`.

## Step 4: Progress Through Phases

Work through the phases:

1. **Vision & Problem Discovery** → Save result in `vision.md`
2. **Scope & Requirements** → Save in `requirements-map.md`
3. **Decomposition Check**: If the scope is large (>8 ACs, multiple independent journeys, different bounded contexts), suggest decomposition and reference `workshop/knowledge/03-decomposition-guide.md`.
4. **Create Network Map** → `network-map.mmd` per `workshop/knowledge/06-network-map-guide.md`

After each phase:

- Save results to the corresponding files.
- Update `PROJECT.md` with the new status.

## Step 5: Write PRD

When the scope is clear:

1. Read `workshop/knowledge/01-prd-template.md` for the template.
2. Guide the user through PRD creation:
   - Title, Problem Statement, User Stories
   - Acceptance Criteria, Scope/Non-Goals
   - Data Model (if data persistence is involved), API Contracts
   - Quality Gates, Autonomy Rules, Completion Promise
3. Mark open items with `[ASSUMPTION]` or `[NEEDS CLARIFICATION]`.
4. Save PRD under `workshop/projects/{slug}/prds/{number}-{name}.md`.
5. Update `PROJECT.md`.

## Communication

Follow the language settings defined in CLAUDE.md.
All file content must be written in English.
User-facing communication uses the language configured in CLAUDE.md.
