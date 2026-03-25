#!/usr/bin/env node
/**
 * npm-stats.mjs — Track @aslomon/effectum downloads + GitHub stars.
 *
 * Usage:
 *   node scripts/npm-stats.mjs
 *   node scripts/npm-stats.mjs --json
 *
 * Writes Markdown report to reports/npm-stats-YYYY-MM-DD.md
 * Also prints summary to stdout.
 *
 * Safe for Cron: single run, exits cleanly, no side effects.
 */

import { writeFileSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(__dirname, "..");
const PACKAGE = "@aslomon/effectum";
const GITHUB_REPO = "aslomon/effectum";
const JSON_OUTPUT = process.argv.includes("--json");

async function fetchNpmDownloads(period) {
  const url = `https://api.npmjs.org/downloads/point/${period}/${encodeURIComponent(PACKAGE)}`;
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "effectum-stats/1.0" },
      signal: AbortSignal.timeout(10_000),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.downloads ?? null;
  } catch {
    return null;
  }
}

async function fetchGitHubStars() {
  const url = `https://api.github.com/repos/${GITHUB_REPO}`;
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "effectum-stats/1.0" },
      signal: AbortSignal.timeout(10_000),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return {
      stars: data.stargazers_count ?? null,
      forks: data.forks_count ?? null,
      openIssues: data.open_issues_count ?? null,
      watchers: data.watchers_count ?? null,
    };
  } catch {
    return null;
  }
}

async function fetchNpmVersion() {
  const url = `https://registry.npmjs.org/${encodeURIComponent(PACKAGE)}/latest`;
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "effectum-stats/1.0" },
      signal: AbortSignal.timeout(10_000),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.version ?? null;
  } catch {
    return null;
  }
}

function formatNum(n) {
  if (n === null || n === undefined) return "N/A";
  return n.toLocaleString("en-US");
}

async function main() {
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10);

  // Fetch in parallel
  const [lastDay, lastWeek, lastMonth, github, version] = await Promise.all([
    fetchNpmDownloads("last-day"),
    fetchNpmDownloads("last-week"),
    fetchNpmDownloads("last-month"),
    fetchGitHubStars(),
    fetchNpmVersion(),
  ]);

  const stats = {
    date: dateStr,
    package: PACKAGE,
    version,
    npm: {
      lastDay,
      lastWeek,
      lastMonth,
    },
    github: github ?? { stars: null, forks: null, openIssues: null, watchers: null },
  };

  if (JSON_OUTPUT) {
    console.log(JSON.stringify(stats, null, 2));
    return;
  }

  // Markdown report
  const md = `# npm Stats — ${dateStr}

**Package:** \`${PACKAGE}\`  
**Version:** ${version ?? "unknown"}  
**Generated:** ${now.toISOString()}

---

## npm Downloads

| Period | Downloads |
|--------|-----------|
| Last 24h | ${formatNum(lastDay)} |
| Last 7 days | ${formatNum(lastWeek)} |
| Last 30 days | ${formatNum(lastMonth)} |

## GitHub

| Metric | Value |
|--------|-------|
| ⭐ Stars | ${formatNum(github?.stars)} |
| 🍴 Forks | ${formatNum(github?.forks)} |
| 👁️ Watchers | ${formatNum(github?.watchers)} |
| 🐛 Open Issues | ${formatNum(github?.openIssues)} |

---

_Next milestone: 100 GitHub Stars 🎯_
`;

  // Write report
  const reportsDir = join(REPO_ROOT, "reports");
  try {
    mkdirSync(reportsDir, { recursive: true });
  } catch {}

  const reportPath = join(reportsDir, `npm-stats-${dateStr}.md`);
  writeFileSync(reportPath, md, "utf8");

  // Print summary to stdout
  console.log(`📦 ${PACKAGE} @ ${version ?? "?"}`);
  console.log(`   Downloads: ${formatNum(lastDay)}/day · ${formatNum(lastWeek)}/week · ${formatNum(lastMonth)}/month`);
  console.log(`   GitHub: ⭐ ${formatNum(github?.stars)} · 🍴 ${formatNum(github?.forks)}`);
  console.log(`   Report: ${reportPath}`);
}

main().catch((err) => {
  console.error("npm-stats error:", err.message);
  process.exit(1);
});
