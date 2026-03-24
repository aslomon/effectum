"use strict";

const { describe, it } = require("node:test");
const assert = require("node:assert/strict");

const { checkPackageAvailable } = require("../bin/install.js");

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
