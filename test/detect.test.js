"use strict";

const { describe, it, beforeEach, afterEach } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("fs");
const path = require("path");
const os = require("os");
const {
  detectProjectName,
  detectStack,
  detectPackageManager,
} = require("../bin/lib/detect");

let tmpDir;

beforeEach(() => {
  tmpDir = path.join(
    os.tmpdir(),
    `effectum-detect-test-${Date.now()}-${Math.random().toString(36).slice(2)}`,
  );
  fs.mkdirSync(tmpDir, { recursive: true });
});

afterEach(() => {
  fs.rmSync(tmpDir, { recursive: true, force: true });
});

describe("detectProjectName", () => {
  it("returns the directory basename", () => {
    const result = detectProjectName(tmpDir);
    assert.strictEqual(result, path.basename(tmpDir));
  });
});

describe("detectStack", () => {
  it("returns null for empty directory", () => {
    assert.strictEqual(detectStack(tmpDir), null);
  });

  it("detects nextjs-supabase from package.json with next dep", () => {
    const pkg = { dependencies: { next: "^14.0.0" } };
    fs.writeFileSync(
      path.join(tmpDir, "package.json"),
      JSON.stringify(pkg),
      "utf8",
    );
    assert.strictEqual(detectStack(tmpDir), "nextjs-supabase");
  });

  it("detects python-fastapi from pyproject.toml", () => {
    fs.writeFileSync(path.join(tmpDir, "pyproject.toml"), "[tool]", "utf8");
    assert.strictEqual(detectStack(tmpDir), "python-fastapi");
  });

  it("detects swift-ios from Package.swift", () => {
    fs.writeFileSync(
      path.join(tmpDir, "Package.swift"),
      "// swift-tools-version:5.9",
      "utf8",
    );
    assert.strictEqual(detectStack(tmpDir), "swift-ios");
  });
});

describe("detectPackageManager", () => {
  it("defaults to npm when nothing found", () => {
    assert.strictEqual(detectPackageManager(tmpDir), "npm");
  });

  it("detects pnpm from lock file", () => {
    fs.writeFileSync(path.join(tmpDir, "pnpm-lock.yaml"), "", "utf8");
    assert.strictEqual(detectPackageManager(tmpDir), "pnpm");
  });

  it("detects yarn from lock file", () => {
    fs.writeFileSync(path.join(tmpDir, "yarn.lock"), "", "utf8");
    assert.strictEqual(detectPackageManager(tmpDir), "yarn");
  });
});
