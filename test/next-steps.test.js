"use strict";

/**
 * Unit tests for Feature 3: Command Next-Steps Navigation.
 * Verifies that every command .md file has a ## Next Steps section
 * with the correct format and content.
 */

const { test, describe } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const commandsDir = path.resolve(__dirname, "..", "system", "commands");

// ─── Helpers ──────────────────────────────────────────────────────────────────

function readCommand(name) {
  return fs.readFileSync(path.join(commandsDir, name), "utf8");
}

function hasNextSteps(content) {
  return content.includes("## Next Steps");
}

function getNextStepsSection(content) {
  const match = content.match(
    /## Next Steps\s*\n([\s\S]*?)(?=\n## |\n---\s*$|$)/,
  );
  return match ? match[1].trim() : null;
}

// ─── Core workflow commands have Next Steps ───────────────────────────────────

describe("Next Steps — core commands", () => {
  test("/plan shows next steps (→ /tdd or /ralph-loop)", () => {
    const content = readCommand("plan.md");
    assert.ok(hasNextSteps(content), "/plan should have ## Next Steps");
    const section = getNextStepsSection(content);
    assert.ok(section.includes("/tdd"), "/plan next steps should mention /tdd");
    assert.ok(
      section.includes("/ralph-loop"),
      "/plan next steps should mention /ralph-loop for full autonomy",
    );
  });

  test("/tdd shows next steps (→ /verify or /build-fix)", () => {
    const content = readCommand("tdd.md");
    assert.ok(hasNextSteps(content), "/tdd should have ## Next Steps");
    const section = getNextStepsSection(content);
    assert.ok(
      section.includes("/verify"),
      "/tdd next steps should mention /verify",
    );
    assert.ok(
      section.includes("/build-fix"),
      "/tdd next steps should mention /build-fix",
    );
  });

  test("/verify shows next steps (→ /code-review or /build-fix)", () => {
    const content = readCommand("verify.md");
    assert.ok(hasNextSteps(content), "/verify should have ## Next Steps");
    const section = getNextStepsSection(content);
    assert.ok(
      section.includes("/code-review"),
      "/verify next steps should mention /code-review",
    );
    assert.ok(
      section.includes("/build-fix"),
      "/verify next steps should mention /build-fix",
    );
  });

  test("/code-review shows next steps (→ Done or feedback loop)", () => {
    const content = readCommand("code-review.md");
    assert.ok(hasNextSteps(content), "/code-review should have ## Next Steps");
    const section = getNextStepsSection(content);
    assert.ok(
      section.includes("Done") || section.includes("ready"),
      "/code-review next steps should mention Done or ready for commit",
    );
  });

  test("/design shows next steps (→ /plan)", () => {
    const content = readCommand("design.md");
    assert.ok(hasNextSteps(content), "/design should have ## Next Steps");
    const section = getNextStepsSection(content);
    assert.ok(
      section.includes("/plan"),
      "/design next steps should mention /plan",
    );
  });
});

// ─── PRD handoff has next steps ───────────────────────────────────────────────

describe("Next Steps — PRD commands", () => {
  test("/prd:handoff shows next steps (→ /design or /plan)", () => {
    const content = fs.readFileSync(
      path.join(commandsDir, "prd", "handoff.md"),
      "utf8",
    );
    assert.ok(hasNextSteps(content), "/prd:handoff should have ## Next Steps");
    const section = getNextStepsSection(content);
    assert.ok(
      section.includes("/design"),
      "/prd:handoff should mention /design for frontend",
    );
    assert.ok(section.includes("/plan"), "/prd:handoff should mention /plan");
  });
});

// ─── All command files have Next Steps ────────────────────────────────────────

describe("Next Steps — completeness check", () => {
  const coreCommands = [
    "plan.md",
    "tdd.md",
    "verify.md",
    "code-review.md",
    "build-fix.md",
    "design.md",
    "ralph-loop.md",
    "e2e.md",
    "refactor-clean.md",
    "checkpoint.md",
    "cancel-ralph.md",
    "setup.md",
    "onboard.md",
    "orchestrate.md",
  ];

  for (const cmd of coreCommands) {
    test(`${cmd} has ## Next Steps section`, () => {
      const content = readCommand(cmd);
      assert.ok(
        hasNextSteps(content),
        `${cmd} should have a ## Next Steps section`,
      );
    });
  }

  test("prd/handoff.md has ## Next Steps section", () => {
    const content = fs.readFileSync(
      path.join(commandsDir, "prd", "handoff.md"),
      "utf8",
    );
    assert.ok(hasNextSteps(content));
  });

  test("onboard/review.md has ## Next Steps section", () => {
    const content = fs.readFileSync(
      path.join(commandsDir, "onboard", "review.md"),
      "utf8",
    );
    assert.ok(hasNextSteps(content));
  });
});

// ─── Next steps format ────────────────────────────────────────────────────────

describe("Next Steps — format", () => {
  test("each next step has a one-line explanation (→ format)", () => {
    const content = readCommand("plan.md");
    const section = getNextStepsSection(content);
    // Check for the → format with explanation (commands may be wrapped in backticks)
    const arrows = section.match(/→\s+`?\/\S+`?\s+—\s+.+/g);
    assert.ok(
      arrows && arrows.length > 0,
      "Next steps should use → /command — explanation format",
    );
  });

  test("next steps include alternative section", () => {
    const content = readCommand("tdd.md");
    const section = getNextStepsSection(content);
    assert.ok(
      section.includes("Alternative"),
      "Next steps should include an Alternative section",
    );
  });
});
