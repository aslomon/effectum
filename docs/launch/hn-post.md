# Show HN: Effectum — Autonomous dev framework for Claude Code

> **Status:** Draft — needs Jason review before posting  
> **Updated:** 2026-03-28 (v0.17.0, 446 tests, 42 commands)  
> **Target:** news.ycombinator.com/submit

---

## Title (pick one)

**Option A (direct):**  
`Show HN: Effectum – Autonomous dev framework for Claude Code (spec → quality-gated build)`

**Option B (curiosity hook):**  
`Show HN: Effectum – I wanted Claude Code to build things while I sleep, so I wrote a framework`

**Option C (v0.17 hook):**  
`Show HN: Effectum – I type /effect:next and Claude tells me what to do next on my codebase`

**Recommendation:** Option B — most click-worthy for HN without being misleading. Option C works well if the /effect:next router is the angle.

---

## Post Text (400 words target)

Effectum is a Claude Code framework I built for myself because nothing in the existing ecosystem covered the full workflow: writing a real spec, then running autonomous iterations until the code actually satisfies defined quality standards.

**The core concept: the Ralph Loop.**  
You define a "completion promise" — a concrete, checkable statement like "all tests pass, build succeeds, 0 lint errors" — and Claude iterates: writes code, runs quality gates, recovers from errors, tries different approaches. It stops when the promise is 100% true. Not when Claude thinks it's done.

Quality gates run every iteration: build, TypeScript types, lint, tests, no debug logs, no `any` casts. Not optional. Context Budget Monitor stops the loop cleanly at 80% context usage with a structured HANDOFF.md. Stuck Detection catches repeated errors after 2 iterations and writes a STUCK.md with diagnosis.

**v0.17: "Apple-like clarity."**  
The command system got a UX pass. New `/effectum` entry point with a `/effect:next` smart router — it reads your project state (open PRDs, task registry, git status) and recommends exactly one next action. No more reading docs to figure out which of 42 commands applies. Also: `/effect:dev:run` → `/effect:dev:tdd`, `/effect:dev:stop` → `/effect:dev:stop`, `/effect:dev:save` → `/effect:dev:save`. The things you actually reach for should be short.

**The other half: PRD Workshop.**  
`/effect:prd:new` guides you through spec writing: requirements → acceptance criteria → data model → completion promise → overlap detection against existing PRDs. Spec quality is the primary variable in output quality — there's no shortcut around it.

**New in v0.17:** `/effectum:init` (7-question interview to populate CLAUDE.md with project-specific context), `/effectum:explore` (4 parallel agents produce 7 knowledge documents in `knowledge/codebase/`), `/effect:dev:diagnose` (post-mortem when loops fail).

I tried BMAD, GSD, Taskmaster, SpecKit. Each taught me something. Effectum combines what worked: context engineering (GSD), structured specs (SpecKit), autonomous execution with real quality gates, and now progressive disclosure so a first-time user can build something in 10 minutes without reading the docs.

**Traction:** 2,200+ downloads this week on npm — organic, no launch post. That's what finally pushed me to write this.

v0.17.0, 446 tests, 42 commands, MIT.

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
> v0.17.0 is stable with 446 passing tests across 42 commands. I've been using it daily on my own projects. Stars are a lagging indicator — hopefully less so after this post.

**"What's the /effect:next command exactly?"**  
> It reads your current project state: open PRDs, tasks.md status, uncommitted changes, test results. Then recommends exactly one action. First commit? `/effectum:setup`. PRD exists but no tasks? `/prd:task-breakdown`. Tests failing? `/effect:dev:fix`. No ambiguity.

---

## Timing Notes

- **Best HN posting time:** Tuesday–Thursday, 8–10 AM US Eastern (2–4 PM Berlin)
- **Weekend posting:** Lower volume but also less competition — Sunday morning ET can work
- **npm traction:** 2,206 downloads this week (organic, pre-launch) — mention for credibility
- **v0.17.0 angle:** "Apple-like clarity" is a positioning hook — lean into the UX improvement story
- **Competitor context:** AWS Kiro launched (pricing complaints), Windsurf acquired by OpenAI — good moment for "Claude Code native" positioning
