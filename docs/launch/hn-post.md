# Show HN: Effectum — Autonomous dev framework for Claude Code

> **Status:** Ready to post — Jason review + post  
> **Updated:** 2026-04-01 (v0.18.3, 539 tests, ~38 commands + full deprecated aliases)  
> **Target:** news.ycombinator.com/submit

---

## Title (pick one)

**Option A (direct):**  
`Show HN: Effectum – Autonomous dev framework for Claude Code (spec → quality-gated build)`

**Option B (curiosity hook):**  
`Show HN: Effectum – I wanted Claude Code to build things while I sleep, so I wrote a framework`

**Option C (v0.18 hook):**  
`Show HN: Effectum – I type /next and Claude tells me exactly what to do next on my codebase`

**Recommendation:** Option B — most click-worthy for HN without being misleading. Option C works well if the /next router is the angle.

---

## Post Text (400 words target)

Effectum is a Claude Code framework I built for myself because nothing in the existing ecosystem covered the full workflow: writing a real spec, then running autonomous iterations until the code actually satisfies defined quality standards.

**The core concept: the Ralph Loop.**  
You define a "completion promise" — a concrete, checkable statement like "all tests pass, build succeeds, 0 lint errors" — and Claude iterates: writes code, runs quality gates, recovers from errors, tries different approaches. It stops when the promise is 100% true. Not when Claude thinks it's done.

Quality gates run every iteration: build, TypeScript types, lint, tests, no debug logs, no `any` casts. Not optional. Context Budget Monitor stops the loop cleanly at 80% context usage with a structured HANDOFF.md. Stuck Detection catches repeated errors after 2 iterations and writes a STUCK.md with diagnosis.

**v0.18: Namespace clarity + backward compat.**  
The command system got a full UX pass across v0.17 and v0.18. New `/effectum` entry point, `/next` smart router, clean `effect:` / `effectum:` namespace split. ~38 deprecated old-name aliases still work — they just show a one-line migration notice and execute identically. No breaking changes, just less confusion.

`/next` reads your project state (open PRDs, task registry, git status, test results) and recommends exactly one action. First commit? → `/context:init`. PRD exists but no tasks? → `/prd:task-breakdown`. Tests failing? → `/tdd`. One answer, always.

**The other half: PRD Workshop.**  
`/prd:new` guides you through spec writing: requirements → acceptance criteria → data model → completion promise → overlap detection against existing PRDs. Spec quality is the primary variable in output quality — there's no shortcut around it.

**What's in v0.17/v0.18:** `/context:init` (7-question interview to populate CLAUDE.md with project-specific context), `/map-codebase` (4 parallel agents produce 7 knowledge documents), `/forensics` (post-mortem when loops fail), `effectum:status` dashboard.

I tried BMAD, GSD, Taskmaster, SpecKit. Each taught me something. Effectum combines what worked: context engineering (GSD), structured specs (SpecKit), autonomous execution with real quality gates, and now progressive disclosure so a first-time user can build something in 10 minutes without reading the docs.

**Traction:** 2,266+ downloads last week on npm — organic, no launch post. That's what finally pushed me to write this.

v0.18.3, 539 tests, MIT.

`npx @aslomon/effectum`

github.com/aslomon/effectum

---

## Thread Strategy (anticipated questions)

**"How is this different from GSD/BMAD?"**  
> GSD is context engineering (how you structure instructions). BMAD is a project methodology. Effectum is execution infrastructure — it runs the loop, enforces quality gates, and drives Claude toward a defined completion state. Compatible, not competing. Effectum generates both CLAUDE.md and AGENTS.md.

**"Why not just use Claude Projects with good instructions?"**  
> You can. Effectum is for people who want a repeatable, checkable process — especially for complex features with multiple ACs. The quality gates are the differentiator: without them, "done" is subjective.

**"Does it work with Codex/OpenAI?"**  
> Not yet. Claude Code only. The slash command system and /ralph-loop flow are Claude Code-specific.

**"Is the Ralph Loop reliable? Won't it just loop forever?"**  
> Max iterations configurable (default 30). Stuck Detection stops at 2 repeated errors with diagnosis. Context Budget Monitor stops cleanly at 80% usage. Fails gracefully, never silently.

**"GitHub has 0 stars — is this production-ready?"**  
> v0.18.3 is stable with 539 passing tests. I've been using it daily on my own projects, and ~3,200 people downloaded it in March + 2,266 last week alone, without a launch post. Stars are a lagging indicator — hopefully less so after this post.

**"What's the /effect:next command exactly?"**  
> It reads your current project state: open PRDs, tasks.md status, uncommitted changes, test results. Then recommends exactly one action. First commit? `/effectum:setup`. PRD exists but no tasks? `/prd:task-breakdown`. Tests failing? `/effect:dev:fix`. No ambiguity.

---

## Timing Notes

- **Best HN posting time:** Tuesday–Thursday, 8–10 AM US Eastern (2–4 PM Berlin)
- **Weekend posting:** Lower volume but also less competition — Sunday morning ET can work
- **npm traction:** 2,266 downloads last week, ~3,200+ in March total (organic, pre-launch) — mention for credibility
- **v0.18.3 angle:** Namespace clarity + backward compat is the UX story; "539 tests" signals maturity
- **Competitor context:** AWS Kiro launched (pricing complaints), Windsurf acquired by OpenAI — good moment for "Claude Code native" positioning
