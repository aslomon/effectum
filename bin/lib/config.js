/**
 * Read/write .effectum.json configuration file.
 * v0.4.0 schema — supports appType, description, recommended setup, mode.
 */
"use strict";

const fs = require("fs");
const path = require("path");

const CONFIG_FILENAME = ".effectum.json";
const CONFIG_VERSION = "0.4.0";

/**
 * Read .effectum.json from a directory.
 * @param {string} dir
 * @returns {object|null} parsed config or null if not found
 * @throws {Error} if file exists but contains invalid JSON (message includes 'Config corrupted')
 */
function readConfig(dir) {
  const filePath = path.join(dir, CONFIG_FILENAME);
  if (!fs.existsSync(filePath)) return null;
  const raw = fs.readFileSync(filePath, "utf8");
  try {
    return JSON.parse(raw);
  } catch (err) {
    throw new Error(
      `Config corrupted: ${filePath} contains invalid JSON — ${err.message}`,
    );
  }
}

/**
 * Write .effectum.json to a directory.
 * @param {string} dir
 * @param {object} config
 * @returns {string} path to the written file
 */
function writeConfig(dir, config) {
  const filePath = path.join(dir, CONFIG_FILENAME);
  const now = new Date().toISOString();

  // Preserve createdAt from existing config if upgrading
  let existingCreatedAt;
  if (fs.existsSync(filePath)) {
    try {
      const existing = JSON.parse(fs.readFileSync(filePath, "utf8"));
      existingCreatedAt = existing.createdAt;
    } catch (_) {}
  }

  const data = {
    version: CONFIG_VERSION,
    ...config,
    updatedAt: now,
  };
  if (!data.createdAt) {
    data.createdAt = existingCreatedAt || now;
  }
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + "\n", "utf8");
  return filePath;
}

/**
 * Check if .effectum.json exists in a directory.
 * @param {string} dir
 * @returns {boolean}
 */
function configExists(dir) {
  return fs.existsSync(path.join(dir, CONFIG_FILENAME));
}

module.exports = {
  readConfig,
  writeConfig,
  configExists,
  CONFIG_FILENAME,
  CONFIG_VERSION,
};
