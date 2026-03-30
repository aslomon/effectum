/**
 * Headless CI mode — PreToolUse hook injection for auto-approval.
 * See: docs/prds/intake-012-headless-ci-mode.md
 */
"use strict";

const fs = require("fs");
const path = require("path");

/** The PreToolUse hook entry injected into settings.json when headless is enabled. */
const HEADLESS_HOOK_ENTRY = {
  matcher: "AskUserQuestion",
  hooks: [
    {
      type: "command",
      command:
        'bash -c \'if [ "$EFFECTUM_HEADLESS" = "1" ]; then source "${CLAUDE_PROJECT_DIR:-.}/.effectum/hooks/headless-approver.sh"; else exit 0; fi\'',
      statusMessage: "Headless: auto-approving known-safe tool...",
    },
  ],
};

/** Unique identifier to find/remove the headless hook in settings.json. */
const HEADLESS_MATCHER = "AskUserQuestion";

/**
 * Apply or remove the headless PreToolUse hook in a settings object.
 * Mutates the object in place.
 *
 * @param {object} settingsObj - parsed settings.json content
 * @param {boolean} headless - whether headless mode is enabled
 * @returns {object} the mutated settingsObj
 */
function applyHeadlessHook(settingsObj, headless) {
  if (!settingsObj.hooks) {
    settingsObj.hooks = {};
  }
  if (!settingsObj.hooks.PreToolUse) {
    settingsObj.hooks.PreToolUse = [];
  }

  // Remove any existing headless hook entry
  settingsObj.hooks.PreToolUse = settingsObj.hooks.PreToolUse.filter(
    (entry) => entry.matcher !== HEADLESS_MATCHER,
  );

  // Add it back if headless is enabled
  if (headless) {
    settingsObj.hooks.PreToolUse.push(HEADLESS_HOOK_ENTRY);
  }

  return settingsObj;
}

/**
 * Copy headless-approver.sh from the effectum package to the project's .effectum/hooks/.
 *
 * @param {string} repoRoot - effectum package root (contains system/hooks/)
 * @param {string} targetDir - project directory
 */
function installHeadlessScript(repoRoot, targetDir) {
  const src = path.join(repoRoot, "system", "hooks", "headless-approver.sh");
  const destDir = path.join(targetDir, ".effectum", "hooks");
  const dest = path.join(destDir, "headless-approver.sh");

  if (!fs.existsSync(src)) return;

  fs.mkdirSync(destDir, { recursive: true });
  fs.copyFileSync(src, dest);
  fs.chmodSync(dest, 0o755);
}

/**
 * Read the headless flag from config.
 * Supports both `config.headless` and `config.autonomy.headless`.
 *
 * @param {object} config - parsed .effectum.json
 * @returns {boolean}
 */
function isHeadlessEnabled(config) {
  if (config.autonomy && typeof config.autonomy.headless === "boolean") {
    return config.autonomy.headless;
  }
  return config.headless === true;
}

module.exports = {
  HEADLESS_HOOK_ENTRY,
  HEADLESS_MATCHER,
  applyHeadlessHook,
  installHeadlessScript,
  isHeadlessEnabled,
};
