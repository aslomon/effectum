"use strict";

/**
 * Unit tests for detect.js
 * Tests: detectStack, detectModular, detectPackageManager, parsers.
 */

const { test, describe, beforeEach, afterEach } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const os = require("node:os");

const {
  detectStack,
  detectModular,
  detectPackageManager,
  loadPresets,
  parsePackageJson,
  parsePythonDeps,
  parseGoMod,
  parsePubspecYaml,
} = require("../bin/lib/detect.js");

// ─── Helpers ─────────────────────────────────────────────────────────────────

function makeTempDir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), "effectum-detect-"));
}

function cleanTempDir(dir) {
  fs.rmSync(dir, { recursive: true, force: true });
}

// ─── detectStack (legacy backward-compatible API) ────────────────────────────

describe("detectStack", () => {
  let tmpDir;

  beforeEach(() => {
    tmpDir = makeTempDir();
  });

  afterEach(() => {
    cleanTempDir(tmpDir);
  });

  test("detects nextjs-supabase from package.json with next + supabase", () => {
    const pkg = {
      dependencies: {
        next: "14.0.0",
        "@supabase/supabase-js": "2.0.0",
      },
    };
    fs.writeFileSync(
      path.join(tmpDir, "package.json"),
      JSON.stringify(pkg),
      "utf8",
    );
    assert.equal(detectStack(tmpDir), "nextjs-supabase");
  });

  test("detects nextjs-supabase from package.json with next only (maps to closest preset)", () => {
    const pkg = {
      dependencies: {
        next: "14.0.0",
        react: "18.0.0",
      },
    };
    fs.writeFileSync(
      path.join(tmpDir, "package.json"),
      JSON.stringify(pkg),
      "utf8",
    );
    assert.equal(detectStack(tmpDir), "nextjs-supabase");
  });

  test("detects nextjs-supabase from package.json with next in devDependencies", () => {
    const pkg = {
      devDependencies: {
        next: "14.0.0",
      },
    };
    fs.writeFileSync(
      path.join(tmpDir, "package.json"),
      JSON.stringify(pkg),
      "utf8",
    );
    assert.equal(detectStack(tmpDir), "nextjs-supabase");
  });

  test("detects python-fastapi from pyproject.toml with fastapi dep", () => {
    fs.writeFileSync(
      path.join(tmpDir, "pyproject.toml"),
      '[project]\ndependencies = [\n  "fastapi>=0.100",\n]\n',
      "utf8",
    );
    assert.equal(detectStack(tmpDir), "python-fastapi");
  });

  test("detects python-fastapi from requirements.txt with fastapi", () => {
    fs.writeFileSync(
      path.join(tmpDir, "requirements.txt"),
      "fastapi\nuvicorn\n",
      "utf8",
    );
    assert.equal(detectStack(tmpDir), "python-fastapi");
  });

  test("detects django-postgres from requirements.txt with django", () => {
    fs.writeFileSync(
      path.join(tmpDir, "requirements.txt"),
      "django>=5.0\npsycopg2-binary\n",
      "utf8",
    );
    assert.equal(detectStack(tmpDir), "django-postgres");
  });

  test("detects swift-ios from Package.swift", () => {
    fs.writeFileSync(
      path.join(tmpDir, "Package.swift"),
      "// swift-tools-version:5.5\n",
      "utf8",
    );
    assert.equal(detectStack(tmpDir), "swift-ios");
  });

  test("detects swift-ios from .xcodeproj directory", () => {
    fs.mkdirSync(path.join(tmpDir, "MyApp.xcodeproj"));
    fs.writeFileSync(
      path.join(tmpDir, "Package.swift"),
      "// swift-tools-version:5.5\n",
      "utf8",
    );
    assert.equal(detectStack(tmpDir), "swift-ios");
  });

  test("detects go-echo from go.mod with echo dependency", () => {
    const gomod = `module myapp

go 1.22

require (
\tgithub.com/labstack/echo/v4 v4.11.0
\tgorm.io/gorm v1.25.0
)
`;
    fs.writeFileSync(path.join(tmpDir, "go.mod"), gomod, "utf8");
    assert.equal(detectStack(tmpDir), "go-echo");
  });

  test("returns null when nothing is detected", () => {
    assert.equal(detectStack(tmpDir), null);
  });

  test("returns null for directory with only an unrelated file", () => {
    fs.writeFileSync(path.join(tmpDir, "README.md"), "# Hello\n", "utf8");
    assert.equal(detectStack(tmpDir), null);
  });

  test("ignores malformed package.json (returns null)", () => {
    fs.writeFileSync(path.join(tmpDir, "package.json"), "NOT JSON{{", "utf8");
    assert.equal(detectStack(tmpDir), null);
  });
});

// ─── detectModular (new structured detection) ────────────────────────────────

describe("detectModular", () => {
  let tmpDir;

  beforeEach(() => {
    tmpDir = makeTempDir();
  });

  afterEach(() => {
    cleanTempDir(tmpDir);
  });

  test("returns structured result with ecosystem, framework, database", () => {
    const pkg = {
      dependencies: {
        next: "14.0.0",
        "@supabase/supabase-js": "2.0.0",
      },
    };
    fs.writeFileSync(
      path.join(tmpDir, "package.json"),
      JSON.stringify(pkg),
      "utf8",
    );
    const result = detectModular(tmpDir);
    assert.equal(result.ecosystem, "javascript");
    assert.equal(result.framework.id, "nextjs");
    assert.equal(result.database.id, "supabase");
    assert.equal(result.framework.confidence, "detected");
    assert.equal(result.database.confidence, "detected");
  });

  test("Next.js alone detects framework but not database", () => {
    const pkg = { dependencies: { next: "14.0.0" } };
    fs.writeFileSync(
      path.join(tmpDir, "package.json"),
      JSON.stringify(pkg),
      "utf8",
    );
    const result = detectModular(tmpDir);
    assert.equal(result.ecosystem, "javascript");
    assert.equal(result.framework.id, "nextjs");
    assert.equal(result.database.id, null);
    assert.equal(result.overallConfidence, "partial");
  });

  test("Next.js + Firebase detects correctly (not supabase)", () => {
    const pkg = {
      dependencies: { next: "14.0.0", firebase: "10.0.0" },
    };
    fs.writeFileSync(
      path.join(tmpDir, "package.json"),
      JSON.stringify(pkg),
      "utf8",
    );
    const result = detectModular(tmpDir);
    assert.equal(result.framework.id, "nextjs");
    assert.equal(result.database.id, "firebase");
  });

  test("infers supabase-auth when supabase is database and no explicit auth", () => {
    const pkg = {
      dependencies: {
        next: "14.0.0",
        "@supabase/supabase-js": "2.0.0",
      },
    };
    fs.writeFileSync(
      path.join(tmpDir, "package.json"),
      JSON.stringify(pkg),
      "utf8",
    );
    const result = detectModular(tmpDir);
    assert.equal(result.auth.id, "supabase-auth");
    assert.equal(result.auth.confidence, "inferred");
  });

  test("detects clerk auth explicitly", () => {
    const pkg = {
      dependencies: {
        next: "14.0.0",
        "@clerk/nextjs": "4.0.0",
      },
    };
    fs.writeFileSync(
      path.join(tmpDir, "package.json"),
      JSON.stringify(pkg),
      "utf8",
    );
    const result = detectModular(tmpDir);
    assert.equal(result.auth.id, "clerk");
    assert.equal(result.auth.confidence, "detected");
  });

  test("certain confidence when framework+db+auth detected", () => {
    const pkg = {
      dependencies: {
        next: "14.0.0",
        "@supabase/supabase-js": "2.0.0",
      },
    };
    fs.writeFileSync(
      path.join(tmpDir, "package.json"),
      JSON.stringify(pkg),
      "utf8",
    );
    const result = detectModular(tmpDir);
    assert.equal(result.overallConfidence, "certain");
  });

  test("none confidence for empty directory", () => {
    const result = detectModular(tmpDir);
    assert.equal(result.overallConfidence, "none");
    assert.equal(result.ecosystem, null);
  });

  test("detects Django from requirements.txt", () => {
    fs.writeFileSync(
      path.join(tmpDir, "requirements.txt"),
      "django>=5.0\npsycopg2-binary\n",
      "utf8",
    );
    const result = detectModular(tmpDir);
    assert.equal(result.ecosystem, "python");
    assert.equal(result.framework.id, "django");
    assert.equal(result.database.id, "postgresql");
  });

  test("detects Go + Echo from go.mod", () => {
    const gomod = `module myapp

go 1.22

require (
\tgithub.com/labstack/echo/v4 v4.11.0
)
`;
    fs.writeFileSync(path.join(tmpDir, "go.mod"), gomod, "utf8");
    const result = detectModular(tmpDir);
    assert.equal(result.ecosystem, "go");
    assert.equal(result.framework.id, "echo");
  });

  test("detects Flutter from pubspec.yaml", () => {
    const pubspec = `name: my_app
dependencies:
  flutter:
    sdk: flutter
  firebase_core: ^2.0.0
`;
    fs.writeFileSync(path.join(tmpDir, "pubspec.yaml"), pubspec, "utf8");
    const result = detectModular(tmpDir);
    assert.equal(result.ecosystem, "dart");
    assert.equal(result.framework.id, "flutter");
    assert.equal(result.database.id, "firebase");
  });

  test("detects Prisma ORM", () => {
    const pkg = {
      dependencies: { next: "14.0.0" },
      devDependencies: { prisma: "5.0.0", "@prisma/client": "5.0.0" },
    };
    fs.writeFileSync(
      path.join(tmpDir, "package.json"),
      JSON.stringify(pkg),
      "utf8",
    );
    const result = detectModular(tmpDir);
    assert.equal(result.orm.id, "prisma");
    assert.equal(result.orm.confidence, "detected");
  });
});

// ─── detectPackageManager ─────────────────────────────────────────────────────

describe("detectPackageManager", () => {
  let tmpDir;

  beforeEach(() => {
    tmpDir = makeTempDir();
  });

  afterEach(() => {
    cleanTempDir(tmpDir);
  });

  test("detects pnpm from pnpm-lock.yaml", () => {
    fs.writeFileSync(path.join(tmpDir, "pnpm-lock.yaml"), "", "utf8");
    assert.equal(detectPackageManager(tmpDir), "pnpm");
  });

  test("detects yarn from yarn.lock", () => {
    fs.writeFileSync(path.join(tmpDir, "yarn.lock"), "", "utf8");
    assert.equal(detectPackageManager(tmpDir), "yarn");
  });

  test("detects npm from package-lock.json", () => {
    fs.writeFileSync(path.join(tmpDir, "package-lock.json"), "{}", "utf8");
    assert.equal(detectPackageManager(tmpDir), "npm");
  });

  test("detects bun from bun.lockb", () => {
    fs.writeFileSync(path.join(tmpDir, "bun.lockb"), "", "utf8");
    assert.equal(detectPackageManager(tmpDir), "bun");
  });

  test("detects uv from uv.lock", () => {
    fs.writeFileSync(path.join(tmpDir, "uv.lock"), "", "utf8");
    assert.equal(detectPackageManager(tmpDir), "uv");
  });

  test("detects uv from pyproject.toml (no lock file)", () => {
    fs.writeFileSync(
      path.join(tmpDir, "pyproject.toml"),
      "[tool.poetry]\n",
      "utf8",
    );
    assert.equal(detectPackageManager(tmpDir), "uv");
  });

  test("detects poetry from poetry.lock", () => {
    fs.writeFileSync(path.join(tmpDir, "poetry.lock"), "", "utf8");
    assert.equal(detectPackageManager(tmpDir), "poetry");
  });

  test("detects pipenv from Pipfile.lock", () => {
    fs.writeFileSync(path.join(tmpDir, "Pipfile.lock"), "{}", "utf8");
    assert.equal(detectPackageManager(tmpDir), "pipenv");
  });

  test("detects go from go.mod", () => {
    fs.writeFileSync(path.join(tmpDir, "go.mod"), "module myapp\n", "utf8");
    assert.equal(detectPackageManager(tmpDir), "go");
  });

  test("detects cargo from Cargo.toml", () => {
    fs.writeFileSync(
      path.join(tmpDir, "Cargo.toml"),
      '[package]\nname = "myapp"\n',
      "utf8",
    );
    assert.equal(detectPackageManager(tmpDir), "cargo");
  });

  test("detects flutter from pubspec.yaml", () => {
    fs.writeFileSync(
      path.join(tmpDir, "pubspec.yaml"),
      "name: my_app\n",
      "utf8",
    );
    assert.equal(detectPackageManager(tmpDir), "flutter");
  });

  test("pnpm takes priority over yarn and npm", () => {
    fs.writeFileSync(path.join(tmpDir, "pnpm-lock.yaml"), "", "utf8");
    fs.writeFileSync(path.join(tmpDir, "yarn.lock"), "", "utf8");
    fs.writeFileSync(path.join(tmpDir, "package-lock.json"), "{}", "utf8");
    assert.equal(detectPackageManager(tmpDir), "pnpm");
  });

  test("falls back to npm when only package.json exists", () => {
    fs.writeFileSync(path.join(tmpDir, "package.json"), "{}", "utf8");
    assert.equal(detectPackageManager(tmpDir), "npm");
  });

  test("falls back to npm for empty directory", () => {
    assert.equal(detectPackageManager(tmpDir), "npm");
  });
});

// ─── Parsers ─────────────────────────────────────────────────────────────────

describe("parseGoMod", () => {
  let tmpDir;

  beforeEach(() => {
    tmpDir = makeTempDir();
  });

  afterEach(() => {
    cleanTempDir(tmpDir);
  });

  test("parses require block in go.mod", () => {
    const gomod = `module example.com/myapp

go 1.22

require (
\tgithub.com/labstack/echo/v4 v4.11.0
\tgorm.io/gorm v1.25.0
\tgithub.com/jackc/pgx/v5 v5.5.0
)
`;
    fs.writeFileSync(path.join(tmpDir, "go.mod"), gomod, "utf8");
    const deps = parseGoMod(tmpDir);
    assert.ok(deps.has("github.com/labstack/echo/v4"));
    assert.ok(deps.has("gorm.io/gorm"));
    assert.ok(deps.has("github.com/jackc/pgx/v5"));
  });

  test("returns empty set for missing go.mod", () => {
    const deps = parseGoMod(tmpDir);
    assert.equal(deps.size, 0);
  });
});

describe("parsePubspecYaml", () => {
  let tmpDir;

  beforeEach(() => {
    tmpDir = makeTempDir();
  });

  afterEach(() => {
    cleanTempDir(tmpDir);
  });

  test("parses flutter dependencies from pubspec.yaml", () => {
    const pubspec = `name: my_app
dependencies:
  flutter:
    sdk: flutter
  firebase_core: ^2.0.0
  cloud_firestore: ^4.0.0
dev_dependencies:
  flutter_test:
    sdk: flutter
`;
    fs.writeFileSync(path.join(tmpDir, "pubspec.yaml"), pubspec, "utf8");
    const deps = parsePubspecYaml(tmpDir);
    assert.ok(deps.has("flutter"));
    assert.ok(deps.has("firebase_core"));
    assert.ok(deps.has("cloud_firestore"));
  });

  test("returns empty set for missing pubspec.yaml", () => {
    const deps = parsePubspecYaml(tmpDir);
    assert.equal(deps.size, 0);
  });
});

describe("parsePythonDeps", () => {
  let tmpDir;

  beforeEach(() => {
    tmpDir = makeTempDir();
  });

  afterEach(() => {
    cleanTempDir(tmpDir);
  });

  test("parses requirements.txt", () => {
    fs.writeFileSync(
      path.join(tmpDir, "requirements.txt"),
      "fastapi>=0.100\nuvicorn\nSQLAlchemy>=2.0\n",
      "utf8",
    );
    const deps = parsePythonDeps(tmpDir);
    assert.ok(deps.has("fastapi"));
    assert.ok(deps.has("uvicorn"));
    assert.ok(deps.has("sqlalchemy"));
  });

  test("skips comments and empty lines", () => {
    fs.writeFileSync(
      path.join(tmpDir, "requirements.txt"),
      "# A comment\n\nfastapi\n-r other.txt\n",
      "utf8",
    );
    const deps = parsePythonDeps(tmpDir);
    assert.ok(deps.has("fastapi"));
    assert.ok(!deps.has("#"));
    assert.ok(!deps.has("-r"));
  });

  test("returns empty set for missing files", () => {
    const deps = parsePythonDeps(tmpDir);
    assert.equal(deps.size, 0);
  });
});

describe("loadPresets", () => {
  test("loads presets from system/presets/", () => {
    const presets = loadPresets();
    assert.ok(
      presets.length >= 8,
      `Expected at least 8 presets, got ${presets.length}`,
    );
    const ids = presets.map((p) => p.id);
    assert.ok(ids.includes("nextjs-supabase"));
    assert.ok(ids.includes("django-postgres"));
    assert.ok(ids.includes("flutter-firebase"));
  });

  test("each preset has required fields", () => {
    const presets = loadPresets();
    for (const preset of presets) {
      assert.ok(preset.id, `preset missing id: ${JSON.stringify(preset)}`);
      assert.ok(preset.label, `preset ${preset.id} missing label`);
      assert.ok(preset.ecosystem, `preset ${preset.id} missing ecosystem`);
      if (preset.kind === "workflow") {
        assert.equal(
          preset.framework,
          null,
          `workflow preset ${preset.id} must use framework=null`,
        );
      } else {
        assert.ok(preset.framework, `preset ${preset.id} missing framework`);
      }
      assert.ok(preset.stack, `preset ${preset.id} missing stack`);
    }
  });
});
