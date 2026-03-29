"use strict";

/**
 * Unit tests for bin/update.js
 * Tests: listCommandFiles, diffCommands, copyCommandFiles, listAllFiles,
 *        extractSentinelBlock, replaceSentinelBlock.
 */

const { test, describe, beforeEach, afterEach } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const os = require("node:os");

const {
  listCommandFiles,
  diffCommands,
  copyCommandFiles,
  listAllFiles,
  extractSentinelBlock,
  replaceSentinelBlock,
  SENTINEL_START,
  SENTINEL_END,
} = require("../bin/update.js");

// ─── Helpers ──────────────────────────────────────────────────────────────────

function makeTempDir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), "effectum-update-"));
}

function cleanTempDir(dir) {
  fs.rmSync(dir, { recursive: true, force: true });
}

function writeFile(dir, relPath, content) {
  const abs = path.join(dir, relPath);
  fs.mkdirSync(path.dirname(abs), { recursive: true });
  fs.writeFileSync(abs, content, "utf8");
}

// ─── listCommandFiles ─────────────────────────────────────────────────────────

describe("listCommandFiles", () => {
  let tmpDir;

  beforeEach(() => {
    tmpDir = makeTempDir();
  });

  afterEach(() => {
    cleanTempDir(tmpDir);
  });

  test("returns empty array for non-existent directory", () => {
    const result = listCommandFiles(path.join(tmpDir, "does-not-exist"));
    assert.deepEqual(result, []);
  });

  test("returns empty array for empty directory", () => {
    const result = listCommandFiles(tmpDir);
    assert.deepEqual(result, []);
  });

  test("lists .md files at root level", () => {
    writeFile(tmpDir, "plan.md", "# Plan");
    writeFile(tmpDir, "tdd.md", "# TDD");
    writeFile(tmpDir, "readme.txt", "not a command");

    const result = listCommandFiles(tmpDir);
    assert.ok(result.includes("plan.md"));
    assert.ok(result.includes("tdd.md"));
    assert.ok(!result.includes("readme.txt"));
    assert.equal(result.length, 2);
  });

  test("lists .md files in subdirectories with relative paths", () => {
    writeFile(tmpDir, "plan.md", "# Plan");
    writeFile(tmpDir, "effect/prd/handoff.md", "# Handoff");
    writeFile(tmpDir, "prd/new.md", "# New");

    const result = listCommandFiles(tmpDir);
    assert.ok(result.includes("plan.md"));
    assert.ok(result.includes("effect/prd/handoff.md"));
    assert.ok(result.includes("prd/new.md"));
    assert.equal(result.length, 3);
  });
});

// ─── diffCommands ─────────────────────────────────────────────────────────────

describe("diffCommands", () => {
  let sourceDir, installedDir;

  beforeEach(() => {
    sourceDir = makeTempDir();
    installedDir = makeTempDir();
  });

  afterEach(() => {
    cleanTempDir(sourceDir);
    cleanTempDir(installedDir);
  });

  test("detects new commands not present in installed dir", () => {
    writeFile(sourceDir, "plan.md", "# Plan");
    writeFile(sourceDir, "tdd.md", "# TDD");
    writeFile(sourceDir, "design.md", "# Design");
    writeFile(installedDir, "plan.md", "# Plan");
    writeFile(installedDir, "tdd.md", "# TDD");

    const diff = diffCommands(sourceDir, installedDir);
    assert.deepEqual(diff.newCommands, ["design.md"]);
    assert.equal(diff.updatedCommands.length, 0);
    assert.equal(diff.unchangedCommands.length, 2);
  });

  test("detects updated commands with different content", () => {
    writeFile(sourceDir, "plan.md", "# Plan v2 — updated");
    writeFile(sourceDir, "tdd.md", "# TDD");
    writeFile(installedDir, "plan.md", "# Plan v1 — old");
    writeFile(installedDir, "tdd.md", "# TDD");

    const diff = diffCommands(sourceDir, installedDir);
    assert.equal(diff.newCommands.length, 0);
    assert.deepEqual(diff.updatedCommands, ["plan.md"]);
    assert.deepEqual(diff.unchangedCommands, ["tdd.md"]);
  });

  test("detects new subdirectory commands", () => {
    writeFile(sourceDir, "plan.md", "# Plan");
    writeFile(sourceDir, "effect/prd/handoff.md", "# Handoff");
    writeFile(installedDir, "plan.md", "# Plan");

    const diff = diffCommands(sourceDir, installedDir);
    assert.deepEqual(diff.newCommands, ["effect/prd/handoff.md"]);
  });

  test("returns all unchanged when source matches installed", () => {
    writeFile(sourceDir, "plan.md", "# Plan");
    writeFile(sourceDir, "tdd.md", "# TDD");
    writeFile(installedDir, "plan.md", "# Plan");
    writeFile(installedDir, "tdd.md", "# TDD");

    const diff = diffCommands(sourceDir, installedDir);
    assert.equal(diff.newCommands.length, 0);
    assert.equal(diff.updatedCommands.length, 0);
    assert.equal(diff.unchangedCommands.length, 2);
  });

  test("handles empty source directory", () => {
    writeFile(installedDir, "plan.md", "# Plan");

    const diff = diffCommands(sourceDir, installedDir);
    assert.equal(diff.newCommands.length, 0);
    assert.equal(diff.updatedCommands.length, 0);
    assert.equal(diff.unchangedCommands.length, 0);
  });

  test("handles empty installed directory", () => {
    writeFile(sourceDir, "plan.md", "# Plan");
    writeFile(sourceDir, "tdd.md", "# TDD");

    const diff = diffCommands(sourceDir, installedDir);
    assert.equal(diff.newCommands.length, 2);
    assert.equal(diff.updatedCommands.length, 0);
    assert.equal(diff.unchangedCommands.length, 0);
  });
});

// ─── copyCommandFiles ─────────────────────────────────────────────────────────

describe("copyCommandFiles", () => {
  let sourceDir, destDir;

  beforeEach(() => {
    sourceDir = makeTempDir();
    destDir = makeTempDir();
  });

  afterEach(() => {
    cleanTempDir(sourceDir);
    cleanTempDir(destDir);
  });

  test("copies files from source to destination", () => {
    writeFile(sourceDir, "plan.md", "# Plan content");
    writeFile(sourceDir, "tdd.md", "# TDD content");

    copyCommandFiles(["plan.md", "tdd.md"], sourceDir, destDir);

    assert.ok(fs.existsSync(path.join(destDir, "plan.md")));
    assert.ok(fs.existsSync(path.join(destDir, "tdd.md")));
    assert.equal(
      fs.readFileSync(path.join(destDir, "plan.md"), "utf8"),
      "# Plan content",
    );
  });

  test("creates subdirectories when copying nested files", () => {
    writeFile(sourceDir, "effect/prd/handoff.md", "# Handoff");

    copyCommandFiles(["effect/prd/handoff.md"], sourceDir, destDir);

    assert.ok(fs.existsSync(path.join(destDir, "effect", "prd", "handoff.md")));
    assert.equal(
      fs.readFileSync(path.join(destDir, "effect", "prd", "handoff.md"), "utf8"),
      "# Handoff",
    );
  });

  test("overwrites existing files", () => {
    writeFile(sourceDir, "plan.md", "# Plan v2");
    writeFile(destDir, "plan.md", "# Plan v1");

    copyCommandFiles(["plan.md"], sourceDir, destDir);

    assert.equal(
      fs.readFileSync(path.join(destDir, "plan.md"), "utf8"),
      "# Plan v2",
    );
  });
});

// ─── listAllFiles ─────────────────────────────────────────────────────────────

describe("listAllFiles", () => {
  let tmpDir;

  beforeEach(() => {
    tmpDir = makeTempDir();
  });

  afterEach(() => {
    cleanTempDir(tmpDir);
  });

  test("returns empty array for non-existent directory", () => {
    const result = listAllFiles(path.join(tmpDir, "nope"));
    assert.deepEqual(result, []);
  });

  test("lists all files including non-.md files", () => {
    writeFile(tmpDir, "file.md", "md");
    writeFile(tmpDir, "file.json", "json");
    writeFile(tmpDir, "sub/file.txt", "txt");

    const result = listAllFiles(tmpDir);
    assert.ok(result.includes("file.md"));
    assert.ok(result.includes("file.json"));
    assert.ok(result.includes("sub/file.txt"));
    assert.equal(result.length, 3);
  });
});

// ─── Integration: update preserves config ─────────────────────────────────────

describe("update integration", () => {
  let tmpDir;

  beforeEach(() => {
    tmpDir = makeTempDir();
  });

  afterEach(() => {
    cleanTempDir(tmpDir);
  });

  test("existing .effectum.json config is preserved during diff", () => {
    const config = {
      version: "0.4.0",
      projectName: "my-project",
      stack: "generic",
      autonomyLevel: "standard",
      language: "english",
      packageManager: "pnpm",
    };
    writeFile(tmpDir, ".effectum.json", JSON.stringify(config));

    // Simulate reading config
    const { readConfig } = require("../bin/lib/config");
    const loaded = readConfig(tmpDir);
    assert.equal(loaded.projectName, "my-project");
    assert.equal(loaded.stack, "generic");
    assert.equal(loaded.packageManager, "pnpm");
  });

  test("diff correctly identifies mixed new and updated commands", () => {
    const sourceDir = makeTempDir();
    const installedDir = makeTempDir();

    try {
      writeFile(sourceDir, "plan.md", "# Plan v2");
      writeFile(sourceDir, "tdd.md", "# TDD");
      writeFile(sourceDir, "new-cmd.md", "# New");
      writeFile(installedDir, "plan.md", "# Plan v1");
      writeFile(installedDir, "tdd.md", "# TDD");

      const diff = diffCommands(sourceDir, installedDir);
      assert.equal(diff.newCommands.length, 1);
      assert.equal(diff.updatedCommands.length, 1);
      assert.equal(diff.unchangedCommands.length, 1);
      assert.ok(diff.newCommands.includes("new-cmd.md"));
      assert.ok(diff.updatedCommands.includes("plan.md"));
      assert.ok(diff.unchangedCommands.includes("tdd.md"));
    } finally {
      cleanTempDir(sourceDir);
      cleanTempDir(installedDir);
    }
  });
});

// ─── extractSentinelBlock ────────────────────────────────────────────────────

describe("extractSentinelBlock", () => {
  test("extracts sentinel block from content with markers", () => {
    const content = [
      "# My Project",
      "",
      SENTINEL_START,
      "## Project Context",
      "This is a SaaS app.",
      SENTINEL_END,
      "",
      "## Other stuff",
    ].join("\n");

    const block = extractSentinelBlock(content);
    assert.ok(block);
    assert.ok(block.startsWith(SENTINEL_START));
    assert.ok(block.endsWith(SENTINEL_END));
    assert.ok(block.includes("This is a SaaS app."));
  });

  test("returns null when no markers exist", () => {
    const content = "# My Project\n\nNo sentinels here.";
    const block = extractSentinelBlock(content);
    assert.equal(block, null);
  });

  test("returns null when only start marker exists", () => {
    const content = `# My Project\n\n${SENTINEL_START}\nSome content`;
    const block = extractSentinelBlock(content);
    assert.equal(block, null);
  });

  test("returns null when only end marker exists", () => {
    const content = `# My Project\nSome content\n${SENTINEL_END}`;
    const block = extractSentinelBlock(content);
    assert.equal(block, null);
  });

  test("returns null when end comes before start", () => {
    const content = `${SENTINEL_END}\nSome content\n${SENTINEL_START}`;
    const block = extractSentinelBlock(content);
    assert.equal(block, null);
  });

  test("extracts block with empty content between markers", () => {
    const content = `# Title\n${SENTINEL_START}\n${SENTINEL_END}\n# Footer`;
    const block = extractSentinelBlock(content);
    assert.ok(block);
    assert.ok(block.includes(SENTINEL_START));
    assert.ok(block.includes(SENTINEL_END));
  });

  test("extracts block with multiline content", () => {
    const innerContent = [
      "## Project Context",
      "",
      "### What This Is",
      "A restaurant management SaaS",
      "",
      "### Users",
      "Restaurant managers, kitchen staff",
    ].join("\n");

    const content = `# Header\n${SENTINEL_START}\n${innerContent}\n${SENTINEL_END}\n# Footer`;
    const block = extractSentinelBlock(content);
    assert.ok(block);
    assert.ok(block.includes("restaurant management SaaS"));
    assert.ok(block.includes("kitchen staff"));
  });
});

// ─── replaceSentinelBlock ────────────────────────────────────────────────────

describe("replaceSentinelBlock", () => {
  test("replaces template sentinel block with preserved content", () => {
    const rendered = [
      "# My Project",
      "",
      SENTINEL_START,
      "<!-- Default placeholder -->",
      SENTINEL_END,
      "",
      "## Footer",
    ].join("\n");

    const preserved = [
      SENTINEL_START,
      "## Project Context",
      "This is my real project context.",
      SENTINEL_END,
    ].join("\n");

    const result = replaceSentinelBlock(rendered, preserved);
    assert.ok(result.includes("This is my real project context."));
    assert.ok(!result.includes("Default placeholder"));
    assert.ok(result.includes("## Footer"));
    assert.ok(result.includes("# My Project"));
  });

  test("returns rendered content unchanged when no sentinel block exists", () => {
    const rendered = "# No sentinels here\n\nJust content.";
    const preserved = `${SENTINEL_START}\nStuff\n${SENTINEL_END}`;

    const result = replaceSentinelBlock(rendered, preserved);
    assert.equal(result, rendered);
  });

  test("preserves content outside the sentinel block", () => {
    const rendered = [
      "# Header",
      "Important stuff above",
      SENTINEL_START,
      "template content",
      SENTINEL_END,
      "Important stuff below",
    ].join("\n");

    const preserved = [SENTINEL_START, "user content", SENTINEL_END].join("\n");

    const result = replaceSentinelBlock(rendered, preserved);
    assert.ok(result.includes("Important stuff above"));
    assert.ok(result.includes("Important stuff below"));
    assert.ok(result.includes("user content"));
    assert.ok(!result.includes("template content"));
  });

  test("handles sentinel block at the very end of the file", () => {
    const rendered = `# Header\n${SENTINEL_START}\ndefault\n${SENTINEL_END}`;
    const preserved = `${SENTINEL_START}\ncustom\n${SENTINEL_END}`;

    const result = replaceSentinelBlock(rendered, preserved);
    assert.ok(result.includes("custom"));
    assert.ok(!result.includes("default"));
  });
});

// ─── Sentinel constants ─────────────────────────────────────────────────────

describe("sentinel constants", () => {
  test("SENTINEL_START is an HTML comment", () => {
    assert.ok(SENTINEL_START.startsWith("<!--"));
    assert.ok(SENTINEL_START.endsWith("-->"));
  });

  test("SENTINEL_END is an HTML comment", () => {
    assert.ok(SENTINEL_END.startsWith("<!--"));
    assert.ok(SENTINEL_END.endsWith("-->"));
  });

  test("SENTINEL_START and SENTINEL_END are different", () => {
    assert.notEqual(SENTINEL_START, SENTINEL_END);
  });

  test("both contain effectum:project-context", () => {
    assert.ok(SENTINEL_START.includes("effectum:project-context"));
    assert.ok(SENTINEL_END.includes("effectum:project-context"));
  });
});
