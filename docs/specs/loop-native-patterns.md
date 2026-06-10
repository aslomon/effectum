# Spec: /loop Native Patterns in Effectum
> Effectum v0.16 candidate | Signal #008 | Created: 2026-03-28

---

## Background

Claude Code's `/loop` command turns a session into a **scheduled background worker** — it fires on a cron-like schedule, runs the prompt, and exits. Use cases: PR review on new commits, deployment monitoring, test-run summaries, CI gate checks.

This is directly relevant to Effectum's `/ralph-loop` command (iterative autonomous implementation) and `/orchestrate` (agent team coordination). There's an opportunity to expose `/loop`-native patterns through Effectum's YAML profiles and template system.

---

## Current State (v0.15)

### `/ralph-loop` command
Currently documented as a manual, interactive "max iterations" loop:
```
/ralph-loop [max-iterations=30]
```
It's driven by a human starting a session and watching it iterate. No scheduling awareness.

### `/orchestrate` command  
Spawns parallel subagents for task distribution. Entirely within a single session, no background execution model.

### YAML Profiles (system/presets/)
8 stack-specific presets. None have a "background worker" or "scheduled task" pattern.

---

## Opportunity

### 1. `loop-first` YAML Profile
Add a new profile that configures Claude Code for background worker use cases:

```yaml
id: loop-worker
label: Background Worker / Scheduled Tasks
hint: Long-running Claude Code sessions with /loop scheduling
ecosystem: any
autonomyLevel: auto
loopConfig:
  defaultSchedule: "0 * * * *"  # hourly default
  maxRuntime: 300  # seconds per loop iteration
  exitOnError: false
  transcriptTimestamps: true
hooks:
  preLoop:
    - git fetch --all  # always have latest before each run
  postLoop:
    - git status --short  # log what changed
```

This maps to a generated CLAUDE.md section that explains /loop behavior to the agent.

### 2. `/ralph-loop` YAML Profile Variant
Add a `ralph-loop-scheduled` profile that wraps `/ralph-loop` in a `/loop` schedule:
- Run the full PRD implementation cycle once per trigger
- Useful for overnight builds: "implement this PRD while I sleep, run until done"
- Stop condition: all acceptance criteria in tasks.md are ✅ DONE

### 3. CLAUDE.md Template Section for /loop Projects

Add an optional `{{LOOP_CONFIG}}` placeholder to `CLAUDE.md.tmpl`:

```markdown
## Scheduled Execution (when running via /loop)

- Each loop iteration is independent — re-read task state from tasks.md at the start
- Timestamps are injected into transcript automatically (Claude Code 1.x+)
- On completion, write a one-line summary to `.claude/loop-summary.log`
- If all tasks are DONE, exit cleanly — do not invent new work
- On error, log to `.claude/loop-errors.log` and continue (do not hard-fail)
```

### 4. Timestamp-Aware Transcript Parsing (Signal #004, #008 combined)

Transcripts now include timestamps when `/loop` fires. Effectum's CHANGELOG agent hook reads transcripts. Worth documenting that timestamp markers can be used for better session reconstruction in post-loop analysis.

---

## Acceptance Criteria

- [ ] New `loop-worker` YAML profile in `system/presets/loop-worker.json`
- [ ] `CLAUDE.md.tmpl` has `{{LOOP_CONFIG}}` placeholder (optional, empty default)
- [ ] `/ralph-loop` docs note: "for overnight runs, wrap with `/loop schedule`"
- [ ] `/orchestrate` docs note: team agents can be triggered via `/loop` for background coordination
- [ ] README adds a "Scheduled / Background Work" section under Use Cases

---

## Open Questions for Jason

1. Should the `loop-worker` preset be a first-class choice in `/setup`'s "What are you building?" question? Or is it an advanced/opt-in option?

2. `/ralph-loop` + `/loop` combo — is this a use case Jason actually wants to support, or is it too complex for v0.16?

---

## Roadmap Slot

**v0.16** — low-risk (mostly docs + one new preset JSON + template placeholder).  
Estimated effort: **0.5–1 day**.

---

*Spec by Lumi (Heartbeat 06:00, 2026-03-28) | Intake Signal #008*
