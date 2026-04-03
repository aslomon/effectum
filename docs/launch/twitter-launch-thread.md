# Effectum — Twitter/X Launch Thread

> **Status:** Draft — needs Jason review before posting
> **Timing:** Post SAME DAY as HN (or day after if HN gains traction) — 13–14 Uhr CET
> **Updated:** 2026-03-31 (v0.18.3, 539 tests)
> **Character target:** Each tweet ≤ 280 chars. Thread = 7–9 tweets.

---

## Version A — "What it does" thread (recommended first post)

**Tweet 1 (hook):**
I wanted Claude Code to build things autonomously without stopping early.

So I built a framework that doesn't stop until the code actually works.

🧵

---

**Tweet 2 (problem):**
The problem with Claude Code out of the box:

It stops when it *thinks* it's done.
Not when tests pass.
Not when the build is clean.

I needed a way to define "done" precisely — and have Claude run toward it.

---

**Tweet 3 (core concept):**
The answer: a completion promise.

A concrete, checkable statement:
"All tests pass. Build succeeds. 0 lint errors."

Claude iterates until that promise is 100% true.
Not until it feels confident. Until it's true.

That's the Ralph Loop.

---

**Tweet 4 (quality gates):**
Every iteration runs 8 quality gates:

→ Build
→ TypeScript types
→ Lint
→ Tests (80%+ coverage)
→ OWASP security
→ No debug logs
→ No `any` casts
→ Max 300 lines/file

None optional. That's the point.

---

**Tweet 5 (smart routing):**
/next reads your project state and tells you exactly one thing to do.

First commit? → /context:init
Open PRD, no tasks? → /prd:task-breakdown
Tests failing? → /tdd
Code review needed? → /effect:dev:review

One answer. Always.

---

**Tweet 6 (traction):**
4,600+ downloads in March on npm.

Organic. No launch post.

That's what finally pushed me to ship this publicly.

---

**Tweet 7 (CTA):**
npx @aslomon/effectum

v0.18.3 — 539 tests — MIT

github.com/aslomon/effectum

If you're building with Claude Code, give it a try. Happy to answer questions.

---

## Version B — "builder story" thread (for after HN gains traction)

**Tweet 1:**
I tried BMAD, GSD, Taskmaster, SpecKit.

Each taught me something.

Effectum is what I built after learning from all of them.

🧵

---

**Tweet 2:**
GSD taught me: context engineering matters more than prompting.
SpecKit taught me: spec quality is the primary variable in output quality.
BMAD taught me: structured methodology beats improvisation.

None of them solved autonomous execution with real quality gates.

---

**Tweet 3:**
So I added that piece:

The Ralph Loop — Claude iterates until a completion promise is satisfied.
Context Budget Monitor — stops cleanly at 80% context with a HANDOFF.md.
Stuck Detection — catches repeated errors, writes diagnosis, doesn't just spin.

---

**Tweet 4:**
The PRD Workshop (/prd:new) guides you through:

→ Requirements
→ Acceptance criteria
→ Data model
→ Completion promise
→ Overlap detection against existing PRDs

Spec quality is not optional. The loop depends on it.

---

**Tweet 5:**
/map-codebase spins 4 parallel agents that produce 7 knowledge documents.

When you hand off a project to Claude Code in a new session, it knows your codebase cold before it writes a single line.

---

**Tweet 6:**
v0.18 shipped with namespace clarity + /next smart router.

~38 deprecated aliases still work — they show a one-line migration notice and execute identically.

No breaking changes. Just less confusion.

---

**Tweet 7:**
npx @aslomon/effectum

v0.18.3 — 539 tests — MIT

github.com/aslomon/effectum

---

## Notes for Jason

- Thread A = best for HN launch day (mirrors the Show HN framing)
- Thread B = best for follow-up day or if HN post gets traction
- Don't post both same day
- 13–14 Uhr CET is optimal window
- Link to HN post in the reply to Tweet 1 (nicht im ersten Tweet selbst — kein externer Link im Engagement-Tweet)
- After posting: reply to any early replies in first 90 min (LinkedIn-Regel gilt hier auch sinngemäß)
