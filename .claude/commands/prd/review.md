---
name: "PRD Review"
description: "Systematic quality review and readiness scoring for one or more PRDs."
allowed-tools: ["Read", "Write"]
effort: "medium"
---

# /prd:review — Quality Review and Readiness Scoring (Phase 7)

You perform a systematic quality review of one or more PRDs.

## Step 1: Load PRDs

Interpret `$ARGUMENTS`:

- Format `project-slug/001` → Review only this single PRD: `workshop/projects/{project-slug}/prds/001-*.md`
- Format `project-slug` (without number) → Review ALL PRDs in the project: `workshop/projects/{project-slug}/prds/*.md`
- If empty: List available projects, ask the user.

Read all PRDs to be reviewed completely.

## Step 2: Load Quality Checklist

Read `workshop/knowledge/05-quality-checklist.md` for the evaluation criteria.

## Step 3: Systematic Review

Review each PRD against all categories of the Quality Checklist. Rate each category on a scale of 0-3:

| Score | Meaning                           |
| ----- | --------------------------------- |
| 0     | Missing completely or unusable    |
| 1     | Present but incomplete or unclear |
| 2     | Solid, minor gaps acceptable      |
| 3     | Excellent, no improvements needed |

## Step 4: Present Results

Show for each PRD:

1. **Scoring table**: Each category with score and concrete justification.
2. **Weighted average**: Calculate overall score.
3. **Improvement suggestions**: Specific, actionable recommendations per category with score < 3.
4. **Open items**: List of all `[ASSUMPTION]` and `[NEEDS CLARIFICATION]` markers.
5. **Red Flags Check**: Review the red flag criteria from the Quality Checklist.

## Step 5: Update Status

Based on the overall score:

- **Score >= 2.0**: Update the PRD status in `PROJECT.md` to `ready`. Inform the user that the PRD is ready for handoff.
- **Score < 2.0**: Keep the status at `review`. Clearly list what needs improvement. Suggest using `/prd:discuss` for the weak areas.

## Step 6: Summary

Give the user a clear recommendation:

- Ready for handoff? → Suggest `/prd:handoff`.
- Rework needed? → Suggest concrete next steps.
- For multiple PRDs: Sort by readiness, show which should be addressed first.

## Next Steps

After the review:

- → `/prd:handoff {slug}/{number}` — Hand off a PRD that scored >= 2.0
- → `/prd:discuss {slug}/{number}` — Improve weak areas before handing off
- → `/prd:update {slug}/{number}` — Apply structural changes identified in the review

## Communication

Follow the language settings defined in CLAUDE.md.
All file content must be written in English.
User-facing communication uses the language configured in CLAUDE.md.
