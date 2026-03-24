"use strict";

const { describe, it, beforeEach, afterEach } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("fs");
const path = require("path");
const os = require("os");
const { readConfig, writeConfig, configExists } = require("../bin/lib/config");

let tmpDir;

beforeEach(() => {
  tmpDir = path.join(
    os.tmpdir(),
    `effectum-config-test-${Date.now()}-${Math.random().toString(36).slice(2)}`,
  );
  fs.mkdirSync(tmpDir, { recursive: true });
});

afterEach(() => {
  fs.rmSync(tmpDir, { recursive: true, force: true });
});

describe("readConfig", () => {
  it("returns null when .effectum.json does not exist", () => {
    assert.strictEqual(readConfig(tmpDir), null);
  });

  it("reads and parses .effectum.json", () => {
    const data = { version: "0.4.0", stack: "nextjs-supabase" };
    fs.writeFileSync(
      path.join(tmpDir, ".effectum.json"),
      JSON.stringify(data),
      "utf8",
    );
    const result = readConfig(tmpDir);
    assert.deepStrictEqual(result, data);
  });

  it("throws with 'Config corrupted' for invalid JSON", () => {
    fs.writeFileSync(path.join(tmpDir, ".effectum.json"), "not json", "utf8");
    assert.throws(() => readConfig(tmpDir), {
      message: /Config corrupted/,
    });
  });
});

describe("writeConfig", () => {
  it("writes .effectum.json and returns the path", () => {
    const result = writeConfig(tmpDir, { stack: "generic" });
    assert.ok(result.endsWith(".effectum.json"));
    const written = JSON.parse(fs.readFileSync(result, "utf8"));
    assert.strictEqual(written.stack, "generic");
    assert.strictEqual(written.version, "0.4.0");
    assert.ok(written.createdAt);
    assert.ok(written.updatedAt);
  });

  it("preserves createdAt on update", () => {
    writeConfig(tmpDir, { stack: "generic" });
    const first = JSON.parse(
      fs.readFileSync(path.join(tmpDir, ".effectum.json"), "utf8"),
    );
    writeConfig(tmpDir, { stack: "python-fastapi" });
    const second = JSON.parse(
      fs.readFileSync(path.join(tmpDir, ".effectum.json"), "utf8"),
    );
    assert.strictEqual(second.createdAt, first.createdAt);
    assert.strictEqual(second.stack, "python-fastapi");
  });
});

describe("configExists", () => {
  it("returns false when file missing", () => {
    assert.strictEqual(configExists(tmpDir), false);
  });

  it("returns true when file exists", () => {
    fs.writeFileSync(path.join(tmpDir, ".effectum.json"), "{}", "utf8");
    assert.strictEqual(configExists(tmpDir), true);
  });
});
