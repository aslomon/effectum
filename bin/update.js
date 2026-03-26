#!/usr/bin/env node
/**
 * Effectum update — apply new commands and re-render templates
 * without re-asking setup questions.
 *
 * Reads existing .effectum.json, diffs commands against the new package,
 * offers to add new commands, and re-renders CLAUDE.md + settings.json.
 */
"use strict";

const fs = require("fs");
const path = require("path");
const { readConfig, writeConfig } = require("./lib/config");
const { loadStackPreset } = require("./lib/stack-parser");
const {
  buildSubstitutionMap,
  renderTemplate,
  findTemplatePath,
} = require("./lib/template");
const { AUTONOMY_MAP, FORMATTER_MAP } = require("./lib/constants");
const { ensureDir, deepMerge, findRepoRoot } = require("./lib/utils");
const { initClack } = require("./lib/ui");
const { recommend } = require("./lib/recommendation");

// ─── Diff: find new commands ────────────────────────────────────────────────

/**
 * List all .md files recursively under a directory (relative paths).
 * @param {string} dir
 * @param {string} [prefix]
 * @returns {string[]}
 */
function listCommandFiles(dir, prefix = "") {
  if (!fs.existsSync(dir)) return [];
  const results = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const rel = prefix ? `${prefix}/${entry.name}` : entry.name;
    if (entry.isDirectory()) {
      results.push(...listCommandFiles(path.join(dir, entry.name), rel));
    } else if (entry.name.endsWith(".md")) {
      results.push(rel);
    }
  }
  return results;
}

/**
 * Compare source commands against installed commands.
 * @param {string} sourceDir - system/commands/ in the package
 * @param {string} installedDir - .claude/commands/ in the project
 * @returns {{ newCommands: string[], updatedCommands: string[], unchangedCommands: string[] }}
 */
function diffCommands(sourceDir, installedDir) {
  const sourceFiles = listCommandFiles(sourceDir);
  const installedFiles = new Set(listCommandFiles(installedDir));

  const newCommands = [];
  const updatedCommands = [];
  const unchangedCommands = [];

  for (const file of sourceFiles) {
    if (!installedFiles.has(file)) {
      newCommands.push(file);
    } else {
      const srcContent = fs.readFileSync(path.join(sourceDir, file), "utf8");
      const instContent = fs.readFileSync(
        path.join(installedDir, file),
        "utf8",
      );
      if (srcContent !== instContent) {
        updatedCommands.push(file);
      } else {
        unchangedCommands.push(file);
      }
    }
  }

  return { newCommands, updatedCommands, unchangedCommands };
}

// ─── Copy commands ──────────────────────────────────────────────────────────

/**
 * Copy selected command files from source to destination.
 * @param {string[]} files - relative paths
 * @param {string} sourceDir
 * @param {string} destDir
 */
function copyCommandFiles(files, sourceDir, destDir) {
  for (const file of files) {
    const src = path.join(sourceDir, file);
    const dest = path.join(destDir, file);
    ensureDir(path.dirname(dest));
    fs.copyFileSync(src, dest);
  }
}

// ─── Re-render templates ────────────────────────────────────────────────────

/**
 * Re-render CLAUDE.md, settings.json, guardrails.md from existing config.
 * @param {object} config
 * @param {string} targetDir
 * @param {string} repoRoot
 * @returns {string[]} list of refreshed files
 */
function reRenderTemplates(config, targetDir, repoRoot) {
  const claudeDir = path.join(targetDir, ".claude");
  const refreshed = [];

  const stackSections = loadStackPreset(config.stack, targetDir, repoRoot);
  const vars = buildSubstitutionMap(config, stackSections);

  // 1. CLAUDE.md
  const claudeMdTmpl = findTemplatePath("CLAUDE.md.tmpl", targetDir, repoRoot);
  const { content: claudeMdContent } = renderTemplate(claudeMdTmpl, vars);
  fs.writeFileSync(path.join(targetDir, "CLAUDE.md"), claudeMdContent, "utf8");
  refreshed.push("CLAUDE.md");

  // 2. settings.json
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

  const autonomy = AUTONOMY_MAP[config.autonomyLevel] || AUTONOMY_MAP.standard;
  settingsObj.permissions = {
    ...settingsObj.permissions,
    ...autonomy.permissions,
    defaultMode: autonomy.defaultMode,
    deny: settingsObj.permissions?.deny || [],
  };

  if (settingsObj.env && config.recommended) {
    settingsObj.env.CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS = config.recommended
      .agentTeams
      ? "1"
      : "0";
  }

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
  refreshed.push("settings.json");

  // 3. guardrails.md
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
  refreshed.push("guardrails.md");

  // 4. Update templates + stacks cache
  const templatesSrc = path.join(repoRoot, "system", "templates");
  const stacksSrc = path.join(repoRoot, "system", "stacks");
  const effectumDir = path.join(targetDir, ".effectum");

  if (fs.existsSync(templatesSrc)) {
    copyCommandFiles(
      listAllFiles(templatesSrc),
      templatesSrc,
      path.join(effectumDir, "templates"),
    );
  }
  if (fs.existsSync(stacksSrc)) {
    copyCommandFiles(
      listAllFiles(stacksSrc),
      stacksSrc,
      path.join(effectumDir, "stacks"),
    );
  }

  return refreshed;
}

/**
 * List all files recursively (relative paths).
 * @param {string} dir
 * @param {string} [prefix]
 * @returns {string[]}
 */
function listAllFiles(dir, prefix = "") {
  if (!fs.existsSync(dir)) return [];
  const results = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const rel = prefix ? `${prefix}/${entry.name}` : entry.name;
    if (entry.isDirectory()) {
      results.push(...listAllFiles(path.join(dir, entry.name), rel));
    } else {
      results.push(rel);
    }
  }
  return results;
}

// ─── Main ─────────────────────────────────────────────────────────────────

async function main() {
  const targetDir = process.cwd();
  const autoYes = process.argv.includes("--yes") || process.argv.includes("-y");
  const repoRoot = findRepoRoot();

  const p = await initClack();
  p.intro("EFFECTUM — Update");

  // Read existing config
  let config;
  try {
    config = readConfig(targetDir);
  } catch (err) {
    p.log.error(err.message);
    process.exit(1);
  }
  if (!config) {
    p.log.error(
      "No .effectum.json found. Run `npx @aslomon/effectum` first to set up.",
    );
    process.exit(1);
  }

  p.log.info(`Project: "${config.projectName}" (${config.stack})`);

  // Diff commands
  const sourceCommands = path.join(repoRoot, "system", "commands");
  const installedCommands = path.join(targetDir, ".claude", "commands");
  const diff = diffCommands(sourceCommands, installedCommands);

  const hasNewCommands = diff.newCommands.length > 0;
  const hasUpdatedCommands = diff.updatedCommands.length > 0;

  if (!hasNewCommands && !hasUpdatedCommands) {
    // Re-render templates even if no new commands (template improvements)
    const s = p.spinner();
    s.start("Checking for template updates...");
    const refreshed = reRenderTemplates(config, targetDir, repoRoot);
    s.stop("Templates refreshed");

    // Update recommendations if applicable
    if (config.appType || config.description) {
      const rec = recommend({
        stack: config.stack,
        appType: config.appType || "web-app",
        description: config.description || "",
        autonomyLevel: config.autonomyLevel || "standard",
        language: config.language || "english",
      });
      config.recommended = rec;
      writeConfig(targetDir, config);
    }

    p.log.success(
      `Already up to date. Templates refreshed: ${refreshed.join(", ")}`,
    );
    p.outro("Update complete!");
    return;
  }

  // Show new commands
  if (hasNewCommands) {
    const names = diff.newCommands.map(
      (f) => `/${f.replace(/\.md$/, "").replace(/\//g, ":")}`,
    );
    p.log.info(`${diff.newCommands.length} new command(s) available:`);
    for (const name of names) {
      p.log.step(`  + ${name}`);
    }
  }

  // Show updated commands
  if (hasUpdatedCommands) {
    p.log.info(`${diff.updatedCommands.length} command(s) with updates:`);
    for (const file of diff.updatedCommands) {
      const name = `/${file.replace(/\.md$/, "").replace(/\//g, ":")}`;
      p.log.step(`  ~ ${name}`);
    }
  }

  // Ask user what to do
  let commandsToAdd = [];
  let commandsToUpdate = [];

  if (hasNewCommands) {
    let addNew = autoYes;
    if (!autoYes) {
      addNew = await p.confirm({
        message: `Add ${diff.newCommands.length} new command(s)?`,
        initialValue: true,
      });
      if (p.isCancel(addNew)) {
        p.cancel("Update cancelled.");
        process.exit(0);
      }
    }
    if (addNew) {
      commandsToAdd = diff.newCommands;
    }
  }

  if (hasUpdatedCommands) {
    let updateExisting = autoYes;
    if (!autoYes) {
      updateExisting = await p.confirm({
        message: `Update ${diff.updatedCommands.length} existing command(s)?`,
        initialValue: true,
      });
      if (p.isCancel(updateExisting)) {
        p.cancel("Update cancelled.");
        process.exit(0);
      }
    }
    if (updateExisting) {
      commandsToUpdate = diff.updatedCommands;
    }
  }

  // Apply changes
  const s = p.spinner();
  s.start("Applying updates...");

  const totalCommands = commandsToAdd.length + commandsToUpdate.length;

  if (commandsToAdd.length > 0) {
    copyCommandFiles(commandsToAdd, sourceCommands, installedCommands);
  }
  if (commandsToUpdate.length > 0) {
    copyCommandFiles(commandsToUpdate, sourceCommands, installedCommands);
  }

  // Re-render templates
  const refreshed = reRenderTemplates(config, targetDir, repoRoot);

  // Update recommendations
  if (config.appType || config.description) {
    const rec = recommend({
      stack: config.stack,
      appType: config.appType || "web-app",
      description: config.description || "",
      autonomyLevel: config.autonomyLevel || "standard",
      language: config.language || "english",
    });
    config.recommended = rec;
    writeConfig(targetDir, config);
  }

  s.stop("Updates applied");

  // Summary
  const summary = [];
  if (commandsToAdd.length > 0) {
    summary.push(`${commandsToAdd.length} new command(s) added`);
  }
  if (commandsToUpdate.length > 0) {
    summary.push(`${commandsToUpdate.length} command(s) updated`);
  }
  summary.push(...refreshed.map((f) => `${f} refreshed`));

  p.log.success(`Updated: ${summary.join(", ")}`);
  p.outro("Update complete!");
}

// Expose internals for testing
module.exports = {
  listCommandFiles,
  diffCommands,
  copyCommandFiles,
  reRenderTemplates,
  listAllFiles,
  main,
};

// Run if executed directly
if (require.main === module) {
  main().catch((err) => {
    console.error(`Fatal error: ${err.message}`);
    process.exit(1);
  });
}
