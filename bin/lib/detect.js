/**
 * Auto-detection: project name, tech stack, package manager.
 */
"use strict";

const fs = require("fs");
const path = require("path");

/**
 * Detect project name from directory name.
 * @param {string} dir
 * @returns {string}
 */
function detectProjectName(dir) {
  return path.basename(path.resolve(dir));
}

/**
 * Detect tech stack from project files.
 * @param {string} dir
 * @returns {string|null} stack key or null
 */
function detectStack(dir) {
  const packageJsonPath = path.join(dir, "package.json");
  if (fs.existsSync(packageJsonPath)) {
    try {
      const pkg = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));
      const allDeps = {
        ...pkg.dependencies,
        ...pkg.devDependencies,
      };
      if (allDeps["next"] && allDeps["@supabase/supabase-js"]) {
        return "nextjs-supabase";
      }
      if (allDeps["next"]) {
        return "nextjs-supabase";
      }
    } catch (_) {
      // ignore parse errors
    }
  }

  const pyprojectPath = path.join(dir, "pyproject.toml");
  const requirementsPath = path.join(dir, "requirements.txt");
  if (fs.existsSync(pyprojectPath) || fs.existsSync(requirementsPath)) {
    return "python-fastapi";
  }

  const packageSwiftPath = path.join(dir, "Package.swift");
  const xcodeprojExists = fs
    .readdirSync(dir)
    .some((f) => f.endsWith(".xcodeproj") || f.endsWith(".xcworkspace"));
  if (fs.existsSync(packageSwiftPath) || xcodeprojExists) {
    return "swift-ios";
  }

  return null;
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
  if (fs.existsSync(path.join(dir, "Package.swift")))
    return "swift package (SPM)";
  if (fs.existsSync(path.join(dir, "package.json"))) return "npm";
  return "npm";
}

/**
 * Run all detections and return a summary.
 * @param {string} dir
 * @returns {{ projectName: string, stack: string|null, packageManager: string }}
 */
function detectAll(dir) {
  return {
    projectName: detectProjectName(dir),
    stack: detectStack(dir),
    packageManager: detectPackageManager(dir),
  };
}

module.exports = {
  detectProjectName,
  detectStack,
  detectPackageManager,
  detectAll,
};
