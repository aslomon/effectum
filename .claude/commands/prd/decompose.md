---
name: "prd:decompose [DEPRECATED → effect:prd:decompose]"
description: "DEPRECATED: Use /effect:prd:decompose instead. This alias will be removed in v0.20."
allowed-tools: ["Read", "Write", "Bash"]
effort: "medium"
---

> ⚠️ **Deprecated as of v0.18.0**
>
> `/prd:decompose` has been renamed to `effect:prd:decompose`.
> This alias will be **removed in v0.20.0**.
>
> Please update your workflow: type `/effect:prd:decompose` going forward.
> (Running `effect:prd:decompose` now...)

---

# /prd:decompose — Split Large Scope into Multiple PRDs (Phase 3)

You break down a large project scope into manageable, individually implementable PRDs.

## Step 1: Load Project

Interpret `$ARGUMENTS` as project-slug.

- If empty: List available projects, ask the user.
- Validate that `workshop/projects/{slug}/` exists.

Read the current project state:

- `workshop/projects/{slug}/PROJECT.md`
- `workshop/projects/{slug}/vision.md` (if present)
- `workshop/projects/{slug}/requirements-map.md` (if present)
- Existing PRDs under `workshop/projects/{slug}/prds/`

## Step 2: Load Decomposition Guide

Read `workshop/knowledge/03-decomposition-guide.md` for strategies and signals.

## Step 3: Check Decomposition Signals

Analyze the scope for decomposition signals:

- More than 8 acceptance criteria total
- Independent user journeys identifiable
- Different bounded contexts / domains
- Different technical layers (frontend, backend, data)
- Features with different priorities / timelines
- Different risk levels

If no clear signals: Inform the user that a single PRD might suffice. Ask whether to decompose anyway.

## Step 4: Propose Decomposition Strategy

Propose one or more strategies:

| Strategy               | When                       | Example                                          |
| ---------------------- | -------------------------- | ------------------------------------------------ |
| **Domain-based**       | Different bounded contexts | Auth PRD, Billing PRD, Dashboard PRD             |
| **User-Journey-based** | Independent user flows     | Onboarding PRD, Core Workflow PRD, Reporting PRD |
| **Phase-based**        | Natural sequence           | MVP PRD, Enhancement PRD, Scale PRD              |
| **Layer-based**        | Clear tech separation      | Data Model PRD, API PRD, Frontend PRD            |

Explain to the user why you recommend this strategy.

## Step 5: Discussion and Adjustment

Discuss the proposed decomposition with the user:

- Show the proposed PRDs with title and brief description.
- Show which requirements / features belong to which PRD.
- Show dependencies between the PRDs.
- Let the user adjust the split (merge, split further, regroup).

## Step 6: Create/Update Files

After agreement:

1. **Vision Document** (`vision.md`): Update or create the project vision document with the overall picture.

2. **Requirements Map** (`requirements-map.md`): Create the assignment table — which requirements/features belong to which PRD.

3. **Network Map** (`network-map.mmd`): Create an initial Network Map (Stage 2) with PRD boundaries, per `workshop/knowledge/06-network-map-guide.md`.

4. **PRD Stubs** (`prds/{number}-{name}.md`): Create a stub file for each identified PRD with:
   - Title and brief description
   - Assigned requirements from the Requirements Map
   - Known dependencies on other PRDs
   - Status: `stub`

5. **PROJECT.md**: Update with the complete PRD list and status `decomposing` → `drafting`.

## Step 7: Next Steps

Show the user:

1. The final decomposition as an overview.
2. A recommended processing order (dependency-based).
3. Suggest starting with `effect:prd:discuss {slug}/001` for the first PRD.

## Next Steps

After decomposition is complete:

- → `effect:prd:discuss {slug}/001` — Start deep-dive on the first PRD
- → `effect:prd:review {slug}` — Review all PRDs for quality and readiness
- → `effect:prd:network-map {slug}` — Visualize the full network of PRDs and dependencies

## Communication

Follow the language settings defined in CLAUDE.md.
All file content must be written in English.
User-facing communication uses the language configured in CLAUDE.md.
