---
prd_id: "001"
title: "v0.4.0 — Stabilization"
version: "1.0"
status: "READY"
created: "2026-03-24"
author: "Lumi"
---

# PRD 001 — Effectum v0.4.0: Stabilization

## 1. Problem Statement

Effectum v0.3.0 is **functionally capable but not production-safe**. The core loop works — the PRD Workshop, Ralph Loop, and Quality Gates all run — but the codebase has accumulated serious structural debt that makes every iteration risky:

- **Zero test coverage**: The recommendation engine and install flow are the most complex logic in the project, but neither has a single test. Regressions go undetected.
- **No CI/CD pipeline**: Pull requests can introduce breaking changes silently. npm publishes happen without automated gates — a broken release ships directly to all users.
- **Critical code duplication**: `generateConfiguredFiles()` is copy-pasted 1:1 between `install.js` and `reconfigure.js`. Any bug fix or enhancement must be applied twice; drift between the copies is already observable.
- **Nine known bugs**: Including a silent failure on corrupted config, a 32-second blocking installer, an array-merge regression that destroys user-defined permissions, and a Windows CRLF parsing failure.
- **No contributor tooling**: No ESLint, no `CONTRIBUTING.md`, no `test` script in `package.json` — the bar for external contributions is unnecessarily high.

Before Effectum can be promoted as a reliable tool in public, and before the v0.5.0 feature expansion (`/prd:update`, task registry, new commands) can be built on top of it, the foundation must be solid. A single rogue bug in a widely-adopted v1.0.0 is harder to recover from than a deliberate pre-launch stabilization sprint.

**v0.4.0 is the prerequisite for everything else.**

---

## 2. Goals

| # | Goal | Metric |
|---|------|--------|
| G1 | All nine known bugs are resolved | `git log --grep="fix:"` covers all bugs listed in §5 |
| G2 | Critical code duplication is eliminated | `generateConfiguredFiles()` exists in exactly one file (`lib/config-generator.js`); `install.js` and `reconfigure.js` import from it |
| G3 | Test coverage established for core logic | Unit tests pass for `recommendation.js`, `detect.js`, `template.js`, `utils.js`; integration tests pass for `--yes --dry-run` and `--yes --local` |
| G4 | CI is green on all target environments | GitHub Actions CI passes on Node 18, 20, 22 × macOS + Ubuntu for every PR merge |
| G5 | npm publish is gated | `prepublishOnly` runs tests + lint; `release.yml` requires green CI before publishing |

---

## 3. Out of Scope

The following are explicitly **not** part of v0.4.0:

- `/prd:update` command (planned for v0.5.0)
- Task Registry / `tasks.md` per project (v0.5.0)
- Any new slash commands (`/deploy`, `/migrate`, `/debug`, `/retrospective`, etc.)
- New or expanded Quality Gates (dependency audit, bundle size, circular deps — v0.5.0)
- Extensible tool architecture / JSON-based tool definitions (v0.5.0)
- PRD YAML frontmatter schema (v0.5.0)
- Network Map improvements (v0.5.0)
- Multi-LLM / Ollama support (v1.0.0)
- Community Foundation Models (v1.0.0)
- GitHub Actions `@effectum` mention integration (v1.0.0)
- README Hero / GIF / launch marketing (v1.0.0)
- Any new Stack Presets beyond the existing three
- Performance benchmarks or published comparison claims

---

## 4. Acceptance Criteria

**Code Quality & Bugs**

- **AC-1:** Given a `.effectum.json` with invalid JSON, `readConfig()` throws a descriptive `Error` object (not returns `null`) with message containing `"Config corrupted"` or `"JSON parse error"`
- **AC-2:** Given `.effectum.json` with `stack: "unknown-stack-xyz"`, `loadStackPreset()` logs a warning and falls back to the `generic` preset without throwing
- **AC-3:** Given four MCP packages to check, `checkPackageAvailable()` completes all four checks in parallel and total wall-clock time is ≤ 10 seconds (previously up to 32s sequential)
- **AC-4:** Given a `claude.md` that contains user-defined `permissions.deny` rules, running `effectum reconfigure` preserves all existing deny entries (no array-override regression)
- **AC-5:** Running `effectum install` on a Windows machine (or with CRLF line endings in stack preset files) correctly parses the stack preset without silent failure
- **AC-6:** Running `effectum install` on a machine where `~/.claude/` does not yet exist creates the directory before writing any files (no crash due to missing parent dir)

**Testing**

- **AC-7:** Running `npm test` from the repo root exits `0` with all tests passing on Node 18, 20, and 22
- **AC-8:** Running `npx effectum --yes --dry-run` creates zero files on disk (integration test asserts no file writes)
- **AC-9:** Running `npx effectum --yes --local` creates all required files in the project directory (integration test asserts presence of `.claude/`, `workshop/`, `.effectum.json`)

**CI/CD**

- **AC-10:** Every pull request to `main` triggers the CI workflow; a PR with a failing test cannot be merged (branch protection enforced via status check)
- **AC-11:** Pushing a git tag matching `v*.*.*` triggers `release.yml` which runs tests, lint, and publishes to npm with provenance — and halts with non-zero exit if any step fails
- **AC-12:** `npm publish` (run manually without a tag) is blocked by `prepublishOnly`, which runs `npm test && npm run lint`

**Developer Experience**

- **AC-13:** Running `npm run lint` on the codebase exits `0` (no ESLint errors on current code)
- **AC-14:** `CONTRIBUTING.md` exists at repo root and documents: local setup, project structure, how to run tests, how to add a stack preset, and the PR process

---

## 5. Technical Implementation

### 5.1 Code Quality & Bug Fixes (~18h)

#### Extract `lib/config-generator.js` (3h)
The core duplication fix. `generateConfiguredFiles()` is currently copy-pasted between `install.js` and `reconfigure.js`. Extract into `lib/config-generator.js` with named exports:
- `generateClaudeMd(config)`
- `generateSettingsJson(config)`
- `generateGuardrails(config)`

Both `install.js` and `reconfigure.js` import from `config-generator.js`. Delete duplicated inline code from both files. This eliminates the primary source of future divergence bugs.

#### Fix `readConfig()` — corrupt config error handling (1h)
`readConfig()` currently swallows JSON parse errors and returns `null`. Change to: catch the parse exception, re-throw a new `Error` with message `"Config corrupted: <original message>. Run 'effectum reconfigure' to reset."`. Callers that previously checked `if (!config)` should now use try/catch.

#### Fix `loadStackPreset()` — graceful fallback (1h)
If the requested stack key is not found in the preset registry, log `warn: Unknown stack "${key}", falling back to "generic"` and return the `generic` preset. Do not throw.

#### Parallelize `checkPackageAvailable()` (2h)
Replace `spawnSync` with async `spawn` wrapped in a `Promise`. Check all MCP packages concurrently via `Promise.all(packages.map(checkPackageAvailable))`. Target: all checks complete in ≤10s regardless of number of packages.

#### Fix `deepMerge()` array semantics for permissions (2h)
Document the intended merge behavior: arrays are currently overwritten (last-write-wins). For `permissions.deny` and `permissions.allow` specifically, implement concat+deduplicate merge instead of override. Add inline JSDoc comment documenting the two strategies.

#### Fix `parseStackPreset()` CRLF regex (1h)
Update all line-boundary regex patterns to handle both `\n` (Unix) and `\r\n` (Windows). Use `\r?\n` in all relevant expressions. Add a test fixture with CRLF content (see §5.2).

#### Fix `installBaseFiles()` — ensure `~/.claude/` exists (1h)
Move `ensureDir(claudeDir)` to the top of `installBaseFiles()` before any file writes. Remove it as a side-effect buried inside other operations.

#### Remove legacy `askMcpServers()` (0.5h)
Delete the `askMcpServers()` function from `ui.js` (marked as Legacy, never called). Verify no remaining callers via grep before deletion.

#### Fix `installPlaywrightBrowsers()` error variable (0.5h)
The fallback error path logs `result.stderr` (first attempt) instead of `result2.stderr` (second attempt). Fix variable reference to point to `result2`.

#### Fix `findRepoRoot()` library mode (1h)
`require.main?.filename` returns the wrong path when Effectum is loaded as a library (via `require()`). Replace with `__dirname`-based traversal that walks up the directory tree looking for `package.json` with `name: "@aslomon/effectum"`.

---

### 5.2 Testing (~10h)

#### Set up test framework (1h)
Use Node.js built-in `node:test` (zero external dependencies, CommonJS-compatible). Create `test/` directory at repo root. Add `"test": "node --test test/**/*.test.js"` to `package.json` scripts.

#### Unit tests: `recommendation.js` (2h)
Test `extractTags(description)` with various stack descriptions and assert expected tag arrays. Test `recommend(projectConfig)` for all four app types × three stacks → assert recommended commands, skills, agents match snapshots. Cover edge case: empty description, null stack.

#### Unit tests: `detect.js` (2h)
Test `detectStack(dir)` using `os.tmpdir()` temp directories with synthesized `package.json` fixtures (Next.js, FastAPI, Swift). Test `detectPackageManager(dir)` with and without lockfiles. Assert correct detection results. Clean up temp dirs in `afterEach`.

#### Unit tests: `template.js` (1h)
Test `substituteAll(template, vars)` with known inputs and expected outputs. Test `findRemainingPlaceholders(str)` returns correct list of unresolved `{{PLACEHOLDER}}` tokens.

#### Unit tests: `utils.js` (1h)
Test `deepMerge()` for plain object merge, nested object merge, and the new array concat-deduplicate behavior for permission keys. Test the CRLF case: pass a string with `\r\n` through the merge pipeline and assert output is clean.

#### Integration test: `--yes --dry-run` (1.5h)
Spawn `effectum --yes --dry-run` in a temp directory. After process exits, assert that zero files were created in the temp directory. Assert exit code is `0`.

#### Integration test: `--yes --local` (1.5h)
Spawn `effectum --yes --local` in a temp directory with a minimal mock `package.json`. After process exits, assert: `.effectum.json` exists, `.claude/` directory exists, `workshop/` directory exists. Assert exit code is `0`.

---

### 5.3 CI/CD (~5h)

#### `.github/workflows/ci.yml` (2h)
```yaml
# Triggers: push to main, all PRs
# Matrix: node [18, 20, 22] × os [ubuntu-latest, macos-latest]
# Steps: checkout → setup-node (with npm cache) → npm ci → npm run lint → npm test
```
Set as required status check for `main` branch protection.

#### `.github/workflows/release.yml` (2h)
```yaml
# Triggers: push tags matching v*.*.*
# Steps: checkout → setup-node → npm ci → npm test → npm run lint
#        → npm publish --provenance (using NODE_AUTH_TOKEN secret)
# Halt on any step failure (default behavior)
```

#### `.github/workflows/security.yml` (0.5h)
```yaml
# Triggers: schedule (weekly, Monday 07:00 UTC) + manual dispatch
# Steps: npm audit --audit-level=moderate → fail if vulnerabilities found
```

#### `package.json` — `prepublishOnly` (0.5h)
Add: `"prepublishOnly": "npm test && npm run lint"`. This blocks manual `npm publish` without green tests and lint.

---

### 5.4 Developer Experience (~5h)

#### ESLint flat config (1.5h)
Create `eslint.config.js` using flat config format. Rules: `eslint:recommended`, CommonJS globals (`require`, `module`, `__dirname`, `__filename`), no `console.error` in non-error paths (warn), consistent `const`/`let` usage. Add `"lint": "eslint ."` and `"lint:fix": "eslint . --fix"` to `package.json` scripts. Ensure current codebase passes lint before merging.

#### `CONTRIBUTING.md` (2h)
Sections:
1. **Getting Started** — `git clone`, `npm install`, `npm test`, `npm run lint`
2. **Project Structure** — annotated directory tree with purpose of each key file
3. **How to Run Tests** — `npm test`, `npm run test:watch` (if implemented), how to add a new test
4. **How to Add a Stack Preset** — step-by-step: where presets live, required fields, how to test
5. **PR Process** — branch naming, commit message format, required checks before review
6. **Code Style** — ESLint is the enforcer; key conventions (named exports, error handling, async patterns)

#### `package.json` scripts (0.5h)
Add/ensure all scripts exist:
- `"test"`: `node --test test/**/*.test.js`
- `"test:watch"`: `node --test --watch test/**/*.test.js`
- `"lint"`: `eslint .`
- `"lint:fix"`: `eslint . --fix`
- `"typecheck"`: `tsc --noEmit` (requires `tsconfig.json` with `checkJs: true`)
- `"dev"`: `node bin/effectum.js`

#### `.npmignore` (0.5h)
Explicitly exclude from published package:
```
.git/
test/
.github/
docs/
*.test.js
eslint.config.js
CONTRIBUTING.md
```

---

## 6. Data Model Changes

**None.** v0.4.0 makes no changes to `.effectum.json` schema, the PRD template format, workshop directory structure, or any user-facing file format. All changes are internal implementation improvements.

The only file additions are in the repo itself (new `lib/config-generator.js`, `test/` directory, `.github/workflows/`, `CONTRIBUTING.md`, `eslint.config.js`) and are not part of the installed package.

---

## 7. Quality Gates

The following gates must be **green** before the v0.4.0 tag is cut and `npm publish` is triggered:

| Gate | Tool | Pass Condition |
|------|------|---------------|
| **Unit Tests** | `node:test` | All tests pass on Node 18, 20, 22 × macOS + Ubuntu |
| **Integration Tests** | `node:test` | `--dry-run` creates 0 files; `--local` creates all required files |
| **Lint** | ESLint | `npm run lint` exits `0` (zero errors, zero warnings) |
| **No Duplication** | Manual / code review | `generateConfiguredFiles` exists in exactly 1 file |
| **All Known Bugs Fixed** | Manual verification | All 9 bugs in §5.1 have corresponding commits and passing regression tests |
| **CI Green** | GitHub Actions | `ci.yml` passes on all 6 matrix targets (3 Node × 2 OS) |
| **Release Workflow** | GitHub Actions | `release.yml` dry-run passes (test + lint steps) |
| **CONTRIBUTING.md** | Manual review | File exists, all 6 sections present and accurate |

---

## 8. Completion Promise

**v0.4.0 is "done" when:**

> Effectum can be installed via `npx @aslomon/effectum`, works reliably on macOS and Linux, handles all known edge cases gracefully (corrupt config, unknown stack, missing directories, Windows line endings), and ships from a codebase that has tests for its core logic and automated CI that prevents regressions.
>
> A developer opening the repo for the first time can read `CONTRIBUTING.md`, run `npm test`, see all tests pass, and submit a PR that cannot merge if it breaks a test.
>
> The npm package is protected: `npm publish` fails unless all tests and lint pass.

This is not a feature release. v0.4.0 is the trust foundation that v0.5.0 and v1.0.0 are built on.

---

## 9. Estimated Effort

| Area | Tasks | Estimated Hours |
|------|-------|----------------|
| Code Quality & Bug Fixes | Extract config-generator, fix 9 bugs | ~18h |
| Testing | Framework setup + 6 test suites | ~10h |
| CI/CD | 3 workflows + prepublishOnly | ~5h |
| Developer Experience | ESLint, CONTRIBUTING.md, scripts, .npmignore | ~5h |
| **Total** | | **~38h** |

Suggested sequencing:
1. **Day 1-2:** Bug fixes + `lib/config-generator.js` extraction (unblocks stable base for tests)
2. **Day 3-4:** Test framework + unit tests (`recommendation.js`, `detect.js`, `template.js`, `utils.js`)
3. **Day 5:** Integration tests + CI workflows
4. **Day 6:** ESLint config + `CONTRIBUTING.md` + `package.json` scripts + `.npmignore`
5. **Day 7:** Full regression run, fix any CI flakes, cut v0.4.0 tag

---

_PRD authored by Lumi | Based on Effectum Roadmap v1.0 (2026-03-22)_
