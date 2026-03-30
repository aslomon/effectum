"use strict";

const { describe, it, beforeEach, afterEach } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("fs");
const path = require("path");
const os = require("os");
const {
  HEADLESS_HOOK_ENTRY,
  HEADLESS_MATCHER,
  applyHeadlessHook,
  installHeadlessScript,
  isHeadlessEnabled,
} = require("../bin/lib/headless");

let tmpDir;

beforeEach(() => {
  tmpDir = path.join(
    os.tmpdir(),
    `effectum-headless-test-${Date.now()}-${Math.random().toString(36).slice(2)}`,
  );
  fs.mkdirSync(tmpDir, { recursive: true });
});

afterEach(() => {
  fs.rmSync(tmpDir, { recursive: true, force: true });
});

// ─── isHeadlessEnabled ──────────────────────────────────────────────────────

describe("isHeadlessEnabled", () => {
  it("returns false when config has no headless field", () => {
    assert.strictEqual(isHeadlessEnabled({ stack: "generic" }), false);
  });

  it("returns true when config.headless is true", () => {
    assert.strictEqual(isHeadlessEnabled({ headless: true }), true);
  });

  it("returns false when config.headless is false", () => {
    assert.strictEqual(isHeadlessEnabled({ headless: false }), false);
  });

  it("returns true when config.autonomy.headless is true", () => {
    assert.strictEqual(
      isHeadlessEnabled({ autonomy: { level: "full", headless: true } }),
      true,
    );
  });

  it("returns false when config.autonomy.headless is false", () => {
    assert.strictEqual(
      isHeadlessEnabled({ autonomy: { level: "full", headless: false } }),
      false,
    );
  });

  it("prefers autonomy.headless over top-level headless", () => {
    assert.strictEqual(
      isHeadlessEnabled({ headless: true, autonomy: { headless: false } }),
      false,
    );
  });
});

// ─── applyHeadlessHook ──────────────────────────────────────────────────────

describe("applyHeadlessHook", () => {
  it("adds AskUserQuestion hook when headless is true", () => {
    const settings = { hooks: { PreToolUse: [] } };
    applyHeadlessHook(settings, true);
    assert.strictEqual(settings.hooks.PreToolUse.length, 1);
    assert.strictEqual(settings.hooks.PreToolUse[0].matcher, HEADLESS_MATCHER);
  });

  it("does not add hook when headless is false", () => {
    const settings = { hooks: { PreToolUse: [] } };
    applyHeadlessHook(settings, false);
    assert.strictEqual(settings.hooks.PreToolUse.length, 0);
  });

  it("removes existing headless hook when headless is false", () => {
    const settings = {
      hooks: {
        PreToolUse: [
          { matcher: "AskUserQuestion", hooks: [{ type: "command" }] },
          { matcher: "Bash", hooks: [{ type: "command" }] },
        ],
      },
    };
    applyHeadlessHook(settings, false);
    assert.strictEqual(settings.hooks.PreToolUse.length, 1);
    assert.strictEqual(settings.hooks.PreToolUse[0].matcher, "Bash");
  });

  it("replaces existing headless hook when headless is true", () => {
    const settings = {
      hooks: {
        PreToolUse: [
          {
            matcher: "AskUserQuestion",
            hooks: [{ type: "command", command: "old" }],
          },
        ],
      },
    };
    applyHeadlessHook(settings, true);
    assert.strictEqual(settings.hooks.PreToolUse.length, 1);
    assert.deepStrictEqual(settings.hooks.PreToolUse[0], HEADLESS_HOOK_ENTRY);
  });

  it("creates hooks.PreToolUse if missing", () => {
    const settings = {};
    applyHeadlessHook(settings, true);
    assert.ok(settings.hooks);
    assert.ok(settings.hooks.PreToolUse);
    assert.strictEqual(settings.hooks.PreToolUse.length, 1);
  });

  it("preserves other PreToolUse hooks", () => {
    const bashHook = { matcher: "Bash", hooks: [{ type: "command" }] };
    const editHook = { matcher: "Edit|Write", hooks: [{ type: "command" }] };
    const settings = {
      hooks: { PreToolUse: [bashHook, editHook] },
    };
    applyHeadlessHook(settings, true);
    assert.strictEqual(settings.hooks.PreToolUse.length, 3);
    assert.deepStrictEqual(settings.hooks.PreToolUse[0], bashHook);
    assert.deepStrictEqual(settings.hooks.PreToolUse[1], editHook);
  });
});

// ─── installHeadlessScript ──────────────────────────────────────────────────

describe("installHeadlessScript", () => {
  it("copies headless-approver.sh to .effectum/hooks/", () => {
    const repoRoot = path.resolve(__dirname, "..");
    installHeadlessScript(repoRoot, tmpDir);
    const dest = path.join(
      tmpDir,
      ".effectum",
      "hooks",
      "headless-approver.sh",
    );
    assert.ok(fs.existsSync(dest), "headless-approver.sh should be copied");
    const stat = fs.statSync(dest);
    assert.ok(stat.mode & 0o100, "script should be executable");
  });

  it("creates .effectum/hooks/ directory if missing", () => {
    const repoRoot = path.resolve(__dirname, "..");
    const hooksDir = path.join(tmpDir, ".effectum", "hooks");
    assert.ok(!fs.existsSync(hooksDir));
    installHeadlessScript(repoRoot, tmpDir);
    assert.ok(fs.existsSync(hooksDir));
  });
});

// ─── HEADLESS_HOOK_ENTRY structure ──────────────────────────────────────────

describe("HEADLESS_HOOK_ENTRY", () => {
  it("has the correct matcher", () => {
    assert.strictEqual(HEADLESS_HOOK_ENTRY.matcher, "AskUserQuestion");
  });

  it("has a command hook with bash source", () => {
    assert.strictEqual(HEADLESS_HOOK_ENTRY.hooks.length, 1);
    assert.strictEqual(HEADLESS_HOOK_ENTRY.hooks[0].type, "command");
    assert.ok(
      HEADLESS_HOOK_ENTRY.hooks[0].command.includes("headless-approver.sh"),
    );
  });

  it("checks EFFECTUM_HEADLESS env var", () => {
    assert.ok(
      HEADLESS_HOOK_ENTRY.hooks[0].command.includes("EFFECTUM_HEADLESS"),
    );
  });
});
