"use strict";

/**
 * Unit tests for detect.js
 * Tests: detectStack, detectPackageManager using real temp dirs.
 */

const { test, describe, beforeEach, afterEach } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const os = require("node:os");

const { detectStack, detectPackageManager } = require("../bin/lib/detect.js");

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Create a temp dir, return its path. */
function makeTempDir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), "effectum-detect-"));
}

/** Remove temp dir recursively. */
function cleanTempDir(dir) {
  fs.rmSync(dir, { recursive: true, force: true });
}

// ─── detectStack ─────────────────────────────────────────────────────────────

describe("detectStack", () => {
  let tmpDir;

  beforeEach(() => {
    tmpDir = makeTempDir();
  });

  afterEach(() => {
    cleanTempDir(tmpDir);
  });

  test("detects nextjs-supabase from package.json with next dependency", () => {
    const pkg = {
      dependencies: {
        next: "14.0.0",
        react: "18.0.0",
      },
    };
    fs.writeFileSync(path.join(tmpDir, "package.json"), JSON.stringify(pkg), "utf8");
    assert.equal(detectStack(tmpDir), "nextjs-supabase");
  });

  test("detects nextjs-supabase from package.json with next + supabase", () => {
    const pkg = {
      dependencies: {
        next: "14.0.0",
        "@supabase/supabase-js": "2.0.0",
      },
    };
    fs.writeFileSync(path.join(tmpDir, "package.json"), JSON.stringify(pkg), "utf8");
    assert.equal(detectStack(tmpDir), "nextjs-supabase");
  });

  test("detects nextjs-supabase from package.json with next in devDependencies", () => {
    const pkg = {
      devDependencies: {
        next: "14.0.0",
      },
    };
    fs.writeFileSync(path.join(tmpDir, "package.json"), JSON.stringify(pkg), "utf8");
    assert.equal(detectStack(tmpDir), "nextjs-supabase");
  });

  test("detects python-fastapi from pyproject.toml", () => {
    fs.writeFileSync(path.join(tmpDir, "pyproject.toml"), "[tool.poetry]\nname = 'myapp'\n", "utf8");
    assert.equal(detectStack(tmpDir), "python-fastapi");
  });

  test("detects python-fastapi from requirements.txt", () => {
    fs.writeFileSync(path.join(tmpDir, "requirements.txt"), "fastapi\nuvicorn\n", "utf8");
    assert.equal(detectStack(tmpDir), "python-fastapi");
  });

  test("detects swift-ios from Package.swift", () => {
    fs.writeFileSync(path.join(tmpDir, "Package.swift"), "// swift-tools-version:5.5\n", "utf8");
    assert.equal(detectStack(tmpDir), "swift-ios");
  });

  test("detects swift-ios from .xcodeproj directory", () => {
    fs.mkdirSync(path.join(tmpDir, "MyApp.xcodeproj"));
    assert.equal(detectStack(tmpDir), "swift-ios");
  });

  test("detects swift-ios from .xcworkspace directory", () => {
    fs.mkdirSync(path.join(tmpDir, "MyApp.xcworkspace"));
    assert.equal(detectStack(tmpDir), "swift-ios");
  });

  test("returns null when nothing is detected", () => {
    // Empty directory — no recognisable project files
    assert.equal(detectStack(tmpDir), null);
  });

  test("returns null for directory with only an unrelated file", () => {
    fs.writeFileSync(path.join(tmpDir, "README.md"), "# Hello\n", "utf8");
    assert.equal(detectStack(tmpDir), null);
  });

  test("ignores malformed package.json (returns null)", () => {
    fs.writeFileSync(path.join(tmpDir, "package.json"), "NOT JSON{{", "utf8");
    // No other project files, so should fall through to null
    assert.equal(detectStack(tmpDir), null);
  });
});

// ─── detectPackageManager ─────────────────────────────────────────────────────

describe("detectPackageManager", () => {
  let tmpDir;

  beforeEach(() => {
    tmpDir = makeTempDir();
  });

  afterEach(() => {
    cleanTempDir(tmpDir);
  });

  test("detects pnpm from pnpm-lock.yaml", () => {
    fs.writeFileSync(path.join(tmpDir, "pnpm-lock.yaml"), "", "utf8");
    assert.equal(detectPackageManager(tmpDir), "pnpm");
  });

  test("detects yarn from yarn.lock", () => {
    fs.writeFileSync(path.join(tmpDir, "yarn.lock"), "", "utf8");
    assert.equal(detectPackageManager(tmpDir), "yarn");
  });

  test("detects npm from package-lock.json", () => {
    fs.writeFileSync(path.join(tmpDir, "package-lock.json"), "{}", "utf8");
    assert.equal(detectPackageManager(tmpDir), "npm");
  });

  test("detects bun from bun.lockb", () => {
    fs.writeFileSync(path.join(tmpDir, "bun.lockb"), "", "utf8");
    assert.equal(detectPackageManager(tmpDir), "bun");
  });

  test("detects uv from uv.lock", () => {
    fs.writeFileSync(path.join(tmpDir, "uv.lock"), "", "utf8");
    assert.equal(detectPackageManager(tmpDir), "uv");
  });

  test("detects uv from pyproject.toml (no lock file)", () => {
    fs.writeFileSync(path.join(tmpDir, "pyproject.toml"), "[tool.poetry]\n", "utf8");
    assert.equal(detectPackageManager(tmpDir), "uv");
  });

  test("detects poetry from poetry.lock", () => {
    fs.writeFileSync(path.join(tmpDir, "poetry.lock"), "", "utf8");
    assert.equal(detectPackageManager(tmpDir), "poetry");
  });

  test("detects pipenv from Pipfile.lock", () => {
    fs.writeFileSync(path.join(tmpDir, "Pipfile.lock"), "{}", "utf8");
    assert.equal(detectPackageManager(tmpDir), "pipenv");
  });

  test("pnpm takes priority over yarn and npm", () => {
    // Simulate an edge case where multiple lock files exist
    fs.writeFileSync(path.join(tmpDir, "pnpm-lock.yaml"), "", "utf8");
    fs.writeFileSync(path.join(tmpDir, "yarn.lock"), "", "utf8");
    fs.writeFileSync(path.join(tmpDir, "package-lock.json"), "{}", "utf8");
    assert.equal(detectPackageManager(tmpDir), "pnpm");
  });

  test("falls back to npm when only package.json exists", () => {
    fs.writeFileSync(path.join(tmpDir, "package.json"), "{}", "utf8");
    assert.equal(detectPackageManager(tmpDir), "npm");
  });

  test("falls back to npm for empty directory", () => {
    assert.equal(detectPackageManager(tmpDir), "npm");
  });
});
