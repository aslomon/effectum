/**
 * Subagent specialization definitions and stack/app-type mappings.
 * Drives the recommendation engine's subagent suggestions.
 */
"use strict";

/**
 * All available subagent specializations with the tags they match.
 * @type {Array<{ key: string, label: string, tags: string[] }>}
 */
const SUBAGENT_SPECS = [
  {
    key: "frontend-developer",
    label: "Frontend Developer",
    tags: ["frontend-heavy", "ui-design"],
  },
  {
    key: "backend-developer",
    label: "Backend Developer",
    tags: ["backend-heavy", "api-first", "db-needed"],
  },
  {
    key: "fullstack-developer",
    label: "Fullstack Developer",
    tags: ["frontend-heavy", "db-needed"],
  },
  {
    key: "react-specialist",
    label: "React Specialist",
    tags: ["nextjs", "react"],
  },
  {
    key: "nextjs-developer",
    label: "Next.js Developer",
    tags: ["nextjs"],
  },
  {
    key: "postgres-pro",
    label: "PostgreSQL Pro",
    tags: ["db-needed", "supabase", "postgres"],
  },
  {
    key: "security-engineer",
    label: "Security Engineer",
    tags: ["auth-needed", "multi-user", "payments"],
  },
  {
    key: "test-automator",
    label: "Test Automator",
    tags: ["testing-heavy"],
  },
  {
    key: "api-designer",
    label: "API Designer",
    tags: ["api-first", "api-design"],
  },
  {
    key: "ui-designer",
    label: "UI Designer",
    tags: ["native-ui", "ui-design"],
  },
  {
    key: "debugger",
    label: "Debugger",
    tags: ["data-pipeline", "compute-heavy"],
  },
  {
    key: "performance-engineer",
    label: "Performance Engineer",
    tags: ["compute-heavy", "data-pipeline"],
  },
  {
    key: "devops-engineer",
    label: "DevOps Engineer",
    tags: ["automation", "background-jobs", "devops"],
  },
  {
    key: "docker-expert",
    label: "Docker Expert",
    tags: ["automation", "devops"],
  },
  {
    key: "typescript-pro",
    label: "TypeScript Pro",
    tags: ["nextjs", "typescript"],
  },
  {
    key: "mcp-developer",
    label: "MCP Developer",
    tags: ["ai-agent", "mcp"],
  },
  {
    key: "code-reviewer",
    label: "Code Reviewer",
    tags: ["testing-heavy", "docs-needed"],
  },
];

/**
 * Stack-specific base subagent recommendations.
 * These are always included for the given stack, regardless of tags.
 * @type {Record<string, string[]>}
 */
const STACK_SUBAGENTS = {
  "nextjs-supabase": [
    "frontend-developer",
    "backend-developer",
    "postgres-pro",
    "security-engineer",
    "test-automator",
  ],
  "python-fastapi": [
    "backend-developer",
    "debugger",
    "security-engineer",
    "test-automator",
    "api-designer",
  ],
  "swift-ios": ["ui-designer", "test-automator"],
  generic: ["debugger", "test-automator"],
};

module.exports = { SUBAGENT_SPECS, STACK_SUBAGENTS };
