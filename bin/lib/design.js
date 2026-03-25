/**
 * Design signal detection for DESIGN.md generation.
 * Scans a project directory for existing design artifacts:
 * Tailwind config, shadcn/ui components.json, CSS variables in globals.css.
 *
 * Returns a structured object for use by the /design command.
 */
"use strict";

const fs = require("fs");
const path = require("path");

// ─── CSS Variable Parsing ────────────────────────────────────────────────────

/**
 * Extract CSS custom property names and color values from a CSS string.
 * @param {string} content - raw CSS text
 * @returns {{ cssVars: string[], existingColors: string[] }}
 */
function parseCssVars(content) {
  const cssVars = [];
  const existingColors = [];

  // Match CSS custom properties: --var-name: value;
  const varRegex = /--([a-zA-Z0-9-]+)\s*:\s*([^;]+);/g;
  let match;
  while ((match = varRegex.exec(content)) !== null) {
    const name = `--${match[1].trim()}`;
    const value = match[2].trim();
    cssVars.push(name);

    // Check if the value looks like a color (hex, rgb, hsl, oklch, named)
    if (isColorValue(value)) {
      existingColors.push(value);
    }
  }

  return { cssVars, existingColors };
}

/**
 * Heuristic: does this string look like a CSS color value?
 * @param {string} value
 * @returns {boolean}
 */
function isColorValue(value) {
  return (
    /^#[0-9a-fA-F]{3,8}$/.test(value) ||
    /^rgba?\s*\(/.test(value) ||
    /^hsla?\s*\(/.test(value) ||
    /^oklch\s*\(/.test(value) ||
    /^color\s*\(/.test(value) ||
    /^\d+(\.\d+)?\s+\d+(\.\d+)?%\s+\d+(\.\d+)?%$/.test(value) // hsl shorthand without hsl()
  );
}

// ─── Public API ──────────────────────────────────────────────────────────────

/**
 * Detect design signals in a project directory.
 *
 * @param {string} dir - absolute path to the project root
 * @returns {{
 *   hasTailwind: boolean,
 *   hasShadcn: boolean,
 *   cssVars: string[],
 *   existingColors: string[]
 * }}
 */
function detectDesignSignals(dir) {
  const result = {
    hasTailwind: false,
    hasShadcn: false,
    cssVars: [],
    existingColors: [],
  };

  // ── Tailwind ──────────────────────────────────────────────────────────────
  const tailwindFiles = [
    "tailwind.config.js",
    "tailwind.config.ts",
    "tailwind.config.mjs",
    "tailwind.config.cjs",
  ];
  result.hasTailwind = tailwindFiles.some((f) =>
    fs.existsSync(path.join(dir, f)),
  );

  // Also check package.json for tailwindcss dependency
  if (!result.hasTailwind) {
    const pkgPath = path.join(dir, "package.json");
    if (fs.existsSync(pkgPath)) {
      try {
        const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));
        const allDeps = Object.assign(
          {},
          pkg.dependencies || {},
          pkg.devDependencies || {},
        );
        result.hasTailwind = "tailwindcss" in allDeps;
      } catch (_) {
        // ignore parse errors
      }
    }
  }

  // ── shadcn/ui ─────────────────────────────────────────────────────────────
  const shadcnPath = path.join(dir, "components.json");
  if (fs.existsSync(shadcnPath)) {
    try {
      const shadcnConfig = JSON.parse(fs.readFileSync(shadcnPath, "utf8"));
      // components.json has a "$schema" or "style" field when it's a shadcn config
      result.hasShadcn =
        typeof shadcnConfig === "object" &&
        (shadcnConfig.$schema !== undefined ||
          shadcnConfig.style !== undefined ||
          shadcnConfig.ui !== undefined);
    } catch (_) {
      // ignore parse errors
    }
  }

  // ── CSS Variables ─────────────────────────────────────────────────────────
  const cssCandidates = [
    path.join(dir, "src", "app", "globals.css"),
    path.join(dir, "src", "styles", "globals.css"),
    path.join(dir, "styles", "globals.css"),
    path.join(dir, "app", "globals.css"),
  ];

  for (const cssPath of cssCandidates) {
    if (fs.existsSync(cssPath)) {
      try {
        const content = fs.readFileSync(cssPath, "utf8");
        const parsed = parseCssVars(content);
        result.cssVars = parsed.cssVars;
        result.existingColors = parsed.existingColors;
      } catch (_) {
        // ignore read errors
      }
      break; // use first match only
    }
  }

  return result;
}

module.exports = { detectDesignSignals, parseCssVars, isColorValue };
