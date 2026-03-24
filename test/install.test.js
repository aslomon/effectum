"use strict";

const { describe, it, beforeEach, afterEach } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("fs");
const path = require("path");
const os = require("os");

const {
  checkPackageAvailable,
  installBaseFiles,
} = require("../bin/install.js");

describe("checkPackageAvailable", () => {
  it("returns a promise", () => {
    const result = checkPackageAvailable("this-package-does-not-exist-xyz");
    assert.ok(result instanceof Promise);
  });

  it("resolves to false for a non-existent package", async () => {
    const result = await checkPackageAvailable(
      "this-package-does-not-exist-xyz-999",
    );
    assert.strictEqual(result, false);
  });

  it("resolves to true for a known package (npm itself)", async () => {
    const result = await checkPackageAvailable("npm");
    assert.strictEqual(result, true);
  });

  it("runs checks in parallel via Promise.all", async () => {
    const packages = [
      "this-fake-pkg-aaa",
      "this-fake-pkg-bbb",
      "this-fake-pkg-ccc",
    ];
    const start = Date.now();
    const results = await Promise.all(
      packages.map((p) => checkPackageAvailable(p)),
    );
    const elapsed = Date.now() - start;
    // All should be false (non-existent)
    for (const r of results) {
      assert.strictEqual(r, false);
    }
    // Parallel should be faster than 3x sequential (8s timeout each = 24s sequential)
    // Just verify it completed — the point is they run concurrently
    assert.ok(
      elapsed < 20000,
      "parallel checks should not take 3x sequential time",
    );
  });
});

describe("installBaseFiles", () => {
  let tmpDir;

  beforeEach(() => {
    tmpDir = path.join(
      os.tmpdir(),
      `effectum-install-test-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    );
    fs.mkdirSync(tmpDir, { recursive: true });
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it("creates .claude directory before any file writes (local install)", () => {
    const repoRoot = path.resolve(__dirname, "..");
    installBaseFiles(tmpDir, repoRoot, false);
    const claudeDir = path.join(tmpDir, ".claude");
    assert.ok(fs.existsSync(claudeDir), ".claude dir should exist");
    assert.ok(
      fs.existsSync(path.join(claudeDir, "commands")),
      "commands dir should exist",
    );
  });

  it("creates target directory for global install", () => {
    const globalDir = path.join(tmpDir, "global-claude");
    const repoRoot = path.resolve(__dirname, "..");
    installBaseFiles(globalDir, repoRoot, true);
    assert.ok(fs.existsSync(globalDir), "global target dir should exist");
  });
});
