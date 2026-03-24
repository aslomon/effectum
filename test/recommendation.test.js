"use strict";

/**
 * Unit tests for recommendation.js
 * Tests: extractTags, recommend(), foundation items, keywords, autonomy levels.
 */

const { test, describe } = require("node:test");
const assert = require("node:assert/strict");

const {
  extractTags,
  recommend,
  suggestTeams,
  COMMAND_RULES,
  MCP_RULES,
} = require("../bin/lib/recommendation.js");

// ─── extractTags ────────────────────────────────────────────────────────────

describe("extractTags", () => {
  test("returns stack tags for nextjs-supabase", () => {
    const tags = extractTags({
      appType: "other",
      stack: "nextjs-supabase",
      description: "",
    });
    assert.ok(tags.includes("nextjs"), "should include nextjs");
    assert.ok(tags.includes("react"), "should include react");
    assert.ok(tags.includes("supabase"), "should include supabase");
    assert.ok(tags.includes("typescript"), "should include typescript");
    assert.ok(tags.includes("db-needed"), "should include db-needed");
  });

  test("returns stack tags for python-fastapi", () => {
    const tags = extractTags({
      appType: "other",
      stack: "python-fastapi",
      description: "",
    });
    assert.ok(tags.includes("python"), "should include python");
    assert.ok(tags.includes("api-first"), "should include api-first");
    assert.ok(tags.includes("backend-heavy"), "should include backend-heavy");
  });

  test("returns appType tags for web-app", () => {
    const tags = extractTags({
      appType: "web-app",
      stack: "generic",
      description: "",
    });
    assert.ok(tags.includes("frontend-heavy"), "should include frontend-heavy");
    assert.ok(tags.includes("auth-needed"), "should include auth-needed");
    assert.ok(tags.includes("db-needed"), "should include db-needed");
    assert.ok(tags.includes("ui-design"), "should include ui-design");
  });

  test("description keyword 'crm' adds crm and related tags", () => {
    const tags = extractTags({
      appType: "other",
      stack: "generic",
      description: "A CRM tool for managing customers",
    });
    assert.ok(tags.includes("crm"), "should include crm");
    assert.ok(tags.includes("internal-tool"), "should include internal-tool");
    assert.ok(tags.includes("auth-needed"), "should include auth-needed");
    assert.ok(tags.includes("db-needed"), "should include db-needed");
    assert.ok(tags.includes("multi-user"), "should include multi-user");
  });

  test("description keyword 'dashboard' adds dashboard tags", () => {
    const tags = extractTags({
      appType: "other",
      stack: "generic",
      description: "Analytics dashboard for tracking sales",
    });
    assert.ok(tags.includes("dashboard"), "should include dashboard");
    assert.ok(
      tags.includes("data-visualization"),
      "should include data-visualization",
    );
  });

  test("description keyword 'supabase' adds supabase and db-needed", () => {
    const tags = extractTags({
      appType: "other",
      stack: "generic",
      description: "A supabase backend service",
    });
    assert.ok(tags.includes("supabase"), "should include supabase");
    assert.ok(tags.includes("db-needed"), "should include db-needed");
  });

  test("description keyword 'stripe' adds payments and auth-needed", () => {
    const tags = extractTags({
      appType: "other",
      stack: "generic",
      description: "Integrate stripe payments",
    });
    assert.ok(tags.includes("payments"), "should include payments");
    assert.ok(tags.includes("auth-needed"), "should include auth-needed");
  });

  test("returns empty array for completely empty inputs", () => {
    const tags = extractTags({
      appType: "other",
      stack: "generic",
      description: "",
    });
    assert.deepEqual(tags, [], "should return empty array");
  });

  test("returns deduplicated tags (no duplicates)", () => {
    // 'next' and 'nextjs' keywords in description + nextjs-supabase stack both add 'nextjs'
    const tags = extractTags({
      appType: "other",
      stack: "nextjs-supabase",
      description: "A Next.js nextjs app",
    });
    const unique = new Set(tags);
    assert.equal(
      tags.length,
      unique.size,
      "tags should not contain duplicates",
    );
  });

  test("description is case-insensitive", () => {
    const tags = extractTags({
      appType: "other",
      stack: "generic",
      description: "CRM DASHBOARD Auth",
    });
    assert.ok(tags.includes("crm"), "should match 'CRM' case-insensitively");
    assert.ok(
      tags.includes("dashboard"),
      "should match 'DASHBOARD' case-insensitively",
    );
    assert.ok(
      tags.includes("auth-needed"),
      "should match 'Auth' case-insensitively",
    );
  });
});

// ─── recommend() for Next.js + Web App ───────────────────────────────────────

describe("recommend() for Next.js + Web App", () => {
  const result = recommend({
    stack: "nextjs-supabase",
    appType: "web-app",
    description: "A full-stack web app with dashboard and auth",
    autonomyLevel: "standard",
    language: "english",
  });

  test("returns commands array", () => {
    assert.ok(Array.isArray(result.commands), "commands should be an array");
    assert.ok(result.commands.length > 0, "commands should not be empty");
  });

  test("returns mcps array", () => {
    assert.ok(Array.isArray(result.mcps), "mcps should be an array");
    assert.ok(result.mcps.length > 0, "mcps should not be empty");
  });

  test("returns subagents array", () => {
    assert.ok(Array.isArray(result.subagents), "subagents should be an array");
    assert.ok(result.subagents.length > 0, "subagents should not be empty");
  });

  test("returns tags array", () => {
    assert.ok(Array.isArray(result.tags), "tags should be an array");
    assert.ok(result.tags.length > 0, "tags should not be empty");
  });

  test("includes stack-specific subagents for nextjs-supabase", () => {
    assert.ok(
      result.subagents.includes("frontend-developer"),
      "should include frontend-developer",
    );
    assert.ok(
      result.subagents.includes("backend-developer"),
      "should include backend-developer",
    );
    assert.ok(
      result.subagents.includes("postgres-pro"),
      "should include postgres-pro",
    );
  });

  test("includes skills for frontend-heavy stack", () => {
    assert.ok(
      result.skills.includes("frontend-design"),
      "should include frontend-design skill",
    );
    assert.ok(
      result.skills.includes("webapp-testing"),
      "should include webapp-testing skill",
    );
  });
});

// ─── recommend() for Python + API ────────────────────────────────────────────

describe("recommend() for Python + API", () => {
  const nextResult = recommend({
    stack: "nextjs-supabase",
    appType: "web-app",
    description: "A dashboard web app",
    autonomyLevel: "standard",
    language: "english",
  });

  const pythonResult = recommend({
    stack: "python-fastapi",
    appType: "api-backend",
    description: "A REST API backend service",
    autonomyLevel: "standard",
    language: "english",
  });

  test("python result has different subagents than nextjs", () => {
    assert.notDeepEqual(
      new Set(pythonResult.subagents),
      new Set(nextResult.subagents),
      "Python and Next.js subagents should differ",
    );
  });

  test("python stack includes backend-specific subagents", () => {
    assert.ok(
      pythonResult.subagents.includes("backend-developer"),
      "should include backend-developer",
    );
    assert.ok(
      pythonResult.subagents.includes("api-designer"),
      "should include api-designer",
    );
    assert.ok(
      pythonResult.subagents.includes("debugger"),
      "should include debugger",
    );
  });

  test("python result does not include nextjs-specific subagents", () => {
    assert.ok(
      !pythonResult.subagents.includes("react-specialist"),
      "should not include react-specialist",
    );
    assert.ok(
      !pythonResult.subagents.includes("nextjs-developer"),
      "should not include nextjs-developer",
    );
  });

  test("python tags include python and api-first", () => {
    assert.ok(
      pythonResult.tags.includes("python"),
      "tags should include python",
    );
    assert.ok(
      pythonResult.tags.includes("api-first"),
      "tags should include api-first",
    );
  });

  test("python tags do not include nextjs", () => {
    assert.ok(
      !pythonResult.tags.includes("nextjs"),
      "tags should not include nextjs",
    );
  });
});

// ─── Foundation Commands ──────────────────────────────────────────────────────

describe("Foundation Commands are always in recommendations", () => {
  const alwaysCommands = COMMAND_RULES.filter((r) => r.always).map(
    (r) => r.key,
  );

  const stacks = ["nextjs-supabase", "python-fastapi", "swift-ios", "generic"];
  const appTypes = ["web-app", "api-backend", "cli-tool", "other"];

  for (const stack of stacks) {
    for (const appType of appTypes) {
      test(`stack=${stack} appType=${appType} always includes foundation commands`, () => {
        const result = recommend({
          stack,
          appType,
          description: "",
          autonomyLevel: "standard",
          language: "english",
        });
        for (const cmd of alwaysCommands) {
          assert.ok(
            result.commands.includes(cmd),
            `should include always-command: ${cmd}`,
          );
        }
      });
    }
  }
});

// ─── Foundation MCPs ──────────────────────────────────────────────────────────

describe("Foundation MCPs are always in recommendations", () => {
  const alwaysMcps = MCP_RULES.filter((r) => r.always).map((r) => r.key);

  test("always MCPs present for minimal input", () => {
    const result = recommend({
      stack: "generic",
      appType: "other",
      description: "",
      autonomyLevel: "standard",
      language: "english",
    });
    for (const mcp of alwaysMcps) {
      assert.ok(result.mcps.includes(mcp), `should always include MCP: ${mcp}`);
    }
  });

  test("always MCPs present for nextjs-supabase web-app", () => {
    const result = recommend({
      stack: "nextjs-supabase",
      appType: "web-app",
      description: "dashboard",
      autonomyLevel: "standard",
      language: "english",
    });
    for (const mcp of alwaysMcps) {
      assert.ok(result.mcps.includes(mcp), `should always include MCP: ${mcp}`);
    }
  });

  test("always MCPs present for python-fastapi api-backend", () => {
    const result = recommend({
      stack: "python-fastapi",
      appType: "api-backend",
      description: "REST API",
      autonomyLevel: "standard",
      language: "english",
    });
    for (const mcp of alwaysMcps) {
      assert.ok(result.mcps.includes(mcp), `should always include MCP: ${mcp}`);
    }
  });
});

// ─── Description Keywords → Tags ─────────────────────────────────────────────

describe("Description keywords influence tags", () => {
  test("'CRM' keyword adds crm tag", () => {
    const tags = extractTags({
      appType: "other",
      stack: "generic",
      description: "Build a CRM system",
    });
    assert.ok(tags.includes("crm"), "CRM keyword should add crm tag");
  });

  test("'saas' keyword adds multi-tenant, multi-user, payments tags", () => {
    const tags = extractTags({
      appType: "other",
      stack: "generic",
      description: "A SaaS product for teams",
    });
    assert.ok(tags.includes("multi-tenant"), "saas should add multi-tenant");
    assert.ok(tags.includes("multi-user"), "saas should add multi-user");
    assert.ok(tags.includes("payments"), "saas should add payments");
  });

  test("'realtime' keyword adds realtime and websocket tags", () => {
    const tags = extractTags({
      appType: "other",
      stack: "generic",
      description: "A realtime chat",
    });
    assert.ok(
      tags.includes("realtime"),
      "realtime keyword should add realtime",
    );
    assert.ok(
      tags.includes("websocket"),
      "realtime keyword should add websocket",
    );
  });

  test("'agent' keyword adds ai-agent tag", () => {
    const tags = extractTags({
      appType: "other",
      stack: "generic",
      description: "AI agent pipeline",
    });
    assert.ok(tags.includes("ai-agent"), "agent keyword should add ai-agent");
  });

  test("'stripe' keyword adds payments and auth-needed", () => {
    const tags = extractTags({
      appType: "other",
      stack: "generic",
      description: "Integrate stripe for billing",
    });
    assert.ok(tags.includes("payments"), "stripe should add payments");
    assert.ok(tags.includes("auth-needed"), "stripe should add auth-needed");
  });

  test("'mcp' keyword adds mcp and ai-agent tags", () => {
    const tags = extractTags({
      appType: "other",
      stack: "generic",
      description: "Build an MCP server",
    });
    assert.ok(tags.includes("mcp"), "mcp keyword should add mcp tag");
    assert.ok(tags.includes("ai-agent"), "mcp keyword should add ai-agent tag");
  });
});

// ─── Autonomy Levels ──────────────────────────────────────────────────────────

describe("Autonomy levels — recommend() returns consistent shape", () => {
  const levels = ["conservative", "standard", "full"];

  for (const level of levels) {
    test(`autonomyLevel=${level} returns valid recommendation shape`, () => {
      const result = recommend({
        stack: "nextjs-supabase",
        appType: "web-app",
        description: "A dashboard app",
        autonomyLevel: level,
        language: "english",
      });
      assert.ok(
        Array.isArray(result.commands),
        `commands should be array for level=${level}`,
      );
      assert.ok(
        Array.isArray(result.hooks),
        `hooks should be array for level=${level}`,
      );
      assert.ok(
        Array.isArray(result.skills),
        `skills should be array for level=${level}`,
      );
      assert.ok(
        Array.isArray(result.mcps),
        `mcps should be array for level=${level}`,
      );
      assert.ok(
        Array.isArray(result.subagents),
        `subagents should be array for level=${level}`,
      );
      assert.ok(
        Array.isArray(result.tags),
        `tags should be array for level=${level}`,
      );
      assert.equal(
        typeof result.agentTeams,
        "boolean",
        `agentTeams should be boolean for level=${level}`,
      );
    });

    test(`autonomyLevel=${level} foundation commands are still present`, () => {
      const alwaysCommands = COMMAND_RULES.filter((r) => r.always).map(
        (r) => r.key,
      );
      const result = recommend({
        stack: "generic",
        appType: "other",
        description: "",
        autonomyLevel: level,
        language: "english",
      });
      for (const cmd of alwaysCommands) {
        assert.ok(
          result.commands.includes(cmd),
          `level=${level} should include always-command: ${cmd}`,
        );
      }
    });
  }
});

// ─── suggestTeams() ──────────────────────────────────────────────────────────

describe("suggestTeams()", () => {
  test("≥10 ACs + ≥2 modules → suggestTeams = true", () => {
    const result = suggestTeams({
      acCount: 12,
      moduleCount: 3,
      parallelStreams: 1,
    });
    assert.equal(
      result.suggestTeams,
      true,
      "should suggest teams for high AC count + multiple modules",
    );
  });

  test("4-9 ACs + 1 module → suggestTeams = false", () => {
    const result = suggestTeams({
      acCount: 7,
      moduleCount: 1,
      parallelStreams: 1,
    });
    assert.equal(
      result.suggestTeams,
      false,
      "should not suggest teams for moderate ACs in a single module",
    );
  });

  test("≤5 ACs + 1 module → suggestTeams = false", () => {
    const result = suggestTeams({
      acCount: 4,
      moduleCount: 1,
      parallelStreams: 1,
    });
    assert.equal(
      result.suggestTeams,
      false,
      "should not suggest teams for small projects",
    );
  });

  test("parallelStreams ≥ 3 combined with high ACs → suggestTeams = true", () => {
    const result = suggestTeams({
      acCount: 12,
      moduleCount: 1,
      parallelStreams: 3,
    });
    assert.equal(
      result.suggestTeams,
      true,
      "should suggest teams when parallel streams and ACs are both high",
    );
  });

  test("result shape has { suggestTeams, reason, recommendedProfile }", () => {
    const result = suggestTeams({
      acCount: 1,
      moduleCount: 1,
      parallelStreams: 0,
    });
    assert.ok("suggestTeams" in result, "result must have suggestTeams");
    assert.ok("reason" in result, "result must have reason");
    assert.ok(
      "recommendedProfile" in result,
      "result must have recommendedProfile",
    );
    assert.equal(
      typeof result.suggestTeams,
      "boolean",
      "suggestTeams must be boolean",
    );
    assert.equal(typeof result.reason, "string", "reason must be string");
  });
});
