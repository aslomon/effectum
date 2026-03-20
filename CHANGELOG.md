# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- **Intelligent Setup Recommender Engine**:
  - `bin/lib/languages.js` - 15+ language definitions with setup instructions
  - `bin/lib/app-types.js` - 9 application type definitions with intent tags (Web App, API/Backend, Mobile, Desktop, CLI, Automation/Agent, Data/ML, Library/SDK, Other)
  - `bin/lib/foundation.js` - 8 foundation hooks that are always active and non-toggleable (File Protection, Destructive Blocker, Git Context, Guardrails Injection, Post-Compaction, Error Logger, Transcript Backup, Auto-Formatter)
  - `bin/lib/specializations.js` - 17 subagent specialization mappings with stack-aware configurations
  - `bin/lib/recommendation.js` - Rules-based recommendation engine that derives optimal Commands, Hooks, Skills, MCPs, and Subagent specializations from stack + app-type + description keywords
- **9-Step Intelligent Setup Flow**:
  - Scope detection (local project or monorepo)
  - Project basics (name, package manager)
  - Application type selection with intent-based guidance
  - Project description for semantic analysis
  - Language selection with region-specific variants
  - Autonomy level (conservative/standard/full)
  - Recommendation preview showing Foundation + recommended configuration
  - Three setup modes: Use Recommended / Customize / Manual configuration
  - Full installation with optional git branch creation
- **Enhanced UI Prompts** (`bin/lib/ui.js`):
  - `askScope()` - Detect local vs. monorepo project scope
  - `askAppType()` - Interactive app type selection with descriptions
  - `askDescription()` - Semantic input for recommendation refinement
  - `showRecommendation()` - Visual preview of Foundation + Recommended Setup
  - `askSetupMode()` - Three-way choice: Recommended/Customize/Manual
  - `askCustomize()` - Per-category customization interface
  - `askManual()` - Full manual configuration from scratch
- **Interactive CLI Configurator** with @clack/prompts TUI:
  - `bin/lib/constants.js` - Autonomy/Formatter Maps, MCP-Server definitions, choice mappings
  - `bin/lib/detect.js` - Auto-detection of Stack, Project name, Package Manager
  - `bin/lib/stack-parser.js` - Parses Stack preset Markdown into Key-Value Maps
  - `bin/lib/template.js` - Placeholder substitution engine
  - `bin/lib/config.js` - `.effectum.json` read/write utilities (v0.4.0 schema with appType, description, recommended, mode)
  - `bin/effectum.js` - Subcommand router (install/init/reconfigure)
  - `bin/init.js` - Per-project initialization
  - `bin/reconfigure.js` - Re-apply configuration from `.effectum.json` with Agent Teams env var support
- **Smart Defaults**: Auto-detection of project context with recommendation engine fallback
- **Multi-Select Support**: Interactive selection for Stack, Language, Autonomy, and MCP Servers
- **Configuration Persistence**: `.effectum.json` for re-running configuration with version tracking
- **Dry-run Mode**: `--dry-run` flag shows plan without writing files
- **Git Integration**: Optional git branch creation during setup
- **@clack/prompts Dependency**: Modern TUI library for interactive prompts

### Changed

- **CLI Rewrite**: Complete rewrite of `bin/install.js` with 9-step intelligent recommendation flow
- **Config Schema**: Updated to v0.4.0 with `appType`, `description`, `recommended`, and `mode` fields
- **Constants Module**: Delegated language and app-type definitions to specialized modules with backward-compatible re-exports
- **Reconfigure Module**: Enhanced to support v0.4.0 config schema and set Agent Teams environment variable
- **Package.json**: Updated bin entry to `effectum.js`, version bumped to reflect feature additions
- **Installation Flow**: Interactive guided setup with AI-driven recommendations replacing previous argument-based approach

### Fixed

- **Placeholder Substitution**: All 9+ placeholders correctly substituted in generated files
- **Zero Leftover Placeholders**: Verification that no `{{...}}` remain in generated files
- **Autonomy Mode Mapping**: Correct mapping of `conservative→default`, `standard→default`, `full→bypassPermissions`
- **Foundation Hook Safety**: All 8 foundation hooks remain non-toggleable to ensure core system safety

## [0.1.1] - 2026-03-20

### Fixed

- **LICENSE**: Added MIT license file
- **CLAUDE.md.tmpl**: Removed phantom `/orchestrate` command from commands table (command doesn't exist)
- **README**: Overhauled with honest positioning, npx install as primary method, limitations section
- **installer**: Added note to run `/setup` after install to substitute placeholders in settings.json

### Changed

- **package.json**: Bumped version to 0.1.1
- **CHANGELOG**: Updated repo URL from placeholder to `aslomon/effectum`

## [0.1.0] - 2026-03-15

### Added

- **System Redesign**: Restructured into installable ecosystem with three distinct parts:
  - **Workshop Tools** (`workshop/`) - Interactive PRD creation system with templates and knowledge base
  - **Installable System** (`system/`) - Reusable command stacks, frameworks, and templates for any project
  - **Comprehensive Documentation** (`docs/`) - Complete guides for installation, customization, and troubleshooting
- **New System Commands**: 10 installable commands covering complete autonomous development workflow:
  - `/plan` - Create detailed project plans
  - `/tdd` - Test-driven development workflow
  - `/verify` - Verification and validation checks
  - `/e2e` - End-to-end testing
  - `/code-review` - Automated code quality review
  - `/build-fix` - Build failure recovery
  - `/refactor-clean` - Code cleanup and optimization
  - `/ralph-loop` - Rapid iterative refinement
  - `/cancel-ralph` - Cancel active Ralph Loop sessions
  - `/checkpoint` - Save project snapshots
- **Framework Presets** (`system/stacks/`): Stack-specific configuration templates:
  - Next.js + Supabase preset
  - Python + FastAPI preset
  - Swift/SwiftUI preset
  - Generic stack-agnostic baseline
- **PRD Workshop**: Guided specification creation with 8 knowledge files, adaptive questioning, network maps
- **MCP Server Integration**: Context7, Playwright, Sequential Thinking, Filesystem
- **Enhanced Documentation**: Installation guide, customization guide, troubleshooting, visual workflow diagrams

### Changed

- **Internationalization**: Translated all Claude Code commands from German to English
- **Project Structure**: Reorganized workshop files into `workshop/` module
- **Command Documentation**: Updated all `.claude/commands/` with new unified format

[0.1.1]: https://github.com/aslomon/effectum/compare/v0.1.0...v0.1.1
[0.1.0]: https://github.com/aslomon/effectum/releases/tag/v0.1.0
