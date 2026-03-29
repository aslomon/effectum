## Scheduled Execution (/loop Background Worker)

This project is configured for background execution via Claude Code's `/loop` command.

**Rules for each loop iteration:**
- Re-read `tasks.md` at the start of every iteration — do not assume prior state
- Work on the next `📋 TODO` task in priority order
- Update task status immediately: TODO → IN_PROGRESS → DONE
- On iteration complete, write a one-line summary to `.claude/loop-summary.log`
- If all tasks are ✅ DONE, exit cleanly — do not invent new work
- On error, log to `.claude/loop-errors.log` and continue — do not hard-fail

**Combining with /ralph-loop:**
- Use `/ralph-loop` for iterative PRD implementation within a single session
- Use `/loop` to schedule that session on a cron-like trigger (e.g., nightly builds)
- Together: overnight autonomous implementation — kick off before sleep, review in the morning

**Transcript timestamps** are active — each `/loop` fire is marked in the transcript for audit trails.
