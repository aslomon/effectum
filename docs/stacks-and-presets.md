# Stacks and Presets

> `system/stacks/*.md` · `bin/lib/stack-parser.js` · `bin/lib/template.js`

Stack presets are the primary mechanism through which Effectum configures language-specific, framework-specific, and opinionated project conventions. Each preset is a structured Markdown file that encodes technology choices, architecture principles, project structure, quality gates, and formatting rules for one development stack.

---

## What a Stack Preset Is

A stack preset is a single `.md` file in `system/stacks/`. There are four built-in presets:

| File | Stack Key | Description |
|---|---|---|
| `nextjs-supabase.md` | `nextjs-supabase` | Full-stack TypeScript: Next.js App Router, Supabase, Tailwind, Shadcn |
| `python-fastapi.md` | `python-fastapi` | Backend: FastAPI, Pydantic v2, SQLAlchemy 2, Alembic, ruff |
| `swift-ios.md` | `swift-ios` | Native Apple apps: Swift 6, SwiftUI, SwiftData, SPM |
| `generic.md` | `generic` | Stack-agnostic baseline with placeholder instructions |

Presets are **not** code — they are documentation that the template engine reads and injects verbatim into generated files like `CLAUDE.md` and `guardrails.md`. The content of a preset defines what Claude Code knows about the project's constraints and conventions.

---

## Preset File Structure

Each preset is divided into named sections using level-2 headings (`##`) followed by a fenced code block. The stack parser reads only these structured sections; prose outside fenced blocks (like the title line and description) is treated as human-readable commentary and is ignored.

```markdown
# Stack Preset: <Name>

> Short description.

## SECTION_NAME
```
content of the section
```

## ANOTHER_SECTION
```
more content
```
```

### Defined Sections

Every built-in preset defines these sections (the generic preset uses explicit `[SPECIFY]` placeholders):

| Section Key | Purpose |
|---|---|
| `TECH_STACK` | Specific versions, libraries, tools, and package managers |
| `ARCHITECTURE_PRINCIPLES` | Mandatory patterns (e.g., MVVM, Result type, MULTI-TENANT) |
| `PROJECT_STRUCTURE` | Expected directory layout as an annotated tree |
| `QUALITY_GATES` | Commands and pass criteria for CI (build, types, tests, lint, format) |
| `FORMATTER` | Formatter command (e.g., `npx prettier --write`) |
| `FORMATTER_GLOB` | File extension filter for the auto-formatter hook |
| `PACKAGE_MANAGER` | Which package manager to use (e.g., `pnpm`, `uv`, `swift package`) |
| `STACK_SPECIFIC_GUARDRAILS` | Opinionated rules that override or extend default behavior |
| `TOOL_SPECIFIC_GUARDRAILS` | Rules about Effectum-managed automation (formatter, CHANGELOG, lock files) |

---

## How the Stack Parser Works

### `parseStackPreset(content)` — `bin/lib/stack-parser.js`

Parses raw Markdown content into a key-value map. The regular expression:

```
/^## (\w+)\s*\n+`{3,4}\n([\s\S]*?)`{3,4}/gm
```

matches any section of the form:

```
## KEY_NAME
```
...value content (may be multiline)...
```
```

Both triple-backtick (` ``` `) and quadruple-backtick (```` ```` ````) fences are supported. The section key is captured in group 1; the content between the fences is captured in group 2 and trimmed. The parser iterates all matches and builds a plain object:

```js
{
  TECH_STACK: "- Next.js >= 16, App Router ONLY\n...",
  ARCHITECTURE_PRINCIPLES: "- AGENT-NATIVE: every feature...\n...",
  // ...
}
```

Sections not matching the `## KEY\n```content```\n` pattern are silently skipped. The `PROJECT_STRUCTURE` section typically uses a quadruple-backtick outer fence to contain a triple-backtick inner code block (to show directory trees in the injected docs without breaking Markdown rendering).

### `loadStackPreset(stackKey, targetDir, repoRoot)` — `bin/lib/stack-parser.js`

Resolves the preset file from two candidate locations, in priority order:

1. **Project-local override:** `<targetDir>/.effectum/stacks/<stackKey>.md`
2. **System default:** `<repoRoot>/system/stacks/<stackKey>.md`

The first path that exists is read and passed to `parseStackPreset`. If neither exists, an error is thrown listing both paths searched.

This lookup order allows projects to ship customized stack presets inside their own `.effectum/` directory, overriding the Effectum defaults without modifying the Effectum installation.

---

## Placeholder Substitution

After parsing, the template engine (`bin/lib/template.js`) builds a substitution map and applies it to every generated file template.

### `buildSubstitutionMap(config, stackSections)`

Combines data from three sources:

1. **User config** (`config` — the `.effectum.json` written during setup): `projectName`, `stack`, `language`, `packageManager`
2. **Stack sections** (parsed preset): the section keys listed above
3. **Runtime detection** (`getToolsForStack`, `checkTool` from `cli-tools.js`): detects which CLI tools are installed on the current machine

Produces this substitution map:

| Placeholder | Source |
|---|---|
| `{{PROJECT_NAME}}` | `config.projectName` |
| `{{LANGUAGE}}` | `LANGUAGE_INSTRUCTIONS[config.language]` or `config.customLanguage` |
| `{{TECH_STACK}}` | `stackSections.TECH_STACK` |
| `{{ARCHITECTURE_PRINCIPLES}}` | `stackSections.ARCHITECTURE_PRINCIPLES` |
| `{{PROJECT_STRUCTURE}}` | `stackSections.PROJECT_STRUCTURE` |
| `{{QUALITY_GATES}}` | `stackSections.QUALITY_GATES` |
| `{{STACK_SPECIFIC_GUARDRAILS}}` | `stackSections.STACK_SPECIFIC_GUARDRAILS` |
| `{{FORMATTER}}` | `FORMATTER_MAP[config.stack].command` |
| `{{FORMATTER_NAME}}` | `FORMATTER_MAP[config.stack].name` |
| `{{FORMATTER_GLOB}}` | `FORMATTER_MAP[config.stack].glob` |
| `{{PACKAGE_MANAGER}}` | `config.packageManager` |
| `{{TOOL_SPECIFIC_GUARDRAILS}}` | `stackSections.TOOL_SPECIFIC_GUARDRAILS` |
| `{{AVAILABLE_TOOLS}}` | Dynamically detected tool list (key, install status, purpose) |

> **Note:** `{{FORMATTER}}`, `{{FORMATTER_NAME}}`, and `{{FORMATTER_GLOB}}` are sourced from `FORMATTER_MAP` in `constants.js` — not from the preset file's `FORMATTER` / `FORMATTER_GLOB` sections directly. The preset sections exist for human reference; `FORMATTER_MAP` is the authoritative source for the auto-formatter hook.

### `substituteAll(content, vars)`

Replaces every occurrence of `{{KEY}}` in a template string with the corresponding value. The pattern for each key is compiled as a global regex (`/\{\{KEY\}\}/g`), so all occurrences in a file are replaced in a single pass over the vars map.

### `renderTemplate(templatePath, vars)`

Reads a template file from disk, calls `substituteAll`, and returns both the rendered content and a list of any `{{...}}` placeholders that remain unreplaced (via `findRemainingPlaceholders`). Callers can warn the user or fail hard on remaining placeholders.

### Template File Resolution

`findTemplatePath(filename, targetDir, repoRoot)` follows the same two-candidate lookup as the stack parser:

1. `<targetDir>/.effectum/templates/<filename>`
2. `<repoRoot>/system/templates/<filename>`

This allows per-project template overrides alongside per-project stack preset overrides.

---

## How to Add a New Stack

### Step 1 — Create the preset file

Create `system/stacks/<your-stack-key>.md`. Use an existing preset as a template. All nine sections must be present; use `[SPECIFY]` for anything not yet determined.

```markdown
# Stack Preset: Go + Echo

> REST APIs with Go, Echo framework, GORM, and sqlc.

## TECH_STACK
```
- Go 1.22+
- Echo v4
- GORM + sqlc for data access
- golang-migrate for migrations
- testify for testing
- golangci-lint for linting
- Docker + Docker Compose
```

## ARCHITECTURE_PRINCIPLES
```
- Clean architecture: handlers → services → repositories
- ...
```

## PROJECT_STRUCTURE
`````
```
cmd/
  server/
    main.go
internal/
  api/
  service/
  repository/
  model/
```
`````

## QUALITY_GATES
```
- Build: `go build ./...` — 0 errors
- Tests: `go test ./... -cover` — all pass, 80%+ coverage
- Lint: `golangci-lint run` — 0 errors
- Format: `gofmt -l .` — 0 differences
```

## FORMATTER
```
gofmt -w
```

## FORMATTER_GLOB
```
go
```

## PACKAGE_MANAGER
```
go mod
```

## STACK_SPECIFIC_GUARDRAILS
```
- **go mod only**: Never vendor dependencies manually. Use `go get`.
- **Error wrapping**: Use `fmt.Errorf("...: %w", err)` for all error chains.
```

## TOOL_SPECIFIC_GUARDRAILS
```
- **gofmt runs automatically**: Do not run gofmt manually.
- **CHANGELOG is auto-updated**: Do not update CHANGELOG.md manually.
- **go.sum is protected**: Use `go mod tidy` to update go.sum.
```
```

### Step 2 — Register the stack key

Add an entry to `STACK_CHOICES` in `bin/lib/constants.js`:

```js
const STACK_CHOICES = [
  // existing entries …
  {
    value: "go-echo",
    label: "Go + Echo",
    hint: "REST APIs with Echo, GORM, sqlc, golang-migrate",
  },
];
```

### Step 3 — Add stack tags

Add an entry to `STACK_TAGS` in `bin/lib/recommendation.js`:

```js
const STACK_TAGS = {
  // existing entries …
  "go-echo": ["api-first", "backend-heavy"],
};
```

### Step 4 — Add a formatter mapping

Add an entry to `FORMATTER_MAP` in `bin/lib/constants.js`:

```js
const FORMATTER_MAP = {
  // existing entries …
  "go-echo": {
    command: "gofmt -w",
    name: "gofmt",
    glob: "go",
  },
};
```

### Step 5 — Add a subagent base set (optional)

Add an entry to `STACK_SUBAGENTS` in `bin/lib/specializations.js`:

```js
const STACK_SUBAGENTS = {
  // existing entries …
  "go-echo": ["backend-developer", "api-designer", "security-engineer", "test-automator"],
};
```

### Step 6 — Add CLI tool definitions (optional)

If the stack requires specific CLI tools (linter, formatter, migration runner), add them to `getToolsForStack` in `bin/lib/cli-tools.js` so they appear in the `{{AVAILABLE_TOOLS}}` section of generated files and are checked for installation.

### Verification

After adding the preset, run:

```bash
# Verify the parser can read the new preset
node -e "
const { loadStackPreset } = require('./bin/lib/stack-parser');
const s = loadStackPreset('go-echo', '/tmp/test', process.cwd());
console.log(Object.keys(s));
"
```

Expected output: all nine section keys printed without errors.

Then run a full setup with the new stack key selected to confirm end-to-end generation works.
