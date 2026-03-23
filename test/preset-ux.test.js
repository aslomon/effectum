"use strict";

/**
 * Unit tests for preset-selection UX fix.
 * Verifies that askPresetOrCustom's initialValue logic behaves correctly
 * when called with different detected ecosystems.
 *
 * Since askPresetOrCustom is an interactive UI function we can't call it directly in tests,
 * we test the underlying initialValue selection logic in isolation.
 */

const { test, describe } = require("node:test");
const assert = require("node:assert/strict");

// Replicate the initialValue selection logic from ui.js
function pickInitialPreset(presets, detectedEcosystem) {
  let initialValue = "__custom__";
  if (detectedEcosystem) {
    const match = presets.find(
      (preset) =>
        preset.ecosystem &&
        preset.ecosystem.toLowerCase() === detectedEcosystem.toLowerCase(),
    );
    if (match) initialValue = match.id;
  }
  return initialValue;
}

const SAMPLE_PRESETS = [
  { id: "django-postgres", label: "Django + PostgreSQL + Docker", ecosystem: "python" },
  { id: "fastapi-postgres", label: "FastAPI + PostgreSQL + Docker", ecosystem: "python" },
  { id: "nextjs-supabase", label: "Next.js + Supabase + Vercel", ecosystem: "javascript" },
  { id: "go-echo-postgres", label: "Go + Echo + PostgreSQL", ecosystem: "go" },
  { id: "swift-swiftui", label: "Swift + SwiftUI", ecosystem: "swift" },
];

describe("Preset initial value selection", () => {
  test("selects first matching preset for javascript ecosystem", () => {
    const result = pickInitialPreset(SAMPLE_PRESETS, "javascript");
    assert.equal(result, "nextjs-supabase");
  });

  test("selects first matching preset for python ecosystem", () => {
    const result = pickInitialPreset(SAMPLE_PRESETS, "python");
    assert.equal(result, "django-postgres");
  });

  test("selects matching preset for go ecosystem", () => {
    const result = pickInitialPreset(SAMPLE_PRESETS, "go");
    assert.equal(result, "go-echo-postgres");
  });

  test("falls back to __custom__ when ecosystem is null", () => {
    const result = pickInitialPreset(SAMPLE_PRESETS, null);
    assert.equal(result, "__custom__");
  });

  test("falls back to __custom__ when ecosystem is undefined", () => {
    const result = pickInitialPreset(SAMPLE_PRESETS, undefined);
    assert.equal(result, "__custom__");
  });

  test("falls back to __custom__ when no preset matches the detected ecosystem", () => {
    const result = pickInitialPreset(SAMPLE_PRESETS, "rust");
    assert.equal(result, "__custom__");
  });

  test("falls back to __custom__ for empty string ecosystem", () => {
    const result = pickInitialPreset(SAMPLE_PRESETS, "");
    assert.equal(result, "__custom__");
  });

  test("ecosystem matching is case-insensitive", () => {
    const result = pickInitialPreset(SAMPLE_PRESETS, "JAVASCRIPT");
    assert.equal(result, "nextjs-supabase");
  });

  test("falls back to __custom__ for empty presets array", () => {
    const result = pickInitialPreset([], "javascript");
    assert.equal(result, "__custom__");
  });

  test("key regression: minimal npm project (no detection signal) defaults to __custom__, not django", () => {
    // Simulates the original bug: bare npm project had null ecosystem → should default to Build Your Own
    const result = pickInitialPreset(SAMPLE_PRESETS, null);
    assert.notEqual(result, "django-postgres", "should NOT default to django in a bare npm project");
    assert.equal(result, "__custom__");
  });
});
