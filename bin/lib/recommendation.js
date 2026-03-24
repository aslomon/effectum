/**
 * Intelligent Setup Recommender — rules-based recommendation engine v1.
 *
 * Derives a complete Claude Code setup from:
 *   stack + appType + description + autonomyLevel + language
 *
 * Returns: commands, hooks, skills, mcps, subagents, agentTeams flag.
 */
"use strict";

const { APP_TYPE_TAGS } = require("./app-types");
const { SUBAGENT_SPECS, STACK_SUBAGENTS } = require("./specializations");
const { MCP_SERVERS } = require("./constants");

// ─── Keyword → Tag mapping ─────────────────────────────────────────────────

/**
 * Description keywords mapped to intent tags.
 * @type {Record<string, string[]>}
 */
const KEYWORD_TAG_MAP = {
  dashboard: ["dashboard", "frontend-heavy", "data-visualization"],
  crm: ["crm", "internal-tool", "auth-needed", "db-needed", "multi-user"],
  admin: ["internal-tool", "auth-needed", "db-needed", "multi-user"],
  auth: ["auth-needed"],
  login: ["auth-needed"],
  signup: ["auth-needed"],
  register: ["auth-needed"],
  api: ["api-first"],
  rest: ["api-first"],
  graphql: ["api-first", "graphql"],
  database: ["db-needed"],
  postgres: ["db-needed", "postgres"],
  supabase: ["supabase", "db-needed"],
  "e-commerce": ["e-commerce", "payments", "auth-needed", "db-needed"],
  ecommerce: ["e-commerce", "payments", "auth-needed", "db-needed"],
  shop: ["e-commerce", "payments", "auth-needed", "db-needed"],
  payment: ["payments", "auth-needed"],
  stripe: ["payments", "auth-needed"],
  chat: ["realtime", "websocket", "multi-user"],
  realtime: ["realtime", "websocket"],
  websocket: ["realtime", "websocket"],
  ai: ["ai-agent"],
  agent: ["ai-agent"],
  llm: ["ai-agent"],
  openai: ["ai-agent"],
  claude: ["ai-agent"],
  bot: ["ai-agent", "automation"],
  automation: ["automation", "background-jobs"],
  workflow: ["automation", "background-jobs"],
  cron: ["automation", "background-jobs"],
  blog: ["content", "seo", "frontend-heavy"],
  cms: ["content", "auth-needed", "db-needed"],
  portfolio: ["content", "seo", "frontend-heavy"],
  landing: ["content", "seo", "frontend-heavy"],
  saas: ["multi-user", "auth-needed", "db-needed", "payments", "multi-tenant"],
  "multi-tenant": ["multi-tenant", "multi-user", "auth-needed"],
  tenant: ["multi-tenant", "multi-user"],
  analytics: ["analytics", "data-visualization", "db-needed"],
  monitoring: ["analytics", "data-visualization", "realtime"],
  docker: ["devops", "automation"],
  kubernetes: ["devops", "automation"],
  ci: ["devops", "automation"],
  deploy: ["devops"],
  test: ["testing-heavy"],
  testing: ["testing-heavy"],
  e2e: ["testing-heavy", "e2e"],
  mobile: ["native-ui", "frontend-heavy"],
  ios: ["native-ui", "swift"],
  android: ["native-ui"],
  react: ["react", "frontend-heavy"],
  next: ["nextjs", "frontend-heavy"],
  nextjs: ["nextjs", "frontend-heavy"],
  python: ["python"],
  fastapi: ["python", "api-first"],
  django: ["python", "frontend-heavy", "db-needed"],
  swift: ["swift", "native-ui"],
  electron: ["desktop", "frontend-heavy"],
  tauri: ["desktop", "frontend-heavy"],
  cli: ["terminal-ui", "scripting"],
  scraper: ["automation", "data-pipeline"],
  crawler: ["automation", "data-pipeline"],
  pipeline: ["data-pipeline", "automation"],
  etl: ["data-pipeline", "automation"],
  ml: ["data-pipeline", "compute-heavy"],
  "machine learning": ["data-pipeline", "compute-heavy"],
  model: ["data-pipeline", "compute-heavy"],
  library: ["api-design", "testing-heavy", "docs-needed"],
  sdk: ["api-design", "testing-heavy", "docs-needed"],
  plugin: ["api-design", "testing-heavy"],
  mcp: ["mcp", "ai-agent"],
  security: ["auth-needed", "security"],
  upload: ["storage", "file-handling"],
  image: ["storage", "file-handling"],
  file: ["storage", "file-handling"],
  notification: ["realtime", "multi-user"],
  email: ["automation", "multi-user"],
};

// ─── Stack → Tag mapping ────────────────────────────────────────────────────

/** @type {Record<string, string[]>} */
const STACK_TAGS = {
  "nextjs-supabase": [
    "nextjs",
    "react",
    "supabase",
    "typescript",
    "frontend-heavy",
    "db-needed",
    "postgres",
  ],
  "python-fastapi": ["python", "api-first", "backend-heavy"],
  "swift-ios": ["swift", "native-ui", "frontend-heavy"],
  generic: [],
};

// ─── Tag extraction ─────────────────────────────────────────────────────────

/**
 * Extract intent tags from all inputs.
 * @param {{ appType: string, stack: string, description: string }} input
 * @returns {string[]}
 */
function extractTags({ appType, stack, description }) {
  const tags = new Set();

  // App-type tags
  const appTags = APP_TYPE_TAGS[appType] || [];
  appTags.forEach((t) => tags.add(t));

  // Stack tags
  const stackTags = STACK_TAGS[stack] || [];
  stackTags.forEach((t) => tags.add(t));

  // Description keyword matching
  const lower = (description || "").toLowerCase();
  for (const [keyword, keyTags] of Object.entries(KEYWORD_TAG_MAP)) {
    if (lower.includes(keyword)) {
      keyTags.forEach((t) => tags.add(t));
    }
  }

  return [...tags];
}

// ─── Recommendation rules ───────────────────────────────────────────────────

/**
 * All available optional commands with the tags that trigger them.
 * @type {Array<{ key: string, label: string, tags: string[], always?: boolean }>}
 */
const COMMAND_RULES = [
  { key: "plan", label: "/plan", tags: [], always: true },
  { key: "tdd", label: "/tdd", tags: [], always: true },
  { key: "verify", label: "/verify", tags: [], always: true },
  { key: "code-review", label: "/code-review", tags: [], always: true },
  { key: "build-fix", label: "/build-fix", tags: [], always: true },
  { key: "refactor-clean", label: "/refactor-clean", tags: [], always: true },
  { key: "e2e", label: "/e2e", tags: [], always: true },
  { key: "ralph-loop", label: "/ralph-loop", tags: [], always: true },
  { key: "checkpoint", label: "/checkpoint", tags: [], always: true },
  { key: "update-docs", label: "/update-docs", tags: ["docs-needed"] },
  { key: "test-coverage", label: "/test-coverage", tags: ["testing-heavy"] },
  {
    key: "simplify",
    label: "/simplify",
    tags: ["backend-heavy", "frontend-heavy"],
  },
];

/**
 * Optional hooks (beyond foundation) with trigger tags.
 * @type {Array<{ key: string, label: string, tags: string[], always?: boolean }>}
 */
const HOOK_RULES = [
  { key: "commit-gate", label: "Commit Message Gate", tags: [], always: true },
  {
    key: "changelog-update",
    label: "CHANGELOG Auto-Update",
    tags: [],
    always: true,
  },
  {
    key: "completion-verifier",
    label: "Completion Verifier",
    tags: [],
    always: true,
  },
  {
    key: "subagent-verifier",
    label: "Subagent Quality Gate",
    tags: [],
    always: true,
  },
  {
    key: "desktop-notifications",
    label: "Desktop Notifications",
    tags: [],
    always: true,
  },
];

/**
 * Skills with trigger tags and mandatory-per-stack rules.
 * @type {Array<{ key: string, label: string, tags: string[], mandatoryForStacks?: string[] }>}
 */
const SKILL_RULES = [
  {
    key: "frontend-design",
    label: "Frontend Design",
    tags: ["frontend-heavy", "ui-design"],
    mandatoryForStacks: ["nextjs-supabase"],
  },
  {
    key: "security-check",
    label: "Security Check",
    tags: ["auth-needed", "multi-user", "payments", "security"],
  },
  {
    key: "webapp-testing",
    label: "Web App Testing",
    tags: ["frontend-heavy", "e2e"],
    mandatoryForStacks: ["nextjs-supabase"],
  },
  {
    key: "doc-coauthoring",
    label: "Doc Co-Authoring",
    tags: ["docs-needed"],
  },
  {
    key: "claude-api",
    label: "Claude API",
    tags: ["ai-agent"],
  },
  {
    key: "mcp-builder",
    label: "MCP Builder",
    tags: ["mcp", "ai-agent"],
  },
];

/**
 * MCP server trigger rules.
 * @type {Array<{ key: string, tags: string[], always?: boolean }>}
 */
const MCP_RULES = [
  { key: "context7", tags: [], always: true },
  { key: "playwright", tags: [], always: true },
  { key: "sequential-thinking", tags: [], always: true },
  { key: "filesystem", tags: ["file-handling", "storage"] },
];

// ─── Core recommendation functions ──────────────────────────────────────────

/**
 * Recommend commands based on tags.
 * @param {string[]} tags
 * @returns {string[]}
 */
function recommendCommands(tags) {
  const tagSet = new Set(tags);
  return COMMAND_RULES.filter(
    (r) => r.always || r.tags.some((t) => tagSet.has(t)),
  ).map((r) => r.key);
}

/**
 * Recommend optional hooks based on tags.
 * @param {string[]} tags
 * @returns {string[]}
 */
function recommendHooks(tags) {
  const tagSet = new Set(tags);
  return HOOK_RULES.filter(
    (r) => r.always || r.tags.some((t) => tagSet.has(t)),
  ).map((r) => r.key);
}

/**
 * Recommend skills based on tags and stack.
 * @param {string[]} tags
 * @param {string} stack
 * @returns {string[]}
 */
function recommendSkills(tags, stack) {
  const tagSet = new Set(tags);
  return SKILL_RULES.filter(
    (r) =>
      r.tags.some((t) => tagSet.has(t)) ||
      (r.mandatoryForStacks && r.mandatoryForStacks.includes(stack)),
  ).map((r) => r.key);
}

/**
 * Recommend MCP servers based on tags.
 * @param {string[]} tags
 * @returns {string[]}
 */
function recommendMcps(tags) {
  const tagSet = new Set(tags);
  return MCP_RULES.filter((r) => r.always || r.tags.some((t) => tagSet.has(t)))
    .map((r) => r.key)
    .filter((key) => MCP_SERVERS.some((s) => s.key === key));
}

/**
 * Recommend subagent specializations based on tags and stack.
 * @param {string[]} tags
 * @param {string} stack
 * @returns {string[]}
 */
function recommendSubagents(tags, stack) {
  const tagSet = new Set(tags);
  const result = new Set();

  // Stack base recommendations
  const stackBase = STACK_SUBAGENTS[stack] || STACK_SUBAGENTS.generic;
  stackBase.forEach((s) => result.add(s));

  // Tag-based additions
  for (const spec of SUBAGENT_SPECS) {
    if (spec.tags.some((t) => tagSet.has(t))) {
      result.add(spec.key);
    }
  }

  return [...result];
}

// ─── Agent Teams recommendation ─────────────────────────────────────────────

/**
 * Team profile metadata used for recommendations.
 * @type {Array<{ key: string, teammate_count: number, stacks: string[] }>}
 */
const TEAM_PROFILES = [
  {
    key: "web-feature",
    teammate_count: 3,
    stacks: ["nextjs-supabase", "nextjs-firebase", "nextjs-prisma"],
  },
  {
    key: "fullstack",
    teammate_count: 5,
    stacks: ["nextjs-supabase", "nextjs-firebase", "nextjs-prisma"],
  },
  {
    key: "frontend-only",
    teammate_count: 3,
    stacks: ["nextjs-supabase", "nextjs-firebase", "nextjs-prisma"],
  },
  {
    key: "review",
    teammate_count: 2,
    stacks: [
      "nextjs-supabase",
      "nextjs-firebase",
      "nextjs-prisma",
      "python-fastapi",
    ],
  },
  {
    key: "overnight-build",
    teammate_count: 4,
    stacks: ["nextjs-supabase", "nextjs-firebase", "nextjs-prisma"],
  },
];

/**
 * Determine whether Agent Teams should be suggested based on project complexity.
 *
 * Criteria (from PRD AC1):
 *   - Number of ACs > 10
 *   - Number of distinct modules > 2
 *   - Number of parallelizable workstreams > 2
 *
 * @param {{ acCount: number, moduleCount: number, parallelStreams: number }} metrics
 * @returns {{ suggestTeams: boolean, reason: string, recommendedProfile: string | null }}
 */
function suggestTeams({
  acCount = 0,
  moduleCount = 0,
  parallelStreams = 0,
} = {}) {
  const reasons = [];
  if (acCount > 10) reasons.push(`${acCount} ACs (>10)`);
  if (moduleCount > 2) reasons.push(`${moduleCount} modules (>2)`);
  if (parallelStreams > 2)
    reasons.push(`${parallelStreams} parallel streams (>2)`);

  const suggest = reasons.length >= 2;

  let recommendedProfile = null;
  if (suggest) {
    if (acCount >= 12 && moduleCount >= 3) {
      recommendedProfile =
        parallelStreams >= 4 ? "overnight-build" : "fullstack";
    } else if (moduleCount <= 2 && parallelStreams <= 3) {
      recommendedProfile = "web-feature";
    } else {
      recommendedProfile = "fullstack";
    }
  }

  return {
    suggestTeams: suggest,
    reason: suggest
      ? `This project may benefit from Agent Teams (experimental): ${reasons.join(", ")}`
      : "",
    recommendedProfile,
  };
}

// ─── Main recommendation entry point ────────────────────────────────────────

/**
 * Generate a complete recommended setup from user inputs.
 *
 * @param {{ stack: string, appType: string, description: string, autonomyLevel: string, language: string, acCount?: number, moduleCount?: number, parallelStreams?: number }} input
 * @returns {{ commands: string[], hooks: string[], skills: string[], mcps: string[], subagents: string[], agentTeams: boolean, suggestTeams: boolean, teamsReason: string, recommendedProfile: string | null, tags: string[] }}
 */
function recommend({
  stack,
  appType,
  description,
  autonomyLevel,
  language,
  acCount,
  moduleCount,
  parallelStreams,
}) {
  const tags = extractTags({ appType, stack, description });
  const teams = suggestTeams({ acCount, moduleCount, parallelStreams });

  return {
    commands: recommendCommands(tags),
    hooks: recommendHooks(tags),
    skills: recommendSkills(tags, stack),
    mcps: recommendMcps(tags),
    subagents: recommendSubagents(tags, stack),
    agentTeams: false,
    suggestTeams: teams.suggestTeams,
    teamsReason: teams.reason,
    recommendedProfile: teams.recommendedProfile,
    tags,
  };
}

// ─── Catalog accessors (for manual/customize mode) ──────────────────────────

/** Get all available commands for manual selection. */
function getAllCommands() {
  return COMMAND_RULES.map((r) => ({ key: r.key, label: r.label }));
}

/** Get all available optional hooks for manual selection. */
function getAllHooks() {
  return HOOK_RULES.map((r) => ({ key: r.key, label: r.label }));
}

/** Get all available skills for manual selection. */
function getAllSkills() {
  return SKILL_RULES.map((r) => ({ key: r.key, label: r.label }));
}

/** Get all available MCP servers for manual selection. */
function getAllMcps() {
  return MCP_SERVERS.map((s) => ({ key: s.key, label: s.label, desc: s.desc }));
}

/** Get all available subagent specializations for manual selection. */
function getAllSubagents() {
  return SUBAGENT_SPECS.map((s) => ({ key: s.key, label: s.label }));
}

module.exports = {
  recommend,
  extractTags,
  suggestTeams,
  getAllCommands,
  getAllHooks,
  getAllSkills,
  getAllMcps,
  getAllSubagents,
  COMMAND_RULES,
  HOOK_RULES,
  SKILL_RULES,
  MCP_RULES,
  TEAM_PROFILES,
};
