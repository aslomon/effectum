"use strict";

/**
 * visual-gate-config.js
 * Parser and validator for the qualityGates.visual section of .effectum.json
 *
 * Based on design spec: knowledge/projects/effectum-visual-gate-config-schema-and-tests.md
 */

const SUPPORTED_VIEWPORTS = new Set(["desktop", "mobile", "tablet"]);
const SUPPORTED_BACKENDS = new Set([
  "openai-gpt-5.4-mini",
  "anthropic-sonnet-4.6",
]);
const SUPPORTED_ON_ERROR = new Set(["skip", "fail"]);
const SUPPORTED_PROMPT_PRESETS = new Set(["default"]);

/**
 * Default config values for qualityGates.visual
 */
const VISUAL_GATE_DEFAULTS = {
  enabled: false,
  baseUrl: null,
  routes: ["/"],
  viewports: ["desktop", "mobile"],
  backend: "openai-gpt-5.4-mini",
  outputDir: ".effectum/visual-reports",
  maxWarnings: 999,
  promptPreset: "default",
  onError: "skip",
};

/**
 * Validate a URL string.
 * @param {string} url
 * @returns {boolean}
 */
function isValidUrl(url) {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch (_) {
    return false;
  }
}

/**
 * Parse and validate the qualityGates.visual config section.
 *
 * @param {object|null|undefined} rawConfig - the full .effectum.json object
 * @returns {{ config: object, errors: string[], enabled: boolean }}
 *   config — merged config with defaults applied
 *   errors — list of validation error messages (empty if valid)
 *   enabled — true only when enabled=true AND config is valid
 */
function parseVisualGateConfig(rawConfig) {
  const errors = [];

  // No config at all → gate disabled, no errors
  if (!rawConfig || !rawConfig.qualityGates || !rawConfig.qualityGates.visual) {
    return {
      config: { ...VISUAL_GATE_DEFAULTS },
      errors: [],
      enabled: false,
    };
  }

  const raw = rawConfig.qualityGates.visual;

  // enabled=false → skip all other validation, gate is off
  if (raw.enabled === false || raw.enabled === undefined) {
    return {
      config: { ...VISUAL_GATE_DEFAULTS, ...raw, enabled: false },
      errors: [],
      enabled: false,
    };
  }

  // From here: enabled=true, validate required + optional fields

  // baseUrl — required when enabled
  if (!raw.baseUrl) {
    errors.push("qualityGates.visual.baseUrl is required when enabled is true");
  } else if (!isValidUrl(raw.baseUrl)) {
    errors.push(
      `qualityGates.visual.baseUrl is not a valid URL: "${raw.baseUrl}"`
    );
  }

  // routes — must be non-empty array of strings if provided
  if (raw.routes !== undefined) {
    if (!Array.isArray(raw.routes) || raw.routes.length === 0) {
      errors.push("qualityGates.visual.routes must be a non-empty array");
    } else {
      const bad = raw.routes.filter((r) => typeof r !== "string");
      if (bad.length > 0) {
        errors.push("qualityGates.visual.routes must contain only strings");
      }
    }
  }

  // viewports — must only contain supported values
  if (raw.viewports !== undefined) {
    if (!Array.isArray(raw.viewports) || raw.viewports.length === 0) {
      errors.push("qualityGates.visual.viewports must be a non-empty array");
    } else {
      const bad = raw.viewports.filter((v) => !SUPPORTED_VIEWPORTS.has(v));
      if (bad.length > 0) {
        errors.push(
          `qualityGates.visual.viewports contains unsupported values: ${bad.join(", ")}. Allowed: ${[...SUPPORTED_VIEWPORTS].join(", ")}`
        );
      }
    }
  }

  // backend — must be in supported list
  if (raw.backend !== undefined && !SUPPORTED_BACKENDS.has(raw.backend)) {
    errors.push(
      `qualityGates.visual.backend "${raw.backend}" is not supported in v1. Allowed: ${[...SUPPORTED_BACKENDS].join(", ")}`
    );
  }

  // maxWarnings — must be >= 0
  if (raw.maxWarnings !== undefined) {
    if (typeof raw.maxWarnings !== "number" || raw.maxWarnings < 0) {
      errors.push(
        "qualityGates.visual.maxWarnings must be a number >= 0"
      );
    }
  }

  // onError — must be in supported list
  if (raw.onError !== undefined && !SUPPORTED_ON_ERROR.has(raw.onError)) {
    errors.push(
      `qualityGates.visual.onError "${raw.onError}" is invalid. Allowed: skip, fail`
    );
  }

  // promptPreset — must be in supported list
  if (
    raw.promptPreset !== undefined &&
    !SUPPORTED_PROMPT_PRESETS.has(raw.promptPreset)
  ) {
    errors.push(
      `qualityGates.visual.promptPreset "${raw.promptPreset}" is not a known preset`
    );
  }

  // Merge with defaults (raw overrides defaults)
  const config = {
    ...VISUAL_GATE_DEFAULTS,
    ...raw,
  };

  return {
    config,
    errors,
    enabled: errors.length === 0 && config.enabled === true,
  };
}

/**
 * Format validation errors for display.
 * @param {string[]} errors
 * @returns {string}
 */
function formatConfigErrors(errors) {
  if (errors.length === 0) return "";
  return [
    "Visual Gate configuration errors:",
    ...errors.map((e) => `  - ${e}`),
  ].join("\n");
}

module.exports = {
  parseVisualGateConfig,
  formatConfigErrors,
  VISUAL_GATE_DEFAULTS,
  SUPPORTED_VIEWPORTS,
  SUPPORTED_BACKENDS,
  SUPPORTED_ON_ERROR,
};
