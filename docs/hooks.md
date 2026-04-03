# Hooks

## What Are Hooks in Claude Code?

Hooks are shell commands, prompts, or agent invocations that Claude Code executes automatically at specific lifecycle events — before a tool runs, after a tool completes, when a session starts, before stopping, and so on. They run outside the LLM context and can:

- **Inject information** into Claude's context (e.g., git status at session start)
- **Block actions** by returning exit code `2` (e.g., preventing writes to `.env` files)
- **Transform inputs or outputs** (e.g., auto-formatting after edits)
- **Log and audit** activity (e.g., writing a command audit log)
- **Enforce policies** (e.g., blocking commits with secrets)
- **Coordinate teams** (e.g., verifying subagent work before stopping)

Hooks are the primary mechanism for enforcing guardrails, automating quality gates, and instrumenting agent behavior without modifying Claude's system prompt.

---

## Hook Events

Claude Code supports the following hook events:

### `SessionStart`
Fires when a Claude Code session begins or resumes. Supports a `matcher` field to target specific session types.

**Matchers:**
- `startup|resume` — fires on new sessions and resumed sessions
- `compact` — fires after context compaction

**Typical uses:** Inject git context, load guardrails, restore post-compaction state.

---

### `PreToolUse`
Fires before any tool executes. The hook receives the tool name and input as JSON on stdin. Returning exit code `2` blocks the tool call.

**Matcher:** Tool name or pattern (e.g., `Edit|Write`, `Bash`, `*` for all tools).

**Typical uses:** Validate inputs, check file protection rules, scan for dangerous commands, enforce commit message quality, scan for secrets before git operations.

---

### `PostToolUse`
Fires after a tool completes successfully. Receives tool name, input, and output on stdin.

**Matcher:** Tool name or pattern (e.g., `Edit|Write`, `Bash`).

**Typical uses:** Auto-format files after edits, log executed commands to an audit trail.

---

### `PostToolUseFailure`
Fires when a tool call fails. Receives tool name, input, and error information on stdin.

**Matcher:** None (fires for all tool failures).

**Typical uses:** Log error patterns to a JSONL file for later analysis, alert on repeated failures.

---

### `PreCompact`
Fires before Claude Code compacts the session context. Receives the transcript path on stdin.

**Typical uses:** Back up the transcript before it is summarized/truncated.

---

### `Stop`
Fires when Claude Code is about to stop responding. Can block stopping by returning `{"ok": false, "reason": "…"}`. Supports three hook types: `command`, `prompt`, and `agent`.

**Typical uses:** Verify all tasks are complete, check that tests were written, update the CHANGELOG.

> **Note:** If `stop_hook_active` is `true` in the hook input, this is a second-pass check (the hook itself triggered a continuation). Be lenient on second pass to avoid infinite loops.

---

### `SubagentStop`
Fires when a subagent finishes its work. The orchestrator uses this to verify subagent output quality before accepting results.

**Typical uses:** Check that the subagent actually wrote files (not just described findings), detect placeholder code or unresolved TODOs.

---

### `TeammateIdle`
Fires in Agent Teams mode when a teammate becomes idle (all assigned tasks completed). Can assign additional tasks by returning `{"ok": false, "reason": "…"}`.

**Typical uses:** Load-balance work across teammates, prevent early idling when other tasks remain unclaimed.

---

### `TaskCompleted`
Fires in Agent Teams mode when a teammate marks a task as completed. Receives `task_id` and `agent_name` on stdin.

**Typical uses:** Log task completion to a team activity log, trigger dependent tasks.

---

### `Notification`
Fires on system-level events. Supports a `matcher` field for event subtypes.

**Matchers:**
- `permission_prompt` — Claude needs user approval for a tool call
- `idle_prompt` — Claude finished and is waiting for input

**Typical uses:** macOS system notifications (via `osascript`) to surface Claude activity when the terminal is in the background.

---

## Foundation Hooks (Always Active)

These hooks are configured in the base `settings.json.tmpl` and are active in every Effectum project. They form the safety and observability baseline.

### SessionStart — Git context + guardrails injection

**Event:** `SessionStart` (matcher: `startup|resume`)

**What it does:**
1. Prints git branch, number of uncommitted files, and the last 3 commits.
2. Reads `~/.claude/guardrails.md` (global) and `.claude/guardrails.md` (project) if they exist, and injects their full content into Claude's context.

**Why:** Ensures Claude always starts with awareness of the current git state and any project-specific constraints without requiring manual prompting.

---

### SessionStart — Post-compaction context restoration

**Event:** `SessionStart` (matcher: `compact`)

**What it does:**
After context compaction, re-injects:
- Current git branch, modified/staged files, and last 5 commits
- General rules (e.g., "use npm, not others")
- Contents of `DESIGN.md` if present
- Recent tool failure log (last 3 entries)
- Guardrails (global and project)

**Why:** Context compaction discards conversation history. This hook prevents Claude from losing critical context about the project state and constraints.

---

### PreToolUse — File protection

**Event:** `PreToolUse` (matcher: `Edit|Write`)

**What it does:**
Blocks writes to protected file patterns:
- `.env`, `.env.local`, `.env.production`
- `secrets/`
- `.git/`
- Lock files: `package-lock.json`, `pnpm-lock.yaml`, `Pipfile.lock`, `poetry.lock`, `Package.resolved`, `Cargo.lock`

Returns exit code `2` with a descriptive error message if a protected pattern is matched.

---

### PreToolUse — Destructive command guard

**Event:** `PreToolUse` (matcher: `Bash`)

**What it does:**
Scans the command string for destructive patterns and blocks if matched:
- `rm -rf /`, `rm -rf ~` (filesystem destruction)
- `drop table`, `DROP TABLE`, `truncate table`, `TRUNCATE TABLE` (database destruction)
- `push.*--force`, `--force.*push` (force pushes)
- `reset --hard origin` (hard resets)

---

### PreToolUse — Commit message quality gate

**Event:** `PreToolUse` (matcher: `Bash`)

**What it does:**
When the command is a `git commit`, extracts the `-m` message and blocks if it is shorter than 10 characters. Enforces descriptive commit messages.

---

### PreToolUse — Secret scanner

**Event:** `PreToolUse` (matcher: `Bash`)

**What it does:**
Before `git commit` or `git push`, diffs the staged changes and scans for patterns that indicate leaked secrets:
- OpenAI API keys (`sk-...`)
- Stripe keys (`sk_live_`, `sk_test_`)
- AWS access key IDs (`AKIA...`)
- GitHub tokens (`ghp_`, `gho_`)
- GitLab tokens (`glpat-...`)
- Slack tokens (`xox[bpras]-...`)
- Hardcoded passwords in source (`password: "..."`)

Blocks the commit/push if any pattern is found.

---

### PostToolUse — Auto-formatter placeholder

**Event:** `PostToolUse` (matcher: `Edit|Write`)

**What it does:**
Runs a formatter after every file edit. In the template this is a placeholder (`echo formatter-not-configured`). Configure it per project by replacing the command with the appropriate formatter (e.g., `prettier --write`, `black`, `gofmt`).

---

### PostToolUse — Command audit log

**Event:** `PostToolUse` (matcher: `Bash`)

**What it does:**
Appends every executed bash command to `~/.claude/command-audit.log` with a timestamp and working directory. Runs asynchronously (`"async": true`) to avoid slowing down tool execution.

---

### PostToolUseFailure — Error pattern logger

**Event:** `PostToolUseFailure`

**What it does:**
Appends tool failure records to `.claude/logs/tool-failures.jsonl` in the project directory. Each record contains: timestamp, tool name, truncated input, and truncated error message. Runs asynchronously.

**Why:** The post-compaction SessionStart hook reads the last 3 entries from this file to re-inject recent error context.

---

### PreCompact — Transcript backup

**Event:** `PreCompact`

**What it does:**
Copies the current session transcript to `.claude/backups/transcript_YYYYMMDD_HHMMSS.jsonl` before compaction. Retains only the 5 most recent backups (older ones are deleted automatically).

---

### Stop — Work completion verifier

**Event:** `Stop` (type: `prompt`)

**What it does:**
Asks Claude to evaluate whether all user-requested tasks were actually completed (not just attempted). Checks for:
- Unresolved errors or failed operations
- Obvious type errors or broken imports in changed code
- Unresolved TODO/FIXME comments

Returns `{"ok": false, "reason": "…"}` to continue if incomplete. Is lenient on second pass (`stop_hook_active: true`).

---

### Stop — Test coverage enforcer

**Event:** `Stop` (type: `prompt`)

**What it does:**
Runs `git diff --name-only HEAD` and checks whether source code changes were accompanied by corresponding test file changes. Blocks stopping if source files were modified without any test files being created or updated. Lenient on second pass.

---

### Stop — CHANGELOG updater

**Event:** `Stop` (type: `agent`)

**What it does:**
Checks `git diff --stat HEAD` for meaningful source code changes. If found, reads (or creates) `CHANGELOG.md` and appends entries under `[Unreleased]` following [Keep a Changelog](https://keepachangelog.com) format (Added / Changed / Fixed / Removed). Skips trivial changes (formatting, comments, config only). Skips on second pass.

---

### SubagentStop — Subagent work verifier

**Event:** `SubagentStop` (type: `prompt`)

**What it does:**
Reviews the subagent's last assistant message and checks:
1. Did the subagent actually complete its task (not just describe findings)?
2. Did it leave placeholder code or TODO comments?
3. If it was supposed to write/edit files, did it do so?

Blocks acceptance if incomplete.

---

### TeammateIdle — Workload balancer

**Event:** `TeammateIdle` (type: `prompt`)

**What it does:**
When a teammate becomes idle, checks:
1. Are all assigned tasks complete?
2. Are there unclaimed tasks the teammate could pick up?
3. Should they assist a blocked teammate?

Returns `{"ok": false, "reason": "…"}` to assign more work.

---

### TaskCompleted — Activity logger

**Event:** `TaskCompleted` (type: `command`)

**What it does:**
Appends a line to `.claude/logs/team-activity.log` with the timestamp, task ID, and agent name. Runs asynchronously.

---

### Notification — macOS system alerts

**Event:** `Notification`

**What it does:**
- On `permission_prompt`: Shows a macOS notification "Claude needs your attention" with sound "Ping".
- On `idle_prompt`: Shows "Task completed" with sound "Glass".

---

## Optional Hooks

The following hooks are available as opt-in extensions (defined in the skills or templates but not enabled by default in every project):

### Continuous Learning — Tool observation (`observe.sh`)

**Location:** `system/skills/hooks/observe.sh`

**Events:** `PreToolUse` and `PostToolUse` (matcher: `*`)

**What it does:**
Records every tool start and completion event to `~/.claude/homunculus/observations.jsonl`. Each record includes: timestamp, event type (`tool_start`/`tool_complete`), tool name, session ID, and truncated input/output. Signals a running observer process via `SIGUSR1` if active.

The observations file is rotated automatically when it exceeds 10 MB.

**Use case:** Powers the `skill-creator` skill's usage frequency analysis and the `scan.sh` / `quick-diff.sh` scripts that measure which skills are actively used.

---

## How Hooks Are Configured in `settings.json`

Hooks are defined under the `hooks` key in `~/.claude/settings.json` (global) or `.claude/settings.json` (project).

### Basic structure

```json
{
  "hooks": {
    "<EventName>": [
      {
        "matcher": "<tool-name-pattern>",
        "hooks": [
          {
            "type": "command",
            "command": "bash -c '...'",
            "statusMessage": "Human-readable status shown in UI...",
            "timeout": 15,
            "async": false
          }
        ]
      }
    ]
  }
}
```

### Hook entry fields

| Field | Type | Description |
|---|---|---|
| `type` | enum | `command` — runs a shell command; `prompt` — runs an LLM evaluation; `agent` — spawns a subagent. |
| `command` | string | Shell command to execute (for `type: command`). |
| `prompt` | string | Prompt text for LLM evaluation (for `type: prompt`). Use `$ARGUMENTS` to reference the hook input. |
| `statusMessage` | string | Text shown in the Claude Code UI while the hook runs. |
| `timeout` | number | Seconds before the hook is killed. Default: no timeout. |
| `async` | boolean | If `true`, the hook runs in the background; Claude does not wait for it. Default: `false`. |

### Matcher field

- **For `PreToolUse`/`PostToolUse`:** The matcher is a pattern matched against the tool name (e.g., `"Edit|Write"`, `"Bash"`, `"*"`).
- **For `SessionStart`/`Notification`:** The matcher is matched against the session type or notification subtype.
- **For `Stop`, `SubagentStop`, `TeammateIdle`, `TaskCompleted`, `PostToolUseFailure`, `PreCompact`:** No matcher is needed (omit the field or use `"*"`).

### Blocking a tool call

Return exit code `2` from a `PreToolUse` `command` hook to block the tool call. Write the reason to `stderr`. Exit code `0` allows the call to proceed.

> **v2.1.90+ required for JSON-blocking hooks:** Before v2.1.90, `PreToolUse` hooks that emitted JSON on stdout and exited with code `2` did not reliably block the tool call. This was a Claude Code bug fixed in v2.1.90. If you use JSON output in a blocking hook (e.g., to set `permissionDecision`), upgrade to v2.1.90 or later.

**Pattern: JSON-emitting blocking hook (requires v2.1.90+)**

```bash
#!/bin/bash
# PreToolUse hook that blocks with structured JSON output
INPUT=$(cat)
CMD=$(echo "$INPUT" | jq -r ".tool_input.command // empty")

if echo "$CMD" | grep -qE "^rm -rf|^sudo rm"; then
  # Send structured JSON to stdout (v2.1.90+ only)
  echo '{"permissionDecision": "deny", "reason": "Destructive rm command blocked by Effectum guardrail"}'
  exit 2
fi
exit 0
```

**Simpler pattern (all versions):** Write reason to `stderr` only, no JSON output:

```bash
#!/bin/bash
INPUT=$(cat)
CMD=$(echo "$INPUT" | jq -r ".tool_input.command // empty")

if echo "$CMD" | grep -qE "^rm -rf|^sudo rm"; then
  echo "Destructive rm command blocked by Effectum guardrail" >&2
  exit 2
fi
exit 0
```

### Blocking a Stop

Return `{"ok": false, "reason": "…"}` from a `prompt` or `agent` Stop hook to continue the session. Return `{"ok": true}` to allow stopping.

---

## Adding a New Hook

### 1. Decide the event and hook type

| Goal | Event | Type |
|---|---|---|
| Block a dangerous command | `PreToolUse` (Bash) | `command` |
| Validate a file before writing | `PreToolUse` (Edit\|Write) | `command` |
| Run a linter after editing | `PostToolUse` (Edit\|Write) | `command` |
| Log activity | `PostToolUse` or `TaskCompleted` | `command` (async) |
| Verify work quality before stopping | `Stop` | `prompt` |
| Verify subagent output | `SubagentStop` | `prompt` |
| Balance team workload | `TeammateIdle` | `prompt` |

### 2. Write the hook command

Hook commands receive JSON on stdin. Use `jq` to extract fields:

```bash
# Extract the bash command being run
CMD=$(jq -r ".tool_input.command" <<< "$(cat)")

# Extract the file path being written
FILE=$(jq -r ".tool_input.file_path // empty" <<< "$(cat)")

# Extract tool name
TOOL=$(jq -r ".tool_name" <<< "$(cat)")
```

Return exit code `2` to block (PreToolUse only). Return `0` to allow.

### 3. Add the hook to `settings.json`

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "command": "bash -c 'CMD=$(jq -r \".tool_input.command\" <<< \"$(cat)\"); # your logic here; exit 0'",
            "statusMessage": "Running my check..."
          }
        ]
      }
    ]
  }
}
```

### 4. Test the hook

Run Claude Code and trigger the relevant tool. Observe the status message in the UI. If the hook should block, verify that exit code `2` causes a clear error message.

For `Stop` hooks with `type: prompt`, test with intentionally incomplete work to confirm the hook catches it.

### 5. Make it async if appropriate

If the hook does not need to block the tool call (e.g., logging, notifications), set `"async": true` to avoid adding latency to tool execution.
