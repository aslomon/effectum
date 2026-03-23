/**
 * Template substitution engine.
 * Reads template files, replaces all {{PLACEHOLDER}} tokens with values
 * from the stack preset and user config.
 *
 * Supports block-based CLAUDE.md generation from system/blocks/.
 */
"use strict";

const fs = require("fs");
const path = require("path");
const { FORMATTER_MAP } = require("./constants");
const { LANGUAGE_INSTRUCTIONS } = require("./languages");
const { getToolsForStack, checkTool } = require("./cli-tools");

// ─── Block Loading ──────────────────────────────────────────────────────────

/**
 * Find the system/blocks/ directory.
 * @param {string} [targetDir]
 * @param {string} [repoRoot]
 * @returns {string|null}
 */
function findBlocksDir(targetDir, repoRoot) {
  const candidates = [];
  if (targetDir) {
    candidates.push(path.join(targetDir, ".effectum", "blocks"));
  }
  if (repoRoot) {
    candidates.push(path.join(repoRoot, "system", "blocks"));
  }
  // Fallback: derive from this file's location
  const defaultRoot = path.resolve(__dirname, "..", "..");
  candidates.push(path.join(defaultRoot, "system", "blocks"));
  for (const dir of candidates) {
    if (fs.existsSync(dir)) return dir;
  }
  return null;
}

/**
 * Load a template block file.
 * @param {string} category - e.g. 'ecosystem', 'framework', 'database', 'deploy'
 * @param {string} id - e.g. 'javascript', 'nextjs', 'supabase', 'vercel'
 * @param {string} [targetDir]
 * @param {string} [repoRoot]
 * @returns {string|null}
 */
function loadBlock(category, id, targetDir, repoRoot) {
  if (!id) return null;
  const blocksDir = findBlocksDir(targetDir, repoRoot);
  if (!blocksDir) return null;

  const filePath = path.join(blocksDir, category, `${id}.md`);
  if (fs.existsSync(filePath)) {
    return fs.readFileSync(filePath, "utf8").trim();
  }
  return null;
}

/**
 * Compose CLAUDE.md content from blocks based on detection result.
 * Falls back to stack preset sections if blocks are not available.
 * @param {object} detection - modular detection result
 * @param {string} [targetDir]
 * @param {string} [repoRoot]
 * @returns {Record<string, string>} block sections keyed by placeholder name
 */
function composeBlocks(detection, targetDir, repoRoot) {
  const blocks = {};

  // Load blocks based on detection components
  const ecosystem = detection.ecosystem;
  const framework = detection.framework ? detection.framework.id : null;
  const database = detection.database ? detection.database.id : null;
  const deploy = detection.deploy ? detection.deploy.id : null;

  const ecosystemBlock = loadBlock("ecosystem", ecosystem, targetDir, repoRoot);
  const frameworkBlock = loadBlock("framework", framework, targetDir, repoRoot);
  const databaseBlock = loadBlock("database", database, targetDir, repoRoot);
  const deployBlock = loadBlock("deploy", deploy, targetDir, repoRoot);

  // Compose TECH_STACK from blocks
  const techParts = [];
  if (ecosystemBlock) techParts.push(ecosystemBlock);
  if (frameworkBlock) techParts.push(frameworkBlock);
  if (databaseBlock) techParts.push(databaseBlock);
  if (deployBlock) techParts.push(deployBlock);

  if (techParts.length > 0) {
    blocks.BLOCK_CONTENT = techParts.join("\n\n");
  }

  // Compose guardrails from framework + database blocks
  const guardrailParts = [];
  if (frameworkBlock) guardrailParts.push(frameworkBlock);
  if (databaseBlock) guardrailParts.push(databaseBlock);
  if (guardrailParts.length > 0) {
    blocks.BLOCK_GUARDRAILS = guardrailParts.join("\n\n");
  }

  return blocks;
}

// ─── Substitution Map ───────────────────────────────────────────────────────

/**
 * Build a substitution map from user config and parsed stack sections.
 * @param {object} config - user config from .effectum.json
 * @param {Record<string, string>} stackSections - parsed stack preset
 * @returns {Record<string, string>}
 */
function buildSubstitutionMap(config, stackSections) {
  const formatter = FORMATTER_MAP[config.stack] || FORMATTER_MAP.generic;
  const langInstruction =
    LANGUAGE_INSTRUCTIONS[config.language] ||
    config.customLanguage ||
    LANGUAGE_INSTRUCTIONS.english;

  // Build AVAILABLE_TOOLS section from detected CLI tools
  const tools = getToolsForStack(config.stack);
  const toolLines = tools.map((t) => {
    const installed = checkTool(t.bin);
    const status = installed ? "installed" : "not installed";
    return `- **${t.key}** (${status}): ${t.why}`;
  });
  const availableTools =
    toolLines.length > 0
      ? toolLines.join("\n")
      : "No CLI tools configured. Run the installer to detect and configure tools.";

  return {
    PROJECT_NAME: config.projectName,
    LANGUAGE: langInstruction,
    TECH_STACK: stackSections.TECH_STACK || "[Not configured]",
    ARCHITECTURE_PRINCIPLES:
      stackSections.ARCHITECTURE_PRINCIPLES || "[Not configured]",
    PROJECT_STRUCTURE: stackSections.PROJECT_STRUCTURE || "[Not configured]",
    QUALITY_GATES: stackSections.QUALITY_GATES || "[Not configured]",
    STACK_SPECIFIC_GUARDRAILS:
      stackSections.STACK_SPECIFIC_GUARDRAILS || "[Not configured]",
    FORMATTER: formatter.command,
    FORMATTER_NAME: formatter.name,
    FORMATTER_GLOB: formatter.glob,
    PACKAGE_MANAGER: config.packageManager,
    TOOL_SPECIFIC_GUARDRAILS:
      stackSections.TOOL_SPECIFIC_GUARDRAILS || "[Not configured]",
    AVAILABLE_TOOLS: availableTools,
  };
}

/**
 * Replace all {{KEY}} placeholders in a string.
 * @param {string} content
 * @param {Record<string, string>} vars
 * @returns {string}
 */
function substituteAll(content, vars) {
  let result = content;
  for (const [key, value] of Object.entries(vars)) {
    const pattern = new RegExp(`\\{\\{${key}\\}\\}`, "g");
    result = result.replace(pattern, value);
  }
  return result;
}

/**
 * Check if any {{...}} placeholders remain.
 * @param {string} content
 * @returns {string[]} list of remaining placeholder names
 */
function findRemainingPlaceholders(content) {
  const matches = content.match(/\{\{(\w+)\}\}/g) || [];
  return [...new Set(matches)];
}

/**
 * Read a template file, substitute all placeholders, return result.
 * @param {string} templatePath
 * @param {Record<string, string>} vars
 * @returns {{ content: string, remaining: string[] }}
 */
function renderTemplate(templatePath, vars) {
  const raw = fs.readFileSync(templatePath, "utf8");
  const content = substituteAll(raw, vars);
  const remaining = findRemainingPlaceholders(content);
  return { content, remaining };
}

/**
 * Find template file path. Checks .effectum/templates/ first, then system/templates/.
 * @param {string} filename - e.g. 'CLAUDE.md.tmpl'
 * @param {string} targetDir
 * @param {string} repoRoot
 * @returns {string}
 */
function findTemplatePath(filename, targetDir, repoRoot) {
  const candidates = [
    path.join(targetDir, ".effectum", "templates", filename),
    path.join(repoRoot, "system", "templates", filename),
  ];
  for (const p of candidates) {
    if (fs.existsSync(p)) return p;
  }
  throw new Error(
    `Template "${filename}" not found. Searched:\n  ${candidates.join("\n  ")}`,
  );
}

module.exports = {
  buildSubstitutionMap,
  substituteAll,
  findRemainingPlaceholders,
  renderTemplate,
  findTemplatePath,
  // Block-based composition
  loadBlock,
  composeBlocks,
  findBlocksDir,
};
