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
 * Deep-merge two plain objects. Source wins on conflicts.
 * Arrays are NOT merged — source replaces target.
 * @param {object} target
 * @param {object} source
 * @returns {object}
 */
function deepMerge(target, source) {
  const out = Object.assign({}, target);
  for (const key of Object.keys(source)) {
    if (
      source[key] &&
      typeof source[key] === "object" &&
      !Array.isArray(source[key]) &&
      out[key] &&
      typeof out[key] === "object" &&
      !Array.isArray(out[key])
    ) {
      out[key] = deepMerge(out[key], source[key]);
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
