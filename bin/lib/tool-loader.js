/**
 * Dynamic tool loader — loads JSON-based tool definitions from system/tools/,
 * merges foundation + stack + community definitions, and deduplicates by key.
 *
 * New stacks require only a new JSON file in system/tools/ — zero code changes.
 * Community/local overrides are loaded from .effectum/tools/ and ~/.effectum/tools/.
 */
"use strict";

const fs = require("fs");
const path = require("path");
const os = require("os");

// ─── JSON loading helpers ────────────────────────────────────────────────────

/**
 * Load tools from a JSON file. Returns empty array if file doesn't exist or is invalid.
 * @param {string} filePath - absolute path to JSON file
 * @returns {Array<object>}
 */
function loadJsonTools(filePath) {
  try {
    if (!fs.existsSync(filePath)) return [];
    const raw = fs.readFileSync(filePath, "utf8");
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed.tools)) return parsed.tools;
    if (Array.isArray(parsed)) return parsed;
    return [];
  } catch (_) {
    return [];
  }
}

/**
 * Load all JSON files from a directory.
 * Skips files starting with _ (e.g., _schema.json).
 * @param {string} dirPath - directory to scan
 * @returns {Array<object>}
 */
function loadToolsFromDir(dirPath) {
  const tools = [];
  try {
    if (!fs.existsSync(dirPath)) return tools;
    const files = fs
      .readdirSync(dirPath)
      .filter((f) => f.endsWith(".json") && !f.startsWith("_"));
    for (const file of files) {
      tools.push(...loadJsonTools(path.join(dirPath, file)));
    }
  } catch (_) {
    // Directory doesn't exist or isn't readable
  }
  return tools;
}

// ─── Tool resolution ─────────────────────────────────────────────────────────

/**
 * Find the system/tools/ directory relative to this module (which lives in bin/lib/).
 * @returns {string}
 */
function getSystemToolsDir() {
  return path.resolve(__dirname, "..", "..", "system", "tools");
}

/**
 * Get the JSON filename for a stack key.
 * @param {string} stack - e.g., "nextjs-supabase"
 * @returns {string} - e.g., "nextjs-supabase.json"
 */
function stackToFilename(stack) {
  return `${stack}.json`;
}

// ─── System basics (pre-config) ──────────────────────────────────────────────

/**
 * Get system-level basics that must be checked before any configuration.
 * These are Homebrew (macOS), Git, Node.js, and Claude Code.
 * @returns {Array<object>}
 */
function getSystemBasics() {
  const platform = os.platform() === "darwin" ? "darwin" : "linux";
  const basics = [];

  // Homebrew (macOS only)
  if (platform === "darwin") {
    basics.push({
      key: "brew",
      bin: "brew",
      displayName: "Homebrew",
      category: "system",
      why: "Package manager for macOS — needed to install other tools",
      priority: 0,
      autoInstall: true,
      install: {
        darwin:
          '/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"',
      },
      check: "brew --version",
    });
  }

  // Git
  basics.push({
    key: "git",
    bin: "git",
    displayName: "Git",
    category: "system",
    why: "Version control — required for all projects",
    priority: 0,
    autoInstall: true,
    install: {
      darwin: "xcode-select --install",
      linux: "sudo apt install -y git",
    },
    check: "git --version",
  });

  // Node.js
  basics.push({
    key: "node",
    bin: "node",
    displayName: "Node.js",
    category: "system",
    why: "JavaScript runtime — required for Claude Code and npm tools",
    priority: 0,
    autoInstall: true,
    install: {
      darwin: "brew install node",
      linux: "sudo apt install -y nodejs npm",
    },
    check: "node --version",
  });

  // Claude Code
  basics.push({
    key: "claude",
    bin: "claude",
    displayName: "Claude Code",
    category: "system",
    why: "AI coding agent — the core of the autonomous workflow",
    priority: 0,
    autoInstall: true,
    install: {
      all: "npm i -g @anthropic-ai/claude-code",
    },
    check: "claude --version",
  });

  return basics;
}

// ─── Main loader ─────────────────────────────────────────────────────────────

/**
 * Load and merge tool definitions for a given stack.
 *
 * Merge order (last wins for duplicate keys):
 *   1. foundation.json (always)
 *   2. stack-specific.json (if exists)
 *   3. Community: <targetDir>/.effectum/tools/*.json
 *   4. Community: ~/.effectum/tools/*.json
 *
 * @param {string} stack - stack key (e.g., "nextjs-supabase", "generic")
 * @param {string} [targetDir] - project directory for local community tools
 * @returns {Array<object>} - deduplicated, priority-sorted tool list
 */
function loadToolDefinitions(stack, targetDir) {
  const systemDir = getSystemToolsDir();
  const tools = [];

  // 1. Foundation (always loaded)
  const foundationPath = path.join(systemDir, "foundation.json");
  tools.push(...loadJsonTools(foundationPath));

  // 2. Stack-specific
  if (stack && stack !== "foundation") {
    const stackPath = path.join(systemDir, stackToFilename(stack));
    tools.push(...loadJsonTools(stackPath));
  }

  // 3. Community: local project overrides
  if (targetDir) {
    const localToolsDir = path.join(targetDir, ".effectum", "tools");
    tools.push(...loadToolsFromDir(localToolsDir));
  }

  // 4. Community: global user overrides
  const globalToolsDir = path.join(os.homedir(), ".effectum", "tools");
  tools.push(...loadToolsFromDir(globalToolsDir));

  return deduplicateByKey(tools);
}

// ─── Deduplication ───────────────────────────────────────────────────────────

/**
 * Deduplicate tools by key. Last occurrence wins (community overrides bundled).
 * Result is sorted by priority (ascending).
 * @param {Array<object>} tools
 * @returns {Array<object>}
 */
function deduplicateByKey(tools) {
  const map = new Map();
  for (const tool of tools) {
    map.set(tool.key, tool);
  }
  return Array.from(map.values()).sort(
    (a, b) => (a.priority ?? 5) - (b.priority ?? 5),
  );
}

// ─── List available stacks ───────────────────────────────────────────────────

/**
 * List all available stack JSON files (excluding foundation and _schema).
 * @returns {Array<string>} - stack keys (e.g., ["nextjs-supabase", "python-fastapi"])
 */
function listAvailableStacks() {
  const systemDir = getSystemToolsDir();
  try {
    return fs
      .readdirSync(systemDir)
      .filter(
        (f) =>
          f.endsWith(".json") && !f.startsWith("_") && f !== "foundation.json",
      )
      .map((f) => f.replace(".json", ""));
  } catch (_) {
    return [];
  }
}

module.exports = {
  loadJsonTools,
  loadToolsFromDir,
  getSystemToolsDir,
  getSystemBasics,
  loadToolDefinitions,
  deduplicateByKey,
  listAvailableStacks,
};
