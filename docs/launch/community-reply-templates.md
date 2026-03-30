# Community Reply Templates — Effectum

> **Purpose:** Ready-to-use replies for HN, Reddit, and Discord after launch  
> **Created:** 2026-03-30  
> **Usage:** Copy → adapt tone to the thread → post. Don't copy verbatim; add one personal detail.

---

## HN Thread Replies

### "How is this different from GSD?"

> GSD is about how you structure the context Claude Code operates in — the CLAUDE.md, folder conventions, working memory pattern. That's context engineering, and it works well.
>
> Effectum is about what happens after the context is set up. It runs the build loop, enforces quality gates every iteration, and stops when a defined completion promise is satisfied — not when Claude thinks it's done. They're complementary, not competing. Effectum actually generates a CLAUDE.md on `/context:init` that follows GSD conventions.

---

### "Won't it just loop forever on a hard problem?"

> Three stops: (1) max iterations (default 30, configurable), (2) Stuck Detection — if the same error repeats twice in a row, it stops and writes a STUCK.md with diagnosis, (3) Context Budget Monitor stops cleanly at 80% context usage with a HANDOFF.md so you can resume. It fails loudly, not silently.

---

### "How is the Ralph Loop different from just running Claude in agent mode?"

> Vanilla agent mode is reactive — Claude decides when it's done. Ralph Loop is declarative — you define the done condition upfront as a completion promise. The difference shows up on anything non-trivial: Claude has a tendency to call "done" while TypeScript errors still exist or tests are at 70%. Quality gates are non-negotiable and run after every iteration.

---

### "This only works for Claude Code right now?"

> Yes, Claude Code only for now. The slash command system and loop execution are Claude Code-specific. The PRD Workshop and spec format are model-agnostic — in theory portable. If Codex or other agents get a similar slash-command mechanism, extending Effectum would be straightforward. Claude Code is where the current traction is.

---

### "Traction of X downloads — isn't that just bots/mirrors?"

> Fair question. npm download counts include CI and mirroring, but 1,650 downloads in a week with zero promotion is a meaningful signal — especially because the package requires interactive setup (not a library you accidentally pull as a dep). The real metric I care about is GitHub stars and actually hearing from people using it. That's what this post is for.

---

### "Why not just prompt Claude to iterate until tests pass?"

> You can, and it sometimes works. Effectum makes it repeatable, observable, and recoverable. Without the framework: no context budget tracking (so it fails mid-loop silently), no per-iteration state persistence (so you can't resume), no spec structure (so spec quality varies), no stuck detection (so it loops on the same error). For one-off tasks, free-form prompting is fine. For anything you want to ship reliably, you need the structure.

---

## Reddit Replies

### r/ClaudeAI — "What stack does this work with?"

> Seven presets out of the box: Next.js+Supabase, FastAPI, Django+PostgreSQL, Go+Echo, Rust+Actix, Swift/SwiftUI, and generic. The presets configure quality gates and stack-specific test commands. You can override anything in the config — the presets are a starting point, not a cage.

---

### r/ClaudeAI — "Is there a video demo?"

> No video yet — that's the honest answer. The best way to see it in action is `npx @aslomon/effectum` — it asks two questions and configures everything. Then `/next` tells you exactly what to do first. Should take under 10 minutes to have it running on an existing project.
>
> If there's enough interest I'll record a walkthrough. HN/Reddit launch is the forcing function.

---

### r/SideProject — "How long did this take to build?"

> About 2 months from the first version to v0.18.3. I kept using it on my own projects (a Next.js+Supabase app and a CLI tool), and every time it failed in a surprising way, I added a guard. The test suite grew alongside the edge cases — it's at 539 tests now, mostly because I kept finding new ways to break the loop.

---

### r/SideProject — "Monetization plan?"

> No plans right now — it's MIT and I want it to spread. The long-term possibility is a hosted dashboard (loop metrics, team PRD library, run history) but that's v2 thinking. Right now I want the core to be solid and used. Stars and feedback are worth more than revenue at this stage.

---

### r/programming — "Why Node/CommonJS? Seems like an odd choice for a dev framework."

> Practicality: Claude Code itself runs in a Node environment, and the `.claude/commands/` files are markdown + YAML frontmatter — no compilation step. CommonJS because the tooling Claude Code wraps around is CJS-first and I didn't want async ESM module loading surprises. Zero runtime dependencies for the core. It's an unusual stack for a "framework" but it fits the constraint.

---

## Discord / Community Replies

### "Does Effectum replace my current Claude Code setup?"

> It layers on top. Effectum generates and manages your CLAUDE.md, AGENTS.md, and `.claude/commands/` — but your existing content is preserved inside sentinel blocks. Run `/context:init` on an existing project and it'll ask you 7 questions, then insert the project-specific context without overwriting what you already have.

---

### "Can I use this on a brownfield project?"

> Yes — that's actually the `/onboard` command's purpose. It runs 6 parallel analysis agents (stack, architecture, API, database, frontend, tests) and produces a structured codebase map. Then `/context:init` populates CLAUDE.md with what it found. Takes a few minutes on a real codebase but gives Claude accurate context instead of generic instructions.

---

### "How do you handle secrets in the quality gates?"

> The pre-commit hook in `settings.json` includes a secret scanner that runs on `git commit*` and `git push*` (conditional `if` fields, so it doesn't fire on other commands). It's pattern-based — catches common formats like `sk-*`, `AKIA*`, `.env` content in staged files. Not a replacement for Gitleaks or Trufflehog, but a fast first line of defense.

---

## General Tone Notes

- **HN:** Technical and direct. Acknowledge tradeoffs. Don't oversell. Answer the literal question.
- **Reddit r/ClaudeAI:** More casual, more "fellow user" energy. Focus on the problem Effectum solves for Claude Code users specifically.
- **Reddit r/SideProject:** Builder-to-builder. Be honest about the journey — the 2 months, the edge cases, the lack of stars vs. downloads. People appreciate transparency.
- **Discord:** Concise. Use code formatting for commands. End with a question or offer to help debug.

---

## Outreach (after initial traction)

If HN post gets 50+ upvotes, reach out to:
- **swyx** (swyx.io) — writes about dev tools, Claude Code ecosystem. X: @swyx
- **Alex Albert** (@alexalbert__) — Anthropic Claude advocate, follows the ecosystem
- **Aravind Srinivas** or Perplexity team — interested in agentic dev tooling  
- **GSD creator** — natural collaboration/mention angle (Effectum is compatible/complementary)

Format: short DM, no ask. "Built something in your ecosystem you might find interesting." One link.
