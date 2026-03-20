# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

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
  - `/cancel-ralph` - Cancel active RALPH sessions
  - `/checkpoint` - Save project snapshots
- **Framework Presets** (`system/stacks/`): Stack-specific configuration templates:
  - Next.js + Supabase preset
  - Python + FastAPI preset
  - Swift/SwiftUI preset
  - Generic stack-agnostic baseline
- **Workshop Reorganization**: Moved PRD creation tools and templates into dedicated workshop module for focused project discovery
- **Enhanced Documentation**: Expanded docs with installation guide, customization guide, troubleshooting, and visual workflow diagrams

### Changed

- **Internationalization**: Translated all Claude Code commands from German to English for broader accessibility
- **Project Structure**: Reorganized workshop files from top-level directories into `workshop/` module for clearer separation of concerns
- **Command Documentation**: Updated all `.claude/commands/` with new unified format and enhanced workflow descriptions

### Removed

- **Moved to Workshop**: Knowledge base, templates, and example project files reorganized into `workshop/` module (not deleted, just relocated)

[Unreleased]: https://github.com/yourname/prd-workshop/compare/v0.0.0...HEAD
