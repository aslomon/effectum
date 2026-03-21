/**
 * CLI tool detection, installation, and auth checking.
 *
 * Tool definitions are loaded dynamically from JSON files in system/tools/
 * via the tool-loader module. This module provides the runtime operations:
 * check, install, auth, and formatting.
 */
"use strict";

const { spawnSync } = require("child_process");
const os = require("os");
const { loadToolDefinitions, getSystemBasics } = require("./tool-loader");

// ─── Platform ────────────────────────────────────────────────────────────────

/**
 * Get the platform key for install commands.
 * @returns {"darwin"|"linux"}
 */
function getPlatform() {
  const p = os.platform();
  return p === "darwin" ? "darwin" : "linux";
}

// ─── Tool check ──────────────────────────────────────────────────────────────

/**
 * Check if a CLI tool is installed by looking up its binary.
 * Uses the tool's `check` command if available, otherwise falls back to `which`.
 * @param {object|string} toolOrBin - tool object or binary name
 * @returns {boolean}
 */
function checkTool(toolOrBin) {
  const bin = typeof toolOrBin === "string" ? toolOrBin : toolOrBin.bin;
  const checkCmd =
    typeof toolOrBin === "object" && toolOrBin.check ? toolOrBin.check : null;

  try {
    if (checkCmd) {
      const result = spawnSync("bash", ["-c", checkCmd], {
        timeout: 5000,
        stdio: "pipe",
        encoding: "utf8",
      });
      return result.status === 0;
    }
    const result = spawnSync("which", [bin], {
      timeout: 5000,
      stdio: "pipe",
      encoding: "utf8",
    });
    return result.status === 0 && result.stdout.trim().length > 0;
  } catch (_) {
    return false;
  }
}

// ─── Tool retrieval ──────────────────────────────────────────────────────────

/**
 * Get the relevant tools for a given stack, loaded from JSON definitions.
 * Foundation tools are always included.
 * @param {string} stack - stack key (e.g., "nextjs-supabase")
 * @param {string} [targetDir] - project directory for community overrides
 * @returns {Array<object>}
 */
function getToolsForStack(stack, targetDir) {
  return loadToolDefinitions(stack, targetDir);
}

/**
 * Check all relevant tools for a stack and return status.
 * @param {string} stack
 * @param {string} [targetDir] - project directory for community overrides
 * @returns {{ tools: Array<object>, missing: Array<object>, installed: Array<object> }}
 */
function checkAllTools(stack, targetDir) {
  const relevant = getToolsForStack(stack, targetDir);
  const results = relevant.map((tool) => ({
    ...tool,
    installed: checkTool(tool),
  }));

  return {
    tools: results,
    missing: results.filter((t) => !t.installed),
    installed: results.filter((t) => t.installed),
  };
}

/**
 * Check system basics (Homebrew, Git, Node.js, Claude Code).
 * @returns {{ tools: Array<object>, missing: Array<object>, installed: Array<object> }}
 */
function checkSystemBasics() {
  const basics = getSystemBasics();
  const results = basics.map((tool) => ({
    ...tool,
    installed: checkTool(tool),
  }));

  return {
    tools: results,
    missing: results.filter((t) => !t.installed),
    installed: results.filter((t) => t.installed),
  };
}

// ─── Tool installation ───────────────────────────────────────────────────────

/**
 * Get the install command for a tool on the current platform.
 * @param {object} tool
 * @returns {string|null}
 */
function getInstallCommand(tool) {
  if (!tool.install) return null;
  const platform = getPlatform();
  return tool.install[platform] || tool.install.all || null;
}

/**
 * Install a single tool using its platform-appropriate command.
 * @param {object} tool
 * @returns {{ ok: boolean, command: string|null, error?: string }}
 */
function installTool(tool) {
  const command = getInstallCommand(tool);
  if (!command) {
    return {
      ok: false,
      command: null,
      error: "No install command for this platform",
    };
  }

  try {
    const result = spawnSync("bash", ["-c", command], {
      timeout: 120000,
      stdio: "pipe",
      encoding: "utf8",
    });
    if (result.status === 0) {
      return { ok: true, command };
    }
    return { ok: false, command, error: result.stderr || "Install failed" };
  } catch (err) {
    return { ok: false, command, error: err.message };
  }
}

/**
 * Categorize tools into auto-installable and manual-only groups.
 * @param {Array<object>} tools - tools with `installed` status
 * @returns {{ autoInstall: Array<object>, manual: Array<object> }}
 */
function categorizeForInstall(tools) {
  const missing = tools.filter((t) => !t.installed);
  const platform = getPlatform();

  return {
    autoInstall: missing.filter((t) => {
      if (t.autoInstall === false) return false;
      const cmd = t.install ? t.install[platform] || t.install.all : null;
      return !!cmd;
    }),
    manual: missing.filter((t) => {
      if (t.autoInstall === false) return true;
      const cmd = t.install ? t.install[platform] || t.install.all : null;
      return !cmd;
    }),
  };
}

// ─── Auth checking ───────────────────────────────────────────────────────────

/**
 * Check if a tool is authenticated.
 * Supports both legacy format (auth as string) and new format (auth as object).
 * @param {object} tool
 * @returns {{ authenticated: boolean, needsAuth: boolean }}
 */
function checkAuth(tool) {
  const authCheck =
    typeof tool.auth === "object" && tool.auth !== null
      ? tool.auth.check
      : typeof tool.auth === "string"
        ? tool.auth
        : null;

  if (!authCheck) {
    return { authenticated: true, needsAuth: false };
  }

  try {
    const result = spawnSync("bash", ["-c", authCheck], {
      timeout: 10000,
      stdio: "pipe",
      encoding: "utf8",
    });
    return {
      authenticated: result.status === 0,
      needsAuth: true,
    };
  } catch (_) {
    return { authenticated: false, needsAuth: true };
  }
}

/**
 * Get the auth setup command for a tool.
 * @param {object} tool
 * @returns {string|null}
 */
function getAuthSetup(tool) {
  if (typeof tool.auth === "object" && tool.auth !== null) {
    return tool.auth.setup || null;
  }
  return tool.authSetup || null;
}

/**
 * Get the auth URL for a tool (for creating tokens).
 * @param {object} tool
 * @returns {string|null}
 */
function getAuthUrl(tool) {
  if (typeof tool.auth === "object" && tool.auth !== null) {
    return tool.auth.url || null;
  }
  return null;
}

/**
 * Check auth status for all installed tools that need auth.
 * @param {Array<object>} tools - tools with `installed` status
 * @returns {Array<object>} - tools with auth status added
 */
function checkAllAuth(tools) {
  return tools
    .filter((t) => t.installed)
    .map((tool) => {
      const authResult = checkAuth(tool);
      return {
        ...tool,
        ...authResult,
        authSetupCmd: getAuthSetup(tool),
        authUrl: getAuthUrl(tool),
      };
    })
    .filter((t) => t.needsAuth);
}

// ─── Formatting helpers ──────────────────────────────────────────────────────

/**
 * Generate a human-readable tools status summary.
 * @param {Array<object>} tools - tool check results
 * @returns {string}
 */
function formatToolStatus(tools) {
  return tools
    .map((t) => {
      const icon = t.installed ? "\u2705" : "\u274C";
      const name = t.displayName || t.key;
      return `  ${icon} ${name} — ${t.why}`;
    })
    .join("\n");
}

/**
 * Generate install instructions for missing tools.
 * @param {Array<object>} missing - missing tools
 * @returns {string}
 */
function formatInstallInstructions(missing) {
  const platform = getPlatform();
  return missing
    .map((t) => {
      const cmd = t.install
        ? t.install[platform] || t.install.all || "N/A"
        : "N/A";
      const name = t.displayName || t.key;
      return `  ${name}: ${cmd}`;
    })
    .join("\n");
}

/**
 * Format a consolidated installation plan.
 * @param {{ autoInstall: Array<object>, manual: Array<object> }} plan
 * @returns {string}
 */
function formatInstallPlan(plan) {
  const lines = [];

  if (plan.autoInstall.length > 0) {
    lines.push("Will install:");
    for (const tool of plan.autoInstall) {
      const name = tool.displayName || tool.key;
      const cmd = getInstallCommand(tool);
      lines.push(`  ${name} — ${cmd}`);
    }
  }

  if (plan.manual.length > 0) {
    if (lines.length > 0) lines.push("");
    lines.push("Manual setup needed:");
    for (const tool of plan.manual) {
      const name = tool.displayName || tool.key;
      const url = tool.manualUrl || getInstallCommand(tool) || "see docs";
      lines.push(`  ${name} — ${url}`);
    }
  }

  return lines.join("\n");
}

/**
 * Format auth status for display.
 * @param {Array<object>} authResults
 * @returns {string}
 */
function formatAuthStatus(authResults) {
  return authResults
    .map((t) => {
      const icon = t.authenticated ? "\u2705" : "\u274C";
      const name = t.displayName || t.key;
      let line = `  ${icon} ${name}`;
      if (!t.authenticated && t.authSetupCmd) {
        line += ` — run: ${t.authSetupCmd}`;
        if (t.authUrl) line += ` (${t.authUrl})`;
      }
      return line;
    })
    .join("\n");
}

/**
 * Build the AVAILABLE_TOOLS section content for CLAUDE.md.
 * @param {Array<object>} tools - tool check results
 * @returns {string}
 */
function buildAvailableToolsSection(tools) {
  const lines = tools.map((t) => {
    const status = t.installed ? "installed" : "not installed";
    const name = t.displayName || t.key;
    return `- **${name}** (${status}): ${t.why}`;
  });
  return lines.join("\n");
}

module.exports = {
  checkTool,
  getToolsForStack,
  checkAllTools,
  checkSystemBasics,
  getPlatform,
  getInstallCommand,
  installTool,
  categorizeForInstall,
  checkAuth,
  getAuthSetup,
  getAuthUrl,
  checkAllAuth,
  formatToolStatus,
  formatInstallInstructions,
  formatInstallPlan,
  formatAuthStatus,
  buildAvailableToolsSection,
};
