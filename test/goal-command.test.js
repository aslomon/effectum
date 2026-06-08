"use strict";

/**
 * Tests for v0.19 Goal command surface.
 */

const { test, describe } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const COMMANDS_DIR = path.resolve(__dirname, "..", "system", "commands");

describe("effect:goal command", () => {
  test("canonical command exists and defines GOAL.md envelope", () => {
    const content = fs.readFileSync(
      path.join(COMMANDS_DIR, "effect", "goal.md"),
      "utf8",
    );

    assert.ok(content.includes('name: "effect:goal"'));
    assert.ok(content.includes("GOAL.md"));
    assert.ok(content.includes(".effectum/goal-state.json"));
    assert.ok(content.includes("Workflow Decision"));
    assert.ok(content.includes("Completion Promise"));
    assert.ok(content.includes("Evidence Required"));
    assert.ok(content.includes("plan-first"));
    assert.ok(content.includes("full-auto"));
    assert.ok(content.includes("orchestrated"));
  });

  test("/goal shortcut exists and points to effect:goal", () => {
    const content = fs.readFileSync(path.join(COMMANDS_DIR, "goal.md"), "utf8");
    assert.ok(content.includes('name: "goal"'));
    assert.ok(content.includes("effect:goal"));
    assert.ok(content.includes("permanent shortcut"));
  });

  test("Claude template advertises goal-first workflow", () => {
    const content = fs.readFileSync(
      path.resolve(__dirname, "..", "system", "templates", "CLAUDE.md.tmpl"),
      "utf8",
    );
    assert.ok(content.includes("GOAL-FIRST"));
    assert.ok(content.includes("effect:goal"));
  });
});
