#!/usr/bin/env bash
# headless-approver.sh — Auto-approve known-safe tool patterns during headless/CI runs.
# Called by PreToolUse hook when EFFECTUM_HEADLESS=1.
#
# Receives tool input via stdin as JSON. Outputs a JSON approval decision.
# See: docs/prds/intake-012-headless-ci-mode.md

set -euo pipefail

input=$(cat)

tool=$(echo "$input" | jq -r '.tool_name // .tool // empty' 2>/dev/null)

# Always allow read-only operations
case "$tool" in
  Read|Glob|Grep)
    echo '{"permissionDecision":"allow"}'
    exit 0
    ;;
esac

# Allow Bash commands matching safe patterns (build, test, lint, git read ops)
if [ "$tool" = "Bash" ]; then
  cmd=$(echo "$input" | jq -r '.tool_input.command // empty' 2>/dev/null)
  if echo "$cmd" | grep -qE "^(npm (test|run|install|build|ci)|npx |pnpm (test|run|install|build)|yarn (test|run|install|build)|jest|vitest|tsc|eslint|prettier|ruff|cargo (test|build|check|clippy)|go (test|build|vet)|swift (test|build)|git (status|diff|log|add|commit|branch|show|rev-parse|stash)|make |python -m pytest|python -m (unittest|mypy|ruff|black)|node )"; then
    echo '{"permissionDecision":"allow"}'
    exit 0
  fi
fi

# Deny everything else with a clear message
echo '{"permissionDecision":"deny","message":"Headless mode: tool '\''"$tool"'\'' not in allowlist. Set EFFECTUM_HEADLESS=0 or add pattern to headless-approver.sh."}'
exit 0
