# PRD: Modular Stack Selection + Smart Auto-Detection

## Problem

Effectum's stack system has three issues:

1. **Rigid presets.** A user wanting Next.js + Firebase must choose "Generic" because only "Next.js + Supabase" exists as a preset. The system forces artificial combinations instead of letting users compose their stack.

2. **Broken detection.** `detect.js` maps Next.js → always "nextjs-supabase" even when using Firebase. Python → always "python-fastapi" even when using Django. No Go, Flutter, Convex, Firebase, Prisma detection.

3. **Redundant questions.** The configurator always asks for stack selection, even when the stack is obvious from `package.json`. An existing Next.js + Supabase project shouldn't need 4 stack questions.

## Goal

Replace rigid presets with a **modular, tree-based stack composition** that auto-detects what it can and only asks what's missing. The system should handle any combination of framework + database + auth + deploy, not just predefined combos.

## Design Decisions

- **Quick Presets remain** as 1-click shortcuts for common combos (Next.js+Supabase, Django+PostgreSQL, etc.)
- **4 composition steps** when building manually: Ecosystem → Framework → Backend/DB → Deploy
- **Testing + Formatter auto-resolved** from framework choice (never asked)
- **Confidence-based skip**: certain = confirm only, partial = ask missing parts, none = full flow
- **JSON-based detection rules** — extensible without code changes

## Acceptance Criteria

### Smart Auto-Detection

- [ ] AC1: New `system/detect/` directory with JSON detection rules per ecosystem
- [ ] AC2: `javascript.json` detects: next, react, vue, nuxt, express, fastify, expo, react-native + supabase, firebase, convex, prisma, drizzle, mongodb + nextauth, clerk, supabase-auth + vercel, netlify
- [ ] AC3: `python.json` detects: fastapi, django, flask + sqlalchemy, prisma-python + postgresql, mongodb
- [ ] AC4: `go.json` detects: echo, gin, fiber + gorm, pgx + postgresql
- [ ] AC5: `swift.json` detects: swiftui, vapor + coredata, swiftdata
- [ ] AC6: `dart.json` detects: flutter + firebase, supabase
- [ ] AC7: Each detection rule has: dependency name, what it detects, category (framework/database/auth/deploy/orm), weight for conflict resolution
- [ ] AC8: Detection returns structured result: `{ ecosystem, framework, database, auth, deploy, orm, confidence }`
- [ ] AC9: Confidence is: "certain" (framework+db+auth detected), "partial" (framework only), "none" (empty project)
- [ ] AC10: Bug fix: Next.js alone no longer maps to "nextjs-supabase" — it maps to "nextjs" with database=unknown
- [ ] AC11: go.mod parser reads Go module dependencies
- [ ] AC12: pubspec.yaml parser reads Flutter/Dart dependencies
- [ ] AC13: requirements.txt and pyproject.toml parser reads Python dependencies

### Configurator Skip Logic

- [ ] AC14: When confidence="certain": show "Detected: Next.js + Supabase + Vercel ✅" — user confirms with Enter or chooses "Change"
- [ ] AC15: When confidence="partial": pre-select detected framework, only ask for missing components (DB? Auth? Deploy?)
- [ ] AC16: When confidence="none": full modular selection flow
- [ ] AC17: Skip logic works in both interactive and non-interactive modes

### Modular Stack Composition (4 Steps)

- [ ] AC18: Step 1 — Ecosystem: JavaScript/TypeScript, Python, Go, Swift, Dart/Flutter, C#/.NET, Rust, Custom
- [ ] AC19: Step 2 — Framework (filtered by ecosystem): Next.js, React(Vite), Vue/Nuxt, Express, Fastify | Django, FastAPI, Flask | Echo, Gin, Fiber | SwiftUI, Vapor | Flutter | Custom
- [ ] AC20: Step 3 — Backend Services (filtered by framework, skipped for pure backends):
  - DB: Supabase, Firebase, Convex, PostgreSQL, MongoDB, Prisma+PG, Drizzle+PG, SQLAlchemy, GORM, None
  - Auth: Supabase Auth, Firebase Auth, NextAuth, Clerk, Custom, None
- [ ] AC21: Step 4 — Deploy (filtered): Vercel, Netlify, Railway, Fly.io, Docker, AWS, App Store, Custom
- [ ] AC22: Each step filters options based on previous selections (Next.js → shows web deploy, not App Store)
- [ ] AC23: Intelligent defaults: Next.js → Supabase pre-selected, Django → PostgreSQL pre-selected
- [ ] AC24: Custom option at every step

### Quick Presets

- [ ] AC25: Quick Presets are shown BEFORE the modular flow: "Use a preset or build your own?"
- [ ] AC26: Presets include at minimum: Next.js+Supabase+Vercel, Next.js+Firebase+Vercel, Next.js+Prisma+Vercel, Django+PostgreSQL+Docker, FastAPI+PostgreSQL+Docker, Go+Echo+PostgreSQL, Swift+SwiftUI, Flutter+Firebase
- [ ] AC27: Selecting a preset skips all 4 steps and goes directly to the next configurator phase
- [ ] AC28: Presets are defined as JSON in `system/presets/` — extensible

### CLAUDE.md from Modular Blocks

- [ ] AC29: New `system/blocks/` directory with template blocks per component
- [ ] AC30: Blocks exist for: ecosystem (javascript.md, python.md, go.md), framework (nextjs.md, django.md, etc.), database (supabase.md, firebase.md, prisma.md, etc.), deploy (vercel.md, docker.md, etc.)
- [ ] AC31: CLAUDE.md is composed by concatenating relevant blocks, not from a monolithic template
- [ ] AC32: Template substitution still works (project name, language, autonomy, etc.)
- [ ] AC33: Formatter and test framework are auto-resolved from framework block (not asked)
- [ ] AC34: guardrails.md is composed from framework + database blocks

### Backward Compatibility

- [ ] AC35: Existing preset names (nextjs-supabase, python-fastapi, etc.) still work in .effectum.json
- [ ] AC36: `reconfigure` handles both old preset format and new modular format
- [ ] AC37: --yes mode uses detected stack or falls back to sensible defaults
- [ ] AC38: Existing tests pass

## Scope

### In Scope
- `system/detect/*.json` — detection rules per ecosystem
- Refactored `bin/lib/detect.js` — JSON-based, modular
- `system/presets/*.json` — quick preset definitions
- `system/blocks/` — CLAUDE.md template blocks per component
- Updated `bin/lib/ui.js` — skip logic, modular composition flow
- Updated `bin/install.js` — integrate new detection + composition
- Updated `bin/lib/template.js` — block-based CLAUDE.md generation
- Updated `bin/lib/constants.js` — new stack choices, expanded formatter map

### Out of Scope
- Monorepo detection (multiple ecosystems in one project)
- IDE integration
- Visual stack comparison/preview
- Auto-migration between stacks

## Technical Design

### Detection Rules Format

```json
{
  "ecosystem": "javascript",
  "configFiles": ["package.json"],
  "parser": "packageJson",
  "rules": [
    { "dep": "next", "detects": "nextjs", "category": "framework", "weight": 10 },
    { "dep": "@supabase/supabase-js", "detects": "supabase", "category": "database", "weight": 10 },
    { "dep": "firebase", "detects": "firebase", "category": "database", "weight": 10 },
    { "dep": "convex", "detects": "convex", "category": "database", "weight": 10 },
    { "dep": "prisma", "detects": "prisma", "category": "orm", "weight": 8 },
    { "dep": "drizzle-orm", "detects": "drizzle", "category": "orm", "weight": 8 },
    { "dep": "next-auth", "detects": "nextauth", "category": "auth", "weight": 10 },
    { "dep": "@clerk/nextjs", "detects": "clerk", "category": "auth", "weight": 10 }
  ]
}
```

### Detection Result

```javascript
{
  ecosystem: "javascript",
  framework: { id: "nextjs", confidence: "detected" },
  database: { id: "supabase", confidence: "detected" },
  auth: { id: "supabase-auth", confidence: "inferred" },
  deploy: { id: null, confidence: "unknown" },
  orm: { id: null, confidence: "unknown" },
  packageManager: "pnpm",
  overallConfidence: "partial"  // framework+db but no deploy
}
```

### Skip Logic in Configurator

```javascript
if (detection.overallConfidence === "certain") {
  // Show summary, confirm with Enter
  const confirmed = await confirmDetectedStack(detection);
  if (confirmed) skipToNextPhase();
  else startModularFlow(detection); // pre-fill detected values
} else if (detection.overallConfidence === "partial") {
  // Pre-fill what's detected, ask only missing parts
  startModularFlow(detection);
} else {
  // Full flow: preset or build your own
  const usePreset = await askPresetOrCustom();
  if (usePreset) selectPreset();
  else startModularFlow(null);
}
```

### Block-based CLAUDE.md

```
system/blocks/
  ecosystem/
    javascript.md    ← "TypeScript strict, no any, const > let"
    python.md        ← "Type hints everywhere, async default"
    go.md            ← "Context-first, error returns, no panic"
  framework/
    nextjs.md        ← "App Router only, Server Components default"
    django.md        ← "Fat models, DRF serializers, manage.py"
    fastapi.md       ← "Pydantic models, Depends(), async"
    echo.md          ← "Clean Architecture, middleware chain"
  database/
    supabase.md      ← "RLS policies, apply_migration, generate types"
    firebase.md      ← "Firestore rules, Firebase Admin SDK"
    prisma.md        ← "Schema-first, prisma migrate, type generation"
    postgresql.md    ← "Raw SQL migrations, indexes, constraints"
  deploy/
    vercel.md        ← "vercel deploy, env vars, preview deployments"
    docker.md        ← "Dockerfile, compose, health checks"
```

Composition: `generateClaudeMd(detection) → read + concat matching blocks → substitute variables`

## Quality Gates

- Next.js + Firebase project → detected as nextjs + firebase (NOT nextjs-supabase)
- Django project → detected as django (NOT python-fastapi)
- Go + Echo project → detected correctly from go.mod
- Flutter project → detected from pubspec.yaml
- Certain detection → stack step skipped, user only confirms
- Partial detection → only missing parts asked
- Quick preset selection → 1 click, no further stack questions
- CLAUDE.md from blocks matches monolithic template quality
- All 124 existing tests still pass
- Backward compatible with old .effectum.json format

## Completion Promise

"Modular stack composition with 4 steps, JSON-based auto-detection for 5+ ecosystems, confidence-based skip logic, quick presets, and block-based CLAUDE.md generation — all backward compatible"
