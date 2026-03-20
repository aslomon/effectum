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

  default:
    // Default: run the installer (handles --help, --global, --local, etc.)
    require("./install.js");
    break;
}
