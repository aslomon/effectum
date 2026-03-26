/**
 * Shared @clack/prompts helpers and display utilities.
 * Uses dynamic import() because @clack/prompts is ESM-only.
 *
 * Supports the 9-step intelligent setup flow:
 *   1. Install Scope  2. Project Basics  3. App Type  4. Description
 *   5. Language  6. Autonomy  7. Recommendation Preview  8. Decision  9. Install
 */
"use strict";

const {
  STACK_CHOICES,
  AUTONOMY_CHOICES,
  MCP_SERVERS,
  ECOSYSTEM_CHOICES,
  FRAMEWORK_CHOICES,
  DATABASE_CHOICES,
  AUTH_CHOICES,
  DEPLOY_CHOICES,
} = require("./constants");
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
const {
  checkAllTools,
  checkSystemBasics,
  formatToolStatus,
  formatInstallInstructions,
  formatInstallPlan,
  formatAuthStatus,
  installTool,
  categorizeForInstall,
  checkAllAuth,
} = require("./cli-tools");

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
    message: "Describe what you want to build (optional, press Enter to skip)",
    placeholder: "e.g. An internal CRM dashboard with auth and analytics",
  });
  handleCancel(value);
  return value || "";
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

// ─── Step 5b: Package Manager ─────────────────────────────────────────────

/**
 * Package manager recommendation logic.
 * @param {string|null} detected - detected package manager from lock file
 * @param {string|null} ecosystem - detected ecosystem (javascript, python, etc.)
 * @returns {{ recommended: string, reason: string }}
 */
function getPackageManagerRecommendation(detected, ecosystem) {
  if (detected && detected !== "npm") {
    return {
      recommended: detected,
      reason: `${detected} detected from lock file`,
    };
  }
  // For new projects or npm default, recommend based on ecosystem
  const ecosystemDefaults = {
    javascript: { recommended: "pnpm", reason: "fast, strict dependencies" },
    python: { recommended: "uv", reason: "fast Python package manager" },
    go: { recommended: "go", reason: "Go modules (built-in)" },
    rust: { recommended: "cargo", reason: "Rust package manager (built-in)" },
    swift: {
      recommended: "swift package (SPM)",
      reason: "Swift Package Manager (built-in)",
    },
    dart: { recommended: "flutter", reason: "Flutter/Dart package manager" },
  };
  if (ecosystem && ecosystemDefaults[ecosystem]) {
    return ecosystemDefaults[ecosystem];
  }
  if (detected) {
    return { recommended: detected, reason: "detected from project files" };
  }
  return { recommended: "pnpm", reason: "fast, strict dependencies" };
}

/**
 * Ask for package manager with detection + recommendation.
 * @param {string|null} detected - auto-detected package manager
 * @param {string|null} ecosystem - detected ecosystem
 * @param {string|null} lockFile - name of detected lock file (for display)
 * @returns {Promise<string>}
 */
async function askPackageManager(detected, ecosystem, lockFile) {
  const rec = getPackageManagerRecommendation(detected, ecosystem);

  // When a non-npm lock file exists, show confirmation
  if (detected && detected !== "npm" && lockFile) {
    p.log.info(`Package Manager: ${detected} detected (${lockFile} found)`);
    p.log.info(`Recommendation: Keep ${detected}`);

    const keep = await p.confirm({
      message: `Keep ${detected}?`,
      initialValue: true,
    });
    handleCancel(keep);

    if (keep) return detected;
  }

  // Selection prompt for new projects or when user wants to change
  const jsManagers = [
    {
      value: "pnpm",
      label: "pnpm",
      hint: "recommended — fast, strict dependencies",
    },
    { value: "npm", label: "npm", hint: "default Node.js manager" },
    { value: "yarn", label: "yarn", hint: "classic alternative" },
    { value: "bun", label: "bun", hint: "fast, experimental" },
  ];

  const pythonManagers = [
    { value: "uv", label: "uv", hint: "recommended — fast Python packaging" },
    { value: "pip", label: "pip", hint: "default Python installer" },
    { value: "poetry", label: "poetry", hint: "dependency management" },
    { value: "pipenv", label: "pipenv", hint: "Pipfile-based" },
  ];

  // Choose options based on ecosystem
  let options;
  if (ecosystem === "python") {
    options = pythonManagers;
  } else if (ecosystem === "go") {
    return "go";
  } else if (ecosystem === "rust") {
    return "cargo";
  } else if (ecosystem === "swift") {
    return "swift package (SPM)";
  } else if (ecosystem === "dart") {
    return "flutter";
  } else {
    options = jsManagers;
  }

  const value = await p.select({
    message: "Which package manager would you like to use?",
    options,
    initialValue: rec.recommended,
  });
  handleCancel(value);
  return value;
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

// ─── System Basics Check (Phase 1) ──────────────────────────────────────────

/**
 * Check system basics (Homebrew, Git, Node.js, Claude Code) before config.
 * Offers to install missing basics.
 * @returns {Promise<void>}
 */
async function showSystemCheck() {
  const result = checkSystemBasics();

  p.note(formatToolStatus(result.tools), "System Basics");

  if (result.missing.length === 0) {
    p.log.success("All system basics are installed.");
    return;
  }

  p.log.warn(`${result.missing.length} system tool(s) not found.`);

  for (const tool of result.missing) {
    const name = tool.displayName || tool.key;
    const wantInstall = await p.confirm({
      message: `Install ${name}? (${tool.why})`,
      initialValue: true,
    });
    handleCancel(wantInstall);

    if (wantInstall) {
      const s = p.spinner();
      s.start(`Installing ${name}...`);
      const installResult = installTool(tool);
      if (installResult.ok) {
        tool.installed = true;
        s.stop(`${name} installed`);
      } else {
        s.stop(`${name} failed: ${installResult.error || "unknown error"}`);
        p.log.warn(`You can install ${name} manually later.`);
      }
    }
  }
}

// ─── Consolidated Installation Plan (Phase 3) ──────────────────────────────

/**
 * Show consolidated installation plan for stack tools and install with one confirmation.
 * @param {string} stack - selected stack key
 * @param {string} [targetDir] - project directory for community overrides
 * @returns {Promise<{ tools: Array<object>, missing: Array<object>, installed: Array<object> }>}
 */
async function showInstallPlan(stack, targetDir) {
  const result = checkAllTools(stack, targetDir);

  p.note(formatToolStatus(result.tools), "Stack Tools");

  if (result.missing.length === 0) {
    p.log.success("All stack tools are installed.");
    return result;
  }

  // Categorize missing tools
  const plan = categorizeForInstall(result.tools);

  // Show the consolidated plan
  p.note(formatInstallPlan(plan), "Installation Plan");

  // Auto-install with one confirmation
  if (plan.autoInstall.length > 0) {
    const names = plan.autoInstall
      .map((t) => t.displayName || t.key)
      .join(", ");
    const confirm = await p.confirm({
      message: `Install ${plan.autoInstall.length} tool(s)? (${names})`,
      initialValue: true,
    });
    handleCancel(confirm);

    if (confirm) {
      for (const tool of plan.autoInstall) {
        const name = tool.displayName || tool.key;
        const s = p.spinner();
        s.start(`Installing ${name}...`);
        const installResult = installTool(tool);
        if (installResult.ok) {
          // Update in result too
          const match = result.tools.find((t) => t.key === tool.key);
          if (match) match.installed = true;
          s.stop(`${name} installed`);
        } else {
          s.stop(`${name} failed: ${installResult.error || "unknown error"}`);
        }
      }
    }
  }

  if (plan.manual.length > 0) {
    p.log.info("Manual setup required for the tools listed above.");
  }

  return result;
}

// ─── Auth Flow (Phase 4) ────────────────────────────────────────────────────

/**
 * Check auth status for installed tools and guide through authentication.
 * @param {Array<object>} tools - tools with `installed` status
 * @returns {Promise<void>}
 */
async function showAuthCheck(tools) {
  const authResults = checkAllAuth(tools);

  if (authResults.length === 0) return;

  p.note(formatAuthStatus(authResults), "Auth Status");

  const unauthenticated = authResults.filter((t) => !t.authenticated);

  if (unauthenticated.length === 0) {
    p.log.success("All tools are authenticated.");
    return;
  }

  p.log.warn(`${unauthenticated.length} tool(s) need authentication.`);

  const runAuth = await p.confirm({
    message: "Show auth commands for unauthenticated tools?",
    initialValue: true,
  });
  handleCancel(runAuth);

  if (runAuth) {
    const lines = unauthenticated.map((t) => {
      const name = t.displayName || t.key;
      let line = `  ${name}: ${t.authSetupCmd}`;
      if (t.authUrl) line += `\n    Token: ${t.authUrl}`;
      return line;
    });
    p.note(lines.join("\n"), "Run these commands manually");
  }
}

// ─── Legacy CLI Tool Check (kept for backward compat) ───────────────────────

/**
 * Run CLI tool check and offer installation/auth for missing tools.
 * @deprecated Use showSystemCheck + showInstallPlan + showAuthCheck instead.
 * @param {string} stack - selected stack key
 * @returns {Promise<{ tools: Array<object>, missing: Array<object>, installed: Array<object> }>}
 */
async function showCliToolCheck(stack) {
  const result = await showInstallPlan(stack);
  await showAuthCheck(result.tools);
  return result;
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

// ─── Modular Stack Composition (confidence-based skip logic) ─────────────────

/**
 * Confirm a detected stack when confidence is "certain".
 * Shows detected components and asks user to confirm or change.
 * @param {object} detection - modular detection result
 * @returns {Promise<boolean>} true if confirmed, false to change
 */
async function confirmDetectedStack(detection) {
  const parts = [];
  if (detection.framework.id)
    parts.push(`Framework: ${detection.framework.id}`);
  if (detection.database.id) parts.push(`Database: ${detection.database.id}`);
  if (detection.auth.id) parts.push(`Auth: ${detection.auth.id}`);
  if (detection.deploy.id) parts.push(`Deploy: ${detection.deploy.id}`);
  if (detection.orm.id) parts.push(`ORM: ${detection.orm.id}`);

  p.note(parts.join("\n"), `Detected Stack (${detection.ecosystem})`);

  const confirmed = await p.confirm({
    message: "Use this detected stack?",
    initialValue: true,
  });
  handleCancel(confirmed);
  return confirmed;
}

/**
 * Ask for missing components when detection is partial.
 * Only asks for components that were not detected.
 * @param {object} detection - modular detection result
 * @returns {Promise<object>} completed stack selection
 */
async function askMissingComponents(detection) {
  const result = {
    ecosystem: detection.ecosystem,
    framework: detection.framework.id,
    database: detection.database.id,
    auth: detection.auth.id,
    deploy: detection.deploy.id,
    orm: detection.orm.id,
  };

  // Ask for framework if not detected
  if (!result.framework && result.ecosystem) {
    const choices = FRAMEWORK_CHOICES[result.ecosystem] || [];
    if (choices.length > 0) {
      const fw = await p.select({
        message: "Framework",
        options: choices.map((c) => ({
          value: c.value,
          label: c.label,
          hint: c.hint,
        })),
      });
      handleCancel(fw);
      result.framework = fw;
    }
  }

  // Ask for database if not detected
  if (!result.database) {
    const db = await p.select({
      message: "Database / Backend",
      options: DATABASE_CHOICES.map((c) => ({
        value: c.value,
        label: c.label,
        hint: c.hint,
      })),
      initialValue:
        result.ecosystem === "javascript" ? "supabase" : "postgresql",
    });
    handleCancel(db);
    result.database = db === "none" ? null : db;
  }

  // Ask for auth if not detected
  if (!result.auth && result.database) {
    const auth = await p.select({
      message: "Authentication",
      options: AUTH_CHOICES.map((c) => ({
        value: c.value,
        label: c.label,
        hint: c.hint,
      })),
      initialValue: result.database === "supabase" ? "supabase-auth" : "none",
    });
    handleCancel(auth);
    result.auth = auth === "none" ? null : auth;
  }

  // Ask for deploy if not detected
  if (!result.deploy) {
    const deploy = await p.select({
      message: "Deployment",
      options: DEPLOY_CHOICES.map((c) => ({
        value: c.value,
        label: c.label,
        hint: c.hint,
      })),
      initialValue: result.ecosystem === "javascript" ? "vercel" : "docker",
    });
    handleCancel(deploy);
    result.deploy = deploy;
  }

  return result;
}

/**
 * Ask user to choose a preset or build their own stack.
 * @param {Array<object>} presets - loaded preset definitions
 * @returns {Promise<{ mode: string, preset?: object }>}
 */
/**
 * @param {Array} presets
 * @param {string|null} detectedEcosystem - ecosystem inferred from project files (e.g. "javascript", "python")
 */
async function askPresetOrCustom(presets, detectedEcosystem) {
  const options = [
    ...presets.map((p) => ({
      value: p.id,
      label: p.label,
      hint: p.hint,
    })),
    {
      value: "__custom__",
      label: "Build Your Own",
      hint: "Choose ecosystem, framework, database, deploy step by step",
    },
  ];

  // Determine best initial selection:
  // - If a preset's ecosystem matches the detected ecosystem, pre-select it.
  // - Otherwise default to "Build Your Own" so we don't mislead the user.
  let initialValue = "__custom__";
  if (detectedEcosystem) {
    const match = presets.find(
      (preset) =>
        preset.ecosystem &&
        preset.ecosystem.toLowerCase() === detectedEcosystem.toLowerCase(),
    );
    if (match) initialValue = match.id;
  }

  const value = await p.select({
    message: "Quick Preset or Build Your Own?",
    options,
    initialValue,
  });
  handleCancel(value);

  if (value === "__custom__") {
    return { mode: "custom" };
  }

  const preset = presets.find((p) => p.id === value);
  return { mode: "preset", preset };
}

/**
 * Full 4-step modular stack composition flow.
 * @param {object|null} prefill - pre-filled values from detection
 * @returns {Promise<object>} complete stack selection
 */
async function askModularStack(prefill) {
  const result = {
    ecosystem: prefill ? prefill.ecosystem : null,
    framework: prefill ? prefill.framework : null,
    database: prefill ? prefill.database : null,
    auth: prefill ? prefill.auth : null,
    deploy: prefill ? prefill.deploy : null,
    orm: prefill ? prefill.orm : null,
  };

  // Step 1: Ecosystem
  if (!result.ecosystem) {
    const eco = await p.select({
      message: "Step 1: Ecosystem",
      options: ECOSYSTEM_CHOICES.map((c) => ({
        value: c.value,
        label: c.label,
        hint: c.hint,
      })),
    });
    handleCancel(eco);
    result.ecosystem = eco;
  }

  // Step 2: Framework
  if (!result.framework) {
    const choices = FRAMEWORK_CHOICES[result.ecosystem] || [];
    if (choices.length > 0) {
      const fw = await p.select({
        message: "Step 2: Framework",
        options: choices.map((c) => ({
          value: c.value,
          label: c.label,
          hint: c.hint,
        })),
      });
      handleCancel(fw);
      result.framework = fw;
    }
  }

  // Step 3: Database + Auth
  if (!result.database) {
    const db = await p.select({
      message: "Step 3a: Database / Backend",
      options: DATABASE_CHOICES.map((c) => ({
        value: c.value,
        label: c.label,
        hint: c.hint,
      })),
      initialValue: result.framework === "nextjs" ? "supabase" : "postgresql",
    });
    handleCancel(db);
    result.database = db === "none" ? null : db;
  }

  if (!result.auth && result.database) {
    const auth = await p.select({
      message: "Step 3b: Authentication",
      options: AUTH_CHOICES.map((c) => ({
        value: c.value,
        label: c.label,
        hint: c.hint,
      })),
      initialValue: result.database === "supabase" ? "supabase-auth" : "none",
    });
    handleCancel(auth);
    result.auth = auth === "none" ? null : auth;
  }

  // Step 4: Deploy
  if (!result.deploy) {
    // Filter deploy options based on ecosystem
    const isNative = ["swift", "dart"].includes(result.ecosystem);
    const deployOptions = DEPLOY_CHOICES.filter((c) => {
      if (isNative && c.value === "vercel") return false;
      if (!isNative && c.value === "appstore") return false;
      return true;
    });

    const deploy = await p.select({
      message: "Step 4: Deployment",
      options: deployOptions.map((c) => ({
        value: c.value,
        label: c.label,
        hint: c.hint,
      })),
      initialValue: isNative
        ? "appstore"
        : result.ecosystem === "javascript"
          ? "vercel"
          : "docker",
    });
    handleCancel(deploy);
    result.deploy = deploy;
  }

  return result;
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
  // Modular stack composition
  confirmDetectedStack,
  askMissingComponents,
  askPresetOrCustom,
  askModularStack,
  // Package manager
  askPackageManager,
  getPackageManagerRecommendation,
  // Tool check flow
  showSystemCheck,
  showInstallPlan,
  showAuthCheck,
  showCliToolCheck,
  // Legacy / utility prompts
  askMcpServers,
  askPlaywright,
  askGitBranch,
  // Display
  showSummary,
  showOutro,
};
