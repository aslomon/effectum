/**
 * Read/write .effectum.json configuration file.
 */
"use strict";

const fs = require("fs");
const path = require("path");

const CONFIG_FILENAME = ".effectum.json";

/**
 * Read .effectum.json from a directory.
 * @param {string} dir
 * @returns {object|null} parsed config or null if not found
 */
function readConfig(dir) {
  const filePath = path.join(dir, CONFIG_FILENAME);
  if (!fs.existsSync(filePath)) return null;
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch (_) {
    return null;
  }
}

/**
 * Write .effectum.json to a directory.
 * @param {string} dir
 * @param {object} config
 */
function writeConfig(dir, config) {
  const filePath = path.join(dir, CONFIG_FILENAME);
  const now = new Date().toISOString();
  const data = {
    version: "0.2.0",
    ...config,
    updatedAt: now,
  };
  if (!data.createdAt) {
    data.createdAt = now;
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

module.exports = { readConfig, writeConfig, configExists, CONFIG_FILENAME };
