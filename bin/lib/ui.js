/**
 * Shared @clack/prompts helpers and display utilities.
 * Uses dynamic import() because @clack/prompts is ESM-only.
 *
 * Supports the 9-step intelligent setup flow:
 *   1. Install Scope  2. Project Basics  3. App Type  4. Description
 *   5. Language  6. Autonomy  7. Recommendation Preview  8. Decision  9. Install
 */
"use strict";

const { STACK_CHOICES, AUTONOMY_CHOICES, MCP_SERVERS } = require("./constants");
const { LANGUAGE_CHOICES } = require("./languages");
const { APP_TYPE_CHOICES } = require("./app-types");
const { FOUNDATION_HOOKS } = require("./foundation");
const {
  getAllCommands,
  getAllHooks,
  getAllSkills,
  getAllMcps,
  getAllSubagents,
} = require("./recommendation");

/** @type {import("@clack/prompts")} */
let p;

/**
 * Initialize @clack/prompts (ESM module). Must be called once before using prompts.
 * @returns {Promise<import("@clack/prompts")>}
 */
async function initClack() {
  if (!p) {
    p = await import("@clack/prompts");
  }
  return p;
}

/**
 * Get the loaded clack instance.
 * @returns {import("@clack/prompts")}
 */
function getClack() {
  if (!p) throw new Error("Call initClack() before using prompts");
  return p;
}

/**
 * Print the Effectum banner via clack intro.
 */
function printBanner() {
  p.intro("EFFECTUM — Intelligent Setup for Claude Code");
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

// ─── Step 1: Install Scope ──────────────────────────────────────────────────

/**
 * Ask for install scope.
 * @returns {Promise<string>} "local" or "global"
 */
async function askScope() {
  const value = await p.select({
    message: "Install scope",
    options: [
      {
        value: "local",
        label: "Local",
        hint: "This project only (./.claude/)",
      },
      {
        value: "global",
        label: "Global",
        hint: "All projects (~/.claude/)",
      },
    ],
    initialValue: "local",
  });
  handleCancel(value);
  return value;
}

// ─── Step 2: Project Basics ─────────────────────────────────────────────────

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

// ─── Step 3: App Type ───────────────────────────────────────────────────────

/**
 * Ask for app type selection.
 * @returns {Promise<string>}
 */
async function askAppType() {
  const value = await p.select({
    message: "What are you building?",
    options: APP_TYPE_CHOICES.map((c) => ({
      value: c.value,
      label: c.label,
      hint: c.hint,
    })),
    initialValue: "web-app",
  });
  handleCancel(value);
  return value;
}

// ─── Step 4: Description ────────────────────────────────────────────────────

/**
 * Ask for a free-text project description.
 * @returns {Promise<string>}
 */
async function askDescription() {
  const value = await p.text({
    message: "Describe what you want to build (one sentence)",
    placeholder: "e.g. An internal CRM dashboard with auth and analytics",
    validate: (v) => {
      if (!v.trim())
        return "A short description helps generate better recommendations";
    },
  });
  handleCancel(value);
  return value;
}

// ─── Step 5: Language ───────────────────────────────────────────────────────

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

// ─── Step 6: Autonomy ───────────────────────────────────────────────────────

/**
 * Ask for autonomy level.
 * @returns {Promise<string>}
 */
async function askAutonomy() {
  const value = await p.select({
    message: "How should Claude work?",
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

// ─── Step 7: Recommendation Preview ─────────────────────────────────────────

/**
 * Display the recommendation preview.
 * @param {object} rec - recommendation from recommend()
 */
function showRecommendation(rec) {
  const lines = [];

  lines.push("FOUNDATION (always active)");
  for (const h of FOUNDATION_HOOKS) {
    lines.push(`  + ${h.label}`);
  }

  lines.push("");
  lines.push("RECOMMENDED COMMANDS");
  for (const key of rec.commands) {
    lines.push(`  + /${key}`);
  }

  lines.push("");
  lines.push("RECOMMENDED HOOKS");
  for (const key of rec.hooks) {
    lines.push(`  + ${key}`);
  }

  if (rec.skills.length > 0) {
    lines.push("");
    lines.push("RECOMMENDED SKILLS");
    for (const key of rec.skills) {
      lines.push(`  + ${key}`);
    }
  }

  lines.push("");
  lines.push("RECOMMENDED MCP SERVERS");
  for (const key of rec.mcps) {
    const server = MCP_SERVERS.find((s) => s.key === key);
    lines.push(`  + ${server ? server.label : key}`);
  }

  lines.push("");
  lines.push("RECOMMENDED SUBAGENT SPECIALIZATIONS");
  for (const key of rec.subagents) {
    lines.push(`  + ${key}`);
  }

  lines.push("");
  lines.push("AGENT TEAMS: disabled (experimental, enable manually)");

  p.note(lines.join("\n"), "Recommended Setup");
}

// ─── Step 8: Decision ───────────────────────────────────────────────────────

/**
 * Ask user how to proceed with the recommendation.
 * @returns {Promise<string>} "recommended" | "customize" | "manual"
 */
async function askSetupMode() {
  const value = await p.select({
    message: "How do you want to proceed?",
    options: [
      {
        value: "recommended",
        label: "Use Recommended",
        hint: "Install the recommended setup as-is",
      },
      {
        value: "customize",
        label: "Customize",
        hint: "Start from recommendations, toggle items on/off",
      },
      {
        value: "manual",
        label: "Manual Selection",
        hint: "Choose everything yourself from scratch",
      },
    ],
    initialValue: "recommended",
  });
  handleCancel(value);
  return value;
}

/**
 * Let user customize the recommended setup by toggling items.
 * @param {object} rec - current recommendation
 * @returns {Promise<object>} modified recommendation
 */
async function askCustomize(rec) {
  const result = { ...rec };

  // Commands
  const commands = await p.multiselect({
    message: "Commands (space to toggle)",
    options: getAllCommands().map((c) => ({
      value: c.key,
      label: c.label,
    })),
    initialValues: rec.commands,
    required: false,
  });
  handleCancel(commands);
  result.commands = commands;

  // Skills
  const skills = await p.multiselect({
    message: "Skills (space to toggle)",
    options: getAllSkills().map((s) => ({
      value: s.key,
      label: s.label,
    })),
    initialValues: rec.skills,
    required: false,
  });
  handleCancel(skills);
  result.skills = skills;

  // MCP servers
  const mcps = await p.multiselect({
    message: "MCP servers (space to toggle)",
    options: getAllMcps().map((m) => ({
      value: m.key,
      label: m.label,
      hint: m.desc,
    })),
    initialValues: rec.mcps,
    required: false,
  });
  handleCancel(mcps);
  result.mcps = mcps;

  // Subagent specializations
  const subagents = await p.multiselect({
    message: "Subagent specializations (space to toggle)",
    options: getAllSubagents().map((s) => ({
      value: s.key,
      label: s.label,
    })),
    initialValues: rec.subagents,
    required: false,
  });
  handleCancel(subagents);
  result.subagents = subagents;

  // Agent Teams (experimental)
  const agentTeams = await p.confirm({
    message: "Enable Agent Teams? (experimental, advanced)",
    initialValue: false,
  });
  handleCancel(agentTeams);
  result.agentTeams = agentTeams;

  return result;
}

/**
 * Full manual selection — nothing pre-selected.
 * @returns {Promise<object>} user-selected setup
 */
async function askManual() {
  const commands = await p.multiselect({
    message: "Select commands",
    options: getAllCommands().map((c) => ({
      value: c.key,
      label: c.label,
    })),
    initialValues: [],
    required: false,
  });
  handleCancel(commands);

  const skills = await p.multiselect({
    message: "Select skills",
    options: getAllSkills().map((s) => ({
      value: s.key,
      label: s.label,
    })),
    initialValues: [],
    required: false,
  });
  handleCancel(skills);

  const mcps = await p.multiselect({
    message: "Select MCP servers",
    options: getAllMcps().map((m) => ({
      value: m.key,
      label: m.label,
      hint: m.desc,
    })),
    initialValues: [],
    required: false,
  });
  handleCancel(mcps);

  const subagents = await p.multiselect({
    message: "Select subagent specializations",
    options: getAllSubagents().map((s) => ({
      value: s.key,
      label: s.label,
    })),
    initialValues: [],
    required: false,
  });
  handleCancel(subagents);

  const agentTeams = await p.confirm({
    message: "Enable Agent Teams? (experimental, advanced)",
    initialValue: false,
  });
  handleCancel(agentTeams);

  return {
    commands,
    hooks: getAllHooks().map((h) => h.key),
    skills,
    mcps,
    subagents,
    agentTeams,
    tags: [],
  };
}

// ─── Legacy prompts (kept for backward compat) ──────────────────────────────

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

// ─── Display helpers ────────────────────────────────────────────────────────

/**
 * Display a summary note.
 * @param {object} config
 * @param {string[]} files
 */
function showSummary(config, files) {
  const lines = [
    `Project:      ${config.projectName}`,
    `Stack:        ${config.stack}`,
    `App Type:     ${config.appType || "n/a"}`,
    `Language:     ${config.language}`,
    `Autonomy:     ${config.autonomyLevel}`,
    `Pkg Manager:  ${config.packageManager}`,
    `Formatter:    ${config.formatter}`,
    `Mode:         ${config.mode || "recommended"}`,
  ];

  if (config.recommended) {
    lines.push(
      `Commands:     ${config.recommended.commands.length}`,
      `Skills:       ${config.recommended.skills.length}`,
      `MCPs:         ${config.recommended.mcps.length}`,
      `Subagents:    ${config.recommended.subagents.length}`,
      `Agent Teams:  ${config.recommended.agentTeams ? "enabled" : "disabled"}`,
    );
  }

  lines.push("", `Files created/updated:`);
  lines.push(...files.map((f) => `  ${f}`));

  p.note(lines.join("\n"), "Configuration Summary");
}

/**
 * Show the next-steps outro.
 * @param {boolean} isGlobal
 */
function showOutro(isGlobal) {
  if (isGlobal) {
    p.outro("Effectum ready! In any project, run: npx @aslomon/effectum init");
  } else {
    p.outro(
      "Effectum ready! Open Claude Code here and start building. Try /plan or /prd:new",
    );
  }
}

module.exports = {
  initClack,
  getClack,
  printBanner,
  handleCancel,
  // Step prompts
  askScope,
  askProjectName,
  askStack,
  askAppType,
  askDescription,
  askLanguage,
  askAutonomy,
  showRecommendation,
  askSetupMode,
  askCustomize,
  askManual,
  // Legacy / utility prompts
  askMcpServers,
  askPlaywright,
  askGitBranch,
  // Display
  showSummary,
  showOutro,
};
