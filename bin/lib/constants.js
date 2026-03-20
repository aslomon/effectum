/**
 * Shared constants for the Effectum CLI.
 * Autonomy levels, formatter mappings, MCP server definitions, stack choices.
 *
 * Language and app-type definitions have moved to their own modules:
 *   - languages.js  (LANGUAGE_CHOICES, LANGUAGE_INSTRUCTIONS)
 *   - app-types.js  (APP_TYPE_CHOICES, APP_TYPE_TAGS)
 */
"use strict";

// Re-export from new modules for backward compatibility
const { LANGUAGE_CHOICES, LANGUAGE_INSTRUCTIONS } = require("./languages");
const { APP_TYPE_CHOICES, APP_TYPE_TAGS } = require("./app-types");

/** @type {Record<string, { defaultMode: string, permissions: { allow: string[] } }>} */
const AUTONOMY_MAP = {
  conservative: {
    defaultMode: "default",
    permissions: {
      allow: ["Read(*)", "Glob(*)", "Grep(*)", "WebFetch(*)", "WebSearch(*)"],
    },
  },
  standard: {
    defaultMode: "default",
    permissions: {
      allow: [
        "Bash(*)",
        "Read(*)",
        "Write(*)",
        "Edit(*)",
        "Glob(*)",
        "Grep(*)",
        "WebFetch(*)",
        "WebSearch(*)",
        "Task(*)",
        "NotebookEdit(*)",
      ],
    },
  },
  full: {
    defaultMode: "bypassPermissions",
    permissions: {
      allow: [
        "Bash(*)",
        "Read(*)",
        "Write(*)",
        "Edit(*)",
        "Glob(*)",
        "Grep(*)",
        "WebFetch(*)",
        "WebSearch(*)",
        "Task(*)",
        "NotebookEdit(*)",
      ],
    },
  },
};

/** @type {Record<string, { command: string, name: string, glob: string }>} */
const FORMATTER_MAP = {
  "nextjs-supabase": {
    command: "npx prettier --write",
    name: "Prettier",
    glob: "ts|tsx|js|jsx|json|css|md",
  },
  "python-fastapi": {
    command: "ruff format",
    name: "Ruff",
    glob: "py",
  },
  "swift-ios": {
    command: "swift-format format -i",
    name: "swift-format",
    glob: "swift",
  },
  generic: {
    command: "echo no-formatter-configured",
    name: "None",
    glob: "*",
  },
};

/** @type {Array<{ key: string, label: string, package: string, desc: string, config?: object, configFn?: function }>} */
const MCP_SERVERS = [
  {
    key: "context7",
    label: "Context7",
    package: "@upstash/context7-mcp",
    desc: "Up-to-date library docs for Claude",
    config: {
      command: "npx",
      args: ["-y", "@upstash/context7-mcp"],
    },
  },
  {
    key: "playwright",
    label: "Playwright MCP",
    package: "@playwright/mcp",
    desc: "E2E browser automation — required for /e2e",
    config: {
      command: "npx",
      args: ["-y", "@playwright/mcp"],
    },
  },
  {
    key: "sequential-thinking",
    label: "Sequential Thinking",
    package: "@modelcontextprotocol/server-sequential-thinking",
    desc: "Complex planning and multi-step reasoning",
    config: {
      command: "npx",
      args: ["-y", "@modelcontextprotocol/server-sequential-thinking"],
    },
  },
  {
    key: "filesystem",
    label: "Filesystem",
    package: "@modelcontextprotocol/server-filesystem",
    desc: "File operations (read/write/search)",
    configFn: (cwd) => ({
      command: "npx",
      args: ["-y", "@modelcontextprotocol/server-filesystem", cwd],
    }),
  },
];

/** @type {Array<{ value: string, label: string, hint: string }>} */
const STACK_CHOICES = [
  {
    value: "nextjs-supabase",
    label: "Next.js + Supabase",
    hint: "Full-stack TypeScript with Tailwind, Shadcn, Supabase",
  },
  {
    value: "python-fastapi",
    label: "Python + FastAPI",
    hint: "Backend APIs with Pydantic, SQLAlchemy, Alembic",
  },
  {
    value: "swift-ios",
    label: "Swift / SwiftUI",
    hint: "Native Apple apps with SwiftData, SPM",
  },
  {
    value: "generic",
    label: "Generic",
    hint: "Stack-agnostic baseline — customize after setup",
  },
];

/** @type {Array<{ value: string, label: string, hint: string }>} */
const AUTONOMY_CHOICES = [
  {
    value: "conservative",
    label: "Conservative",
    hint: "Read-only tools allowed, ask before write/execute",
  },
  {
    value: "standard",
    label: "Standard",
    hint: "Read + Write + Bash allowed, ask for dangerous ops",
  },
  {
    value: "full",
    label: "Full Autonomy",
    hint: "Bypass all permission prompts — trust Claude fully",
  },
];

module.exports = {
  AUTONOMY_MAP,
  FORMATTER_MAP,
  MCP_SERVERS,
  STACK_CHOICES,
  AUTONOMY_CHOICES,
  // Re-exported from languages.js / app-types.js
  LANGUAGE_CHOICES,
  LANGUAGE_INSTRUCTIONS,
  APP_TYPE_CHOICES,
  APP_TYPE_TAGS,
};
