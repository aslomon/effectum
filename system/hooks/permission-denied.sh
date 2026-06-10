#!/usr/bin/env bash
# permission-denied.sh — PermissionDenied hook template
#
# Fires after Claude Code's Auto-Mode denies a tool call.
# Logs the denied tool and decision to stderr for observability,
# then returns {"retry": true} to stdout so Claude attempts an
# alternative approach instead of getting stuck.
#
# REQUIRES: Claude Code >= v2.1.88
#   The PermissionDenied hook event was introduced in v2.1.88.
#   On older versions this hook will never fire.
#
# Hook config (in ~/.claude/settings.json or .claude/settings.json):
#
# {
#   "hooks": {
#     "PermissionDenied": [
#       {
#         "hooks": [
#           {
#             "type": "command",
#             "command": "bash /path/to/permission-denied.sh",
#             "statusMessage": "Handling permission denial...",
#             "timeout": 5
#           }
#         ]
#       }
#     ]
#   }
# }

set -euo pipefail

# Read hook input from stdin (Claude Code passes JSON)
INPUT_JSON=$(cat)

# Extract denied tool name and decision reason
TOOL=$(echo "$INPUT_JSON" | jq -r '.tool_name // "unknown"')
DECISION=$(echo "$INPUT_JSON" | jq -r '.decision // "denied"')

# Log to stderr for observability (stderr does not affect hook output)
echo "[PermissionDenied] tool=$TOOL decision=$DECISION" >&2

# Return retry signal to stdout — Claude will attempt an alternative approach
echo '{"retry": true}'
