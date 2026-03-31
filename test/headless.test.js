"use strict";

const { describe, it } = require("node:test");
const assert = require("node:assert/strict");
const { execSync, spawnSync } = require("child_process");
const path = require("path");
const os = require("os");
const fs = require("fs");

const SCRIPT = path.resolve(__dirname, "../.claude/hooks/headless-approver.sh");

/**
 * Run headless-approver.sh with the given JSON input and optional env.
 * Returns { stdout, stderr, status }.
 */
function runApprover(json, extraEnv = {}) {
  const result = spawnSync("bash", [SCRIPT], {
    input: JSON.stringify(json),
    env: { ...process.env, ...extraEnv },
    encoding: "utf8",
  });
  return {
    stdout: result.stdout.trim(),
    stderr: result.stderr.trim(),
    status: result.status,
  };
}

function parseDecision(stdout) {
  try {
    return JSON.parse(stdout);
  } catch {
    return null;
  }
}

/** Detect the project root so we can build inside/outside paths. */
const PROJECT_ROOT = execSync("git rev-parse --show-toplevel", {
  cwd: __dirname,
  encoding: "utf8",
}).trim();

describe("headless-approver.sh — Read/Glob/Grep (always allow)", () => {
  for (const tool of ["Read", "Glob", "Grep"]) {
    it(`allows ${tool}`, () => {
      const { stdout, status } = runApprover({ tool_name: tool, tool_input: {} });
      assert.strictEqual(status, 0);
      const decision = parseDecision(stdout);
      assert.strictEqual(decision?.permissionDecision, "allow");
    });
  }
});

describe("headless-approver.sh — Bash safe patterns (allow)", () => {
  const safeCmds = [
    "npm test",
    "npm run build",
    "npx tsc",
    "jest --coverage",
    "git status",
    "git diff HEAD",
  ];
  for (const cmd of safeCmds) {
    it(`allows Bash: ${cmd}`, () => {
      const { stdout, status } = runApprover({
        tool_name: "Bash",
        tool_input: { command: cmd },
      });
      assert.strictEqual(status, 0);
      const decision = parseDecision(stdout);
      assert.strictEqual(decision?.permissionDecision, "allow");
    });
  }
});

describe("headless-approver.sh — Bash unsafe patterns (deny)", () => {
  it("denies arbitrary Bash command", () => {
    const { stdout, status } = runApprover({
      tool_name: "Bash",
      tool_input: { command: "rm -rf /" },
    });
    assert.strictEqual(status, 0);
    const decision = parseDecision(stdout);
    assert.strictEqual(decision?.permissionDecision, "deny");
  });
});

describe("headless-approver.sh — Write path check", () => {
  it("allows Write when file_path is inside project root", () => {
    const insidePath = path.join(PROJECT_ROOT, "src", "index.ts");
    const { stdout, status } = runApprover({
      tool_name: "Write",
      tool_input: { file_path: insidePath },
    });
    assert.strictEqual(status, 0);
    const decision = parseDecision(stdout);
    assert.strictEqual(
      decision?.permissionDecision,
      "allow",
      `Expected allow for inside-root path. Got: ${stdout}`
    );
  });

  it("denies Write when file_path is outside project root", () => {
    const outsidePath = path.join(os.tmpdir(), "evil-file.sh");
    const { stdout, status } = runApprover({
      tool_name: "Write",
      tool_input: { file_path: outsidePath },
    });
    assert.strictEqual(status, 0);
    const decision = parseDecision(stdout);
    assert.strictEqual(
      decision?.permissionDecision,
      "deny",
      `Expected deny for outside-root path. Got: ${stdout}`
    );
  });
});

describe("headless-approver.sh — Edit path check", () => {
  it("allows Edit when file_path is inside project root", () => {
    const insidePath = path.join(PROJECT_ROOT, "README.md");
    const { stdout, status } = runApprover({
      tool_name: "Edit",
      tool_input: { file_path: insidePath },
    });
    assert.strictEqual(status, 0);
    const decision = parseDecision(stdout);
    assert.strictEqual(
      decision?.permissionDecision,
      "allow",
      `Expected allow for inside-root path. Got: ${stdout}`
    );
  });

  it("denies Edit when file_path is outside project root", () => {
    const outsidePath = "/etc/hosts";
    const { stdout, status } = runApprover({
      tool_name: "Edit",
      tool_input: { file_path: outsidePath },
    });
    assert.strictEqual(status, 0);
    const decision = parseDecision(stdout);
    assert.strictEqual(
      decision?.permissionDecision,
      "deny",
      `Expected deny for outside-root path. Got: ${stdout}`
    );
  });
});

describe("headless-approver.sh — unknown tool (deny)", () => {
  it("denies unknown tool", () => {
    const { stdout, status } = runApprover({
      tool_name: "NotATool",
      tool_input: {},
    });
    assert.strictEqual(status, 0);
    const decision = parseDecision(stdout);
    assert.strictEqual(decision?.permissionDecision, "deny");
  });
});
