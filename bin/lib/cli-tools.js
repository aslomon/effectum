/**
 * CLI tool definitions, detection, installation, and auth checking.
 *
 * Each tool specifies:
 *   - key/bin: identifier and binary name
 *   - install: platform-specific install commands (darwin/linux/all)
 *   - auth/authSetup: commands to check and configure authentication
 *   - why: human-readable reason for the tool
 *   - foundation: true if always recommended regardless of stack
 *   - stacks: array of stack keys where this tool is relevant
 */
"use strict";

const { spawnSync } = require("child_process");
const os = require("os");

// ─── Tool definitions ────────────────────────────────────────────────────────

const CLI_TOOLS = [
  // Foundation (always recommended)
  {
    key: "git",
    bin: "git",
    install: {
      darwin: "xcode-select --install",
      linux: "sudo apt install -y git",
    },
    auth: "git config user.name && git config user.email",
    authSetup:
      'git config --global user.name "Your Name" && git config --global user.email "you@example.com"',
    why: "Version control — required for all projects",
    foundation: true,
  },
  {
    key: "gh",
    bin: "gh",
    install: { darwin: "brew install gh", linux: "sudo apt install -y gh" },
    auth: "gh auth status",
    authSetup: "gh auth login",
    why: "GitHub: Issues, PRs, Code Search, CI status",
    foundation: true,
  },
  // Stack-specific
  {
    key: "supabase",
    bin: "supabase",
    install: {
      darwin: "brew install supabase/tap/supabase",
      linux: "npm i -g supabase",
    },
    auth: "supabase projects list",
    authSetup: "supabase login",
    why: "Database migrations, type generation, edge functions",
    stacks: ["nextjs-supabase"],
  },
  {
    key: "vercel",
    bin: "vercel",
    install: { all: "npm i -g vercel" },
    auth: "vercel whoami",
    authSetup: "vercel login",
    why: "Deployment to Vercel",
    stacks: ["nextjs-supabase"],
  },
  {
    key: "docker",
    bin: "docker",
    install: {
      darwin: "brew install --cask docker",
      linux: "sudo apt install -y docker.io",
    },
    auth: null,
    why: "Container management, local dev environment",
    stacks: ["python-fastapi", "generic"],
  },
  {
    key: "uv",
    bin: "uv",
    install: { all: "curl -LsSf https://astral.sh/uv/install.sh | sh" },
    auth: null,
    why: "Fast Python package management",
    stacks: ["python-fastapi"],
  },
  {
    key: "ruff",
    bin: "ruff",
    install: { all: "pip install ruff" },
    auth: null,
    why: "Python linting and formatting",
    stacks: ["python-fastapi"],
  },
  {
    key: "xcodebuild",
    bin: "xcodebuild",
    install: { darwin: "xcode-select --install" },
    auth: null,
    why: "iOS/macOS build toolchain",
    stacks: ["swift-ios"],
  },
];

// ─── Tool check ──────────────────────────────────────────────────────────────

/**
 * Check if a CLI tool is installed by looking up its binary.
 * @param {string} bin - binary name (e.g. "git", "gh")
 * @returns {boolean}
 */
function checkTool(bin) {
  try {
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

/**
 * Get the relevant tools for a given stack.
 * Foundation tools are always included.
 * @param {string} stack - stack key (e.g. "nextjs-supabase")
 * @returns {Array<object>}
 */
function getToolsForStack(stack) {
  return CLI_TOOLS.filter(
    (tool) => tool.foundation || (tool.stacks && tool.stacks.includes(stack)),
  );
}

/**
 * Check all relevant tools for a stack and return status.
 * @param {string} stack
 * @returns {{ tools: Array<{ key: string, bin: string, installed: boolean, why: string, install: object, auth: string|null, authSetup: string|null }>, missing: Array<object>, installed: Array<object> }}
 */
function checkAllTools(stack) {
  const relevant = getToolsForStack(stack);
  const results = relevant.map((tool) => ({
    ...tool,
    installed: checkTool(tool.bin),
  }));

  return {
    tools: results,
    missing: results.filter((t) => !t.installed),
    installed: results.filter((t) => t.installed),
  };
}

// ─── Tool installation ───────────────────────────────────────────────────────

/**
 * Get the platform key for install commands.
 * @returns {"darwin"|"linux"}
 */
function getPlatform() {
  const p = os.platform();
  return p === "darwin" ? "darwin" : "linux";
}

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

// ─── Auth checking ───────────────────────────────────────────────────────────

/**
 * Check if a tool is authenticated.
 * @param {object} tool
 * @returns {{ authenticated: boolean, needsAuth: boolean }}
 */
function checkAuth(tool) {
  if (!tool.auth) {
    return { authenticated: true, needsAuth: false };
  }

  try {
    const result = spawnSync("bash", ["-c", tool.auth], {
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
      return `  ${icon} ${t.key} — ${t.why}`;
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
      const cmd = t.install[platform] || t.install.all || "N/A";
      return `  ${t.key}: ${cmd}`;
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
    return `- **${t.key}** (${status}): ${t.why}`;
  });
  return lines.join("\n");
}

module.exports = {
  CLI_TOOLS,
  checkTool,
  getToolsForStack,
  checkAllTools,
  getPlatform,
  getInstallCommand,
  installTool,
  checkAuth,
  formatToolStatus,
  formatInstallInstructions,
  buildAvailableToolsSection,
};
