"use strict";

const { describe, it } = require("node:test");
const assert = require("node:assert/strict");
const { parseStackPreset } = require("../bin/lib/stack-parser");

describe("parseStackPreset", () => {
  it("parses a single section from markdown", () => {
    const md = `## TECH_STACK\n\`\`\`\nNext.js + Supabase\n\`\`\`\n`;
    const result = parseStackPreset(md);
    assert.strictEqual(result.TECH_STACK, "Next.js + Supabase");
  });

  it("parses multiple sections", () => {
    const md = [
      "## SECTION_A",
      "```",
      "content A",
      "```",
      "",
      "## SECTION_B",
      "````",
      "content B",
      "````",
    ].join("\n");
    const result = parseStackPreset(md);
    assert.strictEqual(result.SECTION_A, "content A");
    assert.strictEqual(result.SECTION_B, "content B");
  });

  it("returns empty object for no sections", () => {
    const result = parseStackPreset("just some text without sections");
    assert.deepStrictEqual(result, {});
  });

  it("trims whitespace from section content", () => {
    const md = `## KEY\n\`\`\`\n  hello  \n\`\`\`\n`;
    const result = parseStackPreset(md);
    assert.strictEqual(result.KEY, "hello");
  });
});
