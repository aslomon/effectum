#!/usr/bin/env node
/**
 * Per-project initializer.
 * Used after a global install to configure a specific project.
 * Essentially runs install.js in local mode with interactive prompts.
 */
"use strict";

// init is equivalent to running install with --local (but interactive)
// We just re-use install.js — it handles everything
const path = require("path");

// Ensure --local is set if no scope flag given
const args = process.argv.slice(2);
const hasScope =
  args.includes("--global") ||
  args.includes("-g") ||
  args.includes("--local") ||
  args.includes("-l");

if (!hasScope && !args.includes("--yes") && !args.includes("-y")) {
  // Interactive mode for init — just run install.js as-is (defaults to local)
  require("./install.js");
} else if (!hasScope) {
  // Non-interactive init defaults to local
  process.argv.push("--local");
  require("./install.js");
} else {
  require("./install.js");
}
