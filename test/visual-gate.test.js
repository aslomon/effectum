"use strict";

/**
 * visual-gate.test.js
 * Unit tests for the visual-check.sh gate logic.
 *
 * Tests the pass/fail/error decision rules defined in:
 * - knowledge/projects/effectum-visual-check-cli-contract.md
 * - knowledge/projects/effectum-visual-check-fixtures.md
 *
 * These tests do NOT invoke Playwright or any vision API.
 * They validate the gate evaluation logic in isolation using
 * the fixture JSON payloads defined in the design docs.
 */

const { describe, it } = require("node:test");
const assert = require("node:assert/strict");

// ─── Gate Logic (extracted from the contract spec) ───────────────────────────

/**
 * Evaluate a visual review JSON and return the gate decision.
 * This mirrors what visual-check.sh does when it reads review.json.
 *
 * @param {object} review - Parsed review.json object
 * @param {object} options
 * @param {number} options.maxWarnings - max warnings before WARN exit (default 999)
 * @returns {{ exitCode: number, reason: string }}
 */
function evaluateGate(review, options = {}) {
  const { maxWarnings = 999 } = options;

  // Tool error: null/missing fields
  if (review === null || review === undefined) {
    return { exitCode: 3, reason: "review is null" };
  }

  if (review.exit_code === 3 || review.error) {
    return { exitCode: 3, reason: review.error || "tool error" };
  }

  if (!Array.isArray(review.critical)) {
    return { exitCode: 3, reason: "invalid review schema: critical is not an array" };
  }

  // Fail: any critical issues
  if (review.critical.length > 0) {
    return {
      exitCode: 1,
      reason: `${review.critical.length} critical issue(s) found`,
    };
  }

  // Warn: over warning threshold (only when maxWarnings < 999)
  if (
    maxWarnings < 999 &&
    Array.isArray(review.warnings) &&
    review.warnings.length > maxWarnings
  ) {
    return {
      exitCode: 2,
      reason: `${review.warnings.length} warnings exceed threshold of ${maxWarnings}`,
    };
  }

  // Pass
  return { exitCode: 0, reason: "no critical issues" };
}

/**
 * Extract critical issues from a review for passing back to the coding loop.
 * Returns an array of formatted strings suitable for the next iteration task list.
 */
function formatCriticals(review) {
  if (!review || !Array.isArray(review.critical)) return [];
  return review.critical.map(
    (c) =>
      `[${c.viewport ?? "unknown"} ${c.route ?? "?"}] ${c.element}: ${c.issue} → Fix: ${c.fix}`
  );
}

// ─── Fixtures (from knowledge/projects/effectum-visual-check-fixtures.md) ────

const fixtureA = {
  run_at: "2026-03-27T10:00:00Z",
  base_url: "http://localhost:3000",
  routes: ["/"],
  viewports: ["desktop", "mobile"],
  backend: "openai-gpt-5.4-mini",
  exit_code: 0,
  score: 9,
  critical: [],
  warnings: [],
  passed: [
    "Clear navigation hierarchy on desktop",
    "CTA buttons have sufficient contrast",
    "Headline is readable on mobile viewport",
    "Footer aligns correctly on both viewports",
  ],
};

const fixtureB = {
  run_at: "2026-03-27T10:00:00Z",
  base_url: "http://localhost:3000",
  routes: ["/", "/pricing"],
  viewports: ["desktop", "mobile"],
  backend: "openai-gpt-5.4-mini",
  exit_code: 1,
  score: 4,
  critical: [
    {
      route: "/pricing",
      viewport: "mobile",
      element: "pricing card section",
      issue: "Cards overflow the viewport horizontally",
      fix: "Set max-width: 100% and overflow: hidden on card container",
    },
    {
      route: "/",
      viewport: "mobile",
      element: "hero CTA button",
      issue: "CTA button text is clipped",
      fix: "Remove fixed width on button or increase padding",
    },
  ],
  warnings: [
    {
      route: "/",
      viewport: "desktop",
      element: "testimonial section",
      issue: "Inconsistent card heights",
      suggestion: "Use align-items: stretch or a fixed min-height",
    },
  ],
  passed: ["Navigation renders correctly on desktop"],
};

const fixtureC = {
  run_at: "2026-03-27T10:00:00Z",
  base_url: "http://localhost:3000",
  routes: ["/"],
  viewports: ["desktop", "mobile"],
  backend: "openai-gpt-5.4-mini",
  exit_code: 0,
  score: 7,
  critical: [],
  warnings: [
    { route: "/", viewport: "desktop", element: "hero section spacing", issue: "Tight spacing", suggestion: "Add 8px margin" },
    { route: "/", viewport: "mobile", element: "feature list icons", issue: "Icons too large", suggestion: "Reduce to 24px" },
    { route: "/", viewport: "desktop", element: "footer", issue: "Low link contrast", suggestion: "More distinct color" },
  ],
  passed: ["CTA button is prominent and clear"],
};

const fixtureD = {
  run_at: "2026-03-27T10:00:00Z",
  base_url: "http://localhost:3000",
  routes: ["/"],
  viewports: ["desktop"],
  backend: "openai-gpt-5.4-mini",
  exit_code: 3,
  error: "Missing API key. Set OPENAI_API_KEY before running visual-check.sh.",
  score: null,
  critical: null,
  warnings: null,
  passed: null,
};

const fixtureE = {
  run_at: "2026-03-27T10:00:00Z",
  base_url: "http://localhost:3000",
  routes: ["/"],
  viewports: ["desktop", "mobile"],
  backend: "openai-gpt-5.4-mini",
  exit_code: 3,
  error: "Cannot reach BASE_URL: http://localhost:3000. Is the dev server running?",
  score: null,
  critical: null,
  warnings: null,
  passed: null,
};

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("evaluateGate — gate decision logic", () => {
  describe("Fixture A — pure pass", () => {
    it("returns exit code 0 when no criticals and no warnings", () => {
      const result = evaluateGate(fixtureA);
      assert.strictEqual(result.exitCode, 0);
    });

    it("includes a reason string", () => {
      const result = evaluateGate(fixtureA);
      assert.ok(result.reason.length > 0);
    });
  });

  describe("Fixture B — fail (critical issues)", () => {
    it("returns exit code 1 when critical issues are present", () => {
      const result = evaluateGate(fixtureB);
      assert.strictEqual(result.exitCode, 1);
    });

    it("reason mentions the critical count", () => {
      const result = evaluateGate(fixtureB);
      assert.ok(result.reason.includes("2"), `Expected reason to mention '2', got: ${result.reason}`);
    });
  });

  describe("Fixture C — warn-only", () => {
    it("returns exit code 0 when no criticals (warnings are non-blocking by default)", () => {
      const result = evaluateGate(fixtureC);
      assert.strictEqual(result.exitCode, 0);
    });

    it("returns exit code 2 when warnings exceed explicit threshold", () => {
      const result = evaluateGate(fixtureC, { maxWarnings: 2 });
      assert.strictEqual(result.exitCode, 2);
    });

    it("returns exit code 0 when warnings exactly equal threshold", () => {
      const result = evaluateGate(fixtureC, { maxWarnings: 3 });
      assert.strictEqual(result.exitCode, 0);
    });
  });

  describe("Fixture D — tool error (missing API key)", () => {
    it("returns exit code 3 when error field is present", () => {
      const result = evaluateGate(fixtureD);
      assert.strictEqual(result.exitCode, 3);
    });

    it("includes the error message in reason", () => {
      const result = evaluateGate(fixtureD);
      assert.ok(result.reason.includes("API key"), `Got: ${result.reason}`);
    });
  });

  describe("Fixture E — tool error (unreachable URL)", () => {
    it("returns exit code 3 when URL is unreachable", () => {
      const result = evaluateGate(fixtureE);
      assert.strictEqual(result.exitCode, 3);
    });
  });

  describe("edge cases", () => {
    it("returns exit code 3 for null review", () => {
      const result = evaluateGate(null);
      assert.strictEqual(result.exitCode, 3);
    });

    it("returns exit code 3 for undefined review", () => {
      const result = evaluateGate(undefined);
      assert.strictEqual(result.exitCode, 3);
    });

    it("returns exit code 3 when critical is not an array", () => {
      const result = evaluateGate({ critical: "broken", warnings: [] });
      assert.strictEqual(result.exitCode, 3);
    });

    it("returns exit code 0 for empty critical array", () => {
      const result = evaluateGate({ critical: [], warnings: [] });
      assert.strictEqual(result.exitCode, 0);
    });
  });
});

describe("formatCriticals — issue formatting for coding loop", () => {
  it("returns empty array when no criticals", () => {
    assert.deepStrictEqual(formatCriticals(fixtureA), []);
  });

  it("formats each critical as a readable string with route, viewport, element, and fix", () => {
    const lines = formatCriticals(fixtureB);
    assert.strictEqual(lines.length, 2);
    assert.ok(lines[0].includes("/pricing"));
    assert.ok(lines[0].includes("mobile"));
    assert.ok(lines[0].includes("Fix:"));
  });

  it("handles missing optional fields gracefully", () => {
    const review = {
      critical: [{ element: "nav", issue: "broken", fix: "fix it" }],
    };
    const lines = formatCriticals(review);
    assert.strictEqual(lines.length, 1);
    assert.ok(lines[0].includes("broken"));
  });

  it("returns empty array for null review", () => {
    assert.deepStrictEqual(formatCriticals(null), []);
  });

  it("returns empty array when critical is not an array", () => {
    assert.deepStrictEqual(formatCriticals({ critical: null }), []);
  });
});
