/**
 * Foundation modules — always installed, not toggleable.
 * These are the safety and context hooks that every Effectum setup requires.
 */
"use strict";

/**
 * Foundation hooks that are always active in every Effectum installation.
 * Users cannot deselect these — they are not part of the recommendation flow.
 * @type {Array<{ key: string, label: string, desc: string }>}
 */
const FOUNDATION_HOOKS = [
  {
    key: "file-protection",
    label: "File Protection",
    desc: "Block writes to .env, .git, lock files, secrets/",
  },
  {
    key: "destructive-blocker",
    label: "Destructive Command Blocker",
    desc: "Block rm -rf /, DROP TABLE, force push, reset --hard",
  },
  {
    key: "git-context",
    label: "Git Context Loader",
    desc: "Load git status and recent commits at session start",
  },
  {
    key: "guardrails-injection",
    label: "Guardrails Injection",
    desc: "Inject guardrails.md at session start and after compaction",
  },
  {
    key: "post-compaction",
    label: "Post-Compaction Context",
    desc: "Restore context after memory compaction",
  },
  {
    key: "error-logger",
    label: "Error Logger",
    desc: "Log tool failures to .claude/logs/tool-failures.jsonl",
  },
  {
    key: "transcript-backup",
    label: "Transcript Backup",
    desc: "Backup transcripts before context compaction",
  },
  {
    key: "auto-formatter",
    label: "Auto-Formatter",
    desc: "Stack-aware code formatting on every Edit/Write",
  },
];

/**
 * Format the foundation hooks for display.
 * @returns {string}
 */
function formatFoundationDisplay() {
  return FOUNDATION_HOOKS.map((h) => `  ${h.label} — ${h.desc}`).join("\n");
}

module.exports = { FOUNDATION_HOOKS, formatFoundationDisplay };
