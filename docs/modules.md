# Effectum — Module Reference

> All modules live in `bin/lib/`. They are CommonJS (`require`/`module.exports`).

---

## `detect.js` — Auto-Detection

Inspects the target directory to infer project metadata without user input.

| Export | Signature | Description |
|---|---|---|
| `detectProjectName` | `(dir: string) → string` | Returns `path.basename(path.resolve(dir))` as the default project name |
| `detectStack` | `(dir: string) → string \| null` | Reads `package.json` deps or checks for Python/Swift files; returns a stack key (`"nextjs-supabase"`, `"python-fastapi"`, `"swift-ios"`) or `null` |
| `detectPackageManager` | `(dir: string) → string` | Infers package manager from lock files (`pnpm-lock.yaml`, `yarn.lock`, `bun.lockb`, `package-lock.json`, `poetry.lock`, `uv.lock`, `Package.swift`); defaults to `"npm"` |
| `detectAll` | `(dir: string) → { projectName, stack, packageManager }` | Convenience wrapper — runs all three detections and returns a combined object |

**Supported stacks detected automatically:**

| Stack key | Detection trigger |
|---|---|
| `nextjs-supabase` | `next` in `package.json` dependencies |
| `python-fastapi` | `pyproject.toml` or `requirements.txt` present |
| `swift-ios` | `Package.swift` or `.xcodeproj`/`.xcworkspace` directory |

---

## `config.js` — Configuration Persistence

Reads and writes `.effectum.json` — the project's persisted configuration file.

| Export | Signature | Description |
|---|---|---|
| `readConfig` | `(dir: string) → object \| null` | Parses `.effectum.json` from `dir`; returns `null` if file doesn't exist or is malformed |
| `writeConfig` | `(dir: string, config: object) → string` | Writes config to `.effectum.json`; auto-sets `updatedAt`; preserves `createdAt` from any existing file; returns the absolute file path |
| `configExists` | `(dir: string) → boolean` | Returns `true` if `.effectum.json` is present in `dir` |
| `CONFIG_FILENAME` | `string` | `".effectum.json"` |
| `CONFIG_VERSION` | `string` | `"0.4.0"` |

**Config schema (v0.4.0):**

```json
{
  "version": "0.4.0",
  "name": "my-project",
  "scope": "local",
  "appType": "web-app",
  "description": "...",
  "language": "typescript",
  "stack": "nextjs-supabase",
  "autonomy": "supervised",
  "createdAt": "2026-01-01T00:00:00.000Z",
  "updatedAt": "2026-01-01T00:00:00.000Z"
}
```

---

## `utils.js` — Shared Utilities

General-purpose helpers used across multiple modules.

| Export | Signature | Description |
|---|---|---|
| `ensureDir` | `(dir: string) → void` | Creates a directory and all parents (`fs.mkdirSync` with `{ recursive: true }`) |
| `deepMerge` | `(target: object, source: object) → object` | Deep-merges two plain objects; source wins on conflicts; arrays are replaced (not merged) |
| `findRepoRoot` | `() → string` | Resolves the Effectum package root by walking up from `__filename`; handles both `bin/` and `bin/lib/` call sites |

---

## `recommendation.js` — Configuration Recommendations

Generates a recommended default configuration based on the detected environment and any user-supplied inputs. Consumed by `install.js` to pre-fill the configurator or populate non-interactive defaults.

**Expected exports:** `getRecommendation(detected, userInputs) → configObject`

---

## `foundation.js` — System Prompt Foundation

Builds the base layer of the Claude Code system prompt and `CLAUDE.md` content. Provides universal autonomous-development conventions (TDD, spec-driven, commit style, etc.) independent of the specific stack.

**Expected exports:** `buildFoundation(config) → string` (prompt/markdown content)

---

## `specializations.js` — Stack Specializations

Adds stack-specific rules and instructions on top of the foundation. For example: Next.js App Router conventions, Supabase RLS patterns, FastAPI routing style, Swift/SwiftUI idioms.

**Expected exports:** `buildSpecialization(config) → string` (additional prompt content)

---

## `app-types.js` — Application Type Registry

Defines and describes known application types that the user can choose during configuration.

**Likely exports:** `APP_TYPES` map/array with entries like `{ id, label, description, defaultStack }` for types such as: `web-app`, `api`, `cli`, `mobile`, `library`, `fullstack`, etc.

---

## `languages.js` — Language Registry

Registry of supported programming languages and their associated toolchain conventions (linter, formatter, test runner, type system).

**Likely exports:** `LANGUAGES` map/array with entries like `{ id, label, toolchain, extensions }`.

---

## `constants.js` — Shared Constants

Central location for all magic strings and default values used across the codebase.

**Expected exports:** Named constants such as `CONFIG_FILENAME`, `DEFAULT_AUTONOMY`, `STEP_NAMES`, scope values (`"global"`, `"local"`), etc.

---

## `template.js` — File Template Rendering

Renders `CLAUDE.md` and system prompt file templates by replacing placeholders with values from the assembled configuration object.

**Expected exports:** `renderTemplate(templatePath, vars) → string` or similar.

---

## `stack-parser.js` — Stack String Parser

Parses a raw stack string (e.g. `"nextjs-supabase"`, `"python-fastapi"`) into a structured object consumed by `foundation.js`, `specializations.js`, and `cli-tools.js`.

**Expected exports:** `parseStack(stackKey: string) → { framework, language, database, ... }`

---

## `ui.js` — Terminal UI

Wraps `@clack/prompts` with Effectum-specific styling: step headers, progress indicators, styled info/success/error boxes, and the summary panel shown at the end of installation.

**Expected exports:** Step-rendering helpers, `printSummary(config, paths) → void`, spinner wrappers, etc.

---

## `cli-tools.js` — CLI Tool Detection

Detects installed CLI tools in the user's environment (e.g. `gh`, `vercel`, `supabase`, `pnpm`, `bun`) and generates the corresponding usage instructions to append to the Claude Code system prompt.

**Expected exports:** `detectCliTools() → string[]`, `buildToolInstructions(tools: string[]) → string`

---

## Dependency Graph

```
install.js
  ├── detect.js
  ├── config.js
  ├── utils.js
  ├── ui.js
  ├── constants.js
  ├── recommendation.js
  │     └── app-types.js
  │     └── languages.js
  ├── stack-parser.js
  ├── foundation.js
  ├── specializations.js
  ├── template.js
  └── cli-tools.js
```
