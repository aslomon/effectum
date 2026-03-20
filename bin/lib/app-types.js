/**
 * App type definitions and intent-based tag mappings.
 * Used by the recommendation engine to derive setup from project intent.
 */
"use strict";

/** @type {Array<{ value: string, label: string, hint: string }>} */
const APP_TYPE_CHOICES = [
  {
    value: "web-app",
    label: "Web App",
    hint: "Full-stack web application with UI",
  },
  {
    value: "api-backend",
    label: "API / Backend",
    hint: "REST or GraphQL API service",
  },
  {
    value: "mobile-app",
    label: "Mobile App",
    hint: "iOS, Android, or cross-platform",
  },
  {
    value: "desktop-app",
    label: "Desktop App",
    hint: "Native or Electron desktop application",
  },
  {
    value: "cli-tool",
    label: "CLI Tool",
    hint: "Command-line interface tool",
  },
  {
    value: "automation-agent",
    label: "Automation / Agent System",
    hint: "AI agents, bots, automation workflows",
  },
  {
    value: "data-ml",
    label: "Data / ML Tool",
    hint: "Data pipeline, ML model, analytics",
  },
  {
    value: "library-sdk",
    label: "Library / SDK",
    hint: "Reusable package or framework",
  },
  {
    value: "other",
    label: "Other",
    hint: "Something else entirely",
  },
];

/**
 * Tags implicitly associated with each app type.
 * These are combined with stack and description tags to drive recommendations.
 * @type {Record<string, string[]>}
 */
const APP_TYPE_TAGS = {
  "web-app": [
    "frontend-heavy",
    "auth-needed",
    "db-needed",
    "multi-user",
    "ui-design",
  ],
  "api-backend": [
    "api-first",
    "db-needed",
    "auth-needed",
    "backend-heavy",
    "docs-needed",
  ],
  "mobile-app": ["frontend-heavy", "native-ui", "offline-capable", "ui-design"],
  "desktop-app": ["frontend-heavy", "native-ui", "local-storage", "ui-design"],
  "cli-tool": ["terminal-ui", "scripting", "no-frontend", "docs-needed"],
  "automation-agent": [
    "ai-agent",
    "automation",
    "api-first",
    "background-jobs",
  ],
  "data-ml": [
    "data-pipeline",
    "analytics",
    "backend-heavy",
    "compute-heavy",
    "docs-needed",
  ],
  "library-sdk": ["api-design", "testing-heavy", "docs-needed", "no-frontend"],
  other: [],
};

module.exports = { APP_TYPE_CHOICES, APP_TYPE_TAGS };
