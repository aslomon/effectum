"use strict";

/**
 * Unit tests for AGENTS.md support (PRD 002)
 * Tests: AC-1 detection, AC-3 block loading, block composition.
 */

const { test, describe, beforeEach, afterEach } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const os = require("node:os");

const { detectAgentsMd, detectAll } = require("../bin/lib/detect.js");
const { loadBlock, composeBlocks, findBlocksDir } = require("../bin/lib/template.js");

// ─── Helpers ─────────────────────────────────────────────────────────────────

function makeTempDir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), "effectum-agents-md-"));
}

function cleanTempDir(dir) {
  fs.rmSync(dir, { recursive: true, force: true });
}

const REPO_ROOT = path.resolve(__dirname, "..");

// ─── AC-1: AGENTS.md Detection ───────────────────────────────────────────────

describe("detectAgentsMd", () => {
  let tmpDir;

  beforeEach(() => {
    tmpDir = makeTempDir();
  });

  afterEach(() => {
    cleanTempDir(tmpDir);
  });

  test("agentsMdFound=true when AGENTS.md exists", () => {
    fs.writeFileSync(path.join(tmpDir, "AGENTS.md"), "# Agents\n", "utf8");
    const result = detectAgentsMd(tmpDir);
    assert.equal(result.agentsMdFound, true);
    assert.equal(result.confidence, "certain");
  });

  test("agentsMdFound=false when AGENTS.md does not exist", () => {
    const result = detectAgentsMd(tmpDir);
    assert.equal(result.agentsMdFound, false);
    assert.equal(result.confidence, "none");
  });

  test("detectAll includes agentsMd field", () => {
    const result = detectAll(tmpDir);
    assert.ok("agentsMd" in result, "detectAll result should include agentsMd");
    assert.equal(result.agentsMd.agentsMdFound, false);
  });

  test("detectAll reports agentsMdFound=true when AGENTS.md present", () => {
    fs.writeFileSync(path.join(tmpDir, "AGENTS.md"), "# Agents\n", "utf8");
    const result = detectAll(tmpDir);
    assert.equal(result.agentsMd.agentsMdFound, true);
    assert.equal(result.agentsMd.confidence, "certain");
  });
});

// ─── AC-3: Block Loading ─────────────────────────────────────────────────────

describe("agents-md blocks load without error", () => {
  test("foundation block loads", () => {
    const content = loadBlock("agents-md", "foundation", null, REPO_ROOT);
    assert.ok(content !== null, "foundation block should exist");
    assert.ok(content.length > 0, "foundation block should not be empty");
  });

  test("workflow block loads", () => {
    const content = loadBlock("agents-md", "workflow", null, REPO_ROOT);
    assert.ok(content !== null, "workflow block should exist");
    assert.ok(content.length > 0, "workflow block should not be empty");
  });

  test("guardrails block loads", () => {
    const content = loadBlock("agents-md", "guardrails", null, REPO_ROOT);
    assert.ok(content !== null, "guardrails block should exist");
    assert.ok(content.length > 0, "guardrails block should not be empty");
  });

  test("commands block loads", () => {
    const content = loadBlock("agents-md", "commands", null, REPO_ROOT);
    assert.ok(content !== null, "commands block should exist");
    assert.ok(content.length > 0, "commands block should not be empty");
  });

  test("foundation block contains {{projectName}} placeholder", () => {
    const content = loadBlock("agents-md", "foundation", null, REPO_ROOT);
    assert.ok(content.includes("{{projectName}}"), "foundation should use {{projectName}}");
  });

  test("foundation block contains {{stack}} placeholder", () => {
    const content = loadBlock("agents-md", "foundation", null, REPO_ROOT);
    assert.ok(content.includes("{{stack}}"), "foundation should use {{stack}}");
  });

  test("commands block contains /prd:new command", () => {
    const content = loadBlock("agents-md", "commands", null, REPO_ROOT);
    assert.ok(content.includes("/prd:new"), "commands block should document /prd:new");
  });

  test("guardrails block contains safety language", () => {
    const content = loadBlock("agents-md", "guardrails", null, REPO_ROOT);
    assert.ok(
      content.toLowerCase().includes("secret") || content.toLowerCase().includes("credential"),
      "guardrails should mention secrets/credentials"
    );
  });

  test("blocks dir is discoverable from repo root", () => {
    const dir = findBlocksDir(null, REPO_ROOT);
    assert.ok(dir !== null, "blocks dir should be found");
    assert.ok(fs.existsSync(path.join(dir, "agents-md")), "agents-md subdir should exist");
  });
});

// ─── Template Composition ────────────────────────────────────────────────────

describe("composeBlocks with agents-md blocks", () => {
  test("composeBlocks returns object without errors", () => {
    // composeBlocks expects a detection object — use minimal stub
    const detection = {
      ecosystem: null,
      framework: { id: null },
      database: { id: null },
      deploy: { id: null },
    };
    const result = composeBlocks(detection, null, REPO_ROOT);
    assert.ok(typeof result === "object", "composeBlocks should return an object");
  });

  test("agents-md blocks are loadable independently (not via composeBlocks)", () => {
    // composeBlocks is for CLAUDE.md blocks; agents-md blocks are loaded directly.
    // This test verifies all four blocks load without throwing.
    const blockNames = ["foundation", "workflow", "guardrails", "commands"];
    for (const name of blockNames) {
      assert.doesNotThrow(() => {
        const content = loadBlock("agents-md", name, null, REPO_ROOT);
        assert.ok(content !== null);
      }, `loadBlock("agents-md", "${name}") should not throw`);
    }
  });

  test("{{projectName}} interpolation works correctly", () => {
    const content = loadBlock("agents-md", "foundation", null, REPO_ROOT);
    const interpolated = content.replace(/\{\{projectName\}\}/g, "my-app");
    assert.ok(interpolated.includes("my-app"), "interpolated content should contain project name");
    assert.ok(!interpolated.includes("{{projectName}}"), "no raw placeholder should remain");
  });

  test("{{stack}} interpolation works correctly", () => {
    const content = loadBlock("agents-md", "foundation", null, REPO_ROOT);
    const interpolated = content.replace(/\{\{stack\}\}/g, "nextjs-supabase");
    assert.ok(interpolated.includes("nextjs-supabase"), "interpolated content should contain stack");
    assert.ok(!interpolated.includes("{{stack}}"), "no raw placeholder should remain");
  });
});
