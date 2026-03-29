#!/usr/bin/env node
/**
 * Effectum CLI — subcommand router.
 *
 * npx @aslomon/effectum              → install (default)
 * npx @aslomon/effectum init         → per-project init
 * npx @aslomon/effectum reconfigure  → re-apply from .effectum.json
 * npx @aslomon/effectum --help       → help text
 */
"use strict";

const path = require("path");

const args = process.argv.slice(2);

// Handle --version early
if (args.includes("--version") || args.includes("-v")) {
  const pkg = require("../package.json");
  console.log(`effectum v${pkg.version}`);
  process.exit(0);
}

const subcommand = args.find((a) => !a.startsWith("-"));

// Route to the correct script
switch (subcommand) {
  case "init":
    // Remove 'init' from argv so the child script sees clean args
    process.argv = [
      process.argv[0],
      process.argv[1],
      ...args.filter((a) => a !== "init"),
    ];
    require("./init.js");
    break;

  case "reconfigure":
    process.argv = [
      process.argv[0],
      process.argv[1],
      ...args.filter((a) => a !== "reconfigure"),
    ];
    require("./reconfigure.js");
    break;

  case "update":
    process.argv = [
      process.argv[0],
      process.argv[1],
      ...args.filter((a) => a !== "update"),
    ];
    require("./update.js");
    break;

  default: {
    // If effectum is already installed in CWD, auto-route to update
    const fs = require("fs");
    const cwd = process.cwd();
    const hasConfig = fs.existsSync(path.join(cwd, ".effectum.json"));
    // Effectum-specific markers (no normal Claude Code project has these)
    const hasRalphLoop = fs.existsSync(path.join(cwd, ".claude", "commands", "ralph-loop.md"));
    const hasPrdCommands = fs.existsSync(path.join(cwd, ".claude", "commands", "prd"));
    const hasEffectumCmd = fs.existsSync(path.join(cwd, ".claude", "commands", "effectum.md"));
    const isEffectumProject = hasConfig || hasRalphLoop || hasPrdCommands || hasEffectumCmd;

    if (!args.includes("--help") && !args.includes("-h") && !args.includes("--force-install") && isEffectumProject) {
      if (!hasConfig) {
        const marker = hasRalphLoop ? "/ralph-loop" : hasPrdCommands ? "/prd:*" : "/effectum";
        console.log(`  effectum project detected (${marker} command found)`);
        console.log("  Note: No .effectum.json found — will be created during update.\n");
      } else {
        console.log("  effectum project detected (.effectum.json found)");
      }
      console.log("  → Running update instead of install.");
      console.log("  (Use --force-install to run the full installer instead.)\n");
      require("./update.js");
    } else {
      // Fresh install
      require("./install.js");
    }
    break;
  }
}
