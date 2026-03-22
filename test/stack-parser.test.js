"use strict";

/**
 * Unit tests for stack-parser.js
 * Tests: parseStackPreset — section extraction with 3 and 4 backticks.
 */

const { test, describe } = require("node:test");
const assert = require("node:assert/strict");

const { parseStackPreset } = require("../bin/lib/stack-parser.js");

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Build a minimal stack preset markdown with the given sections.
 * @param {Array<{ key: string, value: string, backticks?: number }>} sections
 * @returns {string}
 */
function buildPreset(sections) {
  return sections
    .map(({ key, value, backticks = 3 }) => {
      const fence = "`".repeat(backticks);
      return `## ${key}\n\n${fence}\n${value}\n${fence}`;
    })
    .join("\n\n");
}

// ─── parseStackPreset ─────────────────────────────────────────────────────────

describe("parseStackPreset", () => {
  test("extracts a single section correctly", () => {
    const content = buildPreset([{ key: "TECH_STACK", value: "Next.js 14 + Supabase" }]);
    const result = parseStackPreset(content);
    assert.equal(result.TECH_STACK, "Next.js 14 + Supabase");
  });

  test("extracts multiple sections correctly", () => {
    const content = buildPreset([
      { key: "TECH_STACK", value: "Next.js + Supabase" },
      { key: "ARCHITECTURE_PRINCIPLES", value: "Feature-based structure" },
      { key: "QUALITY_GATES", value: "Run tests before commit" },
    ]);
    const result = parseStackPreset(content);
    assert.equal(result.TECH_STACK, "Next.js + Supabase");
    assert.equal(result.ARCHITECTURE_PRINCIPLES, "Feature-based structure");
    assert.equal(result.QUALITY_GATES, "Run tests before commit");
  });

  test("extracts all expected effectum section keys", () => {
    const keys = [
      "TECH_STACK",
      "ARCHITECTURE_PRINCIPLES",
      "PROJECT_STRUCTURE",
      "QUALITY_GATES",
      "STACK_SPECIFIC_GUARDRAILS",
      "TOOL_SPECIFIC_GUARDRAILS",
    ];
    const content = buildPreset(keys.map((key) => ({ key, value: `value for ${key}` })));
    const result = parseStackPreset(content);
    for (const key of keys) {
      assert.ok(key in result, `should extract section: ${key}`);
      assert.equal(result[key], `value for ${key}`);
    }
  });

  test("works with 3-backtick code fences", () => {
    const content = "## MY_KEY\n\n```\nmy value here\n```";
    const result = parseStackPreset(content);
    assert.equal(result.MY_KEY, "my value here");
  });

  test("works with 4-backtick code fences", () => {
    const content = "## MY_KEY\n\n````\nmy value here\n````";
    const result = parseStackPreset(content);
    assert.equal(result.MY_KEY, "my value here");
  });

  test("trims leading/trailing whitespace from values", () => {
    const content = "## TRIMMED\n\n```\n\n  some content  \n\n```";
    const result = parseStackPreset(content);
    assert.equal(result.TRIMMED, "some content");
  });

  test("handles multi-line values", () => {
    const multiline = "line 1\nline 2\nline 3";
    const content = buildPreset([{ key: "MULTI", value: multiline }]);
    const result = parseStackPreset(content);
    assert.equal(result.MULTI, multiline);
  });

  test("returns empty object for empty content", () => {
    const result = parseStackPreset("");
    assert.deepEqual(result, {});
  });

  test("returns empty object when no sections match the pattern", () => {
    const content = "# Just a heading\n\nSome text without code fences.\n";
    const result = parseStackPreset(content);
    assert.deepEqual(result, {});
  });

  test("ignores sections without code fences", () => {
    const content =
      "## NO_FENCE\nThis has no fence so should be ignored.\n\n## WITH_FENCE\n\n```\nkeep this\n```";
    const result = parseStackPreset(content);
    assert.ok(!("NO_FENCE" in result), "section without fence should not be extracted");
    assert.equal(result.WITH_FENCE, "keep this");
  });

  test("handles values containing markdown-like content (headers, bullets)", () => {
    const value = "- Item A\n- Item B\n  - Sub-item\n# Nested header";
    const content = buildPreset([{ key: "RICH", value }]);
    const result = parseStackPreset(content);
    assert.equal(result.RICH, value);
  });

  test("handles content with backtick code inside the value (3-fence wrapping 2-backtick inline)", () => {
    // The value contains inline backticks — should not confuse the parser
    const value = "Use `npm install` to install dependencies.";
    const content = buildPreset([{ key: "INSTALL", value }]);
    const result = parseStackPreset(content);
    assert.equal(result.INSTALL, value);
  });

  test("extracts sections with 4-backtick fences alongside 3-backtick sections", () => {
    const content = [
      "## SECTION_3\n\n```\nthree backtick value\n```",
      "## SECTION_4\n\n````\nfour backtick value\n````",
    ].join("\n\n");
    const result = parseStackPreset(content);
    assert.equal(result.SECTION_3, "three backtick value");
    assert.equal(result.SECTION_4, "four backtick value");
  });

  test("parses a realistic nextjs-supabase preset snippet", () => {
    const content = `## TECH_STACK

\`\`\`
- **Framework:** Next.js 14 App Router
- **Database:** Supabase (PostgreSQL)
- **Auth:** Supabase Auth
- **Styling:** Tailwind CSS
\`\`\`

## ARCHITECTURE_PRINCIPLES

\`\`\`
- Feature-based folder structure under src/features/
- Server Components by default, Client Components only when needed
- All DB access via server actions or API routes
\`\`\``;

    const result = parseStackPreset(content);
    assert.ok(result.TECH_STACK.includes("Next.js 14 App Router"), "TECH_STACK should include framework");
    assert.ok(result.TECH_STACK.includes("Supabase (PostgreSQL)"), "TECH_STACK should include DB");
    assert.ok(result.ARCHITECTURE_PRINCIPLES.includes("Feature-based"), "ARCHITECTURE_PRINCIPLES should include structure");
  });
});
