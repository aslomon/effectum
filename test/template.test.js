"use strict";

/**
 * Unit tests for template.js
 * Tests: substituteAll, findRemainingPlaceholders, renderTemplate.
 */

const { test, describe } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const os = require("node:os");

const {
  substituteAll,
  findRemainingPlaceholders,
  renderTemplate,
} = require("../bin/lib/template.js");

// ─── substituteAll ────────────────────────────────────────────────────────────

describe("substituteAll", () => {
  test("replaces a single placeholder", () => {
    const result = substituteAll("Hello, {{NAME}}!", { NAME: "World" });
    assert.equal(result, "Hello, World!");
  });

  test("replaces multiple different placeholders", () => {
    const result = substituteAll("{{GREETING}}, {{NAME}}! You are {{AGE}} years old.", {
      GREETING: "Hi",
      NAME: "Claude",
      AGE: "5",
    });
    assert.equal(result, "Hi, Claude! You are 5 years old.");
  });

  test("replaces the same placeholder multiple times", () => {
    const result = substituteAll("{{FOO}} and {{FOO}} and {{FOO}}", { FOO: "bar" });
    assert.equal(result, "bar and bar and bar");
  });

  test("leaves unknown placeholders untouched", () => {
    const result = substituteAll("Hello {{UNKNOWN}}!", { NAME: "World" });
    assert.equal(result, "Hello {{UNKNOWN}}!");
  });

  test("handles empty vars map — returns input unchanged", () => {
    const input = "Hello {{WORLD}}!";
    const result = substituteAll(input, {});
    assert.equal(result, input);
  });

  test("handles empty string content", () => {
    const result = substituteAll("", { FOO: "bar" });
    assert.equal(result, "");
  });

  test("replaces PROJECT_NAME and TECH_STACK placeholders", () => {
    const tmpl = "# {{PROJECT_NAME}}\n\nStack: {{TECH_STACK}}";
    const result = substituteAll(tmpl, {
      PROJECT_NAME: "MyApp",
      TECH_STACK: "Next.js + Supabase",
    });
    assert.equal(result, "# MyApp\n\nStack: Next.js + Supabase");
  });

  test("placeholder value can contain special regex characters safely", () => {
    // Values with $, (, ), [ etc should not break the replacement
    const result = substituteAll("Command: {{CMD}}", { CMD: "echo $HOME && ls (foo)" });
    assert.equal(result, "Command: echo $HOME && ls (foo)");
  });

  test("replaces all effectum-style placeholders in a realistic template snippet", () => {
    const tmpl = "Project: {{PROJECT_NAME}}\nLang: {{LANGUAGE}}\nPM: {{PACKAGE_MANAGER}}";
    const vars = {
      PROJECT_NAME: "effectum",
      LANGUAGE: "Speak German with the user.",
      PACKAGE_MANAGER: "pnpm",
    };
    const result = substituteAll(tmpl, vars);
    assert.equal(result, "Project: effectum\nLang: Speak German with the user.\nPM: pnpm");
  });
});

// ─── findRemainingPlaceholders ────────────────────────────────────────────────

describe("findRemainingPlaceholders", () => {
  test("returns empty array when no placeholders remain", () => {
    const remaining = findRemainingPlaceholders("Hello World, everything replaced!");
    assert.deepEqual(remaining, []);
  });

  test("finds a single remaining placeholder", () => {
    const remaining = findRemainingPlaceholders("Hello {{NAME}}, how are you?");
    assert.deepEqual(remaining, ["{{NAME}}"]);
  });

  test("finds multiple remaining placeholders", () => {
    const remaining = findRemainingPlaceholders("{{A}} and {{B}} are unset, but {{C}} too.");
    assert.ok(remaining.includes("{{A}}"), "should find {{A}}");
    assert.ok(remaining.includes("{{B}}"), "should find {{B}}");
    assert.ok(remaining.includes("{{C}}"), "should find {{C}}");
    assert.equal(remaining.length, 3);
  });

  test("deduplicates repeated placeholders", () => {
    const remaining = findRemainingPlaceholders("{{FOO}} then {{FOO}} again {{FOO}}");
    assert.deepEqual(remaining, ["{{FOO}}"]);
  });

  test("returns empty array for empty string", () => {
    const remaining = findRemainingPlaceholders("");
    assert.deepEqual(remaining, []);
  });

  test("ignores partial or malformed placeholders", () => {
    // These should not be matched
    const remaining = findRemainingPlaceholders("Hello { NAME } and {{}} and {{}");
    assert.deepEqual(remaining, []);
  });

  test("finds placeholders after partial substitution", () => {
    const partial = substituteAll("{{A}} - {{B}} - {{C}}", { A: "replaced" });
    const remaining = findRemainingPlaceholders(partial);
    assert.ok(remaining.includes("{{B}}"), "should find {{B}}");
    assert.ok(remaining.includes("{{C}}"), "should find {{C}}");
    assert.equal(remaining.length, 2);
  });
});

// ─── renderTemplate ───────────────────────────────────────────────────────────

describe("renderTemplate", () => {
  let tmpDir;

  // Create and clean temp dir inline per test via helper
  function withTempFile(content, fn) {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "effectum-tmpl-"));
    const filePath = path.join(dir, "test.tmpl");
    try {
      fs.writeFileSync(filePath, content, "utf8");
      fn(filePath);
    } finally {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  }

  test("renders template and produces output without placeholders", () => {
    withTempFile("Project: {{PROJECT_NAME}}\nStack: {{TECH_STACK}}", (tmplPath) => {
      const { content, remaining } = renderTemplate(tmplPath, {
        PROJECT_NAME: "EffectumTest",
        TECH_STACK: "Next.js",
      });
      assert.ok(content.includes("EffectumTest"), "should contain substituted project name");
      assert.ok(content.includes("Next.js"), "should contain substituted tech stack");
      assert.deepEqual(remaining, [], "no placeholders should remain");
    });
  });

  test("reports remaining placeholders when vars are incomplete", () => {
    withTempFile("Hello {{NAME}}, your stack is {{TECH_STACK}}.", (tmplPath) => {
      const { content, remaining } = renderTemplate(tmplPath, { NAME: "Jason" });
      assert.ok(content.includes("Jason"), "substituted NAME should appear");
      assert.ok(content.includes("{{TECH_STACK}}"), "unresolved placeholder should remain in content");
      assert.ok(remaining.includes("{{TECH_STACK}}"), "remaining should list {{TECH_STACK}}");
      assert.equal(remaining.length, 1);
    });
  });

  test("returns full file content with all substitutions applied", () => {
    const tmpl = "# {{TITLE}}\n\nAuthor: {{AUTHOR}}\n\nDescription: {{DESC}}";
    withTempFile(tmpl, (tmplPath) => {
      const vars = { TITLE: "My App", AUTHOR: "Jason", DESC: "A cool project" };
      const { content, remaining } = renderTemplate(tmplPath, vars);
      assert.equal(content, "# My App\n\nAuthor: Jason\n\nDescription: A cool project");
      assert.deepEqual(remaining, []);
    });
  });

  test("handles template with no placeholders at all", () => {
    withTempFile("# Static content\nNo placeholders here.", (tmplPath) => {
      const { content, remaining } = renderTemplate(tmplPath, { SOME: "value" });
      assert.equal(content, "# Static content\nNo placeholders here.");
      assert.deepEqual(remaining, []);
    });
  });

  test("handles empty template file", () => {
    withTempFile("", (tmplPath) => {
      const { content, remaining } = renderTemplate(tmplPath, { FOO: "bar" });
      assert.equal(content, "");
      assert.deepEqual(remaining, []);
    });
  });
});
