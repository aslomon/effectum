"use strict";

/**
 * Unit tests for package manager feature.
 * Tests: getPackageManagerRecommendation, template variable substitution,
 * and config persistence.
 */

const { test, describe, beforeEach, afterEach } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const os = require("node:os");

const { getPackageManagerRecommendation } = require("../bin/lib/ui.js");
const { substituteAll } = require("../bin/lib/template.js");
const { writeConfig, readConfig } = require("../bin/lib/config.js");

// ─── Helpers ──────────────────────────────────────────────────────────────────

function makeTempDir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), "effectum-pm-"));
}

function cleanTempDir(dir) {
  fs.rmSync(dir, { recursive: true, force: true });
}

// ─── getPackageManagerRecommendation ──────────────────────────────────────────

describe("getPackageManagerRecommendation", () => {
  test("recommends keeping detected pnpm", () => {
    const result = getPackageManagerRecommendation("pnpm", "javascript");
    assert.equal(result.recommended, "pnpm");
    assert.ok(result.reason.includes("pnpm"));
  });

  test("recommends keeping detected yarn", () => {
    const result = getPackageManagerRecommendation("yarn", "javascript");
    assert.equal(result.recommended, "yarn");
    assert.ok(result.reason.includes("yarn"));
  });

  test("recommends keeping detected bun", () => {
    const result = getPackageManagerRecommendation("bun", "javascript");
    assert.equal(result.recommended, "bun");
    assert.ok(result.reason.includes("bun"));
  });

  test("recommends pnpm for new JavaScript projects (npm fallback)", () => {
    const result = getPackageManagerRecommendation("npm", "javascript");
    assert.equal(result.recommended, "pnpm");
  });

  test("recommends pnpm for null detection with no ecosystem", () => {
    const result = getPackageManagerRecommendation(null, null);
    assert.equal(result.recommended, "pnpm");
  });

  test("recommends uv for Python ecosystem", () => {
    const result = getPackageManagerRecommendation(null, "python");
    assert.equal(result.recommended, "uv");
  });

  test("recommends go for Go ecosystem", () => {
    const result = getPackageManagerRecommendation(null, "go");
    assert.equal(result.recommended, "go");
  });

  test("recommends cargo for Rust ecosystem", () => {
    const result = getPackageManagerRecommendation(null, "rust");
    assert.equal(result.recommended, "cargo");
  });

  test("recommends swift package for Swift ecosystem", () => {
    const result = getPackageManagerRecommendation(null, "swift");
    assert.equal(result.recommended, "swift package (SPM)");
  });

  test("recommends flutter for Dart ecosystem", () => {
    const result = getPackageManagerRecommendation(null, "dart");
    assert.equal(result.recommended, "flutter");
  });

  test("returns detected npm when npm is detected and no ecosystem match", () => {
    const result = getPackageManagerRecommendation("npm", "unknown-ecosystem");
    assert.equal(result.recommended, "npm");
    assert.ok(result.reason.includes("detected"));
  });
});

// ─── Template Variable: {{PACKAGE_MANAGER}} ──────────────────────────────────

describe("{{PACKAGE_MANAGER}} template variable", () => {
  test("substitutes PACKAGE_MANAGER in template content", () => {
    const template = "Build: `{{PACKAGE_MANAGER}} build` — 0 errors";
    const result = substituteAll(template, { PACKAGE_MANAGER: "pnpm" });
    assert.equal(result, "Build: `pnpm build` — 0 errors");
  });

  test("substitutes PACKAGE_MANAGER with npm", () => {
    const template =
      "Use {{PACKAGE_MANAGER}} for dependencies. Run {{PACKAGE_MANAGER}} install.";
    const result = substituteAll(template, { PACKAGE_MANAGER: "npm" });
    assert.equal(result, "Use npm for dependencies. Run npm install.");
  });

  test("substitutes PACKAGE_MANAGER in guardrails", () => {
    const template =
      "**{{PACKAGE_MANAGER}}, not alternatives**: This project uses {{PACKAGE_MANAGER}}.";
    const result = substituteAll(template, { PACKAGE_MANAGER: "yarn" });
    assert.equal(result, "**yarn, not alternatives**: This project uses yarn.");
  });

  test("PACKAGE_MANAGER works alongside other placeholders", () => {
    const template =
      "Project: {{PROJECT_NAME}}\nPM: {{PACKAGE_MANAGER}}\nLang: {{LANGUAGE}}";
    const result = substituteAll(template, {
      PROJECT_NAME: "my-app",
      PACKAGE_MANAGER: "bun",
      LANGUAGE: "English",
    });
    assert.equal(result, "Project: my-app\nPM: bun\nLang: English");
  });
});

// ─── Config Persistence: packageManager ───────────────────────────────────────

describe("packageManager in .effectum.json", () => {
  let tmpDir;

  beforeEach(() => {
    tmpDir = makeTempDir();
  });

  afterEach(() => {
    cleanTempDir(tmpDir);
  });

  test("packageManager is saved in .effectum.json", () => {
    writeConfig(tmpDir, {
      projectName: "test-project",
      stack: "nextjs-supabase",
      packageManager: "pnpm",
    });

    const config = readConfig(tmpDir);
    assert.equal(config.packageManager, "pnpm");
  });

  test("packageManager persists through config update", () => {
    writeConfig(tmpDir, {
      projectName: "test-project",
      stack: "nextjs-supabase",
      packageManager: "yarn",
    });

    // Update a different field
    const config = readConfig(tmpDir);
    config.autonomyLevel = "full";
    writeConfig(tmpDir, config);

    const updated = readConfig(tmpDir);
    assert.equal(updated.packageManager, "yarn");
    assert.equal(updated.autonomyLevel, "full");
  });

  test("different package managers are saved correctly", () => {
    const managers = ["pnpm", "npm", "yarn", "bun", "uv", "cargo", "go"];
    for (const pm of managers) {
      writeConfig(tmpDir, {
        projectName: "test",
        packageManager: pm,
      });
      const config = readConfig(tmpDir);
      assert.equal(config.packageManager, pm, `Failed for ${pm}`);
    }
  });
});

// ─── Stack Preset: {{PACKAGE_MANAGER}} in nextjs-supabase ─────────────────────

describe("Stack preset uses {{PACKAGE_MANAGER}}", () => {
  const stackPath = path.resolve(
    __dirname,
    "..",
    "system",
    "stacks",
    "nextjs-supabase.md",
  );

  test("nextjs-supabase preset contains {{PACKAGE_MANAGER}} placeholders", () => {
    const content = fs.readFileSync(stackPath, "utf8");
    assert.ok(
      content.includes("{{PACKAGE_MANAGER}}"),
      "Stack preset should contain {{PACKAGE_MANAGER}} placeholders",
    );
  });

  test("nextjs-supabase preset does not hardcode pnpm in TECH_STACK", () => {
    const content = fs.readFileSync(stackPath, "utf8");
    // The TECH_STACK section should use {{PACKAGE_MANAGER}}, not hardcoded pnpm
    const techStackMatch = content.match(
      /## TECH_STACK\s*\n\s*```\s*\n([\s\S]*?)```/,
    );
    if (techStackMatch) {
      const techStack = techStackMatch[1];
      assert.ok(
        !techStack.includes("- pnpm"),
        "TECH_STACK should not hardcode pnpm — use {{PACKAGE_MANAGER}} instead",
      );
    }
  });

  test("nextjs-supabase preset uses {{PACKAGE_MANAGER}} in QUALITY_GATES", () => {
    const content = fs.readFileSync(stackPath, "utf8");
    const qualityMatch = content.match(
      /## QUALITY_GATES\s*\n\s*```\s*\n([\s\S]*?)```/,
    );
    if (qualityMatch) {
      const qualityGates = qualityMatch[1];
      assert.ok(
        qualityGates.includes("{{PACKAGE_MANAGER}}"),
        "QUALITY_GATES should use {{PACKAGE_MANAGER}}",
      );
      assert.ok(
        !qualityGates.includes("pnpm build"),
        "QUALITY_GATES should not hardcode pnpm build",
      );
    }
  });
});
