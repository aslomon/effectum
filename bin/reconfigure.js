#!/usr/bin/env node
/**
 * Reconfigure — re-apply settings from .effectum.json.
 * Reads the saved config and regenerates CLAUDE.md, settings.json, guardrails.md.
 * Supports v0.4.0 config schema with appType, description, recommended setup.
 */
"use strict";

const fs = require("fs");
const path = require("path");
const { readConfig } = require("./lib/config");
const { loadStackPreset } = require("./lib/stack-parser");
const {
  buildSubstitutionMap,
  renderTemplate,
  findTemplatePath,
} = require("./lib/template");
const {
  extractSentinelBlock,
  replaceSentinelBlock,
} = require("./update");
const { AUTONOMY_MAP, FORMATTER_MAP } = require("./lib/constants");
const { ensureDir, deepMerge, findRepoRoot } = require("./lib/utils");
const { initClack } = require("./lib/ui");
const { recommend } = require("./lib/recommendation");
const { writeConfig } = require("./lib/config");

// ─── Main ─────────────────────────────────────────────────────────────────

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes("--dry-run");
  const targetDir = process.cwd();
  const repoRoot = findRepoRoot();

  const p = await initClack();
  p.intro("EFFECTUM — Reconfigure");

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
      "No .effectum.json found in this directory. Run `npx @aslomon/effectum` first.",
    );
    process.exit(1);
  }

  // Re-run recommendation engine with current config values
  if (config.appType || config.description) {
    const rec = recommend({
      stack: config.stack,
      appType: config.appType || "web-app",
      description: config.description || "",
      autonomyLevel: config.autonomyLevel || "standard",
      language: config.language || "english",
    });
    config.recommended = rec;
    // Persist updated recommendations
    writeConfig(targetDir, config);
  }

  const configInfo = [`"${config.projectName}" (${config.stack})`];
  if (config.appType) configInfo.push(`type: ${config.appType}`);
  if (config.mode) configInfo.push(`mode: ${config.mode}`);
  p.log.info(`Reconfiguring ${configInfo.join(", ")}`);

  if (dryRun) {
    p.note(JSON.stringify(config, null, 2), "Current Configuration");
    p.log.info("Dry run — files that would be regenerated:");
    p.log.step("  CLAUDE.md");
    p.log.step("  .claude/settings.json");
    p.log.step("  .claude/guardrails.md");
    p.outro("Dry run complete. No changes made.");
    process.exit(0);
  }

  const claudeDir = path.join(targetDir, ".claude");

  // Load stack preset
  const stackSections = loadStackPreset(config.stack, targetDir, repoRoot);
  const vars = buildSubstitutionMap(config, stackSections);

  const s = p.spinner();
  s.start("Regenerating configuration files...");

  // 1. CLAUDE.md — preserve sentinel block across re-renders
  const claudeMdPath = path.join(targetDir, "CLAUDE.md");
  let preservedBlock = null;
  if (fs.existsSync(claudeMdPath)) {
    const existingContent = fs.readFileSync(claudeMdPath, "utf8");
    preservedBlock = extractSentinelBlock(existingContent);
  }

  const claudeMdTmpl = findTemplatePath("CLAUDE.md.tmpl", targetDir, repoRoot);
  let { content: claudeMdContent, remaining: claudeMdRemaining } =
    renderTemplate(claudeMdTmpl, vars);

  if (preservedBlock) {
    claudeMdContent = replaceSentinelBlock(claudeMdContent, preservedBlock);
  }

  fs.writeFileSync(claudeMdPath, claudeMdContent, "utf8");

  if (claudeMdRemaining.length > 0) {
    p.log.warn(
      `CLAUDE.md has remaining placeholders: ${claudeMdRemaining.join(", ")}`,
    );
  }

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

  // Apply Agent Teams env var from saved config
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

  s.stop("Configuration files regenerated");

  p.log.success("CLAUDE.md — updated");
  p.log.success(".claude/settings.json — updated");
  p.log.success(".claude/guardrails.md — updated");

  p.outro("Reconfiguration complete!");
}

main().catch((err) => {
  console.error(`Fatal error: ${err.message}`);
  process.exit(1);
});
