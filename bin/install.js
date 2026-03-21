#!/usr/bin/env node
/**
 * Effectum interactive installer — Intelligent Setup Recommender.
 *
 * 9-step flow:
 *   1. Install Scope       (global / local)
 *   2. Project Basics       (name, stack, package manager)
 *   3. App Type             (web-app, api, mobile, cli, ...)
 *   4. Description          (free-text intent)
 *   5. Language             (15+ languages + custom)
 *   6. Autonomy             (conservative / standard / full)
 *   7. Recommendation       (preview calculated setup)
 *   8. Decision             (use recommended / customize / manual)
 *   9. Install              (write files)
 *
 * Usage:
 *   npx @aslomon/effectum              -> interactive install
 *   npx @aslomon/effectum --global     -> non-interactive global install
 *   npx @aslomon/effectum --local      -> non-interactive local install
 *   npx @aslomon/effectum --yes        -> non-interactive with smart defaults
 *   npx @aslomon/effectum --dry-run    -> show plan without writing
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
} = require("./lib/template");
const { writeConfig } = require("./lib/config");
const { AUTONOMY_MAP, FORMATTER_MAP, MCP_SERVERS } = require("./lib/constants");
const {
  ensureDir,
  deepMerge,
  findRepoRoot: findRepoRootShared,
} = require("./lib/utils");
const { recommend } = require("./lib/recommendation");
const {
  initClack,
  getClack,
  printBanner,
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
  askPlaywright,
  askGitBranch,
  showSummary,
  showOutro,
} = require("./lib/ui");

// ─── File helpers ─────────────────────────────────────────────────────────────

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

// ─── Parse CLI args ─────────────────────────────────────────────────────────

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
    nonInteractive: false,
  };
}

// ─── MCP server install helpers ─────────────────────────────────────────────

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

// ─── Playwright install helpers ─────────────────────────────────────────────

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

// ─── Core install: copy commands, templates, stacks ─────────────────────────

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

  // 5. Agents (subagent specializations)
  const agentsSrc = path.join(repoRoot, "system", "agents");
  if (fs.existsSync(agentsSrc)) {
    const agentsDest = isGlobal
      ? path.join(targetDir, "agents")
      : path.join(targetDir, ".claude", "agents");
    steps.push(...copyDir(agentsSrc, agentsDest, { skipExisting: true }));
  }

  return steps;
}

// ─── Install only recommended agents (filtered by recommendation) ──────────

function installRecommendedAgents(targetDir, repoRoot, recommendedAgents) {
  const agentsSrc = path.join(repoRoot, "system", "agents");
  const agentsDest = path.join(targetDir, ".claude", "agents");
  const steps = [];

  if (!fs.existsSync(agentsSrc) || !recommendedAgents || recommendedAgents.length === 0) {
    return steps;
  }

  for (const agentKey of recommendedAgents) {
    const srcFile = path.join(agentsSrc, `${agentKey}.md`);
    if (fs.existsSync(srcFile)) {
      const destFile = path.join(agentsDest, `${agentKey}.md`);
      steps.push(copyFile(srcFile, destFile, { skipExisting: true }));
    }
  }

  return steps;
}

// ─── Generate configured files (CLAUDE.md, settings.json, guardrails.md) ───

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
  const claudeMdDest = path.join(targetDir, "CLAUDE.md");
  ensureDir(path.dirname(claudeMdDest));
  fs.writeFileSync(claudeMdDest, claudeMdContent, "utf8");
  steps.push({ status: "created", dest: claudeMdDest });

  if (claudeMdRemaining.length > 0) {
    console.warn(
      `Warning: CLAUDE.md has remaining placeholders: ${claudeMdRemaining.join(", ")}`,
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

  // Apply Agent Teams env var
  if (settingsObj.env) {
    settingsObj.env.CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS =
      config.recommended && config.recommended.agentTeams ? "1" : "0";
  }

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

// ─── Smart defaults for non-interactive mode ────────────────────────────────

function buildSmartDefaults(targetDir) {
  const detected = detectAll(targetDir);
  const stack = detected.stack || "generic";
  const formatter = FORMATTER_MAP[stack] || FORMATTER_MAP.generic;

  const rec = recommend({
    stack,
    appType: "web-app",
    description: "",
    autonomyLevel: "standard",
    language: "english",
  });

  return {
    projectName: detected.projectName,
    stack,
    appType: "web-app",
    description: "",
    language: "english",
    autonomyLevel: "standard",
    packageManager: detected.packageManager,
    formatter: formatter.name,
    mcpServers: rec.mcps,
    playwrightBrowsers: rec.mcps.includes("playwright"),
    installScope: "local",
    recommended: rec,
    mode: "recommended",
  };
}

// ─── Git branch creation ────────────────────────────────────────────────────

function createGitBranch(name) {
  const result = spawnSync("git", ["checkout", "-b", name], {
    stdio: "pipe",
    encoding: "utf8",
  });
  return result.status === 0;
}

// ─── Main ───────────────────────────────────────────────────────────────────

async function main() {
  const args = parseArgs(process.argv);
  const repoRoot = findRepoRoot();

  // Help
  if (args.help) {
    console.log(`
effectum — intelligent setup for Claude Code

Usage:
  npx effectum                  Interactive installer (9-step flow)
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

  // ── Non-interactive mode ──────────────────────────────────────────────────
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

      // Install recommended agents
      const recAgents = config.recommended ? config.recommended.subagents : [];
      if (recAgents && recAgents.length > 0) {
        installRecommendedAgents(targetDir, repoRoot, recAgents);
      }

      writeConfig(targetDir, config);
    }

    // MCP servers — always install recommended MCPs (or explicit --with-mcp)
    const mcpKeys = config.mcpServers || (config.recommended ? config.recommended.mcps : []) || [];
    if (mcpKeys.length > 0 || args.withMcp) {
      const keysToInstall = mcpKeys.length > 0 ? mcpKeys : MCP_SERVERS.map((s) => s.key);
      const mcpResults = installMcpServers(keysToInstall);
      const settingsPath = isGlobal
        ? path.join(homeClaudeDir, "settings.json")
        : path.join(targetDir, ".claude", "settings.json");
      addMcpToSettings(settingsPath, mcpResults, targetDir);
    }

    // Playwright — install if recommended or explicit
    if (args.withPlaywright || config.playwrightBrowsers) {
      installPlaywrightBrowsers();
      if (!isGlobal) ensurePlaywrightConfig(process.cwd());
    }

    console.log("\n  Effectum installed successfully.\n");
    process.exit(0);
  }

  // ── Interactive mode — 9-step flow ────────────────────────────────────────
  const p = await initClack();
  printBanner();

  const detected = detectAll(process.cwd());

  if (detected.stack) {
    p.log.info(
      `Detected: ${detected.stack} project (${detected.packageManager})`,
    );
  }

  // ── Step 1: Install Scope ─────────────────────────────────────────────────
  const scopeValue = await askScope();
  const installGlobal = scopeValue === "global";
  const installTargetDir = installGlobal ? homeClaudeDir : process.cwd();

  // Global install: skip project-specific steps, install base only
  if (installGlobal) {
    if (args.dryRun) {
      p.log.info("Dry run — no files will be written.");
      p.note(
        [
          "~/.claude/commands/*.md",
          "~/.claude/settings.json",
          "~/.claude/guardrails.md",
          "~/.effectum/templates/",
          "~/.effectum/stacks/",
        ].join("\n"),
        "Files to be created",
      );
      p.outro("Dry run complete. No changes made.");
      process.exit(0);
    }

    const s = p.spinner();
    s.start("Installing global workflow commands and templates...");
    installBaseFiles(installTargetDir, repoRoot, true);
    s.stop("Global base files installed");

    showOutro(true);
    process.exit(0);
  }

  // ── Step 2: Project Basics ────────────────────────────────────────────────
  const projectName = await askProjectName(detected.projectName);
  const stack = await askStack(detected.stack);

  // ── Step 3: App Type ──────────────────────────────────────────────────────
  const appType = await askAppType();

  // ── Step 4: Description ───────────────────────────────────────────────────
  const description = await askDescription();

  // ── Step 5: Language ──────────────────────────────────────────────────────
  const langResult = await askLanguage();

  // ── Step 6: Autonomy ──────────────────────────────────────────────────────
  const autonomyLevel = await askAutonomy();

  // ── Step 7: Recommendation Preview ────────────────────────────────────────
  const rec = recommend({
    stack,
    appType,
    description,
    autonomyLevel,
    language: langResult.language,
  });

  showRecommendation(rec);

  // ── Step 8: Decision ──────────────────────────────────────────────────────
  const setupMode = await askSetupMode();

  let finalSetup = rec;
  if (setupMode === "customize") {
    finalSetup = await askCustomize(rec);
  } else if (setupMode === "manual") {
    finalSetup = await askManual();
  }

  // Check if playwright is in the final MCP list and ask about browser install
  const wantPlaywright = finalSetup.mcps.includes("playwright")
    ? await askPlaywright()
    : false;

  // Git branch
  const gitBranch = await askGitBranch();

  // Build config object
  const formatterDef = FORMATTER_MAP[stack] || FORMATTER_MAP.generic;
  const config = {
    projectName,
    stack,
    appType,
    description,
    language: langResult.language,
    ...(langResult.customLanguage
      ? { customLanguage: langResult.customLanguage }
      : {}),
    autonomyLevel,
    packageManager: detected.packageManager,
    formatter: formatterDef.name,
    mcpServers: finalSetup.mcps,
    playwrightBrowsers: wantPlaywright,
    installScope: "local",
    recommended: {
      commands: finalSetup.commands,
      hooks: finalSetup.hooks,
      skills: finalSetup.skills,
      mcps: finalSetup.mcps,
      subagents: finalSetup.subagents,
      agentTeams: finalSetup.agentTeams,
    },
    mode: setupMode,
  };

  // ── Dry run ───────────────────────────────────────────────────────────────
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
    if (finalSetup.mcps.length > 0) {
      plannedFiles.push("MCP servers in settings.json");
    }
    p.note(plannedFiles.join("\n"), "Files to be created/updated");
    p.outro("Dry run complete. No changes made.");
    process.exit(0);
  }

  // ── Step 9: Install ───────────────────────────────────────────────────────

  // Create git branch if requested
  if (gitBranch.create) {
    const sGit = p.spinner();
    sGit.start("Creating git branch...");
    const ok = createGitBranch(gitBranch.name);
    if (ok) {
      sGit.stop(`Branch "${gitBranch.name}" created`);
    } else {
      sGit.stop("Could not create branch (may already exist)");
    }
  }

  // 9a: Base files
  const s1 = p.spinner();
  s1.start("Installing workflow commands and templates...");
  const baseSteps = installBaseFiles(installTargetDir, repoRoot, false);
  s1.stop(
    `Installed ${baseSteps.filter((s) => s.status === "created").length} files`,
  );

  // 9b: Configure
  const s2 = p.spinner();
  s2.start("Generating CLAUDE.md, settings.json, guardrails.md...");
  const configSteps = generateConfiguredFiles(
    config,
    installTargetDir,
    repoRoot,
    false,
  );
  s2.stop("Configuration files generated");

  // 9b2: Install recommended agents
  const recAgents = finalSetup.subagents || [];
  if (recAgents.length > 0) {
    const sAgents = p.spinner();
    sAgents.start("Installing agent specializations...");
    const agentSteps = installRecommendedAgents(installTargetDir, repoRoot, recAgents);
    const agentCount = agentSteps.filter((s) => s.status === "created").length;
    sAgents.stop(`${agentCount} agent specializations installed`);
    configSteps.push(...agentSteps);
  }

  // 9c: MCP servers
  if (finalSetup.mcps.length > 0) {
    const s3 = p.spinner();
    s3.start("Setting up MCP servers...");
    const mcpResults = installMcpServers(finalSetup.mcps);
    const settingsPath = path.join(
      installTargetDir,
      ".claude",
      "settings.json",
    );
    addMcpToSettings(settingsPath, mcpResults, installTargetDir);
    const okCount = mcpResults.filter((r) => r.ok).length;
    s3.stop(`${okCount} MCP servers configured`);
  }

  // 9d: Playwright
  if (wantPlaywright) {
    const s4 = p.spinner();
    s4.start("Installing Playwright browsers...");
    const pwResult = installPlaywrightBrowsers();
    ensurePlaywrightConfig(process.cwd());
    s4.stop(
      pwResult.ok
        ? "Playwright browsers installed"
        : "Playwright install failed (run manually: npx playwright install)",
    );
  }

  // 9e: Save config
  const configPath = writeConfig(installTargetDir, config);
  configSteps.push({ status: "created", dest: configPath });

  // ── Summary ───────────────────────────────────────────────────────────────
  const allSteps = [...baseSteps, ...configSteps];
  const allFiles = allSteps
    .filter((s) => s && s.dest)
    .map((s) => {
      const homeDir = os.homedir();
      return s.dest.startsWith(homeDir)
        ? "~/" + path.relative(homeDir, s.dest)
        : path.relative(process.cwd(), s.dest);
    });

  const uniqueFiles = [...new Set(allFiles)].slice(0, 20);
  showSummary(config, uniqueFiles);
  showOutro(false);
}

main().catch((err) => {
  console.error(`Fatal error: ${err.message}`);
  process.exit(1);
});
