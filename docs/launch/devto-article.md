# I built Effectum because I wanted Claude Code to build things while I sleep

**Status:** Draft — Jason review before publishing  
**Target:** dev.to (@aslomon)  
**Tags:** #claudecode #aigentic #productivity #opensource

---

Let me describe a workflow I've been running for the past few weeks.

I write a spec. I go to sleep. In the morning, there's working code.

Not "mostly working" code that needs three hours of cleanup. Working code. Build passes. All tests green. No `any` casts. No console.logs. Under 300 lines per file. Zero OWASP vulnerabilities. 80%+ test coverage.

I didn't write a custom script for each project. I built a framework: **Effectum**.

Here's what it does and why I built it.

---

## The gap I kept hitting

Claude Code is remarkable. But vanilla Claude Code has a predictable failure mode for complex work:

You ask it to build something. It writes code. You run it. There's an error. You paste the error. It fixes that error and introduces a different one. This continues for a while. Eventually you have working code — but the process was manual and exhausting.

The missing piece isn't intelligence. It's a **feedback loop with defined exit criteria**.

When does Claude know it's done? When it *thinks* it's done. That's not the same as when *you* think it's done.

---

## The core concept: the completion promise

Effectum is built around one idea: you define a "completion promise" before work starts.

A completion promise is a concrete, checkable statement:

```
"Build succeeds, all tests pass with 80%+ coverage, 0 TypeScript errors, 0 lint warnings, 0 console.log in production code"
```

The Ralph Loop — Effectum's autonomous execution mode — runs until that promise is 100% true. Not until Claude thinks it's true. Until the automated checks confirm it.

Every iteration:
1. Claude implements or fixes
2. 8 quality gates run automatically
3. If anything fails: Claude reads the output and tries again
4. If all 8 pass: loop exits

8 gates: build, TypeScript types, ESLint, tests (80%+ coverage), OWASP security scan, no debug logs, no `any` casts, no file over 300 lines.

Not configurable. Not optional. That's the point.

---

## The PRD workshop: spec quality is the real variable

The framework ships with a guided PRD workflow because spec quality is the primary variable in output quality.

Vague spec → vague results. Precise spec → precise results.

The `/prd:new` command walks through:
- What problem are you solving?
- Who's affected?
- Acceptance criteria (testable, not aspirational)
- Data model
- API design
- Completion promise

The spec becomes both the human contract and the agent's instructions. Same document. You write it once.

---

## What ships in the box

```bash
npx @aslomon/effectum
```

- **Foundation hooks:** file protection, destructive blocker, git context, auto-formatter
- **8 quality gates:** baked into every Ralph Loop iteration
- **PRD workshop:** `/prd:new`, `/prd:express`, `/prd:review`, `/prd:update`, network maps
- **Design system:** `/design` generates DESIGN.md — color palette, typography, component conventions
- **Stack presets:** Next.js+Supabase, FastAPI, Django+PostgreSQL, Go+Echo, Rust+Actix, Swift/SwiftUI, generic
- **CLAUDE.md + AGENTS.md:** ecosystem-neutral, works with GSD, BMAD, Codex, anything reading AGENTS.md
- **Agent Teams:** orchestrate parallel multi-domain builds (experimental, requires Claude Code ≥v2.1.32)
- **Autonomy levels:** Conservative (step-by-step approval), Standard (batch), Full Autonomy (overnight runs)
- **`effectum update`:** sync new commands/specs from upstream without touching your project config

YAML frontmatter on all command files. 408 tests. MIT license.

---

## What it doesn't do

I want to be explicit about limitations:

- **Claude Code only.** No Codex, no Gemini CLI, no other agents yet.
- **Ralph Loop scales with PRD quality.** If your spec is vague, the loop will produce vague code. Framework can't fix bad specs.
- **Agent Teams is experimental.** Requires feature flag + specific Claude Code version. Not for production pipelines yet.
- **Not a task manager.** There's no dashboard, no ticket system, no project board. The workflow is CLI-first.

---

## The current state

Released on npm as `@aslomon/effectum`. 2,992 downloads last week — mostly organic, pre-launch.

Three user journeys the framework is explicitly designed for:

1. **Greenfield solo dev:** Write a spec, run the Ralph Loop overnight, wake up to working code
2. **Brownfield onboarding:** Drop Effectum into an existing codebase, `/onboard` generates a structured PRD from what's already there
3. **Team parallelism:** Use Agent Teams to run frontend + backend + tests in parallel on the same repo

The biggest open issue: context limits. In iteration 12, the session context fills up. The loop doesn't know to stop gracefully and hand off state. This is a known gap — the Context Budget Monitor feature is planned for the next release.

---

## Why I'm sharing this now

I had the core ideas for this in October 2025. I didn't share them because I wasn't sure anyone else needed this.

Then I shipped a version, put it on npm with no announcement, and watched 2,992 downloads happen over seven days.

Apparently other people also want Claude Code to build things while they sleep.

If you're already using Claude Code for real projects, I think Effectum will save you hours per week. If you're just starting with agentic development, it's a useful structure to start with rather than build yourself.

```bash
npx @aslomon/effectum
```

GitHub: [aslomon/effectum](https://github.com/aslomon/effectum)

I'm @jasonrinnert on Twitter and @aslomon on GitHub. Happy to answer questions.

---

*What's your current Claude Code workflow? I'm curious how others structure autonomous work.*
