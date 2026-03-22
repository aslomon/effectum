"use strict";

const { describe, it } = require("node:test");
const assert = require("node:assert/strict");
const {
  substituteAll,
  findRemainingPlaceholders,
} = require("../bin/lib/template");

describe("substituteAll", () => {
  it("replaces a single placeholder", () => {
    const result = substituteAll("Hello {{NAME}}", { NAME: "World" });
    assert.strictEqual(result, "Hello World");
  });

  it("replaces multiple occurrences of the same placeholder", () => {
    const result = substituteAll("{{X}} and {{X}}", { X: "ok" });
    assert.strictEqual(result, "ok and ok");
  });

  it("replaces multiple different placeholders", () => {
    const result = substituteAll("{{A}}-{{B}}", { A: "1", B: "2" });
    assert.strictEqual(result, "1-2");
  });

  it("leaves unknown placeholders untouched", () => {
    const result = substituteAll("{{KNOWN}} {{UNKNOWN}}", { KNOWN: "yes" });
    assert.strictEqual(result, "yes {{UNKNOWN}}");
  });

  it("handles empty vars", () => {
    const result = substituteAll("{{FOO}}", {});
    assert.strictEqual(result, "{{FOO}}");
  });
});

describe("findRemainingPlaceholders", () => {
  it("finds remaining placeholders", () => {
    const result = findRemainingPlaceholders("{{A}} done {{B}} {{A}}");
    assert.ok(result.includes("{{A}}"));
    assert.ok(result.includes("{{B}}"));
  });

  it("returns empty array when no placeholders remain", () => {
    const result = findRemainingPlaceholders("no placeholders here");
    assert.deepStrictEqual(result, []);
  });
});
