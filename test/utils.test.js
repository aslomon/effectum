"use strict";

const { describe, it } = require("node:test");
const assert = require("node:assert/strict");
const { deepMerge, ensureDir, findRepoRoot } = require("../bin/lib/utils");
const fs = require("fs");
const path = require("path");
const os = require("os");

describe("deepMerge", () => {
  it("merges flat objects, source wins on conflict", () => {
    const result = deepMerge({ a: 1, b: 2 }, { b: 3, c: 4 });
    assert.deepStrictEqual(result, { a: 1, b: 3, c: 4 });
  });

  it("deep-merges nested objects", () => {
    const target = { nested: { a: 1, b: 2 } };
    const source = { nested: { b: 3, c: 4 } };
    const result = deepMerge(target, source);
    assert.deepStrictEqual(result, { nested: { a: 1, b: 3, c: 4 } });
  });

  it("source arrays replace target arrays (no array merge)", () => {
    const result = deepMerge({ arr: [1, 2] }, { arr: [3] });
    assert.deepStrictEqual(result, { arr: [3] });
  });

  it("does not mutate the original target", () => {
    const target = { a: 1 };
    const source = { b: 2 };
    deepMerge(target, source);
    assert.deepStrictEqual(target, { a: 1 });
  });

  it("handles empty objects", () => {
    assert.deepStrictEqual(deepMerge({}, { a: 1 }), { a: 1 });
    assert.deepStrictEqual(deepMerge({ a: 1 }, {}), { a: 1 });
  });

  it("source null/primitive overwrites target object", () => {
    const result = deepMerge({ a: { nested: true } }, { a: null });
    assert.deepStrictEqual(result, { a: null });
  });

  it("concat+deduplicates permissions.allow arrays", () => {
    const target = { permissions: { allow: ["read", "write"] } };
    const source = { permissions: { allow: ["write", "execute"] } };
    const result = deepMerge(target, source);
    assert.deepStrictEqual(result.permissions.allow, [
      "read",
      "write",
      "execute",
    ]);
  });

  it("concat+deduplicates permissions.deny arrays", () => {
    const target = { permissions: { deny: ["rm -rf"] } };
    const source = { permissions: { deny: ["rm -rf", "drop table"] } };
    const result = deepMerge(target, source);
    assert.deepStrictEqual(result.permissions.deny, ["rm -rf", "drop table"]);
  });

  it("still replaces non-permissions arrays normally", () => {
    const result = deepMerge(
      { other: { allow: [1, 2] } },
      { other: { allow: [3] } },
    );
    assert.deepStrictEqual(result.other.allow, [3]);
  });

  it("handles permissions.allow when target has no allow", () => {
    const target = { permissions: {} };
    const source = { permissions: { allow: ["read"] } };
    const result = deepMerge(target, source);
    assert.deepStrictEqual(result.permissions.allow, ["read"]);
  });
});

describe("ensureDir", () => {
  it("creates a nested directory that does not exist", () => {
    const tmpDir = path.join(
      os.tmpdir(),
      `effectum-test-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    );
    const nested = path.join(tmpDir, "a", "b", "c");
    ensureDir(nested);
    assert.ok(fs.existsSync(nested));
    // Cleanup
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });
});

describe("findRepoRoot", () => {
  it("returns a path that contains bin/ and system/", () => {
    const root = findRepoRoot();
    assert.ok(fs.existsSync(path.join(root, "bin")));
  });
});
