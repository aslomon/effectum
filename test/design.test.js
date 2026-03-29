"use strict";

/**
 * Unit tests for design.js
 * Tests: detectDesignSignals, parseCssVars, isColorValue, template loading.
 */

const { test, describe, beforeEach, afterEach } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const os = require("node:os");

const {
  detectDesignSignals,
  parseCssVars,
  isColorValue,
} = require("../bin/lib/design.js");

// ─── Helpers ──────────────────────────────────────────────────────────────────

function makeTempDir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), "effectum-design-"));
}

function cleanTempDir(dir) {
  fs.rmSync(dir, { recursive: true, force: true });
}

function writeFile(dir, relPath, content) {
  const abs = path.join(dir, relPath);
  fs.mkdirSync(path.dirname(abs), { recursive: true });
  fs.writeFileSync(abs, content, "utf8");
}

// ─── detectDesignSignals — Tailwind ──────────────────────────────────────────

describe("detectDesignSignals — Tailwind detection", () => {
  let tmpDir;

  beforeEach(() => {
    tmpDir = makeTempDir();
  });

  afterEach(() => {
    cleanTempDir(tmpDir);
  });

  test("hasTailwind is false for empty project", () => {
    const result = detectDesignSignals(tmpDir);
    assert.equal(result.hasTailwind, false);
  });

  test("hasTailwind is true when tailwind.config.js exists", () => {
    writeFile(tmpDir, "tailwind.config.js", "module.exports = {};");
    const result = detectDesignSignals(tmpDir);
    assert.equal(result.hasTailwind, true);
  });

  test("hasTailwind is true when tailwind.config.ts exists", () => {
    writeFile(tmpDir, "tailwind.config.ts", "export default {};");
    const result = detectDesignSignals(tmpDir);
    assert.equal(result.hasTailwind, true);
  });

  test("hasTailwind is true when tailwindcss is in devDependencies", () => {
    writeFile(
      tmpDir,
      "package.json",
      JSON.stringify({ devDependencies: { tailwindcss: "^3.0.0" } }),
    );
    const result = detectDesignSignals(tmpDir);
    assert.equal(result.hasTailwind, true);
  });

  test("hasTailwind is true when tailwindcss is in dependencies", () => {
    writeFile(
      tmpDir,
      "package.json",
      JSON.stringify({ dependencies: { tailwindcss: "^4.0.0" } }),
    );
    const result = detectDesignSignals(tmpDir);
    assert.equal(result.hasTailwind, true);
  });
});

// ─── detectDesignSignals — shadcn ────────────────────────────────────────────

describe("detectDesignSignals — shadcn detection", () => {
  let tmpDir;

  beforeEach(() => {
    tmpDir = makeTempDir();
  });

  afterEach(() => {
    cleanTempDir(tmpDir);
  });

  test("hasShadcn is false for empty project", () => {
    const result = detectDesignSignals(tmpDir);
    assert.equal(result.hasShadcn, false);
  });

  test("hasShadcn is true when components.json has style field", () => {
    writeFile(
      tmpDir,
      "components.json",
      JSON.stringify({ style: "default", rsc: true }),
    );
    const result = detectDesignSignals(tmpDir);
    assert.equal(result.hasShadcn, true);
  });

  test("hasShadcn is true when components.json has $schema field", () => {
    writeFile(
      tmpDir,
      "components.json",
      JSON.stringify({
        $schema: "https://ui.shadcn.com/schema.json",
        style: "default",
      }),
    );
    const result = detectDesignSignals(tmpDir);
    assert.equal(result.hasShadcn, true);
  });

  test("hasShadcn is false when components.json is not a shadcn config", () => {
    writeFile(tmpDir, "components.json", JSON.stringify(["Button", "Input"]));
    const result = detectDesignSignals(tmpDir);
    assert.equal(result.hasShadcn, false);
  });
});

// ─── detectDesignSignals — CSS variables ─────────────────────────────────────

describe("detectDesignSignals — CSS variable detection", () => {
  let tmpDir;

  beforeEach(() => {
    tmpDir = makeTempDir();
  });

  afterEach(() => {
    cleanTempDir(tmpDir);
  });

  test("cssVars and existingColors are empty for project with no CSS", () => {
    const result = detectDesignSignals(tmpDir);
    assert.deepEqual(result.cssVars, []);
    assert.deepEqual(result.existingColors, []);
  });

  test("detects CSS variables from src/app/globals.css", () => {
    writeFile(
      tmpDir,
      "src/app/globals.css",
      `:root {
  --color-primary: #6366f1;
  --color-background: #fafafa;
  --font-size-base: 16px;
}`,
    );
    const result = detectDesignSignals(tmpDir);
    assert.ok(result.cssVars.includes("--color-primary"));
    assert.ok(result.cssVars.includes("--color-background"));
    assert.ok(result.cssVars.includes("--font-size-base"));
  });

  test("extracts color values from CSS variables", () => {
    writeFile(
      tmpDir,
      "src/app/globals.css",
      `:root {
  --color-primary: #6366f1;
  --color-muted: rgb(100, 100, 100);
  --spacing-base: 8px;
}`,
    );
    const result = detectDesignSignals(tmpDir);
    assert.ok(result.existingColors.includes("#6366f1"));
    assert.ok(result.existingColors.includes("rgb(100, 100, 100)"));
    // non-color values should not appear
    assert.ok(!result.existingColors.includes("8px"));
  });

  test("falls back to styles/globals.css if src/app/globals.css not found", () => {
    writeFile(tmpDir, "styles/globals.css", `:root { --color-accent: #ff6b6b; }`);
    const result = detectDesignSignals(tmpDir);
    assert.ok(result.cssVars.includes("--color-accent"));
  });
});

// ─── detectDesignSignals — combined project structures ───────────────────────

describe("detectDesignSignals — combined project structures", () => {
  let tmpDir;

  beforeEach(() => {
    tmpDir = makeTempDir();
  });

  afterEach(() => {
    cleanTempDir(tmpDir);
  });

  test("returns all signals for a full Next.js + Tailwind + shadcn project", () => {
    writeFile(tmpDir, "tailwind.config.ts", "export default {};");
    writeFile(
      tmpDir,
      "components.json",
      JSON.stringify({ $schema: "https://ui.shadcn.com/schema.json", style: "default" }),
    );
    writeFile(
      tmpDir,
      "src/app/globals.css",
      `:root { --background: #fff; --foreground: #0f172a; }`,
    );

    const result = detectDesignSignals(tmpDir);
    assert.equal(result.hasTailwind, true);
    assert.equal(result.hasShadcn, true);
    assert.ok(result.cssVars.length > 0);
  });

  test("return shape always has all four expected keys", () => {
    const result = detectDesignSignals(tmpDir);
    assert.ok("hasTailwind" in result, "hasTailwind missing");
    assert.ok("hasShadcn" in result, "hasShadcn missing");
    assert.ok("cssVars" in result, "cssVars missing");
    assert.ok("existingColors" in result, "existingColors missing");
  });
});

// ─── parseCssVars ─────────────────────────────────────────────────────────────

describe("parseCssVars", () => {
  test("parses empty string without error", () => {
    const result = parseCssVars("");
    assert.deepEqual(result, { cssVars: [], existingColors: [] });
  });

  test("parses multiple CSS variables", () => {
    const css = `:root {
  --primary: #3b82f6;
  --secondary: #10b981;
  --radius: 0.5rem;
}`;
    const result = parseCssVars(css);
    assert.ok(result.cssVars.includes("--primary"));
    assert.ok(result.cssVars.includes("--secondary"));
    assert.ok(result.cssVars.includes("--radius"));
    assert.ok(result.existingColors.includes("#3b82f6"));
    assert.ok(result.existingColors.includes("#10b981"));
  });

  test("does not include non-color values in existingColors", () => {
    const css = `:root { --spacing: 8px; --font: Inter; --size: 100%; }`;
    const result = parseCssVars(css);
    assert.equal(result.existingColors.length, 0);
    assert.equal(result.cssVars.length, 3);
  });
});

// ─── isColorValue ─────────────────────────────────────────────────────────────

describe("isColorValue", () => {
  test("recognizes 3-digit hex colors", () => {
    assert.equal(isColorValue("#fff"), true);
    assert.equal(isColorValue("#abc"), true);
  });

  test("recognizes 6-digit hex colors", () => {
    assert.equal(isColorValue("#6366f1"), true);
    assert.equal(isColorValue("#ffffff"), true);
  });

  test("recognizes rgb() values", () => {
    assert.equal(isColorValue("rgb(255, 0, 0)"), true);
    assert.equal(isColorValue("rgba(0, 0, 0, 0.5)"), true);
  });

  test("recognizes hsl() values", () => {
    assert.equal(isColorValue("hsl(240, 100%, 50%)"), true);
    assert.equal(isColorValue("hsla(240, 100%, 50%, 0.8)"), true);
  });

  test("recognizes oklch() values", () => {
    assert.equal(isColorValue("oklch(0.7 0.15 240)"), true);
  });

  test("does not recognize plain pixel values", () => {
    assert.equal(isColorValue("16px"), false);
    assert.equal(isColorValue("1rem"), false);
    assert.equal(isColorValue("Inter"), false);
    assert.equal(isColorValue("100%"), false);
  });
});

// ─── Template file tests ──────────────────────────────────────────────────────

describe("DESIGN.md template", () => {
  const templatePath = path.resolve(
    __dirname,
    "..",
    "system",
    "templates",
    "DESIGN.md.tmpl",
  );

  test("template file exists at expected path", () => {
    assert.ok(fs.existsSync(templatePath), `Template not found at ${templatePath}`);
  });

  test("template loads without error", () => {
    let content;
    assert.doesNotThrow(() => {
      content = fs.readFileSync(templatePath, "utf8");
    });
    assert.ok(typeof content === "string");
    assert.ok(content.length > 100);
  });

  test("template contains {{projectName}} placeholder", () => {
    const content = fs.readFileSync(templatePath, "utf8");
    assert.ok(content.includes("{{projectName}}"), "Missing {{projectName}}");
  });

  test("template contains {{stack}} placeholder", () => {
    const content = fs.readFileSync(templatePath, "utf8");
    assert.ok(content.includes("{{stack}}"), "Missing {{stack}}");
  });

  test("template contains {{date}} placeholder", () => {
    const content = fs.readFileSync(templatePath, "utf8");
    assert.ok(content.includes("{{date}}"), "Missing {{date}}");
  });

  test("template contains all required sections", () => {
    const content = fs.readFileSync(templatePath, "utf8");
    const requiredSections = [
      "## Overview",
      "## Color System",
      "## Typography",
      "## Component Patterns",
      "## Layout",
      "## Interaction Design",
      "## Constraints",
    ];
    for (const section of requiredSections) {
      assert.ok(content.includes(section), `Missing section: ${section}`);
    }
  });

  test("template contains TODO markers for user input", () => {
    const content = fs.readFileSync(templatePath, "utf8");
    assert.ok(content.includes("<!-- TODO:"), "No TODO markers found in template");
  });

  test("placeholder interpolation works correctly", () => {
    const content = fs.readFileSync(templatePath, "utf8");
    const replaced = content
      .replace(/\{\{projectName\}\}/g, "MyApp")
      .replace(/\{\{stack\}\}/g, "Next.js + Tailwind")
      .replace(/\{\{date\}\}/g, "2026-03-25");

    assert.ok(replaced.includes("MyApp"), "projectName not replaced");
    assert.ok(replaced.includes("Next.js + Tailwind"), "stack not replaced");
    assert.ok(replaced.includes("2026-03-25"), "date not replaced");
    assert.ok(!replaced.includes("{{projectName}}"), "{{projectName}} still present");
    assert.ok(!replaced.includes("{{stack}}"), "{{stack}} still present");
    assert.ok(!replaced.includes("{{date}}"), "{{date}} still present");
  });
});

// ─── /design command file tests ───────────────────────────────────────────────

describe("/design command", () => {
  const commandPath = path.resolve(
    __dirname,
    "..",
    "system",
    "commands",
    "effect/design.md",
  );

  test("command file exists", () => {
    assert.ok(fs.existsSync(commandPath), `Command file not found at ${commandPath}`);
  });

  test("command file mentions DESIGN.md output", () => {
    const content = fs.readFileSync(commandPath, "utf8");
    assert.ok(content.includes("DESIGN.md"), "Command should reference DESIGN.md output");
  });

  test("command file mentions design signal scanning", () => {
    const content = fs.readFileSync(commandPath, "utf8");
    assert.ok(
      content.toLowerCase().includes("tailwind") || content.toLowerCase().includes("scan"),
      "Command should mention scanning for design signals",
    );
  });
});
