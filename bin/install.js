#!/usr/bin/env node
/**
 * Effectum interactive installer.
 * Rewritten with @clack/prompts for full TUI experience.
 *
 * Usage:
 *   npx @aslomon/effectum              → interactive install
 *   npx @aslomon/effectum --global     → non-interactive global install
 *   npx @aslomon/effectum --local      → non-interactive local install
 *   npx @aslomon/effectum --yes        → non-interactive with smart defaults
 *   npx @aslomon/effectum --dry-run    → show plan without writing
 */
"use strict";

const fs = require("fs");
const path = require("path");
const os = require("os");
const { spawnSync } = require("child_process");
const { detectAll } = require("./lib/detect");
const { loadStackPreset } = require("./lib/stack-parser");
const {
  buildSubstitutionMap,
  renderTemplate,
  findTemplatePath,
  findRemainingPlaceholders,
} = require("./lib/template");
const { writeConfig } = require("./lib/config");
const { AUTONOMY_MAP, FORMATTER_MAP, MCP_SERVERS } = require("./lib/constants");
const { ensureDir, deepMerge, findRepoRoot: findRepoRootShared } = require("./lib/utils");
const {
  initClack,
  getClack,
  printBanner,
  askProjectName,
  askStack,
  askLanguage,
  askAutonomy,
  askMcpServers,
  askPlaywright,
  askGitBranch,
  showSummary,
  showOutro,
} = require("./lib/ui");

function copyFile(src, dest, opts = {}) {
  if (fs.existsSync(dest) && opts.skipExisting) {
    return { status: "skipped", dest };
  }
  ensureDir(path.dirname(dest));
  fs.copyFileSync(src, dest);
  return { status: "created", dest };
}

function copyDir(srcDir, destDir, opts = {}) {
  const results = [];
  if (!fs.existsSync(srcDir)) return results;
  const entries = fs.readdirSync(srcDir, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(srcDir, entry.name);
    const destPath = path.join(destDir, entry.name);
    if (entry.isDirectory()) {
      results.push(...copyDir(srcPath, destPath, opts));
    } else {
      results.push(copyFile(srcPath, destPath, opts));
    }
  }
  return results;
}

function findRepoRoot() {
  return findRepoRootShared();
}

// ─── Parse CLI args ───────────────────────────────────────────────────────

function parseArgs(argv) {
  const args = argv.slice(2);
  return {
    global: args.includes("--global") || args.includes("-g"),
    local: args.includes("--local") || args.includes("-l"),
    claude: args.includes("--claude"),
    withMcp: args.includes("--with-mcp"),
    withPlaywright: args.includes("--with-playwright"),
    yes: args.includes("--yes") || args.includes("-y"),
    dryRun: args.includes("--dry-run"),
    help: args.includes("--help") || args.includes("-h"),
    nonInteractive: false, // computed below
  };
}

// ─── MCP server install helpers ───────────────────────────────────────────

function checkPackageAvailable(pkg) {
  try {
    const result = spawnSync("npm", ["view", pkg, "version"], {
      timeout: 8000,
      stdio: "pipe",
      encoding: "utf8",
    });
    return result.status === 0 && result.stdout.trim().length > 0;
  } catch (_) {
    return false;
  }
}

function installMcpServers(selectedKeys) {
  const results = [];
  const selected = MCP_SERVERS.filter((s) => selectedKeys.includes(s.key));

  for (const server of selected) {
    try {
      const available = checkPackageAvailable(server.package);
      if (available) {
        results.push({ ...server, ok: true, note: "available via npx" });
      } else {
        const install = spawnSync("npm", ["install", "-g", server.package], {
          timeout: 60000,
          stdio: "pipe",
          encoding: "utf8",
        });
        if (install.status === 0) {
          results.push({ ...server, ok: true, note: "installed globally" });
        } else {
          results.push({
            ...server,
            ok: true,
            note: "npx at runtime (not pre-installed)",
          });
        }
      }
    } catch (err) {
      results.push({ ...server, ok: false, error: err.message });
    }
  }
  return results;
}

function addMcpToSettings(settingsPath, mcpResults, targetDir) {
  let settings = {};
  if (fs.existsSync(settingsPath)) {
    try {
      settings = JSON.parse(fs.readFileSync(settingsPath, "utf8"));
    } catch (_) {}
  }

  if (!settings.mcpServers) settings.mcpServers = {};

  for (const result of mcpResults) {
    if (!result.ok) continue;
    const config = result.configFn ? result.configFn(targetDir) : result.config;
    if (!settings.mcpServers[result.key]) {
      settings.mcpServers[result.key] = config;
    }
  }

  if (settings.permissions && Array.isArray(settings.permissions.allow)) {
    const toAdd = [
      "mcp__playwright",
      "mcp__sequential-thinking",
      "mcp__context7",
      "mcp__filesystem",
    ];
    for (const perm of toAdd) {
      if (!settings.permissions.allow.includes(perm)) {
        settings.permissions.allow.push(perm);
      }
    }
  }

  fs.writeFileSync(
    settingsPath,
    JSON.stringify(settings, null, 2) + "\n",
    "utf8",
  );
}

// ─── Playwright install helpers ───────────────────────────────────────────

function installPlaywrightBrowsers() {
  try {
    const result = spawnSync(
      "npx",
      ["playwright", "install", "--with-deps", "chromium"],
      { timeout: 120000, stdio: "pipe", encoding: "utf8" },
    );
    if (result.status === 0) return { ok: true };
    const result2 = spawnSync("npx", ["playwright", "install", "chromium"], {
      timeout: 120000,
      stdio: "pipe",
      encoding: "utf8",
    });
    if (result2.status === 0) return { ok: true };
    return { ok: false, error: result.stderr };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

function ensurePlaywrightConfig(targetDir) {
  const tsConfig = path.join(targetDir, "playwright.config.ts");
  const jsConfig = path.join(targetDir, "playwright.config.js");
  if (fs.existsSync(tsConfig) || fs.existsSync(jsConfig)) {
    return { status: "skipped", dest: tsConfig };
  }
  const content = `import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
`;
  ensureDir(path.dirname(tsConfig));
  fs.writeFileSync(tsConfig, content, "utf8");
  return { status: "created", dest: tsConfig };
}

// ─── Core install: copy commands, templates, stacks ───────────────────────

function installBaseFiles(targetDir, repoRoot, isGlobal) {
  const claudeDir = isGlobal ? targetDir : path.join(targetDir, ".claude");
  const commandsDir = path.join(claudeDir, "commands");
  const steps = [];

  // 1. Commands
  const srcCommands = path.join(repoRoot, "system", "commands");
  steps.push(...copyDir(srcCommands, commandsDir, { skipExisting: false }));

  // 2. AUTONOMOUS-WORKFLOW.md
  const awSrc = path.join(
    repoRoot,
    "system",
    "templates",
    "AUTONOMOUS-WORKFLOW.md",
  );
  const awDest = isGlobal
    ? path.join(os.homedir(), ".effectum", "AUTONOMOUS-WORKFLOW.md")
    : path.join(targetDir, "AUTONOMOUS-WORKFLOW.md");
  steps.push(copyFile(awSrc, awDest, { skipExisting: false }));

  // 3. Workshop
  const workshopSrc = path.join(repoRoot, "workshop");
  const workshopDest = isGlobal
    ? path.join(os.homedir(), ".effectum", "workshop")
    : path.join(targetDir, "workshop");
  steps.push(...copyDir(workshopSrc, workshopDest, { skipExisting: true }));

  // 4. Copy templates + stacks so reconfigure can find them later
  const templatesSrc = path.join(repoRoot, "system", "templates");
  const stacksSrc = path.join(repoRoot, "system", "stacks");
  const effectumDir = isGlobal
    ? path.join(os.homedir(), ".effectum")
    : path.join(targetDir, ".effectum");
  steps.push(
    ...copyDir(templatesSrc, path.join(effectumDir, "templates"), {
      skipExisting: false,
    }),
  );
  steps.push(
    ...copyDir(stacksSrc, path.join(effectumDir, "stacks"), {
      skipExisting: false,
    }),
  );

  return steps;
}

// ─── Generate configured files (CLAUDE.md, settings.json, guardrails.md) ─

function generateConfiguredFiles(config, targetDir, repoRoot, isGlobal) {
  const claudeDir = isGlobal ? targetDir : path.join(targetDir, ".claude");
  const steps = [];

  // Load stack preset
  const stackSections = loadStackPreset(config.stack, targetDir, repoRoot);
  const vars = buildSubstitutionMap(config, stackSections);

  // 1. CLAUDE.md
  const claudeMdTmpl = findTemplatePath("CLAUDE.md.tmpl", targetDir, repoRoot);
  const { content: claudeMdContent, remaining: claudeMdRemaining } =
    renderTemplate(claudeMdTmpl, vars);
  const claudeMdDest = isGlobal
    ? path.join(targetDir, "CLAUDE.md")
    : path.join(targetDir, "CLAUDE.md");
  ensureDir(path.dirname(claudeMdDest));
  fs.writeFileSync(claudeMdDest, claudeMdContent, "utf8");
  steps.push({ status: "created", dest: claudeMdDest });

  if (claudeMdRemaining.length > 0) {
    console.warn(
      `⚠ CLAUDE.md has remaining placeholders: ${claudeMdRemaining.join(", ")}`,
    );
  }

  // 2. settings.json — build from template with autonomy level applied
  const settingsTmpl = findTemplatePath(
    "settings.json.tmpl",
    targetDir,
    repoRoot,
  );
  let settingsObj;
  try {
    settingsObj = JSON.parse(fs.readFileSync(settingsTmpl, "utf8"));
  } catch (e) {
    throw new Error(`Could not parse settings template: ${e.message}`);
  }

  // Apply autonomy level
  const autonomy = AUTONOMY_MAP[config.autonomyLevel] || AUTONOMY_MAP.standard;
  settingsObj.permissions = {
    ...settingsObj.permissions,
    ...autonomy.permissions,
    defaultMode: autonomy.defaultMode,
    deny: settingsObj.permissions?.deny || [],
  };

  // Apply formatter in PostToolUse hook
  const formatter = FORMATTER_MAP[config.stack] || FORMATTER_MAP.generic;
  if (settingsObj.hooks?.PostToolUse) {
    for (const group of settingsObj.hooks.PostToolUse) {
      if (group.matcher === "Edit|Write") {
        for (const hook of group.hooks) {
          if (
            hook.command &&
            hook.command.includes("formatter-not-configured")
          ) {
            if (formatter.command === "echo no-formatter-configured") {
              hook.command = "echo no-formatter-configured";
            } else {
              hook.command = `bash -c 'INPUT=$(cat); FILE=$(echo "$INPUT" | jq -r ".tool_input.file_path // empty"); if [[ "$FILE" =~ \\.(${formatter.glob})$ ]]; then ${formatter.command} "$FILE" 2>/dev/null; fi; exit 0'`;
            }
          }
        }
      }
    }
  }

  // Merge with existing settings if present
  const settingsDest = path.join(claudeDir, "settings.json");
  let existing = {};
  if (fs.existsSync(settingsDest)) {
    try {
      existing = JSON.parse(fs.readFileSync(settingsDest, "utf8"));
    } catch (_) {}
  }
  const merged = deepMerge(existing, settingsObj);
  ensureDir(path.dirname(settingsDest));
  fs.writeFileSync(
    settingsDest,
    JSON.stringify(merged, null, 2) + "\n",
    "utf8",
  );
  steps.push({ status: "created", dest: settingsDest });

  // 3. guardrails.md — substitute stack-specific sections
  const guardrailsTmpl = findTemplatePath(
    "guardrails.md.tmpl",
    targetDir,
    repoRoot,
  );
  const guardrailsRaw = fs.readFileSync(guardrailsTmpl, "utf8");
  let guardrailsContent = guardrailsRaw;

  // Replace "No stack-specific guardrails..." with actual content
  if (stackSections.STACK_SPECIFIC_GUARDRAILS) {
    guardrailsContent = guardrailsContent.replace(
      /No stack-specific guardrails configured yet\. Run \/setup to configure for your stack\./,
      stackSections.STACK_SPECIFIC_GUARDRAILS,
    );
  }
  if (stackSections.TOOL_SPECIFIC_GUARDRAILS) {
    guardrailsContent = guardrailsContent.replace(
      /No tool-specific guardrails configured yet\. Run \/setup to configure\./,
      stackSections.TOOL_SPECIFIC_GUARDRAILS,
    );
  }

  const guardrailsDest = path.join(claudeDir, "guardrails.md");
  ensureDir(path.dirname(guardrailsDest));
  fs.writeFileSync(guardrailsDest, guardrailsContent, "utf8");
  steps.push({ status: "created", dest: guardrailsDest });

  return steps;
}

// ─── Smart defaults for non-interactive mode ──────────────────────────────

function buildSmartDefaults(targetDir) {
  const detected = detectAll(targetDir);
  const formatter =
    FORMATTER_MAP[detected.stack || "generic"] || FORMATTER_MAP.generic;
  return {
    projectName: detected.projectName,
    stack: detected.stack || "generic",
    language: "english",
    autonomyLevel: "standard",
    packageManager: detected.packageManager,
    formatter: formatter.name,
    mcpServers: MCP_SERVERS.map((s) => s.key),
    playwrightBrowsers: true,
    installScope: "local",
  };
}

// ─── Git branch creation ──────────────────────────────────────────────────

function createGitBranch(name) {
  const result = spawnSync("git", ["checkout", "-b", name], {
    stdio: "pipe",
    encoding: "utf8",
  });
  return result.status === 0;
}

// ─── Main ─────────────────────────────────────────────────────────────────

async function main() {
  const args = parseArgs(process.argv);
  const repoRoot = findRepoRoot();

  // Help
  if (args.help) {
    console.log(`
effectum — autonomous development system for Claude Code

Usage:
  npx effectum                  Interactive installer
  npx effectum init             Per-project init (after global install)
  npx effectum reconfigure      Re-apply config from .effectum.json
  npx effectum --global         Install globally (~/.claude/, no prompts)
  npx effectum --local          Install locally (./.claude/, no prompts)
  npx effectum --dry-run        Show planned files without writing
  npx effectum --yes            Non-interactive with smart defaults

Options:
  --global, -g        Install globally for all projects (~/.claude/)
  --local,  -l        Install locally for this project (./.claude/)
  --claude            Select Claude Code runtime (default)
  --with-mcp          Install MCP servers
  --with-playwright   Install Playwright browsers
  --yes, -y           Skip interactive prompts, use smart defaults
  --dry-run           Show what would be created without writing
  --help, -h          Show this help
`);
    process.exit(0);
  }

  // Check repo files exist
  if (!fs.existsSync(path.join(repoRoot, "system", "commands"))) {
    console.error("Error: Could not find Effectum system files.");
    console.error("  Expected: " + path.join(repoRoot, "system", "commands"));
    process.exit(1);
  }

  // Determine mode
  const isNonInteractive =
    args.yes ||
    args.global ||
    args.local ||
    process.env.CI === "true" ||
    !process.stdin.isTTY;

  const isGlobal = args.global;
  const homeClaudeDir = path.join(os.homedir(), ".claude");
  const targetDir = isGlobal ? homeClaudeDir : process.cwd();

  // ── Non-interactive mode ────────────────────────────────────────────────
  if (isNonInteractive) {
    const config = buildSmartDefaults(targetDir);
    config.installScope = isGlobal ? "global" : "local";

    if (args.dryRun) {
      console.log("\n  Dry run — no files will be written.\n");
      console.log("  Config:", JSON.stringify(config, null, 2));
      console.log("\n  Files that would be created:");
      console.log("    .claude/commands/*.md");
      console.log("    .claude/settings.json");
      console.log("    .claude/guardrails.md");
      console.log("    CLAUDE.md");
      console.log("    AUTONOMOUS-WORKFLOW.md");
      console.log("    .effectum.json");
      if (args.withMcp) console.log("    MCP servers in settings.json");
      process.exit(0);
    }

    // Install base files
    installBaseFiles(targetDir, repoRoot, isGlobal);

    // Generate configured files (only for local installs)
    if (!isGlobal) {
      generateConfiguredFiles(config, targetDir, repoRoot, isGlobal);
      writeConfig(targetDir, config);
    }

    // MCP servers
    if (args.withMcp) {
      const mcpResults = installMcpServers(config.mcpServers);
      const settingsPath = isGlobal
        ? path.join(homeClaudeDir, "settings.json")
        : path.join(targetDir, ".claude", "settings.json");
      addMcpToSettings(settingsPath, mcpResults, targetDir);
    }

    // Playwright
    if (args.withPlaywright) {
      installPlaywrightBrowsers();
      if (!isGlobal) ensurePlaywrightConfig(process.cwd());
    }

    console.log("\n  Effectum installed successfully.\n");
    process.exit(0);
  }

  // ── Interactive mode ────────────────────────────────────────────────────
  const p = await initClack();
  printBanner();

  const detected = detectAll(process.cwd());

  if (detected.stack) {
    p.log.info(
      `Detected: ${detected.stack} project (${detected.packageManager})`,
    );
  }

  // Scope
  const scopeValue = await p.select({
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
  if (p.isCancel(scopeValue)) {
    p.cancel("Setup cancelled.");
    process.exit(0);
  }
  const installGlobal = scopeValue === "global";
  const installTargetDir = installGlobal ? homeClaudeDir : process.cwd();

  // Project name
  const projectName = await askProjectName(detected.projectName);

  // Stack
  const stack = await askStack(detected.stack);

  // Language
  const langResult = await askLanguage();

  // Autonomy
  const autonomyLevel = await askAutonomy();

  // MCP servers
  const mcpServerKeys = await askMcpServers();

  // Playwright
  const wantPlaywright = mcpServerKeys.includes("playwright")
    ? await askPlaywright()
    : false;

  // Git branch
  const gitBranch = await askGitBranch();

  // Build config object
  const formatter = FORMATTER_MAP[stack] || FORMATTER_MAP.generic;
  const config = {
    projectName,
    stack,
    language: langResult.language,
    ...(langResult.customLanguage
      ? { customLanguage: langResult.customLanguage }
      : {}),
    autonomyLevel,
    packageManager: detected.packageManager,
    formatter: formatter.name,
    mcpServers: mcpServerKeys,
    playwrightBrowsers: wantPlaywright,
    installScope: installGlobal ? "global" : "local",
  };

  // ── Dry run ─────────────────────────────────────────────────────────────
  if (args.dryRun) {
    p.log.info("Dry run — no files will be written.");
    p.note(JSON.stringify(config, null, 2), "Planned Configuration");
    const plannedFiles = [
      ".claude/commands/*.md",
      ".claude/settings.json",
      ".claude/guardrails.md",
      "CLAUDE.md",
      "AUTONOMOUS-WORKFLOW.md",
      ".effectum.json",
    ];
    if (mcpServerKeys.length > 0) {
      plannedFiles.push("MCP servers in settings.json");
    }
    p.note(plannedFiles.join("\n"), "Files to be created/updated");
    p.outro("Dry run complete. No changes made.");
    process.exit(0);
  }

  // ── Create git branch ──────────────────────────────────────────────────
  if (gitBranch.create) {
    const s = p.spinner();
    s.start("Creating git branch...");
    const ok = createGitBranch(gitBranch.name);
    if (ok) {
      s.stop(`Branch "${gitBranch.name}" created`);
    } else {
      s.stop("Could not create branch (may already exist)");
    }
  }

  // ── Step 1: Base files ─────────────────────────────────────────────────
  const s1 = p.spinner();
  s1.start("Installing workflow commands and templates...");
  const baseSteps = installBaseFiles(installTargetDir, repoRoot, installGlobal);
  s1.stop(
    `Installed ${baseSteps.filter((s) => s.status === "created").length} files`,
  );

  // ── Step 2: Configure (local only) ────────────────────────────────────
  const configSteps = [];
  if (!installGlobal) {
    const s2 = p.spinner();
    s2.start(
      "Generating configured files (CLAUDE.md, settings.json, guardrails.md)...",
    );
    const cSteps = generateConfiguredFiles(
      config,
      installTargetDir,
      repoRoot,
      installGlobal,
    );
    configSteps.push(...cSteps);
    s2.stop("Configuration files generated");
  }

  // ── Step 3: MCP servers ────────────────────────────────────────────────
  if (mcpServerKeys.length > 0) {
    const s3 = p.spinner();
    s3.start("Setting up MCP servers...");
    const mcpResults = installMcpServers(mcpServerKeys);
    const settingsPath = installGlobal
      ? path.join(homeClaudeDir, "settings.json")
      : path.join(installTargetDir, ".claude", "settings.json");
    addMcpToSettings(settingsPath, mcpResults, installTargetDir);
    const okCount = mcpResults.filter((r) => r.ok).length;
    s3.stop(`${okCount} MCP servers configured`);
  }

  // ── Step 4: Playwright ─────────────────────────────────────────────────
  if (wantPlaywright) {
    const s4 = p.spinner();
    s4.start("Installing Playwright browsers...");
    const pwResult = installPlaywrightBrowsers();
    if (!installGlobal) ensurePlaywrightConfig(process.cwd());
    s4.stop(
      pwResult.ok
        ? "Playwright browsers installed"
        : "Playwright install failed (run manually: npx playwright install)",
    );
  }

  // ── Step 5: Save config ────────────────────────────────────────────────
  if (!installGlobal) {
    const configPath = writeConfig(installTargetDir, config);
    configSteps.push({ status: "created", dest: configPath });
  }

  // ── Summary ─────────────────────────────────────────────────────────────
  const allSteps = [...baseSteps, ...configSteps];
  const allFiles = allSteps
    .filter((s) => s && s.dest)
    .map((s) => {
      const homeDir = os.homedir();
      return s.dest.startsWith(homeDir)
        ? "~/" + path.relative(homeDir, s.dest)
        : path.relative(process.cwd(), s.dest);
    });

  // Deduplicate for summary
  const uniqueFiles = [...new Set(allFiles)].slice(0, 20);
  showSummary(config, uniqueFiles);
  showOutro(installGlobal);
}

main().catch((err) => {
  console.error(`Fatal error: ${err.message}`);
  process.exit(1);
});
