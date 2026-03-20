# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- **Interactive CLI Configurator** with @clack/prompts TUI:
  - `bin/lib/constants.js` - Autonomy/Formatter Maps, MCP-Server definitions, choice mappings
  - `bin/lib/detect.js` - Auto-detection of Stack, Project name, Package Manager
  - `bin/lib/stack-parser.js` - Parses Stack preset Markdown into Key-Value Maps
  - `bin/lib/template.js` - Placeholder substitution engine
  - `bin/lib/config.js` - `.effectum.json` read/write utilities
  - `bin/lib/ui.js` - @clack/prompts wrapper for all interactive prompts
  - `bin/effectum.js` - Subcommand router (install/init/reconfigure)
  - `bin/init.js` - Per-project initialization
  - `bin/reconfigure.js` - Re-apply configuration from `.effectum.json`
- **Smart Defaults**: Auto-detection of project context with fallback mechanisms
- **Multi-Select Support**: Interactive selection for Stack, Language, Autonomy, and MCP Servers
- **Configuration Persistence**: `.effectum.json` for re-running configuration
- **Dry-run Mode**: `--dry-run` flag shows plan without writing files
- **Git Integration**: Optional git branch creation during setup
- **@clack/prompts Dependency**: Modern TUI library for interactive prompts

### Changed

- **CLI Rewrite**: Complete rewrite of `bin/install.js` with new @clack/prompts TUI
- **Package.json**: Updated bin entry to `effectum.js`, bumped version to 0.2.0
- **Installation Flow**: New interactive guided setup replacing previous argument-based approach

### Fixed

- **Placeholder Substitution**: All 9+ placeholders correctly substituted in generated files
- **Zero Leftover Placeholders**: Verification that no `{{...}}` remain in generated files
- **Autonomy Mode Mapping**: Correct mapping of `conservative→default`, `standard→default`, `full→bypassPermissions`

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
