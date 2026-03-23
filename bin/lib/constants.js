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
  "django-postgres": {
    command: "ruff format",
    name: "Ruff",
    glob: "py",
  },
  "go-echo": {
    command: "gofmt -w",
    name: "gofmt",
    glob: "go",
  },
  "rust-actix": {
    command: "rustfmt",
    name: "rustfmt",
    glob: "rs",
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
    value: "django-postgres",
    label: "Django + PostgreSQL",
    hint: "Python web apps with Django ORM, DRF, PostgreSQL",
  },
  {
    value: "go-echo",
    label: "Go + Echo",
    hint: "Backend APIs with Echo v4, GORM, PostgreSQL, Air",
  },
  {
    value: "rust-actix",
    label: "Rust + Actix-Web",
    hint: "High-performance APIs with SQLx, PostgreSQL",
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

/** Ecosystem choices for modular composition Step 1 */
const ECOSYSTEM_CHOICES = [
  {
    value: "javascript",
    label: "JavaScript / TypeScript",
    hint: "Next.js, React, Vue, Express, Fastify",
  },
  { value: "python", label: "Python", hint: "Django, FastAPI, Flask" },
  { value: "go", label: "Go", hint: "Echo, Gin, Fiber" },
  { value: "swift", label: "Swift", hint: "SwiftUI, Vapor" },
  { value: "dart", label: "Dart / Flutter", hint: "Flutter, Firebase" },
  { value: "rust", label: "Rust", hint: "Actix-web, Axum" },
  { value: "custom", label: "Custom", hint: "Specify your own" },
];

/** Framework choices filtered by ecosystem (Step 2) */
const FRAMEWORK_CHOICES = {
  javascript: [
    {
      value: "nextjs",
      label: "Next.js",
      hint: "Full-stack React with App Router",
    },
    { value: "react", label: "React (Vite)", hint: "SPA with Vite bundler" },
    { value: "vue", label: "Vue / Nuxt", hint: "Vue.js or Nuxt framework" },
    { value: "express", label: "Express", hint: "Minimal Node.js backend" },
    { value: "fastify", label: "Fastify", hint: "Fast Node.js backend" },
    {
      value: "expo",
      label: "Expo / React Native",
      hint: "Cross-platform mobile",
    },
    { value: "custom", label: "Custom", hint: "Specify your own" },
  ],
  python: [
    {
      value: "django",
      label: "Django",
      hint: "Batteries-included web framework",
    },
    {
      value: "fastapi",
      label: "FastAPI",
      hint: "Async API framework with Pydantic",
    },
    { value: "flask", label: "Flask", hint: "Lightweight web framework" },
    { value: "custom", label: "Custom", hint: "Specify your own" },
  ],
  go: [
    { value: "echo", label: "Echo", hint: "High-performance HTTP framework" },
    { value: "gin", label: "Gin", hint: "Popular HTTP web framework" },
    { value: "fiber", label: "Fiber", hint: "Express-inspired web framework" },
    { value: "custom", label: "Custom", hint: "Specify your own" },
  ],
  swift: [
    { value: "swiftui", label: "SwiftUI", hint: "Native Apple UI framework" },
    { value: "vapor", label: "Vapor", hint: "Server-side Swift" },
    { value: "custom", label: "Custom", hint: "Specify your own" },
  ],
  dart: [
    { value: "flutter", label: "Flutter", hint: "Cross-platform UI toolkit" },
    { value: "custom", label: "Custom", hint: "Specify your own" },
  ],
  rust: [
    {
      value: "actix",
      label: "Actix-web",
      hint: "High-performance async web framework",
    },
    { value: "axum", label: "Axum", hint: "Tokio-based web framework" },
    { value: "custom", label: "Custom", hint: "Specify your own" },
  ],
};

/** Database choices filtered by framework (Step 3) */
const DATABASE_CHOICES = [
  {
    value: "supabase",
    label: "Supabase",
    hint: "PostgreSQL + Auth + Storage + Realtime",
  },
  {
    value: "firebase",
    label: "Firebase",
    hint: "Firestore + Auth + Cloud Functions",
  },
  { value: "convex", label: "Convex", hint: "Reactive backend platform" },
  { value: "postgresql", label: "PostgreSQL", hint: "Raw PostgreSQL" },
  { value: "mongodb", label: "MongoDB", hint: "Document database" },
  { value: "prisma", label: "Prisma + PostgreSQL", hint: "Type-safe ORM" },
  { value: "drizzle", label: "Drizzle + PostgreSQL", hint: "TypeScript ORM" },
  { value: "sqlalchemy", label: "SQLAlchemy", hint: "Python SQL toolkit" },
  { value: "gorm", label: "GORM", hint: "Go ORM library" },
  { value: "none", label: "None", hint: "No database" },
];

/** Auth choices (Step 3) */
const AUTH_CHOICES = [
  {
    value: "supabase-auth",
    label: "Supabase Auth",
    hint: "Built-in with Supabase",
  },
  {
    value: "firebase-auth",
    label: "Firebase Auth",
    hint: "Built-in with Firebase",
  },
  {
    value: "nextauth",
    label: "NextAuth / Auth.js",
    hint: "Flexible auth for Next.js",
  },
  { value: "clerk", label: "Clerk", hint: "Drop-in auth components" },
  { value: "custom", label: "Custom", hint: "Roll your own" },
  { value: "none", label: "None", hint: "No auth" },
];

/** Deploy choices (Step 4) */
const DEPLOY_CHOICES = [
  {
    value: "vercel",
    label: "Vercel",
    hint: "Serverless, edge, preview deploys",
  },
  { value: "netlify", label: "Netlify", hint: "JAMstack deployment" },
  { value: "railway", label: "Railway", hint: "Simple cloud hosting" },
  { value: "flyio", label: "Fly.io", hint: "Global edge deployment" },
  { value: "docker", label: "Docker", hint: "Container deployment" },
  { value: "aws", label: "AWS", hint: "Amazon Web Services" },
  { value: "appstore", label: "App Store", hint: "Apple/Google app stores" },
  { value: "custom", label: "Custom", hint: "Specify your own" },
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
  ECOSYSTEM_CHOICES,
  FRAMEWORK_CHOICES,
  DATABASE_CHOICES,
  AUTH_CHOICES,
  DEPLOY_CHOICES,
  // Re-exported from languages.js / app-types.js
  LANGUAGE_CHOICES,
  LANGUAGE_INSTRUCTIONS,
  APP_TYPE_CHOICES,
  APP_TYPE_TAGS,
};
