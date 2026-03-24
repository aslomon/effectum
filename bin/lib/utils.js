/**
 * Shared utility functions.
 */
"use strict";

const fs = require("fs");
const path = require("path");

/**
 * Ensure a directory exists (recursive mkdir).
 * @param {string} dir
 */
function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

/**
 * Keys within `permissions` that should be concat+deduplicated instead of replaced.
 * @type {Set<string>}
 */
const PERMISSIONS_MERGE_KEYS = new Set(["allow", "deny"]);

/**
 * Deep-merge two plain objects. Source wins on conflicts.
 * Arrays are replaced by default, EXCEPT for `permissions.allow` and
 * `permissions.deny` which are concatenated and deduplicated.
 * @param {object} target
 * @param {object} source
 * @param {string} [_parentKey] - internal: tracks the parent key for permissions merge logic
 * @returns {object}
 */
function deepMerge(target, source, _parentKey) {
  const out = Object.assign({}, target);
  for (const key of Object.keys(source)) {
    // Concat+deduplicate permissions.allow and permissions.deny arrays
    if (
      _parentKey === "permissions" &&
      PERMISSIONS_MERGE_KEYS.has(key) &&
      Array.isArray(out[key]) &&
      Array.isArray(source[key])
    ) {
      out[key] = [...new Set([...out[key], ...source[key]])];
    } else if (
      source[key] &&
      typeof source[key] === "object" &&
      !Array.isArray(source[key]) &&
      out[key] &&
      typeof out[key] === "object" &&
      !Array.isArray(out[key])
    ) {
      out[key] = deepMerge(out[key], source[key], key);
    } else {
      out[key] = source[key];
    }
  }
  return out;
}

/**
 * Find the Effectum repo root (parent of bin/).
 * @returns {string}
 */
function findRepoRoot() {
  const binDir = path.dirname(require.main?.filename || __filename);
  // If we're in bin/lib/, go up two levels; if in bin/, go up one
  if (path.basename(binDir) === "lib") {
    return path.resolve(binDir, "..", "..");
  }
  return path.resolve(binDir, "..");
}

module.exports = { ensureDir, deepMerge, findRepoRoot };
