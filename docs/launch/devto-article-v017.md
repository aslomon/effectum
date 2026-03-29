# Dev.to Article Draft — Effectum v0.17.0

> **Status:** Draft — needs Jason review before publishing  
> **Updated:** 2026-03-29 (v0.17.0, 446 tests, 42 commands)  
> **Target:** dev.to/@aslomon  
> **Tags:** claudecode, ai, productivity, tooling

---

## Title

**I built a framework for Claude Code so I can type /next and just start coding**

---

## Article

When I started using Claude Code seriously, I had a problem: I knew the tools were powerful, but I didn't know *which* tool to reach for, *when*. Type `/plan`? `/tdd`? `/ralph-loop`? Read the docs again?

I built Effectum to solve this. And in v0.17.0, I finally added the thing that makes it click: `/next`.

---

### What `/next` does

`/next` reads your project state — open PRDs, tasks.md, uncommitted changes, test failures — and tells you exactly one thing to do next. No ambiguity.

```
/next
→ You have 3 uncommitted test files and an open PRD. 
  Recommended: /tdd to implement the next task.
  Run: /tdd
```

It's not magic. It's a smart router that maps your current state to the right command. But it eliminates the "where do I start?" paralysis that I kept running into.

---

### The bigger picture: what Effectum actually is

Effectum is a Claude Code framework with one core idea: **"done" should be defined before you start, not declared when you're tired.**

The main loop is `/ralph-loop`:

1. You write a PRD with acceptance criteria and a *completion promise* (a verifiable statement like "all tests pass, build succeeds, 0 type errors")
2. Claude iterates: implements, runs quality gates, recovers from errors
3. It stops when the completion promise is 100% true — not when Claude "thinks" it's done

Quality gates run every iteration: build, types, lint, tests, no debug logs. Not optional.

Three safety mechanisms for long runs:
- **Context Budget Monitor** — at 80% context usage, commits state and writes `HANDOFF.md` cleanly
- **Stuck Detection** — if the same error repeats twice, stops and writes `STUCK.md` with diagnosis
- **Loop Ledger** — every run logs to `effectum-metrics.json`: iterations, outcome, duration

---

### What's new in v0.17.0

**Entry point.** `npx @aslomon/effectum` now installs a `/effectum` command with `/help` and `/next` aliases. One place to start, regardless of where you are in a project.

**Cleaner names.** `/run` works like `/tdd`. `/stop` like `/cancel-ralph`. `/save` like `/checkpoint`. The commands you reach for constantly are now one word.

**Context init.** `/context:init` is a 7-question interview that populates your `CLAUDE.md` with project-specific context — domain terminology, architecture decisions, critical areas, tech debt. Everything Claude needs to avoid generic responses. Takes 5 minutes, saves hours.

**PRD improvements.** `/prd:new` now detects overlap with existing PRDs in Step 2, reads CLAUDE.md sentinel for domain context, and recommends `/ralph-loop` as primary next step for agentic workflows.

**`/map-codebase`.** Spawns 4 parallel analysis agents that produce 7 knowledge documents in `knowledge/codebase/`: architecture, stack, conventions, testing strategy, concerns, integrations. Use it on any unfamiliar codebase before you start building.

**`/forensics`.** When a loop fails, `/forensics` reads HANDOFF.md, STUCK.md, loop-state, metrics, and git log. Classifies the failure mode, analyzes root cause, writes `FORENSICS-{date}.md` with recommended next steps.

---

### Numbers

- 42 commands (up from 31 in v0.16.0)
- 446 tests
- 7 stack presets (Next.js+Supabase, FastAPI, Django, Go+Echo, Flutter+Firebase, Swift/SwiftUI, generic)
- 3 autonomy levels: Conservative, Standard, Full Autonomy (overnight)
- Works with Agent Teams for parallel multi-domain builds

---

### Installation

```bash
npx @aslomon/effectum
```

Run it in your project directory. It detects your stack, configures Claude Code with quality gates and hooks, and sets up the full command system. Takes about 30 seconds.

Then open Claude Code and type `/next`.

---

### Why I built this

I'm a solo dev working on several projects simultaneously. Claude Code is genuinely useful for me, but I kept hitting the same wall: great execution on individual tasks, no continuity between sessions, no shared definition of "done."

I tried BMAD (excellent for enterprise, too much ceremony for solo work), GSD (taught me context engineering, changed how I think about prompting — still use it), Taskmaster (useful breakdowns, leaves the execution gap open), SpecKit (great spec format, no autonomous execution).

Effectum is what I ended up with after combining what worked from each.

It's MIT licensed. `github.com/aslomon/effectum`. If you're using Claude Code seriously and want a framework that gets out of your way while keeping quality high, try it.

---

*This is a personal project — I use it daily. v0.17.0 is stable with 446 passing tests. Feedback welcome.*
