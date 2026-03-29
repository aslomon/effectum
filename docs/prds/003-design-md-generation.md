# PRD: DESIGN.md Generation & `/effect:design` Command

**ID:** 003  
**Version Target:** 0.13.0  
**Status:** Draft  
**Author:** Lumi  
**Created:** 2026-03-25

---

## Problem

Effectum improves implementation reliability through PRDs, quality gates, and autonomous execution. But frontend work still suffers from a recurring gap:

- PRDs describe **what** to build
- Agents generate code for **how** it behaves
- There is no first-class artifact defining **how it should look**

As a result, frontend output often drifts toward generic UI, inconsistent component choices, and repeated design iteration loops.

Effectum already references `DESIGN.md` throughout templates, hooks, workshop docs, and frontend skills — but there is no structured way to create it.

This creates a mismatch:
1. The system assumes `DESIGN.md` exists for UI work
2. Users are not guided to produce it
3. Agents therefore either improvise visual decisions or default to generic patterns

---

## Goal

Add a first-class **DESIGN.md workflow** to Effectum so frontend-heavy projects can generate a structured visual spec before implementation begins.

The MVP should introduce a dedicated `/effect:design` command that:
- reads the current PRD
- inspects the codebase for existing design signals
- accepts lightweight user guidance
- generates a project-root `DESIGN.md`

This document becomes the visual source of truth for future UI work.

---

## Core Product Principle

> PRD defines the product. DESIGN.md defines the interface.

`DESIGN.md` should be to frontend work what the PRD is to feature logic: a clear, explicit constraint document that reduces ambiguity and rework.

---

## User Stories

1. **As a solo builder**, I want Effectum to generate a usable design spec so UI output stops looking generic.
2. **As a product owner**, I want design decisions documented before implementation so multiple frontend iterations are not wasted on taste mismatches.
3. **As an agent**, I want a single source of truth for tokens, layout, components, and interaction patterns so I do not invent inconsistent UI conventions.
4. **As a maintainer**, I want DESIGN.md to be optional for non-UI projects and expected for frontend-heavy work.

---

## Workflow

### Recommended flow

```text
/effect:prd:new → PRD approved → /effect:design → DESIGN.md generated → /effect:dev:plan → /ralph-loop
```

### Future integration

For web/mobile/fullstack projects, Effectum can later prompt after PRD completion:

> “This looks like a UI project. Generate DESIGN.md now?”

But that is **not required for MVP**.

---

## Acceptance Criteria

### AC-1: `/effect:design` Command
- New command file: `.claude/commands/effect:design.md`
- Command asks for:
  - PRD path or active PRD
  - optional style prompt (e.g. “Apple-like”, “dense B2B dashboard”, “warm editorial”)
  - optional reference URLs or screenshots (future-friendly placeholder allowed)
- Command outputs `DESIGN.md` in project root

### AC-2: UI Project Detection
- Effectum recommends `/effect:design` when `appType` is one of:
  - `web-app`
  - `mobile-app`
  - `fullstack`-adjacent presets
- Effectum does **not** recommend it for:
  - `cli-tool`
  - `api-backend`
  - `automation-agent`
  - `library-sdk`

### AC-3: DESIGN.md Structure
Generated `DESIGN.md` must include these sections:
1. Design Goals / Mood
2. Design Tokens
3. Typography
4. Layout Strategy
5. Component Patterns
6. Interaction Patterns
7. Responsive Behavior
8. Existing Codebase Signals
9. Open Design Questions

### AC-4: Existing Project Analysis
`/effect:design` inspects existing files when available:
- `tailwind.config.*`
- `src/app/globals.css` / `styles/*`
- `components/ui/*`
- theme tokens / CSS variables
- UI dependencies in `package.json`

Generated DESIGN.md must distinguish between:
- **Observed** conventions from codebase
- **Proposed** new conventions

### AC-5: Template & Workflow Integration
- `CLAUDE.md` / `AGENTS.md` generation continues referencing `DESIGN.md`
- Add a short note to docs explaining when to create it
- `/effect:dev:plan` and frontend-related prompts should explicitly read `DESIGN.md` if present

### AC-6: Non-UI Safety
- No `DESIGN.md` generation for backend-only installs unless user explicitly runs `/effect:design`
- Docs clarify that `DESIGN.md` is optional outside UI work

### AC-7: Documentation
- Add `docs/effect:design-md.md` explaining:
  - what DESIGN.md is
  - when to use it
  - sample workflow
  - how to maintain it after UI changes

### AC-8: Example Output
- Add one realistic example `DESIGN.md` snippet to docs or workshop knowledge
- Show tokens + layout + component rules

---

## Scope

### In Scope
- `/effect:design` command spec
- DESIGN.md document structure
- existing project analysis
- documentation and workflow guidance

### Out of Scope
- Figma import
- automatic screenshot analysis
- URL scraping of design inspiration sites
- generated mockups
- runtime validation that implementation matches DESIGN.md

---

## Data Model

No persistent app state changes required for MVP.

Artifacts:
- `DESIGN.md` in project root
- docs for generation and maintenance

---

## Implementation Notes

- Reuse existing frontend guidance already present in:
  - `skills/frontend-design/`
  - workshop templates
  - CLAUDE.md / AGENTS.md references
- The command should bias toward **documenting constraints**, not writing verbose design essays
- Keep generated DESIGN.md practical and implementation-oriented

---

## Why This Matters

This feature is strategically important because it makes Effectum stronger where agents still fail most often: frontend specificity.

Competitors can help structure execution, but they rarely provide a modular design-spec artifact that sits cleanly between product spec and implementation.

That makes `DESIGN.md` a credible differentiator for Effectum.

---

## Open Questions

1. Should `/effect:design` be generated by default after `/effect:prd:new` for web projects, or only suggested?
2. Should DESIGN.md live in project root only, or support `docs/DESIGN.md`?
3. Should future versions add “reference site analysis” as an opt-in step?
4. Should frontend quality gates eventually validate compliance with DESIGN.md?
