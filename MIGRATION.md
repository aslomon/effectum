# Effectum Migration Guide

## v0.17/v0.18 → current (Namespace Reorganization)

**Released:** v0.17.0 (2026-03-28) · **Finalized:** v0.18.x (2026-03-29)

Effectum reorganized its command namespace for clarity. All old command names still work — they show a one-line deprecation notice and execute identically. **No commands were broken.** The old names will be removed in **v0.20**.

---

### Why the change?

Two namespaces now exist:

| Namespace | Purpose | Entry point |
|-----------|---------|-------------|
| `effect:dev:*` | Day-to-day development work | `/effect:dev:tdd`, `/effect:dev:fix`, … |
| `effectum:*` | Setup, onboarding, project management | `/effectum:init`, `/effectum:setup`, … |
| `effect:prd:*` | PRD Workshop | `/effect:prd:new`, `/effect:prd:status`, … |
| `effect:next` | Smart router | `/effect:next` |

The top-level `/effectum` command is the entry point. `/effect:next` (or just `/next` via alias) reads your project state and tells you which one to use.

---

### Command Rename Table (v0.16 → v0.18)

All old names still execute. Permanent aliases are marked ✅. Deprecated aliases are marked ⚠️ (removed in v0.20).

#### Setup & Onboarding

| Old name | New name | Status |
|----------|----------|--------|
| `/effectum-init` | `/effectum:init` | ⚠️ deprecated → v0.20 |
| `/context:init` | `/effectum:init` | ⚠️ deprecated → v0.20 |
| `/workshop:init` | `/effectum:init` | ⚠️ deprecated → v0.20 |
| `/project:init` | `/effectum:init` | ⚠️ deprecated → v0.20 |
| `/setup` | `/effectum:setup` | ⚠️ deprecated → v0.20 |
| `/onboard` | `/effectum:onboard` | ⚠️ deprecated → v0.20 |
| `/onboard:review` | `/effectum:onboard:review` | ⚠️ deprecated → v0.20 |
| `/workshop:archive` | `/effectum:archive` | ⚠️ deprecated → v0.20 |
| `/project:archive` | `/effectum:archive` | ⚠️ deprecated → v0.20 |

#### Development Workflow

| Old name | New name | Status |
|----------|----------|--------|
| `/run` | `/effect:dev:run` | ⚠️ deprecated → v0.20 |
| `/tdd` | `/effect:dev:tdd` | ⚠️ deprecated → v0.20 |
| `/plan` | `/effect:dev:plan` | ⚠️ deprecated → v0.20 |
| `/verify` | `/effect:dev:verify` | ⚠️ deprecated → v0.20 |
| `/e2e` | `/effect:dev:e2e` | ⚠️ deprecated → v0.20 |
| `/code-review` | `/effect:dev:review` | ⚠️ deprecated → v0.20 |
| `/refactor-clean` | `/effect:dev:refactor` | ⚠️ deprecated → v0.20 |
| `/build-fix` | `/effect:dev:fix` | ⚠️ deprecated → v0.20 |
| `/design` | `/effect:design` | ⚠️ deprecated → v0.20 |

#### Loop Control

| Old name | New name | Status |
|----------|----------|--------|
| `/stop` | `/effect:dev:stop` | ⚠️ deprecated → v0.20 |
| `/cancel-ralph` | `/effect:dev:stop` | ⚠️ deprecated → v0.20 |
| `/save` | `/effect:dev:save` | ⚠️ deprecated → v0.20 |
| `/checkpoint` | `/effect:dev:save` | ⚠️ deprecated → v0.20 |
| `/orchestrate` | `/effect:dev:orchestrate` | ⚠️ deprecated → v0.20 |
| `/diagnose` | `/effect:dev:diagnose` | ⚠️ deprecated → v0.20 |
| `/forensics` | `/effect:dev:diagnose` | ⚠️ deprecated → v0.20 |

#### Navigation

| Old name | New name | Status |
|----------|----------|--------|
| `/next` | `/effect:next` | ⚠️ deprecated → v0.20 |
| `/explore` | `/effectum:explore` | ⚠️ deprecated → v0.20 |
| `/map-codebase` | `/effectum:explore` | ⚠️ deprecated → v0.20 |

#### PRD Workshop

| Old name | New name | Status |
|----------|----------|--------|
| `/prd:new` | `/effect:prd:new` | ⚠️ deprecated → v0.20 |
| `/prd:express` | `/effect:prd:express` | ⚠️ deprecated → v0.20 |
| `/prd:status` | `/effect:prd:status` | ⚠️ deprecated → v0.20 |
| `/prd:update` | `/effect:prd:update` | ⚠️ deprecated → v0.20 |
| `/prd:discuss` | `/effect:prd:discuss` | ⚠️ deprecated → v0.20 |
| `/prd:resume` | `/effect:prd:resume` | ⚠️ deprecated → v0.20 |
| `/prd:prompt` | `/effect:prd:handoff` | ⚠️ deprecated → v0.20 |
| `/prd:handoff` | `/effect:prd:handoff` | ⚠️ deprecated → v0.20 |
| `/prd:review` | `/effect:prd:review` | ⚠️ deprecated → v0.20 |
| `/prd:decompose` | `/effect:prd:decompose` | ⚠️ deprecated → v0.20 |
| `/prd:network-map` | `/effect:prd:network-map` | ⚠️ deprecated → v0.20 |

---

### Permanent Aliases (never deprecated)

These short aliases will not be removed. They are convenience shortcuts for the most common commands:

| Alias | Resolves to |
|-------|-------------|
| `/help` | `/effectum` (entry point) |
| `/run` | ⚠️ deprecated (see above) — use `/effect:dev:run` |

---

### Upgrade Path

**Upgrading from v0.16 or earlier:**

```bash
npx @aslomon/effectum update
```

This re-renders your CLAUDE.md template (sentinel-preserved) and `.effectum/` config files. Your `.claude/commands/` directory is left untouched — old command files stay in place and continue to work.

**If you added custom commands:**  
No action needed. Custom commands in `.claude/commands/` are never overwritten by `effectum update`.

**If you have CLAUDE.md content outside the sentinel block:**  
Also preserved. Only content between `<!-- effectum:project-context:start -->` and `<!-- effectum:project-context:end -->` is managed by Effectum.

---

### Removal Timeline

| Version | Action |
|---------|--------|
| v0.17.0 | Deprecated aliases introduced — old names still execute, show one-line notice |
| v0.18.x | Namespace finalized, all deprecated aliases verified working |
| **v0.20** | **Deprecated aliases removed** |

**Expected v0.20 release:** TBD. No date set. You will receive clear warnings in-loop before removal.

---

### Questions?

Open an issue: [github.com/aslomon/effectum/issues](https://github.com/aslomon/effectum/issues)
