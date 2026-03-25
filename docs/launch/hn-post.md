# Show HN: Effectum — Autonomous dev framework for Claude Code

> **Status:** Draft — needs Jason review before posting  
> **Updated:** 2026-03-25 (v0.11.1, 184 tests)  
> **Target:** news.ycombinator.com/submit

---

## Title (pick one)

**Option A (direct):**  
`Show HN: Effectum – Autonomous dev framework for Claude Code (spec → quality-gated build)`

**Option B (curiosity hook):**  
`Show HN: Effectum – I wanted Claude Code to build things while I sleep, so I wrote a framework`

**Option C (positioning):**  
`Show HN: Effectum – Claude Code framework with structured PRD workflow and quality gates (not another task manager)`

**Recommendation:** Option A — HN readers prefer direct + concrete over clickbait.

---

## Post Text (400 words target)

Effectum is a Claude Code framework I built for myself because nothing in the existing ecosystem covered the full workflow: writing a real spec, then running autonomous iterations until the code actually satisfies defined quality standards.

**The core concept: the Ralph Loop.**  
You define a "completion promise" — a concrete, checkable statement like "all tests pass, build succeeds, 0 lint errors" — and Claude iterates: writes code, runs 8 automated quality gates, recovers from errors, tries different approaches. It stops when the promise is 100% true. Not when Claude thinks it's done.

The 8 quality gates run every iteration: build, TypeScript types, lint, tests (80%+ coverage required), OWASP security scan, no debug logs, no `any` casts, max 300 lines/file. Not optional.

**The other half: PRD Workshop.**  
Slash commands that guide you through writing a specification good enough for autonomous implementation. `/prd:new` → guided discovery → acceptance criteria → data model → completion promise. Spec quality is the primary variable in output quality — there's no shortcut around it.

I tried everything first: BMAD is thorough but too much ceremony for a solo dev. GSD introduced me to context engineering and changed how I think about prompting — but doesn't help with spec writing. Taskmaster does useful task breakdowns but stops there. SpecKit has a great spec format but leaves the execution gap open. Effectum combines what I found useful from each, packaged as one command.

**Honest about limitations:** Claude Code only (no Codex/Gemini yet). Ralph Loop effectiveness scales with PRD quality. Agent Teams feature is experimental (requires Claude Code ≥v2.1.32 with feature flag).

Works with 7 stack presets (Next.js+Supabase, FastAPI, Django+PostgreSQL, Go+Echo, Rust+Actix, Swift/SwiftUI, generic). Three autonomy levels: Conservative (step-by-step), Standard (batch), Full Autonomy (overnight). Agent Teams for parallel multi-domain builds.

v0.11.1, 184 tests, MIT.

`npx @aslomon/effectum`

GitHub: github.com/aslomon/effectum

---

## Thread Strategy (anticipated questions)

**"How is this different from GSD/BMAD?"**  
> GSD is context engineering (how you structure instructions). BMAD is a project methodology. Effectum is execution infrastructure — it runs the loop, enforces the quality gates, and drives Claude toward a defined completion state. They're compatible, not competing. You could use GSD's AGENTS.md convention with Effectum.

**"Why not just use Claude Projects with good instructions?"**  
> You can. Effectum is for people who want a repeatable, checkable process — especially for complex features with multiple ACs. The quality gates are the key differentiator: without them, "done" is subjective.

**"Does it work with Codex/OpenAI?"**  
> Not yet. Claude Code only. The slash command system and /plan-/ralph-loop flow are Claude Code-specific. Adding Codex support would require significant rework.

**"Is the Ralph Loop reliable? Won't it just loop forever?"**  
> Max iterations are configurable (default 30 for Standard). If gates don't pass after max iterations, it stops and reports the delta. It's not magic — it fails gracefully when the spec is ambiguous or the codebase is too complex.

**"GitHub has 0 stars — is this production-ready?"**  
> This is a Show HN post, not a launch claim. v0.11.1 is stable with 184 passing tests. I've been using it on my own projects for weeks. Stars are a lagging indicator.

---

## Timing Notes

- **Best HN posting time:** Tuesday–Thursday, 8–10 AM US Eastern (2–4 PM Berlin)
- **Kiro backlash timing:** AWS Kiro's pricing complaints peaked late March — directly relevant context
- **After AGENTS.md support ships (v0.12.0):** add mention of multi-agent convention alignment
