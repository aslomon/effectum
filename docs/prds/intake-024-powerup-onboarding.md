# Spec: Powerup Onboarding Integration

**Intake:** #024  
**Signal:** Claude Code v2.1.90 — `/powerup` command added: in-app onboarding with animated terminal demos for Claude Code features.  
**Priority:** P1  
**Roadmap:** v0.20  
**Status:** Draft (2026-04-02)

---

## Problem

New Effectum users go through `effectum:onboard` or `effectum:setup` and get a fully configured project — but they may not know what Claude Code itself can do. There is a gap between "Effectum is installed" and "I understand the Claude Code features that make Effectum powerful."

Claude Code's new `/powerup` command fills this gap with animated terminal demos that teach core features. Effectum should bridge users to it as a natural follow-on step after onboarding.

Additionally, Effectum has its own learning curve (`/ralph-loop`, `effect:dev:run`, `effect:prd:new`, etc.) that `/powerup` does not cover. There is an opportunity for Effectum-specific "powerup" lessons.

---

## Solution

Two changes:

1. **Reference `/powerup` in the onboarding flow** — after `effectum:onboard` or `effectum:setup` completes, suggest `/powerup` as a next step for users new to Claude Code.
2. **Effectum-specific lessons** (future) — create Effectum-native powerup content that teaches the Effectum workflow commands.

---

## Specification

### Phase 1: `/powerup` Reference in Onboarding

After `effectum:onboard` or `effectum:setup` completes successfully, append a "Learn More" section to the completion output:

```
✔ Effectum setup complete.

📚 Next steps:
  1. Run effect:prd:new to write your first specification
  2. Run effect:dev:plan to create an implementation plan
  3. Run /powerup to learn Claude Code features (animated demos)
```

**Implementation:** Add the `/powerup` suggestion to the completion message templates in:

- `commands/effectum-onboard.md` — post-onboarding output
- `commands/effectum-setup.md` — post-setup output (interactive configurator)
- `commands/effectum.md` — the `/effectum` front door help text

### Phase 2: Effectum Powerup Lessons (Future)

Create Effectum-specific interactive lessons that teach the core workflow:

| Lesson                 | Teaches                                                                       |
| ---------------------- | ----------------------------------------------------------------------------- |
| **The Effectum Loop**  | `effect:prd:new` → `effect:dev:plan` → `effect:dev:run` → `effect:dev:verify` |
| **Ralph Loop**         | What `/ralph-loop` does, how to monitor it, when to stop it                   |
| **PRD Lifecycle**      | Creating, updating, reviewing, and handing off PRDs                           |
| **Project Onboarding** | Using `effectum:onboard` on an existing codebase                              |
| **Recovery**           | `effect:dev:save`, `effect:dev:diagnose`, resuming crashed sessions           |

**Format considerations:**

- If Claude Code exposes a powerup API or lesson format, Effectum lessons should use it for consistency
- If not, Effectum lessons could be implemented as a guided walkthrough command (`effectum:learn` or `effectum:tutorial`)
- Lessons should work in both interactive and headless modes (text fallback for CI)

### Phase 3: `effect:next` Integration

Update `effect:next` (the smart router) to recommend `/powerup` when it detects:

- A freshly installed project with no PRDs yet
- A user who has not run any `effect:dev:*` commands in the current project

```
💡 Looks like you're just getting started.
   Run /powerup to learn Claude Code features, or effect:prd:new to write your first spec.
```

---

## Acceptance Criteria

- [ ] `effectum:onboard` completion output includes `/powerup` as a suggested next step
- [ ] `effectum:setup` completion output includes `/powerup` as a suggested next step
- [ ] `/effectum` help text mentions `/powerup` under a "Learn" or "Getting Started" section
- [ ] `effect:next` recommends `/powerup` for fresh projects with no PRDs
- [ ] No behavioral change for existing users who skip the suggestion
- [ ] Phase 2 lessons are documented as a follow-up (not blocking v0.20)

---

## Non-Goals

- Not replacing Claude Code's `/powerup` — Effectum references it, does not duplicate it.
- Not building a full tutorial engine in v0.20 — Phase 2 is a roadmap item.
- Not gating any Effectum functionality behind completing `/powerup` — it is always optional.

---

## Implementation Notes

- `/powerup` requires Claude Code ≥ v2.1.90
- Phase 1 is a text-only change to command templates — no new scripts or hooks
- Phase 2 depends on whether Claude Code exposes a lesson/powerup registration API. Monitor Claude Code changelogs for this.
- The `/powerup` suggestion should degrade gracefully if the user's Claude Code version does not support it (no error, just skip the suggestion)

---

## Open Questions

1. **Powerup lesson API** — Does Claude Code v2.1.90 expose a way for extensions to register custom powerup lessons? If so, Phase 2 becomes much simpler.
2. **Version detection** — Should Effectum check the Claude Code version before suggesting `/powerup`? Or just suggest it and let Claude Code handle the "unknown command" case?
3. **Lesson format** — If Phase 2 proceeds, should lessons be markdown-based (like PRDs) or interactive scripts?
