"use strict";

const { describe, it } = require("node:test");
const assert = require("node:assert/strict");
const { extractTags, recommend } = require("../bin/lib/recommendation");

describe("extractTags", () => {
  it("extracts tags from stack", () => {
    const tags = extractTags({
      appType: "web-app",
      stack: "nextjs-supabase",
      description: "",
    });
    assert.ok(tags.includes("nextjs"));
    assert.ok(tags.includes("react"));
    assert.ok(tags.includes("supabase"));
  });

  it("extracts tags from description keywords", () => {
    const tags = extractTags({
      appType: "web-app",
      stack: "generic",
      description: "a dashboard with auth and payment processing",
    });
    assert.ok(tags.includes("dashboard"));
    assert.ok(tags.includes("auth-needed"));
    assert.ok(tags.includes("payments"));
  });

  it("returns empty-ish for generic stack and empty description", () => {
    const tags = extractTags({
      appType: "other",
      stack: "generic",
      description: "",
    });
    // Should still contain app-type tags if defined, but no stack or keyword tags
    assert.ok(Array.isArray(tags));
  });
});

describe("recommend", () => {
  it("returns a complete recommendation object", () => {
    const rec = recommend({
      stack: "nextjs-supabase",
      appType: "web-app",
      description: "SaaS dashboard",
      autonomyLevel: "standard",
      language: "english",
    });
    assert.ok(Array.isArray(rec.commands));
    assert.ok(Array.isArray(rec.hooks));
    assert.ok(Array.isArray(rec.skills));
    assert.ok(Array.isArray(rec.mcps));
    assert.ok(Array.isArray(rec.subagents));
    assert.ok(Array.isArray(rec.tags));
    assert.strictEqual(typeof rec.agentTeams, "boolean");
  });

  it("always includes core commands", () => {
    const rec = recommend({
      stack: "generic",
      appType: "other",
      description: "",
      autonomyLevel: "standard",
      language: "english",
    });
    assert.ok(rec.commands.includes("plan"));
    assert.ok(rec.commands.includes("tdd"));
    assert.ok(rec.commands.includes("verify"));
  });

  it("always includes core MCP servers", () => {
    const rec = recommend({
      stack: "generic",
      appType: "other",
      description: "",
      autonomyLevel: "standard",
      language: "english",
    });
    assert.ok(rec.mcps.includes("context7"));
    assert.ok(rec.mcps.includes("playwright"));
  });
});
