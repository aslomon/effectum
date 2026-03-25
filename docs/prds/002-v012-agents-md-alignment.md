# PRD: v0.12.0 — AGENTS.md Alignment & CLI-Native Positioning

**ID:** 002  
**Version:** 0.12.0  
**Status:** Draft  
**Author:** Lumi (Orchestrator)  
**Created:** 2026-03-25  
**Priority:** P0

---

## Problem

The ecosystem is converging on `AGENTS.md` as the standard project instruction file. GSD v2.37 (39k+ GitHub Stars) already supports it natively and is deprecating `agent-instructions.md`. BMAD v6 and Kiro have similar standardization patterns.

Effectum currently generates `CLAUDE.md` — which is Claude-Code-specific and creates friction for:
1. Developers who work across multiple AI coding tools
2. Projects that adopt `AGENTS.md` as the multi-agent standard
3. Attracting users from the GSD ecosystem

Additionally, Effectum has no public signal of npm downloads or GitHub activity — making it impossible to assess reach, justify the community launch, or inform feature decisions.

### The Opportunity

Kiro's opaque pricing and IDE-lock-in are generating developer backlash. Effectum's positioning as **CLI-native, transparent, works-with-your-tools** is a direct counter. But to benefit from this, Effectum needs:
- A clear, confident differentiation narrative
- Alignment with ecosystem conventions (AGENTS.md)
- A community launch that capitalizes on Kiro frustration timing

---

## Goal

1. **Add `AGENTS.md` as an optional output format** alongside `CLAUDE.md` — detectable from existing project conventions, or selectable in the configurator
2. **Add npm downloads + GitHub Stars tracking** — lightweight Cron-based reporting so Jason can see growth
3. **Refine CLI-native positioning in README + docs** — direct, honest contrast vs Kiro/IDE-based tools
4. **Community Launch prep** — finalize HackerNews post + Product Hunt launch assets

---

## Core Product Principle

> "Works with your tools, not replacing them."

Effectum is Claude Code-native. It doesn't lock you into an IDE or a cloud dashboard. It runs in your terminal, writes to your project files, and gets out of the way. The only lock-in is better defaults.

---

## Acceptance Criteria

### AC-1: AGENTS.md Detection
- `bin/lib/detect.js` detects `AGENTS.md` in project root
- If found: suggest to Effectum user whether to also update `AGENTS.md` alongside `CLAUDE.md`, or replace `CLAUDE.md` with `AGENTS.md` as primary
- Detection confidence: `certain` if file exists, `none` otherwise

### AC-2: AGENTS.md Generation Option
- New `--output-format` flag (or interactive prompt option): `claude-md` (default) | `agents-md` | `both`
- When `agents-md` or `both` is selected: generate `AGENTS.md` using the same block-composition system as `CLAUDE.md`
- `AGENTS.md` template uses generic language (no "Claude"-specific references) — works for Claude Code, Codex, Gemini CLI, etc.
- Docs updated with new flag in `docs/cli-reference.md` and `docs/extending-stacks.md`

### AC-3: `AGENTS.md` template blocks
- Create `system/blocks/agents-md/` directory with generic template blocks
- At minimum: `foundation.md`, `workflow.md`, `guardrails.md`, `commands.md`
- Blocks use `{{variable}}` interpolation consistent with existing template system
- Tests: `test/agents-md.test.js` — 12 unit tests covering detection, generation, interpolation

### AC-4: npm Downloads Tracking
- `scripts/npm-stats.mjs` — fetches daily/weekly/monthly downloads from `https://api.npmjs.org/downloads/point/last-week/@aslomon/effectum`
- GitHub Stars: fetches from `https://api.github.com/repos/aslomon/effectum` (no auth needed for public repos, rate-limit-safe at 1 req/run)
- Output: Markdown summary `reports/npm-stats-YYYY-MM-DD.md`
- Cron-safe: single run, exits cleanly

### AC-5: README Positioning Refresh
- Add "Why not Kiro / GSD / BMAD?" section to README.md
- Honest, non-aggressive comparison: what each tool is good at, where Effectum differs
- Emphasize: CLI-native, Claude Code-native, lightweight, no IDE required, transparent config
- Add AGENTS.md support badge/note once AC-2 ships

### AC-6: HN Launch Post Draft
- `docs/launch/hn-post.md` — Show HN draft ready for Jason review
- Max 400 words, honest positioning, links to npm + GitHub
- Thread strategy: answer questions about BMAD/GSD/Kiro comparison proactively

### AC-7: Backwards Compatibility
- Existing projects with `CLAUDE.md` are unaffected
- `--output-format` defaults to `claude-md` if not specified
- Migration note in CHANGELOG when AGENTS.md support ships

---

## Scope

### In Scope
- AGENTS.md detection + generation
- npm/GitHub stats script
- README positioning refresh
- HN launch post draft
- Tests for all new code

### Out of Scope
- Product Hunt launch (needs design assets — separate task)
- Multi-agent routing across tools (future)
- Community skills marketplace (future — separate PRD)
- AGENTS.md runtime enforcement (Claude Code specific — out of scope)

---

## Data Model

No new persistent data. `scripts/npm-stats.mjs` writes to `reports/` (gitignored).

---

## Implementation Notes

- `system/detect/agents-md.json` — single detection rule: `files: ["AGENTS.md"]` → ecosystem: `multi-agent`, confidence: `certain`
- Template composition: reuse `bin/lib/template.js` `composeBlocks()` — just point to `agents-md/` blocks
- Stats script: pure Node.js, no new dependencies, uses built-in `fetch` (Node 18+)

---

## Success Criteria

| Metric | Target |
|--------|--------|
| AGENTS.md detection works | ✅ Unit test pass |
| `--output-format agents-md` generates valid file | ✅ Unit test pass |
| All existing tests still pass | ✅ 184+ tests green |
| npm stats script runs without error | ✅ Manual test |
| HN post draft ready for Jason | ✅ File in docs/launch/ |

---

## Open Questions

1. Should `AGENTS.md` use a different section structure than `CLAUDE.md`? (Recommend: yes — more generic, less Claude-specific jargon)
2. Should Effectum add a `--dry-run` flag that shows what would be generated without writing files? (Nice-to-have, not in this PRD)
3. Community launch: HN first or Product Hunt first? (Recommend: HN first — dev audience, immediate feedback)
