/**
 * Parse stack preset .md files into key-value maps.
 */
"use strict";

const fs = require("fs");
const path = require("path");

/**
 * Parse a stack preset markdown file into a sections map.
 * Extracts content from sections like:
 * ## KEY_NAME
 * ```
 * value content
 * ```
 * @param {string} content - markdown content
 * @returns {Record<string, string>}
 */
function parseStackPreset(content) {
  const sections = {};
  const regex = /^## (\w+)\s*\r?\n(?:\r?\n)*`{3,4}\r?\n([\s\S]*?)`{3,4}/gm;
  let match;
  while ((match = regex.exec(content)) !== null) {
    sections[match[1]] = match[2].trim();
  }
  return sections;
}

/**
 * Load and parse a stack preset file by stack key.
 * Looks in the .effectum/stacks/ directory first (installed copy),
 * then falls back to system/stacks/ (repo source).
 * If the requested stack key is not found, logs a warning and
 * falls back to the 'generic' preset.
 * @param {string} stackKey - e.g. 'nextjs-supabase'
 * @param {string} targetDir - project directory
 * @param {string} repoRoot - effectum repo root
 * @returns {Record<string, string>}
 */
function loadStackPreset(stackKey, targetDir, repoRoot) {
  const candidates = [
    path.join(targetDir, ".effectum", "stacks", `${stackKey}.md`),
    path.join(repoRoot, "system", "stacks", `${stackKey}.md`),
  ];

  for (const filePath of candidates) {
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, "utf8");
      return parseStackPreset(content);
    }
  }

  // Fallback to generic preset instead of crashing
  if (stackKey !== "generic") {
    console.warn(
      `Stack preset "${stackKey}" not found — falling back to "generic".`,
    );
    return loadStackPreset("generic", targetDir, repoRoot);
  }

  // generic itself not found — return empty sections
  return {};
}

module.exports = { parseStackPreset, loadStackPreset };
