"use strict";

/**
 * Tests that all 28 command files have valid YAML frontmatter
 * with required fields: name and description.
 */

const { test, describe } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const COMMANDS_DIR = path.resolve(__dirname, "..", "system", "commands");

/**
 * Collect all .md command files recursively, excluding README.md.
 */
function collectCommandFiles(dir) {
  const files = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...collectCommandFiles(fullPath));
    } else if (
      entry.isFile() &&
      entry.name.endsWith(".md") &&
      entry.name !== "README.md"
    ) {
      files.push(fullPath);
    }
  }
  return files;
}

/**
 * Parse YAML frontmatter from a markdown file.
 * Returns null if no frontmatter found.
 */
function parseFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return null;

  const yaml = match[1];
  const result = {};

  for (const line of yaml.split("\n")) {
    const kvMatch = line.match(/^(\S[\w-]+):\s*(.+)$/);
    if (kvMatch) {
      const key = kvMatch[1];
      let value = kvMatch[2].trim();
      // Remove surrounding quotes
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
      result[key] = value;
    }
  }

  return result;
}

const commandFiles = collectCommandFiles(COMMANDS_DIR);

describe("command frontmatter", () => {
  test("finds exactly 28 command files", () => {
    assert.equal(
      commandFiles.length,
      28,
      `Expected 28 command files, found ${commandFiles.length}: ${commandFiles.map((f) => path.relative(COMMANDS_DIR, f)).join(", ")}`,
    );
  });

  for (const filePath of commandFiles) {
    const relativePath = path.relative(COMMANDS_DIR, filePath);

    test(`${relativePath} has YAML frontmatter`, () => {
      const content = fs.readFileSync(filePath, "utf8");
      assert.ok(
        content.startsWith("---\n"),
        `${relativePath} must start with YAML frontmatter delimiter`,
      );
      const frontmatter = parseFrontmatter(content);
      assert.ok(
        frontmatter !== null,
        `${relativePath} must have valid YAML frontmatter`,
      );
    });

    test(`${relativePath} has 'name' field`, () => {
      const content = fs.readFileSync(filePath, "utf8");
      const frontmatter = parseFrontmatter(content);
      assert.ok(
        frontmatter && frontmatter.name,
        `${relativePath} must have a 'name' field in frontmatter`,
      );
      assert.ok(
        frontmatter.name.length > 0,
        `${relativePath} 'name' must not be empty`,
      );
    });

    test(`${relativePath} has 'description' field`, () => {
      const content = fs.readFileSync(filePath, "utf8");
      const frontmatter = parseFrontmatter(content);
      assert.ok(
        frontmatter && frontmatter.description,
        `${relativePath} must have a 'description' field in frontmatter`,
      );
      assert.ok(
        frontmatter.description.length > 0,
        `${relativePath} 'description' must not be empty`,
      );
      assert.ok(
        frontmatter.description.length <= 200,
        `${relativePath} 'description' must be ≤200 chars (got ${frontmatter.description.length})`,
      );
    });
  }
});

describe("onboard.md structure", () => {
  test("onboard.md is under 250 lines", () => {
    const content = fs.readFileSync(
      path.join(COMMANDS_DIR, "onboard.md"),
      "utf8",
    );
    const lineCount = content.split("\n").length;
    assert.ok(
      lineCount <= 250,
      `onboard.md should be ≤250 lines, got ${lineCount}`,
    );
  });

  test("6 agent spec files exist in system/agents/", () => {
    const agentsDir = path.resolve(__dirname, "..", "system", "agents");
    const expectedFiles = [
      "onboard-stack-analyst.md",
      "onboard-architecture-analyst.md",
      "onboard-api-analyst.md",
      "onboard-database-analyst.md",
      "onboard-frontend-analyst.md",
      "onboard-test-analyst.md",
    ];
    for (const file of expectedFiles) {
      assert.ok(
        fs.existsSync(path.join(agentsDir, file)),
        `system/agents/${file} must exist`,
      );
    }
  });

  test("onboard.md references agent spec files", () => {
    const content = fs.readFileSync(
      path.join(COMMANDS_DIR, "onboard.md"),
      "utf8",
    );
    assert.ok(
      content.includes("onboard-stack-analyst.md"),
      "onboard.md must reference stack analyst spec",
    );
    assert.ok(
      content.includes("onboard-architecture-analyst.md"),
      "onboard.md must reference architecture analyst spec",
    );
    assert.ok(
      content.includes("onboard-api-analyst.md"),
      "onboard.md must reference API analyst spec",
    );
  });
});

describe("ralph-loop.md structure", () => {
  test("Prime Directives appear within first 50 lines", () => {
    const content = fs.readFileSync(
      path.join(COMMANDS_DIR, "ralph-loop.md"),
      "utf8",
    );
    const lines = content.split("\n").slice(0, 50);
    const first50 = lines.join("\n");
    assert.ok(
      first50.includes("Prime Directives"),
      "Prime Directives must appear within first 50 lines of ralph-loop.md",
    );
  });
});

describe("commands README.md", () => {
  test("README.md exists in system/commands/", () => {
    assert.ok(
      fs.existsSync(path.join(COMMANDS_DIR, "README.md")),
      "system/commands/README.md must exist",
    );
  });

  test("README.md lists all command categories", () => {
    const content = fs.readFileSync(
      path.join(COMMANDS_DIR, "README.md"),
      "utf8",
    );
    assert.ok(content.includes("/plan"), "README must list /plan");
    assert.ok(content.includes("/tdd"), "README must list /tdd");
    assert.ok(content.includes("/verify"), "README must list /verify");
    assert.ok(content.includes("/ralph-loop"), "README must list /ralph-loop");
    assert.ok(content.includes("/prd:new"), "README must list /prd:new");
    assert.ok(content.includes("/onboard"), "README must list /onboard");
  });
});
