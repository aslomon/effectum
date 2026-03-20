/**
 * Shared @clack/prompts helpers and display utilities.
 */
"use strict";

const p = require("@clack/prompts");
const {
  STACK_CHOICES,
  LANGUAGE_CHOICES,
  AUTONOMY_CHOICES,
  MCP_SERVERS,
} = require("./constants");

/**
 * Print the Effectum banner via clack intro.
 */
function printBanner() {
  p.intro("EFFECTUM — Autonomous development system for Claude Code");
}

/**
 * Check if the user cancelled a prompt (Ctrl+C).
 * @param {*} value
 */
function handleCancel(value) {
  if (p.isCancel(value)) {
    p.cancel("Setup cancelled.");
    process.exit(0);
  }
}

/**
 * Ask for project name with a detected default.
 * @param {string} detected
 * @returns {Promise<string>}
 */
async function askProjectName(detected) {
  const value = await p.text({
    message: "Project name",
    placeholder: detected,
    initialValue: detected,
    validate: (v) => {
      if (!v.trim()) return "Project name is required";
    },
  });
  handleCancel(value);
  return value;
}

/**
 * Ask for tech stack selection.
 * @param {string|null} detected - auto-detected stack key
 * @returns {Promise<string>}
 */
async function askStack(detected) {
  const value = await p.select({
    message: "Tech stack",
    options: STACK_CHOICES.map((c) => ({
      value: c.value,
      label: c.label,
      hint: c.hint,
    })),
    initialValue: detected || "generic",
  });
  handleCancel(value);
  return value;
}

/**
 * Ask for communication language.
 * @returns {Promise<{ language: string, customLanguage?: string }>}
 */
async function askLanguage() {
  const value = await p.select({
    message: "Communication language",
    options: LANGUAGE_CHOICES.map((c) => ({
      value: c.value,
      label: c.label,
      hint: c.hint,
    })),
    initialValue: "english",
  });
  handleCancel(value);

  if (value === "custom") {
    const custom = await p.text({
      message: "Enter your language instruction",
      placeholder: 'e.g. "Speak French with the user"',
      validate: (v) => {
        if (!v.trim()) return "Language instruction is required";
      },
    });
    handleCancel(custom);
    return { language: "custom", customLanguage: custom };
  }

  return { language: value };
}

/**
 * Ask for autonomy level.
 * @returns {Promise<string>}
 */
async function askAutonomy() {
  const value = await p.select({
    message: "Autonomy level",
    options: AUTONOMY_CHOICES.map((c) => ({
      value: c.value,
      label: c.label,
      hint: c.hint,
    })),
    initialValue: "standard",
  });
  handleCancel(value);
  return value;
}

/**
 * Ask which MCP servers to install via multi-select.
 * @returns {Promise<string[]>}
 */
async function askMcpServers() {
  const value = await p.multiselect({
    message: "MCP servers (space to toggle, enter to confirm)",
    options: MCP_SERVERS.map((s) => ({
      value: s.key,
      label: s.label,
      hint: s.desc,
    })),
    initialValues: MCP_SERVERS.map((s) => s.key),
    required: false,
  });
  handleCancel(value);
  return value;
}

/**
 * Ask whether to install Playwright browsers.
 * @returns {Promise<boolean>}
 */
async function askPlaywright() {
  const value = await p.confirm({
    message: "Install Playwright browsers? (required for /e2e)",
    initialValue: true,
  });
  handleCancel(value);
  return value;
}

/**
 * Ask whether to create a new git branch.
 * @returns {Promise<{ create: boolean, name?: string }>}
 */
async function askGitBranch() {
  const create = await p.confirm({
    message: "Create a new git branch for this setup?",
    initialValue: false,
  });
  handleCancel(create);

  if (!create) return { create: false };

  const name = await p.text({
    message: "Branch name",
    initialValue: "effectum-setup",
    placeholder: "effectum-setup",
  });
  handleCancel(name);
  return { create: true, name };
}

/**
 * Display a summary note.
 * @param {object} config
 * @param {string[]} files
 */
function showSummary(config, files) {
  const lines = [
    `Project:   ${config.projectName}`,
    `Stack:     ${config.stack}`,
    `Language:  ${config.language}`,
    `Autonomy:  ${config.autonomyLevel}`,
    `Pkg Mgr:   ${config.packageManager}`,
    `Formatter: ${config.formatter}`,
    `MCP:       ${(config.mcpServers || []).join(", ") || "none"}`,
    "",
    `Files created/updated:`,
    ...files.map((f) => `  ${f}`),
  ];
  p.note(lines.join("\n"), "Configuration Summary");
}

/**
 * Show the next-steps outro.
 * @param {boolean} isGlobal
 */
function showOutro(isGlobal) {
  if (isGlobal) {
    p.outro(
      "Effectum ready! In any project, run: npx @aslomon/effectum init",
    );
  } else {
    p.outro(
      "Effectum ready! Open Claude Code here and start building. Try /plan or /prd:new",
    );
  }
}

module.exports = {
  printBanner,
  handleCancel,
  askProjectName,
  askStack,
  askLanguage,
  askAutonomy,
  askMcpServers,
  askPlaywright,
  askGitBranch,
  showSummary,
  showOutro,
};
