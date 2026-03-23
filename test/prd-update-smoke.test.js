"use strict";

const { test, describe } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const repoRoot = path.resolve(__dirname, "..");

function read(relPath) {
  return fs.readFileSync(path.join(repoRoot, relPath), "utf8");
}

describe("/prd:update smoke contract", () => {
  const command = read("system/commands/prd/update.md");
  const deltaTemplate = read("workshop/templates/delta-handoff.md");
  const taskTemplate = read("workshop/templates/tasks.md");
  const networkGuide = read("workshop/knowledge/06-network-map-guide.md");

  test("command references all required generated artifacts", () => {
    assert.match(command, /workshop\/projects\/\{slug\}\/tasks\.md/);
    assert.match(command, /workshop\/projects\/\{slug\}\/network-map\.mmd/);
    assert.match(command, /workshop\/projects\/\{slug\}\/prompts\/\{number\}-update-v\{new_version\}\.md/);
  });

  test("delta handoff template contains the core sections", () => {
    assert.match(deltaTemplate, /## Protection Rules/);
    assert.match(deltaTemplate, /## Stale Tasks/);
    assert.match(deltaTemplate, /## New Tasks/);
    assert.match(deltaTemplate, /## Cancelled Tasks/);
    assert.match(deltaTemplate, /## Quality Gates/);
    assert.match(deltaTemplate, /## Completion Promise/);
  });

  test("task registry template supports update lifecycle states", () => {
    assert.match(taskTemplate, /TODO/);
    assert.match(taskTemplate, /IN_PROGRESS/);
    assert.match(taskTemplate, /DONE/);
    assert.match(taskTemplate, /STALE/);
    assert.match(taskTemplate, /CANCELLED/);
  });

  test("network map guide explicitly supports /prd:update", () => {
    assert.match(networkGuide, /\/prd:update/);
  });

  test("command includes critical safety and versioning steps", () => {
    assert.match(command, /Proceed with this update\? \(yes\/no\)/);
    assert.match(command, /git tag prd-\{number\}-v\{current_version\}-pre/);
    assert.match(command, /Increment the minor version/);
    assert.match(command, /Add a new row at the top of the Changelog table/);
    assert.match(command, /Do NOT delete them from the file/);
  });

  test("delta handoff contract preserves unknown test coverage honestly", () => {
    assert.match(command, /No explicit automated test located yet/);
    assert.match(command, /never invent a test path/);
  });

  test("delta handoff contract preserves original typography in quoted diffs", () => {
    assert.match(command, /Preserve original typography from the PRD/);
    assert.match(command, /em dashes `—`, curly quotes/);
  });

  test("commit step protects unrelated untracked prompt files", () => {
    assert.match(command, /git status --short/);
    assert.match(command, /Untracked scratch\/prompt files/);
    assert.match(command, /do \*\*not\*\* stage automatically/);
  });
});
