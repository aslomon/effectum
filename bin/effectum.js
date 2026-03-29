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
    // If .effectum.json exists in CWD, auto-route to update instead of install
    const fs = require("fs");
    const configPath = path.join(process.cwd(), ".effectum.json");
    if (!args.includes("--help") && !args.includes("-h") && fs.existsSync(configPath)) {
      console.log("  effectum project detected (.effectum.json found)");
      console.log("  → Running update instead of install.\n");
      require("./update.js");
    } else {
      // Fresh install
      require("./install.js");
    }
    break;
  }
}
