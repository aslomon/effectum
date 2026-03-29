# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.17.7] - 2026-03-29

### Changed

- **Auto Mode as Default for Full Autonomy** — `full` autonomy level now uses `auto` mode as default (safer than `bypassPermissions`, aligns with Claude Code Auto Mode).

## [0.17.6] - 2026-03-29

### Fixed

- **Autonomy Detection from All Claude Code Modes** — Detect autonomy level from both `defaultMode` and `allow` list, supporting all 6 Claude Code permission modes.

## [0.17.5] - 2026-03-29

### Fixed

- **Autonomy Level Detection** — `effectum update` now correctly infers `autonomyLevel` from existing `settings.json` `defaultMode` when creating `.effectum.json` for legacy projects.

## [0.17.4] - 2026-03-29

### Fixed

- **Update Routing** — `bin/effectum.js` now correctly calls `update.js` `main()` when routing detected projects to the update flow.

## [0.17.3] - 2026-03-29

### Fixed

- **Effectum Detection** — Projects are now detected by unique Effectum-specific commands (`ralph-loop`, `prd/`) rather than generic `CLAUDE.md` presence, avoiding false positives.

## [0.17.2] - 2026-03-29

### Fixed

- **Legacy Project Support** — Projects with Effectum commands but no `.effectum.json` are now correctly detected and upgraded; config is inferred from existing setup during update.

## [0.17.1] - 2026-03-29

### Fixed

- **Auto-detect Update** — `npx @aslomon/effectum` in an existing Effectum project now automatically routes to `update` instead of the full installer.

## [0.17.0] - 2026-03-28

### Added

- **Command Entry Point & Smart Router** — New `/effectum` entry point with `/help` alias; smart `/next` router that reads project state and recommends the single best next action.
- **Namespace Reorganization (2026-03-28)** — Commands renamed for clarity: `/workshop:init` → `/project:init`, `/workshop:archive` → `/project:archive`, `/effectum:init` → `/context:init`. Deprecated old names still work with v0.19 removal notice.
- **Command Aliases (2026-03-28)** — New convenience aliases: `/run` (→ `/tdd`), `/stop` (→ `/cancel-ralph`), `/save` (→ `/checkpoint`), `/diagnose` (→ `/forensics`), `/explore` (→ `/map-codebase`).
- **Restructured Command README (2026-03-28)** — Updated `.claude/commands/README.md` with new hierarchical navigation: entry point (`/effectum`, `/help`, `/next`), core workflow, quality gates, git operations, loop control, orchestration, and setup categories.

### Changed

- **Feature Intake Batch 2 (2026-03-28)** — Tracked three new feature signals: Description length capping in v2.1.86 (P1: cap to 250 chars), X-Claude-Code-Session-Id header support for API proxies (P2: watchlist), and improvements to `/skills` listing (docs-only).
- **Effort Field on Commands** — Added `effort: "high"` annotation to `/ralph-loop` and `/orchestrate` commands to signal context-intensive operations.
- **Agent-Ready Extension Fields in `/prd:new`** — Quality Gates, Completion Promise, and Autonomy Rules conditionally prompted in Step 5 for agent-facing specifications.
- **Loop State Persistence** — `/cancel-ralph` now updates `.effectum/loop-state.json` with `status: "cancelled"` and `cancelled_at` timestamp for resumable workflows.
- **Plan Output Automation** — `/plan` command now writes plan to `.claude/plan.local.md` with YAML frontmatter in new Step 7; subsequent steps renumbered.
- **PRD Overlap Detection** — `/prd:new` reads existing PRDs in Step 2 for overlap detection.
- **CLAUDE.md Sentinel Integration** — `/prd:new` reads CLAUDE.md sentinel for domain context during feature generation.
- **Checkpoint Detection in `/ralph-loop`** — Detects checkpoint tags, stores in loop-state.json, mentions rollback in stuck handler.
- **Task Registry Integration** — `/tdd` now integrates with task registry (reads on start, updates on completion).
- **Debugger Agent Tags** — `debugger.md` agent now includes `tags: debugging, error-analysis, troubleshooting` for improved discoverability.

### Changed

- **Hook Conditionals in Templates** — Updated `settings.json.tmpl` templates to add `"if"` conditional fields: commit message validation only fires on `git commit*`, secret scanning fires on `git commit*` or `git push*`. Applied consistently across `.claude/settings.json`, `.effectum/templates/settings.json.tmpl`, and `system/templates/settings.json.tmpl`.
- **README.md Command Tables** — Updated formatting for consistency in Loop Control and Setup & Brownfield sections; added descriptions for `/forensics`, `/effectum:init`, and `/map-codebase` to command reference tables.
- **`/prd:handoff` Primary Next Step** — Now recommends `/ralph-loop` as the primary recommended next step for agentic workflows.
- **`/prd:network-map` Sanitize Order** — Mermaid sanitize step moved before write (Steps 7→11 renumbered for clarity).
- **`/workshop:archive` Path Format** — Fixed archive path to `workshop/archive/{date}_{slug}/` for consistent organization.
- **Preset Stack Assignments** — `nextjs-firebase` and `nextjs-prisma` presets corrected from `nextjs-supabase` to `generic` (no matching stack files exist).

## [0.16.0] - 2026-03-28

### Added

- **Sentinel-based CLAUDE.md Split** — `<!-- effectum:project-context:start/end -->` markers in the template. Content between sentinels is preserved across `effectum update` re-renders. Enables persistent project context that survives template changes.
- **Context Budget Monitor** — `/ralph-loop` and `/orchestrate` now estimate context usage before each iteration. At >80% usage: commit current state, write `HANDOFF.md` with structured handoff, and stop cleanly.
- **Stuck Detection** — `/ralph-loop` tracks error messages across iterations. If the same error repeats in 2 consecutive iterations: stop immediately, write `STUCK.md` with diagnosis and next steps.
- **Per-Iteration Loop State** — `/ralph-loop` persists `.effectum/loop-state.json` after every iteration. On startup, detects incomplete runs and offers to resume or start fresh.
- **Loop Ledger** — On completion (success, stuck, or budget stop), `/ralph-loop` appends a session entry to `effectum-metrics.json` with iterations, outcome, quality gates, and duration.
- **`/forensics` Command** — Post-mortem diagnosis that reads HANDOFF.md, STUCK.md, loop-state.json, effectum-metrics.json, and git log. Classifies failure mode, analyzes root cause, outputs `FORENSICS-YYYY-MM-DD.md` with recommended next steps.
- **`/effectum:init` Command** — Interactive 7-question interview to populate the sentinel block in CLAUDE.md with project-specific context (app description, users, domain terminology, architecture decisions, conventions, critical areas, tech debt).
- **`/map-codebase` Command** — Spawns 4 parallel analysis agents (ArchitectureMapper, StackMapper, QualityMapper, IntegrationMapper) that produce 7 knowledge documents in `knowledge/codebase/` (ARCHITECTURE.md, STACK.md, STRUCTURE.md, CONVENTIONS.md, TESTING.md, CONCERNS.md, INTEGRATIONS.md).
- **Hook Modernization** — Added `if` conditional fields to git-specific hooks in `settings.json.tmpl` (commit message check and secret scanning only fire on `git commit`/`git push`). Added `effort` field to command frontmatter.

### Changed

- **Version bumped** — v0.15.0 → v0.16.0
- **README** — Updated version badge, feature description for v0.16.0
- **Command Index** — Added `/forensics`, `/effectum:init`, `/map-codebase` to command reference

## [0.15.0] - 2026-03-26

### Added

- **YAML Frontmatter on All Commands** — All 28 command files (`.claude/commands/` and `system/commands/`) now include `---` YAML frontmatter with `name`, `description`, and `allowed-tools` fields. Enables machine-readable command metadata and improved CLI tooling.
- **Agent Spec Extraction from `/onboard`** — 6 specialized agent prompts extracted from `onboard.md` into separate files:
  - `system/agents/onboard-stack-analyst.md` — Technology stack detection
  - `system/agents/onboard-architecture-analyst.md` — Architecture pattern identification
  - `system/agents/onboard-api-analyst.md` — API endpoint discovery
  - `system/agents/onboard-database-analyst.md` — Database schema analysis
  - `system/agents/onboard-frontend-analyst.md` — Frontend structure & UI framework detection
  - `system/agents/onboard-test-analyst.md` — Testing framework and coverage analysis
  - `onboard.md` reduced from 578 → 202 lines (under 250-line target); agent prompts now live in isolated, maintainable files.
- **Command Index** (`system/commands/README.md`) — Comprehensive guide to all 28 commands organized by workflow category (Planning, Implementation, Quality, Git, Loop Control, Orchestration, Setup, PRD Workshop, Workshop). Includes workflow diagrams and decision trees.
- **Overview Table in `/onboard`** — Quick reference showing the 8-step onboarding process (Parse & Validate → Launch 6 Agents → Merge Results → Self-Test → Generate PRDs → Consistency Review → User Confirmation → Write Files) with parallel agents and expected outputs.
- **Prime Directives Repositioning in `/ralph-loop`** — Moved from line 224 ("CRITICAL RULES" section) to line 21 ("Prime Directives" section) for improved discoverability and immediate visibility in command file.

### Tests

- New `test/frontmatter.test.js` — 92 tests covering YAML frontmatter validation for all 28 command files:
  - Frontmatter presence and valid YAML syntax
  - Required fields: `name`, `description`, `allowed-tools`
  - Field value types and non-empty validation
  - Allowed-tools contain only valid tool names (Bash, Read, Edit, Write, Glob, Grep, Agent, etc.)
- **Total tests**: 389 (up from 297)

### Changed

- **Version bumped** — v0.14.2 → v0.15.0 (minor version bump for new features)
- **`.effectum.json` metadata** — Version reference updated

## [0.13.0] - 2026-03-25

### Added

- **`/design` Command** (`system/commands/design.md`) — 5-step workflow: read PRD → detect design signals → ask 3–5 lightweight questions → generate `DESIGN.md` → confirm. For frontend-heavy projects, bridges the gap between "what to build" (PRD) and "how it should look" (DESIGN.md).
- **`DESIGN.md` Template** (`system/templates/DESIGN.md.tmpl`) — 7 sections: Overview, Color System, Typography, Component Patterns, Layout & Spacing, Interaction Design, Constraints. Uses `{{projectName}}` / `{{stack}}` / `{{date}}` interpolation. TODO markers for user-driven sections.
- **`detectDesignSignals(dir)`** (`bin/lib/design.js`) — Scans for Tailwind (config files + package.json), shadcn (components.json), CSS custom properties (globals.css in 4 candidate paths). Returns structured `{ hasTailwind, hasShadcn, cssVars, existingColors }`.
- **Design docs** (`docs/design-md.md`) — When to use DESIGN.md, how to run `/design`, section reference, example snippet, FAQ.

### Tests

- 236 tests, all passing (up from 201)
- Added `test/design.test.js` — 35 tests covering Tailwind/shadcn/CSS detection, parseCssVars, isColorValue, template loading/interpolation, command file validation

## [0.12.0] - 2026-03-25

### Added

- **AGENTS.md Detection** — `detectAgentsMd(dir)` in `bin/lib/detect.js` detects `AGENTS.md` in project root and sets `agentsMdFound: true` with `certain` confidence; wired into `detectAll()`
- **`--output-format` CLI flag** — Accepts `claude-md` (default) | `agents-md` | `both`. When `agents-md` or `both`, generates a tool-agnostic `AGENTS.md` alongside or instead of `CLAUDE.md`. Auto-triggers when existing `AGENTS.md` detected in project.
- **AGENTS.md template blocks** (`system/blocks/agents-md/`) — 4 generic blocks with `{{projectName}}` / `{{stack}}` interpolation: `foundation.md`, `workflow.md`, `guardrails.md`, `commands.md`. No Claude-specific language — compatible with Codex, Gemini CLI, and other agents.
- **npm Stats Script** (`scripts/npm-stats.mjs`) — Tracks daily/weekly/monthly npm downloads and GitHub stars; outputs Markdown report to `reports/`. Safe for cron.
- **HN Launch Post draft** (`docs/launch/hn-post.md`) — Show HN post with thread strategy and timing notes.

### Changed

- **README** — Added Kiro to comparison table; added AGENTS.md positioning note; clarified CLI-native vs IDE-based tool positioning.
- **`docs/cli-reference.md`** — Documented `--output-format` flag with examples and full section.

### Tests

- 201 tests, all passing (up from 184)
- Added `test/agents-md.test.js` — 17 new tests covering detection, block loading, placeholder content, `composeBlocks` compatibility, and interpolation

## [0.11.1] - 2026-03-24

### Fixed

- **Rust/Cargo.toml detection** — Added `system/detect/rust.json` with 61 rules covering ecosystem, framework, build tooling, and async runtime detection; maps to `rust-actix` stack preset
- **npx entrypoint** — `main()` was never called via `npx` because `require.main !== module` when loaded by `effectum.js` router; fixed by checking `process.argv[1]` instead

## [0.11.0] - 2026-03-24

### Added

- **Agent Teams Orchestration**: 5 YAML team profiles (web-feature, fullstack, frontend-only, review, overnight-build) with agent specializations, file ownership, phased execution, quality gates, and cost estimates
- **`/orchestrate` Command** — Full lifecycle management: profile loading, prerequisite validation, cost estimation, team creation, PRD-based task distribution, progress monitoring, nudge, and shutdown
- **`suggestTeams()` Function** — Recommendation engine that suggests optimal team profiles based on code complexity (ACs, module count, parallel streams)
- **Team Hooks**: Enhanced `TeammateIdle` and `TaskCompleted` hooks for task completion validation and test status verification

### Changed

- **`bin/lib/recommendation.js`** — Integrated `suggestTeams()` logic into recommendation engine output
- **`system/templates/settings.json.tmpl`** — Added team hook configuration for automatic task validation
- **`system/templates/AUTONOMOUS-WORKFLOW.md`** — Added Section 9.5 with `/orchestrate` reference, YAML profile table, and cost awareness guidance
- **`docs/teams.md`** — Complete rewrite with YAML schema, all 5 profile definitions, `/orchestrate` workflow, and automatic recommendation logic

## [0.10.0] - 2026-03-24

### Fixed

- **AC-1:** `readConfig()` now throws a descriptive `Error` with message containing `"Config corrupted"` on invalid JSON instead of silently returning `null`
- **AC-2:** `loadStackPreset()` falls back to the `generic` preset with a warning log instead of crashing when an unknown stack key is requested
- **AC-3:** `checkPackageAvailable()` now uses async `spawn` + `Promise.all` for parallel MCP package checks — reduces max wait from ~32s to ≤10s
- **AC-4:** `deepMerge()` uses concat+deduplicate for `permissions.allow` and `permissions.deny` arrays instead of overriding — preserves user-defined deny rules through `reconfigure`
- **AC-5:** `parseStackPreset()` regex updated to handle CRLF (`\r\n`) line endings — fixes silent parse failures on Windows
- **AC-6:** `installBaseFiles()` ensures the `.claude/` directory exists before any file writes — prevents crash on first install
- **AC-7:** `installPlaywrightBrowsers()` fallback error path now correctly references `result2.stderr` instead of `result.stderr`
- **AC-8:** `findRepoRoot()` uses `__dirname`-based traversal instead of `require.main?.filename` — works correctly when Effectum is loaded as a library

### Tests

- 184 tests, all passing (up from 156)
- Added `test/install.test.js` — 28 new integration and unit tests covering `checkPackageAvailable()`, `installBaseFiles()`, `findRepoRoot()`, `installPlaywrightBrowsers()`
- Extended `test/stack-parser.test.js` — CRLF handling + fallback preset coverage
- Extended `test/utils.test.js` — permissions array merge coverage
- Extended `test/config.test.js` — corrupt config error handling

## [0.9.0] - 2026-03-23

### Added

- **Modular Stack Selection + Smart Auto-Detection System**:
  - Detection rules (`system/detect/`) — 5 JSON rule files covering JavaScript (27 rules), Python (13), Go (7), Swift (5), Dart (5) for ecosystem, framework, database, auth, deploy, and ORM detection
  - Quick-start presets (`system/presets/`) — 8 preset definitions (nextjs-supabase, nextjs-firebase, nextjs-prisma, django-postgres, fastapi-postgres, go-echo-postgres, swift-swiftui, flutter-firebase)
  - Template blocks (`system/blocks/`) — 14 CLAUDE.md template block files organized by category
  - Refactored detection engine (`bin/lib/detect.js`) with 5 new parsers and structured confidence levels (`certain`, `partial`, `none`)
  - Block-based template composition (`bin/lib/template.js`) — `loadBlock()` and `composeBlocks()` for dynamic CLAUDE.md generation
  - Enhanced UI prompts (`bin/lib/ui.js`) — `confirmDetectedStack()`, `askMissingComponents()`, `askPresetOrCustom()`, `askModularStack()`
  - Installer confidence-based skip logic with `--yes` smart defaults
  - Extended constants for django-postgres/rust-actix in FORMATTER_MAP
- **Interactive HTML Network Map Viewer** — dark/light theme, direction toggle, SVG export (auto-generated by `/prd:network-map`)

### Changed

- Installer flow is now confidence-based: `certain` (confirm/change), `partial` (pre-fill + ask missing), `none` (preset or modular)
- Stores `modular` selection in `.effectum.json` alongside legacy `stack` key

### Fixed

- Next.js-only projects no longer incorrectly detected as `nextjs-supabase`
- Mermaid syntax safety rules added to network-map-guide (quote labels with slashes/special chars)

## [0.8.0] - 2026-03-23

### Added

- **`/onboard` Command** — reverse-engineers existing codebases into Effectum PRDs via 6 parallel analysis agents (Stack, Architecture, API, Database, Frontend, Tests), self-test loop (7 tests, max 5 iterations), PRD generation per feature area, automatic `/onboard:review`, user-driven correction flow
- **`/onboard:review` Command** — consistency review with 6 checks (cross-PRD consistency, duplicate features, simplification opportunities, scope clarity, naming conventions, full coverage); supports `--fix` and `--strict` flags
- Updated PRD template (`workshop/knowledge/01-prd-template.md`) — added `implemented` status and `onboarded` field to frontmatter schema

## [0.7.0] - 2026-03-23

### Added

- **Stack Preset: Go + Echo** (`system/stacks/go-echo.md`, `system/tools/go-echo.json`) — Go 1.22+, Echo v4, GORM, PostgreSQL, Air hot-reload, golangci-lint, golang-migrate
- **Stack Preset: Django + PostgreSQL** (`system/stacks/django-postgres.md`, `system/tools/django-postgres.json`) — Python 3.12+, Django 5+, DRF, pytest-django, ruff, mypy, uv

## [0.6.2] - 2026-03-22

### Added

- 124 unit tests for recommendation engine, detect module, template engine, and stack parser (`node:test`)
- GitHub Actions CI/CD pipeline (`ci.yml` + `publish.yml`)
- Launch content and marketing materials

## [0.6.1] - 2026-03-21

### Fixed

- Task registry is now mandatory in ralph-loop and CLAUDE.md — enforces status updates every iteration

## [0.6.0] - 2026-03-21

### Added

- **PRD Lifecycle Management System**:
  - Task Registry template (`workshop/templates/tasks.md`) — auto-managed with stable task IDs and status transitions
  - Delta Handoff template (`workshop/templates/delta-handoff.md`) — structured handoff with Protection Rules, Regression Mandate, Hard Remove Policy
  - `/prd:update` Command — 15-step workflow for semantic section diffs, change classification (ADDITIVE/MODIFIED/REMOVED/DESIGN/STRUCTURAL), impact analysis, Git checkpoints, Task Registry + Network Map updates, Delta Handoff generation
  - Enhanced PRD template with YAML frontmatter (id, version, status, features[], connections[], Changelog table)
  - Network Map auto-sync — frontmatter-driven deterministic generation with `--validate` flag

### Changed

- `/prd:new` — auto-generates frontmatter + Stage 1 network map on creation
- `/prd:handoff` — initializes Task Registry on first handoff (1 task per Acceptance Criterion)
- `/prd:network-map` — added `--validate` flag for circular deps, isolated nodes, orphaned refs, status mismatches
- Ralph Loop — added PRD-hash change detection, Task Registry sync, Network Map status sync

## [0.5.0] - 2026-03-21

### Added

- **Extensible JSON-Based Tool Management System**:
  - `system/tools/_schema.json` — JSON schema documentation for tool definitions
  - `system/tools/foundation.json` — always-loaded foundation tools (git, gh, claude)
  - Stack-specific tool files: `nextjs-supabase.json`, `python-fastapi.json`, `swift-ios.json`, `generic.json`
  - Each tool definition includes: key, bin, displayName, category, why, priority, autoInstall, install (per-platform), check, auth, manualUrl
- **Dynamic Tool Loader** (`bin/lib/tool-loader.js`) — merge order: foundation → stack → `.effectum/tools/` → `~/.effectum/tools/` (last wins)
- Comprehensive documentation updates

### Changed

- `bin/lib/cli-tools.js` — refactored to use tool-loader instead of hardcoded definitions
- New UI functions: `showSystemCheck()`, `showInstallPlan()`, `showAuthCheck()` (replacing monolithic `showCliToolCheck()`)
- `--yes` mode: checks all dependencies and reports status without blocking on unauthenticated tools

## [0.4.0] - 2026-03-21

### Added

- **Agent Specializations**: Mobile Developer (`system/agents/mobile-developer.md`) and Data Engineer (`system/agents/data-engineer.md`)
- **Security Hooks**: Secret detection hook (PreToolUse/Bash) for detecting API keys, credentials, tokens in git commits
- **TDD Enforcement Hook**: Stop Prompt hook enforcing test-driven development with `stop_hook_active` bypass
- **CLI Tool Check** (`bin/lib/cli-tools.js`) — guided installation and authentication for git, gh, supabase, vercel, docker, uv, ruff, xcodebuild
- `{{AVAILABLE_TOOLS}}` template substitution for dynamic tool availability in CLAUDE.md

### Changed

- `bin/lib/specializations.js` — registered both new specializations with domain-specific tags and stack mappings

## [0.3.0] - 2026-03-21

### Added

- **Intelligent Setup Recommender Engine**:
  - `bin/lib/languages.js` — 15+ language definitions
  - `bin/lib/app-types.js` — 9 application type definitions with intent tags
  - `bin/lib/foundation.js` — 8 always-active foundation hooks (File Protection, Destructive Blocker, Git Context, Guardrails Injection, Post-Compaction, Error Logger, Transcript Backup, Auto-Formatter)
  - `bin/lib/recommendation.js` — rules-based engine deriving optimal Commands, Hooks, Skills, MCPs, Subagent specializations from stack + app-type + description keywords
- **9-Step Intelligent Setup Flow**: scope detection, project basics, app type, description, language, autonomy level, recommendation preview, setup mode, installation with optional git branch
- **Configuration Persistence** — `.effectum.json` v0.4.0 schema with `appType`, `description`, `recommended`, `mode`
- `bin/reconfigure.js` — re-apply configuration with Agent Teams env var support
- Smart defaults with `--dry-run` flag

### Changed

- Complete CLI rewrite with `@clack/prompts` TUI replacing argument-based approach
- Config schema updated to v0.4.0

### Fixed

- Framework detection: Next.js-only projects no longer detected as `nextjs-supabase`
- All 9+ placeholders correctly substituted; zero leftover `{{...}}` in generated files
- Autonomy mode mapping: `conservative→default`, `standard→default`, `full→bypassPermissions`

## [0.1.6] - 2026-03-20

### Fixed

- Deduplicated utils, fixed stack-parser regex, added `--version` flag, fixed global outro text

## [0.1.1] - 2026-03-20

### Fixed

- Added MIT license file
- Removed phantom `/orchestrate` command from CLAUDE.md template
- README overhauled with honest positioning, npx install as primary method, limitations section
- Installer: added note to run `/setup` after install to substitute placeholders in settings.json

### Changed

- Bumped version to 0.1.1, updated repo URL from placeholder to `aslomon/effectum`

## [0.1.0] - 2026-03-15

### Added

- **System Redesign**: restructured into installable ecosystem with Workshop (`workshop/`), Installable System (`system/`), and Documentation (`docs/`)
- **10 System Commands**: `/plan`, `/tdd`, `/verify`, `/e2e`, `/code-review`, `/build-fix`, `/refactor-clean`, `/ralph-loop`, `/cancel-ralph`, `/checkpoint`
- **Framework Presets** (`system/stacks/`): Next.js + Supabase, Python + FastAPI, Swift/SwiftUI, Generic
- **PRD Workshop**: guided specification creation with 8 knowledge files, adaptive questioning, network maps
- **MCP Server Integration**: Context7, Playwright, Sequential Thinking, Filesystem
- Translated all Claude Code commands from German to English

[Unreleased]: https://github.com/aslomon/effectum/compare/v0.16.0...HEAD
[0.16.0]: https://github.com/aslomon/effectum/compare/v0.15.0...v0.16.0
[0.15.0]: https://github.com/aslomon/effectum/compare/v0.13.0...v0.15.0
[0.9.0]: https://github.com/aslomon/effectum/compare/v0.8.0...v0.9.0
[0.8.0]: https://github.com/aslomon/effectum/compare/v0.7.0...v0.8.0
[0.7.0]: https://github.com/aslomon/effectum/compare/v0.6.2...v0.7.0
[0.6.2]: https://github.com/aslomon/effectum/compare/v0.6.1...v0.6.2
[0.6.1]: https://github.com/aslomon/effectum/compare/v0.6.0...v0.6.1
[0.6.0]: https://github.com/aslomon/effectum/compare/v0.5.0...v0.6.0
[0.5.0]: https://github.com/aslomon/effectum/compare/v0.4.0...v0.5.0
[0.4.0]: https://github.com/aslomon/effectum/compare/v0.3.0...v0.4.0
[0.3.0]: https://github.com/aslomon/effectum/compare/v0.1.6...v0.3.0
[0.1.6]: https://github.com/aslomon/effectum/compare/v0.1.1...v0.1.6
[0.1.1]: https://github.com/aslomon/effectum/compare/v0.1.0...v0.1.1
[0.1.0]: https://github.com/aslomon/effectum/releases/tag/v0.1.0
