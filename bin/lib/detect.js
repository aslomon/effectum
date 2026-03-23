/**
 * Auto-detection: project name, tech stack, package manager.
 *
 * Loads JSON detection rules from system/detect/ and matches them
 * against project dependency files (package.json, pyproject.toml, etc.).
 *
 * Returns structured detection: { ecosystem, framework, database, auth, deploy, orm, confidence }
 */
"use strict";

const fs = require("fs");
const path = require("path");

// ─── Detection Rule Loading ─────────────────────────────────────────────────

/**
 * Find the system/detect/ directory.
 * Checks .effectum/detect/ (installed copy) first, then system/detect/ (repo source).
 * @param {string} [targetDir] - project directory
 * @returns {string|null}
 */
function findDetectDir(targetDir) {
  const candidates = [];
  if (targetDir) {
    candidates.push(path.join(targetDir, ".effectum", "detect"));
  }
  // Repo root: walk up from this file (bin/lib/) to repo root
  const repoRoot = path.resolve(__dirname, "..", "..");
  candidates.push(path.join(repoRoot, "system", "detect"));
  for (const dir of candidates) {
    if (fs.existsSync(dir)) return dir;
  }
  return null;
}

/**
 * Load all detection rule files from system/detect/.
 * @param {string} [targetDir]
 * @returns {Array<object>}
 */
function loadDetectionRules(targetDir) {
  const detectDir = findDetectDir(targetDir);
  if (!detectDir) return [];

  const rules = [];
  const files = fs.readdirSync(detectDir).filter((f) => f.endsWith(".json"));
  for (const file of files) {
    try {
      const content = JSON.parse(
        fs.readFileSync(path.join(detectDir, file), "utf8"),
      );
      rules.push(content);
    } catch (_) {
      // skip malformed rule files
    }
  }
  return rules;
}

// ─── Dependency Parsers ─────────────────────────────────────────────────────

/**
 * Parse package.json dependencies.
 * @param {string} dir
 * @returns {Set<string>}
 */
function parsePackageJson(dir) {
  const filePath = path.join(dir, "package.json");
  if (!fs.existsSync(filePath)) return new Set();
  try {
    const pkg = JSON.parse(fs.readFileSync(filePath, "utf8"));
    return new Set([
      ...Object.keys(pkg.dependencies || {}),
      ...Object.keys(pkg.devDependencies || {}),
    ]);
  } catch (_) {
    return new Set();
  }
}

/**
 * Parse Python dependencies from pyproject.toml and requirements.txt.
 * @param {string} dir
 * @returns {Set<string>}
 */
function parsePythonDeps(dir) {
  const deps = new Set();

  // pyproject.toml: look for dependency names in [project.dependencies] or [tool.poetry.dependencies]
  const pyprojectPath = path.join(dir, "pyproject.toml");
  if (fs.existsSync(pyprojectPath)) {
    try {
      const content = fs.readFileSync(pyprojectPath, "utf8");
      // Match dependency names from various sections
      // Lines like: fastapi = "..." or "fastapi>=0.100"
      const depPatterns = [
        /^\s*"?([a-zA-Z0-9_-]+)"?\s*[>=<!~]/gm,
        /^\s*([a-zA-Z0-9_-]+)\s*=/gm,
      ];
      for (const pattern of depPatterns) {
        let match;
        while ((match = pattern.exec(content)) !== null) {
          const name = match[1].toLowerCase().replace(/_/g, "-");
          deps.add(name);
          // Also keep original form for matching
          deps.add(match[1].toLowerCase());
        }
      }
    } catch (_) {}
  }

  // requirements.txt: one dep per line
  const reqPath = path.join(dir, "requirements.txt");
  if (fs.existsSync(reqPath)) {
    try {
      const content = fs.readFileSync(reqPath, "utf8");
      for (const line of content.split("\n")) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith("#") || trimmed.startsWith("-")) {
          continue;
        }
        // Extract package name (before any version specifier)
        const match = trimmed.match(/^([a-zA-Z0-9_.-]+)/);
        if (match) {
          const name = match[1].toLowerCase();
          deps.add(name);
          deps.add(name.replace(/-/g, "_"));
          deps.add(name.replace(/_/g, "-"));
        }
      }
    } catch (_) {}
  }

  return deps;
}

/**
 * Parse go.mod dependencies.
 * @param {string} dir
 * @returns {Set<string>}
 */
function parseGoMod(dir) {
  const filePath = path.join(dir, "go.mod");
  if (!fs.existsSync(filePath)) return new Set();
  try {
    const content = fs.readFileSync(filePath, "utf8");
    const deps = new Set();
    // Match: require lines and require block entries
    // Single: require github.com/foo/bar v1.2.3
    // Block:  github.com/foo/bar v1.2.3
    const requireBlockMatch = content.match(/require\s*\(\s*([\s\S]*?)\s*\)/gm);
    if (requireBlockMatch) {
      for (const block of requireBlockMatch) {
        const lines = block.split("\n");
        for (const line of lines) {
          const match = line.trim().match(/^([a-zA-Z0-9./_-]+)\s+v/);
          if (match) deps.add(match[1]);
        }
      }
    }
    // Single require statements
    const singleRequires = content.matchAll(
      /^require\s+([a-zA-Z0-9./_-]+)\s+v/gm,
    );
    for (const match of singleRequires) {
      deps.add(match[1]);
    }
    return deps;
  } catch (_) {
    return new Set();
  }
}

/**
 * Parse pubspec.yaml dependencies (Flutter/Dart).
 * @param {string} dir
 * @returns {Set<string>}
 */
function parsePubspecYaml(dir) {
  const filePath = path.join(dir, "pubspec.yaml");
  if (!fs.existsSync(filePath)) return new Set();
  try {
    const content = fs.readFileSync(filePath, "utf8");
    const deps = new Set();
    // Match dependency names in dependencies: and dev_dependencies: sections
    // Simple YAML parsing: lines with 2-space indent under dependencies:
    let inDeps = false;
    for (const line of content.split("\n")) {
      if (/^(dependencies|dev_dependencies):/.test(line)) {
        inDeps = true;
        continue;
      }
      if (inDeps && /^\S/.test(line)) {
        inDeps = false;
        continue;
      }
      if (inDeps) {
        const match = line.match(/^\s{2}([a-zA-Z0-9_]+):/);
        if (match) deps.add(match[1]);
      }
    }
    // Also check for flutter SDK
    if (content.includes("sdk: flutter")) {
      deps.add("flutter");
    }
    return deps;
  } catch (_) {
    return new Set();
  }
}

/**
 * Parse Swift Package.swift imports (basic keyword scan).
 * @param {string} dir
 * @returns {Set<string>}
 */
function parseSwiftPackage(dir) {
  const deps = new Set();
  const filePath = path.join(dir, "Package.swift");
  if (fs.existsSync(filePath)) {
    try {
      const content = fs.readFileSync(filePath, "utf8");
      // Look for .package(url: "...vapor/vapor...") patterns
      const urlMatches = content.matchAll(/\.package\s*\(\s*url:\s*"([^"]+)"/g);
      for (const m of urlMatches) {
        deps.add(m[1]);
        // Extract last path component: github.com/vapor/vapor -> vapor/vapor
        const parts = m[1].replace(/\.git$/, "").split("/");
        if (parts.length >= 2) {
          deps.add(parts.slice(-2).join("/"));
        }
      }
    } catch (_) {}
  }

  // Also check for .xcodeproj/.xcworkspace (implies SwiftUI)
  try {
    const entries = fs.readdirSync(dir);
    if (
      entries.some(
        (f) => f.endsWith(".xcodeproj") || f.endsWith(".xcworkspace"),
      )
    ) {
      deps.add("SwiftUI");
    }
  } catch (_) {}

  return deps;
}

const PARSERS = {
  packageJson: parsePackageJson,
  pythonDeps: parsePythonDeps,
  goMod: parseGoMod,
  pubspecYaml: parsePubspecYaml,
  swiftPackage: parseSwiftPackage,
};

// ─── Detection Engine ───────────────────────────────────────────────────────

/**
 * Detect project name from directory name.
 * @param {string} dir
 * @returns {string}
 */
function detectProjectName(dir) {
  return path.basename(path.resolve(dir));
}

/**
 * Run modular detection against all rule files.
 * @param {string} dir - project directory
 * @returns {{ ecosystem: string|null, framework: object, database: object, auth: object, deploy: object, orm: object, packageManager: string, overallConfidence: string }}
 */
function detectModular(dir) {
  const rules = loadDetectionRules(dir);
  const result = {
    ecosystem: null,
    framework: { id: null, confidence: "unknown" },
    database: { id: null, confidence: "unknown" },
    auth: { id: null, confidence: "unknown" },
    deploy: { id: null, confidence: "unknown" },
    orm: { id: null, confidence: "unknown" },
    packageManager: detectPackageManager(dir),
    overallConfidence: "none",
  };

  // Track best match per category across all ecosystems
  const bestMatch = {}; // category -> { id, weight, ecosystem }

  for (const ruleFile of rules) {
    const parser = PARSERS[ruleFile.parser];
    if (!parser) continue;

    // Check if any config file exists
    const hasConfigFile = (ruleFile.configFiles || []).some((f) =>
      fs.existsSync(path.join(dir, f)),
    );
    if (!hasConfigFile) continue;

    const deps = parser(dir);

    // Config file exists → set ecosystem even if no specific deps matched
    if (!result.ecosystem) {
      result.ecosystem = ruleFile.ecosystem;
    }

    if (deps.size === 0) continue;

    for (const rule of ruleFile.rules) {
      // For Go deps, check prefix match (github.com/labstack/echo matches github.com/labstack/echo/v4)
      let matched = deps.has(rule.dep);
      if (!matched && ruleFile.parser === "goMod") {
        for (const dep of deps) {
          if (dep.startsWith(rule.dep)) {
            matched = true;
            break;
          }
        }
      }
      // For Python, try normalized forms
      if (!matched && ruleFile.parser === "pythonDeps") {
        const normalized = rule.dep.toLowerCase().replace(/-/g, "_");
        const altNormalized = rule.dep.toLowerCase().replace(/_/g, "-");
        matched =
          deps.has(rule.dep.toLowerCase()) ||
          deps.has(normalized) ||
          deps.has(altNormalized);
      }

      if (!matched) continue;

      const cat = rule.category;
      const current = bestMatch[cat];
      if (!current || rule.weight > current.weight) {
        bestMatch[cat] = {
          id: rule.detects,
          weight: rule.weight,
          ecosystem: ruleFile.ecosystem,
        };
      }
    }

    // If we matched any rule in this ecosystem, set the ecosystem
    const matchedCategories = Object.values(bestMatch).filter(
      (m) => m.ecosystem === ruleFile.ecosystem,
    );
    if (matchedCategories.length > 0 && !result.ecosystem) {
      result.ecosystem = ruleFile.ecosystem;
    }
  }

  // Apply best matches to result
  for (const [cat, match] of Object.entries(bestMatch)) {
    if (result[cat]) {
      result[cat] = { id: match.id, confidence: "detected" };
    }
    if (!result.ecosystem) {
      result.ecosystem = match.ecosystem;
    }
  }

  // Infer auth from database (supabase -> supabase-auth if no explicit auth)
  if (
    result.auth.id === null &&
    result.database.id === "supabase" &&
    result.auth.confidence === "unknown"
  ) {
    result.auth = { id: "supabase-auth", confidence: "inferred" };
  }
  if (
    result.auth.id === null &&
    result.database.id === "firebase" &&
    result.auth.confidence === "unknown"
  ) {
    result.auth = { id: "firebase-auth", confidence: "inferred" };
  }

  // Calculate overall confidence
  const detected = [result.framework, result.database, result.auth].filter(
    (c) => c.id !== null,
  );
  if (detected.length >= 3) {
    result.overallConfidence = "certain";
  } else if (detected.length >= 1) {
    result.overallConfidence = "partial";
  } else {
    result.overallConfidence = "none";
  }

  return result;
}

/**
 * Map modular detection to a legacy stack key for backward compatibility.
 * @param {{ ecosystem: string|null, framework: object, database: object }} detection
 * @returns {string|null}
 */
function detectionToStackKey(detection) {
  if (!detection.ecosystem) return null;

  const fw = detection.framework.id;
  const db = detection.database.id;

  // Map to existing stack presets
  if (fw === "nextjs" && db === "supabase") return "nextjs-supabase";
  if (fw === "django") return "django-postgres";
  if (fw === "fastapi") return "python-fastapi";
  if (fw === "echo" || fw === "gin" || fw === "fiber") return "go-echo";
  if (fw === "swiftui" || fw === "vapor") return "swift-ios";
  if (detection.ecosystem === "dart") return "generic";

  // Framework-only matches (no database detected)
  if (fw === "nextjs") return "nextjs-supabase";
  if (detection.ecosystem === "python") return "python-fastapi";
  if (detection.ecosystem === "go") return "go-echo";
  if (detection.ecosystem === "swift") return "swift-ios";

  return null;
}

/**
 * Detect tech stack from project files.
 * Returns a legacy stack key for backward compatibility.
 * @param {string} dir
 * @returns {string|null} stack key or null
 */
function detectStack(dir) {
  const detection = detectModular(dir);
  return detectionToStackKey(detection);
}

/**
 * Detect package manager from lock files.
 * @param {string} dir
 * @returns {string}
 */
function detectPackageManager(dir) {
  if (fs.existsSync(path.join(dir, "pnpm-lock.yaml"))) return "pnpm";
  if (fs.existsSync(path.join(dir, "yarn.lock"))) return "yarn";
  if (fs.existsSync(path.join(dir, "bun.lockb"))) return "bun";
  if (fs.existsSync(path.join(dir, "package-lock.json"))) return "npm";
  if (fs.existsSync(path.join(dir, "Pipfile.lock"))) return "pipenv";
  if (fs.existsSync(path.join(dir, "poetry.lock"))) return "poetry";
  if (fs.existsSync(path.join(dir, "uv.lock"))) return "uv";
  if (fs.existsSync(path.join(dir, "pyproject.toml"))) return "uv";
  if (fs.existsSync(path.join(dir, "go.mod"))) return "go";
  if (fs.existsSync(path.join(dir, "Cargo.toml"))) return "cargo";
  if (fs.existsSync(path.join(dir, "pubspec.yaml"))) return "flutter";
  if (fs.existsSync(path.join(dir, "Package.swift")))
    return "swift package (SPM)";
  if (fs.existsSync(path.join(dir, "package.json"))) return "npm";
  return "npm";
}

/**
 * Run all detections and return a summary.
 * @param {string} dir
 * @returns {{ projectName: string, stack: string|null, packageManager: string, detection: object }}
 */
function detectAll(dir) {
  const detection = detectModular(dir);
  return {
    projectName: detectProjectName(dir),
    stack: detectionToStackKey(detection),
    packageManager: detection.packageManager,
    detection,
  };
}

/**
 * Load preset definitions from system/presets/.
 * @param {string} [targetDir]
 * @returns {Array<object>}
 */
function loadPresets(targetDir) {
  const candidates = [];
  if (targetDir) {
    candidates.push(path.join(targetDir, ".effectum", "presets"));
  }
  const repoRoot = path.resolve(__dirname, "..", "..");
  candidates.push(path.join(repoRoot, "system", "presets"));

  for (const dir of candidates) {
    if (!fs.existsSync(dir)) continue;
    const presets = [];
    const files = fs.readdirSync(dir).filter((f) => f.endsWith(".json"));
    for (const file of files) {
      try {
        const content = JSON.parse(
          fs.readFileSync(path.join(dir, file), "utf8"),
        );
        presets.push(content);
      } catch (_) {
        // skip malformed preset files
      }
    }
    if (presets.length > 0) return presets;
  }
  return [];
}

module.exports = {
  detectProjectName,
  detectStack,
  detectPackageManager,
  detectModular,
  detectionToStackKey,
  detectAll,
  loadPresets,
  loadDetectionRules,
  // Exposed for testing
  parsePackageJson,
  parsePythonDeps,
  parseGoMod,
  parsePubspecYaml,
  parseSwiftPackage,
};
