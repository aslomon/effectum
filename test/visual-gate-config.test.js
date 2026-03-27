"use strict";

/**
 * visual-gate-config.test.js
 * Tests for the qualityGates.visual config parser and validator.
 *
 * Based on test matrix in:
 * knowledge/projects/effectum-visual-gate-config-schema-and-tests.md
 */

const { describe, it } = require("node:test");
const assert = require("node:assert/strict");
const { parseVisualGateConfig, VISUAL_GATE_DEFAULTS } = require("../bin/lib/visual-gate-config");

// ─── Helpers ─────────────────────────────────────────────────────────────────

function cfg(visual) {
  return { qualityGates: { visual } };
}

function assertValid(result) {
  assert.deepStrictEqual(result.errors, [], `Expected no errors, got: ${result.errors.join(", ")}`);
}

function assertError(result, fragment) {
  assert.ok(result.errors.length > 0, "Expected at least one error");
  if (fragment) {
    const found = result.errors.some((e) => e.includes(fragment));
    assert.ok(found, `Expected error containing "${fragment}", got:\n${result.errors.join("\n")}`);
  }
}

// ─── Tests: Config-Parsing (Section A) ───────────────────────────────────────

describe("parseVisualGateConfig — config parsing (Section A)", () => {

  it("A1: visual missing entirely → gate disabled, no errors", () => {
    const result = parseVisualGateConfig({});
    assert.strictEqual(result.enabled, false);
    assertValid(result);
  });

  it("A1: qualityGates missing → gate disabled, no errors", () => {
    const result = parseVisualGateConfig(null);
    assert.strictEqual(result.enabled, false);
    assertValid(result);
  });

  it("A2: enabled=false → gate disabled, no validation of other fields", () => {
    const result = parseVisualGateConfig(cfg({ enabled: false }));
    assert.strictEqual(result.enabled, false);
    assertValid(result);
  });

  it("A2: enabled=false with invalid baseUrl → no error (not validated when disabled)", () => {
    const result = parseVisualGateConfig(cfg({ enabled: false, baseUrl: "not-a-url" }));
    assertValid(result);
    assert.strictEqual(result.enabled, false);
  });

  it("A3: enabled=true + valid baseUrl → valid, gate enabled", () => {
    const result = parseVisualGateConfig(cfg({ enabled: true, baseUrl: "http://localhost:3000" }));
    assertValid(result);
    assert.strictEqual(result.enabled, true);
  });

  it("A4: enabled=true, baseUrl missing → error", () => {
    const result = parseVisualGateConfig(cfg({ enabled: true }));
    assertError(result, "baseUrl is required");
    assert.strictEqual(result.enabled, false);
  });

  it("A5: enabled=true, baseUrl invalid string → error", () => {
    const result = parseVisualGateConfig(cfg({ enabled: true, baseUrl: "not-a-url" }));
    assertError(result, "not a valid URL");
  });

  it("A5: enabled=true, baseUrl without protocol → error", () => {
    const result = parseVisualGateConfig(cfg({ enabled: true, baseUrl: "localhost:3000" }));
    assertError(result, "not a valid URL");
  });

  it("A3: https URL is accepted", () => {
    const result = parseVisualGateConfig(cfg({ enabled: true, baseUrl: "https://example.com" }));
    assertValid(result);
  });
});

// ─── Tests: Enum/Type Validation (Section B) ─────────────────────────────────

describe("parseVisualGateConfig — enum/type validation (Section B)", () => {

  const base = { enabled: true, baseUrl: "http://localhost:3000" };

  it("B1: valid viewports → no error", () => {
    const result = parseVisualGateConfig(cfg({ ...base, viewports: ["desktop", "mobile"] }));
    assertValid(result);
  });

  it("B2: unsupported viewport → error", () => {
    const result = parseVisualGateConfig(cfg({ ...base, viewports: ["watch"] }));
    assertError(result, "unsupported values");
  });

  it("B2: empty viewports array → error", () => {
    const result = parseVisualGateConfig(cfg({ ...base, viewports: [] }));
    assertError(result, "non-empty array");
  });

  it("B3: valid backend → no error", () => {
    const result = parseVisualGateConfig(cfg({ ...base, backend: "openai-gpt-5.4-mini" }));
    assertValid(result);
  });

  it("B3: anthropic backend → no error", () => {
    const result = parseVisualGateConfig(cfg({ ...base, backend: "anthropic-sonnet-4.6" }));
    assertValid(result);
  });

  it("B4: unsupported backend → error", () => {
    const result = parseVisualGateConfig(cfg({ ...base, backend: "gemini-2.5-pro" }));
    assertError(result, "not supported in v1");
  });

  it("B5: maxWarnings=0 → valid (edge: zero is allowed)", () => {
    const result = parseVisualGateConfig(cfg({ ...base, maxWarnings: 0 }));
    assertValid(result);
  });

  it("B5: maxWarnings=-1 → error", () => {
    const result = parseVisualGateConfig(cfg({ ...base, maxWarnings: -1 }));
    assertError(result, "maxWarnings");
  });

  it("B5: maxWarnings='ten' → error", () => {
    const result = parseVisualGateConfig(cfg({ ...base, maxWarnings: "ten" }));
    assertError(result, "maxWarnings");
  });

  it("B6: onError=skip → valid", () => {
    const result = parseVisualGateConfig(cfg({ ...base, onError: "skip" }));
    assertValid(result);
  });

  it("B6: onError=fail → valid", () => {
    const result = parseVisualGateConfig(cfg({ ...base, onError: "fail" }));
    assertValid(result);
  });

  it("B6: onError=retry → error", () => {
    const result = parseVisualGateConfig(cfg({ ...base, onError: "retry" }));
    assertError(result, "invalid");
  });
});

// ─── Tests: Defaults ─────────────────────────────────────────────────────────

describe("parseVisualGateConfig — default values applied", () => {

  const base = { enabled: true, baseUrl: "http://localhost:3000" };

  it("applies default routes when not specified", () => {
    const result = parseVisualGateConfig(cfg({ ...base }));
    assert.deepStrictEqual(result.config.routes, VISUAL_GATE_DEFAULTS.routes);
  });

  it("applies default viewports when not specified", () => {
    const result = parseVisualGateConfig(cfg({ ...base }));
    assert.deepStrictEqual(result.config.viewports, VISUAL_GATE_DEFAULTS.viewports);
  });

  it("applies default backend when not specified", () => {
    const result = parseVisualGateConfig(cfg({ ...base }));
    assert.strictEqual(result.config.backend, VISUAL_GATE_DEFAULTS.backend);
  });

  it("applies default onError when not specified", () => {
    const result = parseVisualGateConfig(cfg({ ...base }));
    assert.strictEqual(result.config.onError, VISUAL_GATE_DEFAULTS.onError);
  });

  it("overrides routes when specified", () => {
    const result = parseVisualGateConfig(cfg({ ...base, routes: ["/dashboard"] }));
    assert.deepStrictEqual(result.config.routes, ["/dashboard"]);
  });

  it("overrides backend when specified", () => {
    const result = parseVisualGateConfig(cfg({ ...base, backend: "anthropic-sonnet-4.6" }));
    assert.strictEqual(result.config.backend, "anthropic-sonnet-4.6");
  });
});

// ─── Tests: enabled flag gate ─────────────────────────────────────────────────

describe("parseVisualGateConfig — enabled flag semantics", () => {

  it("enabled=true + valid config → enabled=true", () => {
    const result = parseVisualGateConfig(cfg({ enabled: true, baseUrl: "http://localhost:3000" }));
    assert.strictEqual(result.enabled, true);
  });

  it("enabled=true + errors → enabled=false (invalid config is not active)", () => {
    const result = parseVisualGateConfig(cfg({ enabled: true, baseUrl: "bad-url" }));
    assert.strictEqual(result.enabled, false);
  });

  it("enabled=false + otherwise valid → enabled=false", () => {
    const result = parseVisualGateConfig(cfg({ enabled: false, baseUrl: "http://localhost:3000" }));
    assert.strictEqual(result.enabled, false);
  });
});
