# Questioning Framework — PRD Discovery

Structured question progression for extracting requirements from a vague idea to a production-ready PRD.

---

## Principles

1. **Batch questions** — max 4-5 per round, thematically grouped
2. **Summarize after each round** — let the user correct misunderstandings
3. **Accept short answers** — "yes", "standard", "you decide" are valid responses
4. **Mark uncertainty** — use [ASSUMPTION] and [NEEDS CLARIFICATION] instead of silent guesses
5. **Adapt depth to project size** — skip rounds for simple features, go deeper for complex projects

---

## Phase 1: Vision & Problem Discovery

### Round 1 — The Foundation (always ask)

1. **What are you building?** Describe it in 1-2 sentences.
2. **What problem does it solve?** Who suffers from this problem today?
3. **How is this problem solved today?** (Workarounds, competitors, manual processes)
4. **Why now?** What makes this the right time? (Market timing, strategic context, dependency unblocked)

### Round 2 — Depth (always ask)

5. **Who are the primary users?** Describe concrete personas, not "everyone".
6. **What is the cost of inaction?** What happens if you do NOT build this?
7. **Greenfield or brownfield?** Is there existing code, an existing product, or starting from scratch?
8. **Tech stack?** What technology is used or preferred? (Framework, database, hosting, etc.)

### Round 3 — Constraints (ask if project is non-trivial)

9. **Timeline or budget constraints?**
10. **Regulatory or compliance requirements?** (GDPR, accessibility, industry-specific)
11. **Dependencies on external systems or teams?**
12. **Known technical risks or uncertainties?**

### After Round 1-3: Vision Summary

Present a structured summary:

- Problem Statement (2-3 sentences)
- Target Users (personas)
- Proposed Solution (high-level)
- Tech Stack
- Key Constraints
- [ASSUMPTION] list
- [NEEDS CLARIFICATION] list

Let the user validate and correct.

---

## Phase 2: Scope Definition

### Round 4 — Feature Sorting

Present all identified features/capabilities and ask the user to sort:

13. **v1 (Must-have):** What absolutely must be in the first release?
14. **v2 (Nice-to-have):** What can wait for a later iteration?
15. **Out-of-scope:** What should explicitly NOT be built?
16. **Non-Goals:** What could someone reasonably expect to be included, but is intentionally excluded? (These prevent scope creep)

### Round 5 — Assumptions & Open Questions

17. **Review assumptions:** Present all [ASSUMPTION] items and ask: "Are these correct?"
18. **Review open questions:** Present all [NEEDS CLARIFICATION] items and ask: "Can you clarify these?"

---

## Phase 3: Decomposition Check

### Round 6 — Project Size Assessment (ask if project has 8+ features)

19. **Independent user groups?** Do different user types have completely different journeys? (If yes → separate PRDs)
20. **Independent domains?** Can you identify bounded contexts that have no shared data? (If yes → separate PRDs)
21. **Phased delivery?** Are there natural milestones where value can be delivered incrementally? (If yes → PRDs per phase)

If multiple PRDs are needed, create:

- Project Vision Document (artifact)
- Requirements Map with PRD assignments (artifact)
- Dependency Graph between PRDs (artifact)

---

## Phase 4: Discuss (per PRD)

### Feature-Type Detection

Identify the primary type of the feature and ask type-specific questions:

### For Visual/UI Features

22. **Layout:** Cards, list, table, grid? Dense or spacious?
23. **Interactions:** Modals, inline editing, drag-and-drop, keyboard shortcuts?
24. **States:** What does the empty state look like? Loading state? Error state?
25. **Responsive:** Mobile-first? Key breakpoints? What changes on mobile?
26. **Existing patterns:** Should this match existing UI patterns in the project? Which ones?

### For APIs/Backend Features

22. **Response format:** JSON structure? Pagination style? (offset, cursor, keyset)
23. **Error handling:** Error response format? Specific error codes? User-facing messages?
24. **Authentication:** Which auth method? Role-based access?
25. **Rate limiting:** Requests per minute/hour? Per user or per API key?
26. **Idempotency:** Which operations must be idempotent?

### For Data/Content Features

22. **Data structure:** Hierarchical, flat, graph? Nesting depth?
23. **Validation rules:** Field-level constraints? Cross-field validations?
24. **Migration strategy:** How to handle existing data? Backfill needed?
25. **Retention:** Data lifecycle? Soft delete or hard delete?

### For Integration Features

22. **External API:** Which API version? Authentication method? Rate limits?
23. **Error recovery:** Retry strategy? Circuit breaker? Fallback behavior?
24. **Data mapping:** How do external data models map to internal ones?
25. **Sync strategy:** Real-time (webhooks), polling, or batch?

---

## Phase 5: Requirements Deep-Dive (per PRD)

### Round 7 — User Stories

Frame each story using Jobs-to-be-Done:

27. **For each user persona:** What is the main job they are trying to accomplish?
28. **Happy path:** What does the ideal flow look like, step by step?
29. **Edge cases:** What happens when [unusual input / missing data / concurrent access / timeout]?
30. **Error recovery:** When something goes wrong, how does the user get back on track?

### Round 8 — Data Model

31. **Core entities:** What are the main data objects? What are their relationships?
32. **Multi-tenancy:** Is tenant/org isolation needed? (If yes, org_id on every table)
33. **Audit trail:** Do changes need to be tracked? (created_at, updated_at, created_by)
34. **Soft delete:** Should records be deletable? Soft or hard delete?
35. **Access control:** Who can see/edit/delete what? (RLS policy requirements)

### Round 9 — API Design

36. **Endpoints:** List the CRUD operations needed. Any non-standard operations?
37. **Request/Response shapes:** Suggest shapes and ask: "Does this match your expectation?"
38. **Validation:** Which fields are required? Max lengths? Allowed formats?
39. **Versioning:** Is API versioning needed?

### Round 10 — Non-Functional Requirements

40. **Performance:** Expected response time? Concurrent users?
41. **Scalability:** Expected data volume? Growth rate?
42. **Security:** Beyond standard auth — any specific requirements?
43. **Accessibility:** WCAG level? Keyboard navigation? Screen reader support?

---

## Phase 6: Verification Questions

After the PRD draft is complete, verify with these meta-questions:

44. **Testability:** "Can every acceptance criterion be verified by an automated test?"
45. **Completeness:** "Is anything missing that a developer would need to ask about?"
46. **Boundaries:** "Is it clear what is NOT being built?"
47. **Dependencies:** "Are all dependencies on other systems/features documented?"
48. **Success:** "How will you know this feature is successful after launch?"

---

## Adaptation Guide

### For Tiny Features (1-3 AC)

- Skip Phase 3 (Decomposition)
- Compress Phase 4 (Discuss) to 2-3 questions
- Skip Non-Functional Requirements unless relevant
- Total: ~12-15 questions

### For Standard Features (4-8 AC)

- Full Phase 1-2
- Quick Phase 3 check
- Full Phase 4-5
- Total: ~25-30 questions

### For Large Projects (9+ AC, multiple PRDs)

- Full all phases
- Multiple rounds in Phase 4-5
- Explicit Decomposition with Vision Document
- Total: ~35-45 questions across multiple sessions

---

## Anti-Patterns to Avoid

1. **Asking all questions at once** — overwhelms the user, produces shallow answers
2. **Accepting "it should be user-friendly"** — push for concrete criteria (what does friendly mean HERE?)
3. **Skipping Non-Goals** — the most common cause of scope creep
4. **Assuming technical details** — always ask about stack, patterns, and constraints
5. **Writing the PRD before understanding the problem** — resist the urge to jump to solutions
6. **Over-specifying implementation** — describe WHAT, not HOW (unless the user has strong opinions)
7. **Ignoring edge cases** — "what happens when..." questions reveal most requirements
8. **Single-perspective thinking** — consider engineer, executive, and end-user perspectives
