# Troubleshooting

Common issues and solutions for the autonomous development workflow.

## Installation Issues

### Commands not found after setup

**Symptom**: Running `/effect:dev:plan`, `/effect:dev:tdd`, or other workflow commands shows "unknown command" or no response.

**Causes and fixes**:

1. **Files in wrong location**: Commands must be in `.claude/commands/` at the project root (not in a subdirectory). Verify:

   ```bash
   ls .claude/commands/effect:dev:plan.md
   ```

2. **File extension wrong**: Command files must end in `.md`. If they have a different extension, rename them.

3. **Claude Code not restarted**: After installing commands, start a new Claude Code session. Existing sessions do not pick up new commands automatically.

4. **Wrong project directory**: Make sure you opened Claude Code in the project where you installed the workflow, not in the autonomous-dev repo.

### Settings.json syntax errors

**Symptom**: Hooks do not fire. No auto-formatting, no file protection.

**Fix**: Validate the JSON:

```bash
python3 -c "import json; json.load(open('.claude/settings.json'))"
```

Common JSON errors:

- Trailing commas after the last item in an array or object
- Single quotes instead of double quotes
- Unescaped special characters in strings

### Placeholder values not substituted

**Symptom**: You see literal `{{PLACEHOLDER}}` text in CLAUDE.md or settings.json.

**Fix**: Re-run `/effectum:setup` from the autonomous-dev repo. If the issue persists, manually replace the placeholders. Check `system/stacks/{your-stack}.md` for the correct values.

## Hook Issues

### Hooks not firing

**Symptom**: No auto-formatting after file edits. No guardrails loaded at session start. No CHANGELOG updates.

**Diagnosis**:

1. Check settings.json exists and has valid JSON.
2. Check the hook matcher patterns match the tool names. For example, `"Edit|Write"` matches the Edit and Write tools.
3. Check hook commands are valid bash. Test them manually:
   ```bash
   echo '{"tool_input": {"file_path": "test.ts"}}' | bash -c 'FILE=$(jq -r ".tool_input.file_path" <<< "$(cat)"); echo $FILE'
   ```

### Auto-format changing files unexpectedly

**Symptom**: Files are reformatted in ways that break your code style.

**Fix**: Check which formatter is configured. The `FORMATTER_COMMAND` placeholder in settings.json determines the formatter. Common fixes:

- Add a `.prettierrc` file to configure Prettier.
- Add a `ruff.toml` file to configure ruff.
- Adjust the `FORMATTER_GLOB` to exclude file types that should not be formatted.

### Edit/Write fails with "File content has changed" after formatting

**Symptom**: Claude's second consecutive `Edit` or `Write` on a file fails with an error like `"File content has changed"` when a format-on-save hook is configured.

**Cause**: Before Claude Code v2.1.90, a `PostToolUse` format-on-save hook that rewrote a file immediately after an edit would cause the next `Edit`/`Write` call to see a different file hash than expected, triggering this error.

**Fix**: Upgrade to Claude Code v2.1.90 or later — the race condition is fixed.

**Workaround (older versions)**: Disable the format-on-save hook temporarily, or configure the formatter to only run on explicit save (not on every PostToolUse event).

---

### File protection blocking legitimate edits

**Symptom**: Claude cannot edit a file that is not actually sensitive.

**Fix**: The PreToolUse hook checks file paths against a pattern list. Edit settings.json and remove patterns from the protection check if they are too aggressive for your project.

### Desktop notifications not working

**Symptom**: No macOS notifications for permission prompts or task completion.

**Fix**: The notification hooks use `osascript`. This requires:

- macOS (not Linux or Windows)
- Terminal app has notification permissions in System Settings > Notifications

If you are on Linux, replace the `osascript` commands with `notify-send` or remove the Notification hooks.

## Ralph Loop Issues

### Ralph Loop not stopping

**Symptom**: Ralph Loop keeps iterating even though you think the work is done.

**Causes**:

1. **Completion promise not satisfied**: Claude only outputs the completion promise when ALL quality gates and acceptance criteria are met. Check what is still failing:
   - Are all tests passing?
   - Does the build succeed?
   - Is the linter clean?

2. **Completion promise wording mismatch**: The `--completion-promise` string must exactly match what Claude outputs inside `<promise>` tags. Check for typos.

3. **Flaky tests**: A test that passes sometimes and fails other times prevents the completion promise from being output consistently. See "Stateful dependencies cause flaky tests" in the lessons learned.

**Emergency stop**:

```
/effect:dev:stop
```

### Ralph Loop consuming too many iterations

**Symptom**: Ralph Loop uses all iterations without completing the feature.

**Fixes**:

1. **Increase max-iterations**: For complex features, 30-50 iterations may not be enough. Increase to 50-80.
2. **Add an iteration plan**: Give Claude a roadmap so it sequences work efficiently instead of jumping between concerns.
3. **Simplify the feature**: Decompose into smaller PRDs. A single PRD should have 3-6 acceptance criteria, not 15.
4. **Check the 80% status report**: Ralph Loop writes a status report to `.claude/ralph-status.md` when 80% of iterations are consumed. Read it to understand what is blocking.

### Ralph Loop stuck in error loop

**Symptom**: The same error appears iteration after iteration. Claude tries to fix it but the fix does not work.

**Fix**: Stop the loop (`/effect:dev:stop`) and investigate manually:

1. Read `.claude/ralph-blockers.md` if it exists.
2. Check the actual error message (not just Claude's interpretation of it).
3. Fix the root cause manually.
4. Restart the Ralph Loop with remaining tasks.

## Quality Gate Issues

### Quality gates failing unexpectedly

**Symptom**: `/effect:dev:verify` reports failures that you do not expect.

**Common causes**:

| Failure         | Cause                    | Fix                                  |
| --------------- | ------------------------ | ------------------------------------ |
| Build fails     | Missing dependency       | Run `pnpm install` / `pip install`   |
| Type errors     | Generated types outdated | Regenerate types from schema         |
| Lint errors     | New rule in config       | Fix violations or adjust lint config |
| Tests fail      | Environment mismatch     | Check test runner configuration      |
| RLS check fails | New table without policy | Add RLS policy via migration         |

### Coverage below threshold

**Symptom**: Tests pass but coverage is below 80%.

**Fixes**:

1. Check which files have low coverage. The test runner reports per-file coverage.
2. Add tests for uncovered branches (error handling, edge cases).
3. If a file is intentionally untested (configuration, type exports), exclude it from the coverage threshold.

### Security review flags false positives

**Symptom**: `/effect:dev:review` flags issues that are not actual vulnerabilities.

**Fix**: Document the false positive in the code review output. If the same false positive recurs, add it to guardrails.md:

```markdown
## Known False Positives

- `/api/webhooks` endpoint does not require auth — this is intentional for webhook receivers.
```

## Permission Issues

### Claude asking for permission on every action

**Symptom**: Claude prompts for approval before every file edit or bash command.

**Fix**: Check the autonomy level in `.claude/settings.json`:

```json
{
  "permissions": {
    "defaultMode": "bypassPermissions"
  }
}
```

If it says `"allowEdits"`, Claude will ask before edits. Change to `"bypassPermissions"` for standard autonomy.

### Claude cannot access MCP servers

**Symptom**: Supabase MCP, Playwright MCP, or other servers are not available.

**Fix**: MCP servers must be configured in the Claude Code settings (not project settings). Check:

- `~/.claude/settings.json` for global MCP configuration
- The MCP server process is running

## Reset and Reinstall

### Full reinstall

To completely reinstall the workflow:

1. Open Claude Code in the autonomous-dev repo.
2. Run `/effectum:setup ~/path/to/your/project`.
3. Choose "Overwrite" when prompted about the existing `.claude/` directory.

### Partial reset

To reset specific components:

- **Reset commands**: Delete `.claude/commands/` and re-run `/effectum:setup`.
- **Reset settings**: Delete `.claude/settings.json` and re-run `/effectum:setup`.
- **Reset guardrails**: Delete `.claude/guardrails.md` and re-run `/effectum:setup`.
- **Keep customizations**: Choose "Merge" during `/effectum:setup` to keep existing files and only add missing ones.

### Factory reset

To remove all workflow files from your project:

```bash
rm -f CLAUDE.md AUTONOMOUS-WORKFLOW.md
rm -rf .claude/commands/ .claude/settings.json .claude/guardrails.md
```

Then reinstall with `/effectum:setup`.
