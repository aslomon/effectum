# Reddit Launch Posts — Effectum

> **Status:** Draft — needs Jason review before posting  
> **Target subreddits:** r/ClaudeAI, r/SideProject, r/programming  
> **Updated:** 2026-03-25

---

## Post 1: r/ClaudeAI

**Title:**  
I built a framework to stop Claude Code from quitting early — it iterates until tests actually pass

**Body:**

Been using Claude Code heavily for a few months. The biggest frustration wasn't the code quality — it was Claude deciding it was "done" when the build was still broken or tests were still failing.

So I built [Effectum](https://github.com/aslomon/effectum) around the concept of a **completion promise**: a concrete, checkable statement like *"all tests pass, build succeeds, 0 lint errors"*. Claude iterates until that promise is 100% satisfied. Not until it *thinks* it's done.

It runs 8 quality gates every iteration:
- Build
- TypeScript types
- Lint
- Tests (80%+ coverage required)
- OWASP security scan
- No debug logs
- No `any` casts
- Max 300 lines/file

None are optional. That's the point.

The other half is a **PRD Workshop** — slash commands that guide you through writing a spec good enough for autonomous implementation. Because Claude's output quality scales directly with spec quality.

`npx @aslomon/effectum` — two questions, everything configured.

Works with 7 stack presets (Next.js+Supabase, FastAPI, Django+PostgreSQL, Go+Echo, Rust+Actix, Swift/SwiftUI, generic). Three autonomy levels. MIT.

---

Curious what your Claude Code workflow looks like — especially around quality gates. What do you do when Claude calls something "done" but it obviously isn't?

---

## Post 2: r/SideProject

**Title:**  
Show r/SideProject: I built an autonomous dev framework for Claude Code (2 months in, 296 downloads/day)

**Body:**

I've been building with Claude Code since early 2024 and kept hitting the same wall: there was no structure around *when* a build was actually done. Claude would declare success while tests were still broken.

So I spent two months building **Effectum** — an open-source Claude Code framework that:

1. **PRD Workshop**: guides you through writing specs via slash commands (`/effect:prd:new`, `/effect:prd:update`). Spec quality → output quality. No shortcut.
2. **Ralph Loop**: define a "completion promise" → Claude iterates with 8 quality gates until provably satisfied
3. **7 stack presets**: Next.js+Supabase, FastAPI, Django+Postgres, Go+Echo, Rust+Actix, Swift/SwiftUI, generic
4. **Agent Teams**: experimental parallel builds across multiple Claude instances (v0.12.0)

What surprised me: 296 downloads/day before any community launch. People are apparently searching for this.

`npx @aslomon/effectum` — open source, MIT

GitHub: [aslomon/effectum](https://github.com/aslomon/effectum)

Happy to answer questions about the architecture or the autonomy tradeoffs.

---

## Post 3: r/programming (more technical angle)

**Title:**  
Effectum: A spec-driven autonomous build loop for Claude Code with 8 quality gates

**Body:**

I wanted Claude Code to run until a build is *verifiably correct*, not just *plausibly done*. So I built a thin framework around that idea.

The core concept: you define a **completion promise** — a machine-checkable predicate like "build exits 0, test coverage ≥80%, lint clean, no TypeScript errors". Claude runs code, checks all 8 gates, recovers from failures, and iterates until the promise is satisfied. Max iterations configurable (default 30).

What I learned building this:

- **Spec quality is the primary variable.** The PRD Workshop exists because vague specs produce vague code regardless of iteration count.
- **Quality gates need to be non-negotiable.** The moment you make them optional, they stop working as feedback signals.
- **AGENTS.md is becoming the ecosystem standard.** Added `--output-format agents-md` in v0.12.0 for compatibility with multi-agent setups (GSD convention).

Stack: Node.js, CommonJS, zero runtime dependencies for the core. 202 tests.

`npx @aslomon/effectum` | [github.com/aslomon/effectum](https://github.com/aslomon/effectum) | MIT

---

## Posting Strategy

| Subreddit | Best Time | Approach |
|-----------|-----------|----------|
| r/ClaudeAI | Tue-Thu 9-11 AM ET | Problem/solution framing, end with question |
| r/SideProject | Mon-Wed 10 AM ET | Show & Tell format, include metrics |
| r/programming | Tue-Thu 8-10 AM ET | Technical, no hype, link to GitHub |

**Order:** r/ClaudeAI first (most relevant audience) → r/SideProject (1 day later) → r/programming (after HN)

**Don't cross-post same day.** Space them 24-48h apart.
