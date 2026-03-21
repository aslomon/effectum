/**
 * Template substitution engine.
 * Reads template files, replaces all {{PLACEHOLDER}} tokens with values
 * from the stack preset and user config.
 */
"use strict";

const fs = require("fs");
const path = require("path");
const { FORMATTER_MAP } = require("./constants");
const { LANGUAGE_INSTRUCTIONS } = require("./languages");
const { getToolsForStack, checkTool } = require("./cli-tools");

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
};
