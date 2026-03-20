#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const readline = require('readline');
const os = require('os');
const { spawnSync } = require('child_process');

// ─── ANSI colors ───────────────────────────────────────────────────────────
const c = {
  reset:   '\x1b[0m',
  bold:    '\x1b[1m',
  dim:     '\x1b[2m',
  yellow:  '\x1b[33m',
  cyan:    '\x1b[36m',
  green:   '\x1b[32m',
  red:     '\x1b[31m',
  magenta: '\x1b[35m',
  blue:    '\x1b[34m',
  white:   '\x1b[37m',
  bgBlack: '\x1b[40m',
};

const bold    = s => `${c.bold}${s}${c.reset}`;
const yellow  = s => `${c.yellow}${s}${c.reset}`;
const cyan    = s => `${c.cyan}${s}${c.reset}`;
const green   = s => `${c.green}${s}${c.reset}`;
const red     = s => `${c.red}${s}${c.reset}`;
const dim     = s => `${c.dim}${s}${c.reset}`;

// ─── Banner ────────────────────────────────────────────────────────────────
function printBanner() {
  console.log();
  console.log(yellow('  ⚡') + bold(yellow(' EFFECTUM')));
  console.log(dim('  Autonomous development system for Claude Code'));
  console.log(dim('  Describe what you want. Get production-ready code.'));
  console.log();
}

// ─── Readline helpers ──────────────────────────────────────────────────────
function createRL() {
  return readline.createInterface({
    input:  process.stdin,
    output: process.stdout,
  });
}

function ask(rl, question) {
  return new Promise(resolve => rl.question(question, answer => resolve(answer.trim())));
}

async function askChoice(rl, question, choices, defaultIdx = 0) {
  console.log(question);
  choices.forEach((ch, i) => {
    const marker = i === defaultIdx ? green('▶') : ' ';
    const num    = cyan(`${i + 1}`);
    const label  = i === defaultIdx ? bold(ch.label) : ch.label;
    console.log(`  ${marker} ${num}) ${label}${ch.desc ? dim('  — ' + ch.desc) : ''}`);
  });
  const answer = await ask(rl, `  ${dim(`[1-${choices.length}, default ${defaultIdx + 1}]:`)} `);
  const n = parseInt(answer, 10);
  if (!answer || isNaN(n) || n < 1 || n > choices.length) return defaultIdx;
  return n - 1;
}

async function confirm(rl, question, defaultYes = true) {
  const hint = defaultYes ? dim('[Y/n]') : dim('[y/N]');
  const answer = await ask(rl, `${question} ${hint} `);
  if (!answer) return defaultYes;
  return answer.toLowerCase().startsWith('y');
}

// ─── File helpers ──────────────────────────────────────────────────────────
function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function copyFile(src, dest, opts = {}) {
  const { skipExisting = false } = opts;
  if (fs.existsSync(dest) && skipExisting) {
    return { status: 'skipped', dest };
  }
  ensureDir(path.dirname(dest));
  fs.copyFileSync(src, dest);
  return { status: 'created', dest };
}

function copyDir(srcDir, destDir, opts = {}) {
  const results = [];
  if (!fs.existsSync(srcDir)) return results;

  const entries = fs.readdirSync(srcDir, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath  = path.join(srcDir, entry.name);
    const destPath = path.join(destDir, entry.name);
    if (entry.isDirectory()) {
      results.push(...copyDir(srcPath, destPath, opts));
    } else {
      results.push(copyFile(srcPath, destPath, opts));
    }
  }
  return results;
}

// ─── Deep-merge two plain objects ─────────────────────────────────────────
function deepMerge(target, source) {
  const out = Object.assign({}, target);
  for (const key of Object.keys(source)) {
    if (
      source[key] && typeof source[key] === 'object' && !Array.isArray(source[key]) &&
      out[key]    && typeof out[key]    === 'object' && !Array.isArray(out[key])
    ) {
      out[key] = deepMerge(out[key], source[key]);
    } else {
      out[key] = source[key];
    }
  }
  return out;
}

// ─── Merge settings.json (template → existing) ────────────────────────────
function mergeSettings(templatePath, destPath) {
  let template;
  try {
    template = JSON.parse(fs.readFileSync(templatePath, 'utf8'));
  } catch (e) {
    return { status: 'error', dest: destPath, error: `Could not read template: ${e.message}` };
  }

  let existing = {};
  if (fs.existsSync(destPath)) {
    try {
      existing = JSON.parse(fs.readFileSync(destPath, 'utf8'));
    } catch (_) {
      // corrupted/empty — overwrite
    }
  }

  // Template wins for all keys, but preserve keys only in existing
  const merged = deepMerge(existing, template);

  ensureDir(path.dirname(destPath));
  fs.writeFileSync(destPath, JSON.stringify(merged, null, 2) + '\n', 'utf8');
  return { status: 'created', dest: destPath };
}

// ─── Find repo root ────────────────────────────────────────────────────────
function findRepoRoot() {
  const binDir = path.dirname(__filename);
  const repoRoot = path.resolve(binDir, '..');
  if (fs.existsSync(path.join(repoRoot, 'system', 'commands'))) {
    return repoRoot;
  }
  return repoRoot;
}

// ─── Parse CLI args ────────────────────────────────────────────────────────
function parseArgs(argv) {
  const args = argv.slice(2);
  return {
    global:         args.includes('--global') || args.includes('-g'),
    local:          args.includes('--local')  || args.includes('-l'),
    claude:         args.includes('--claude'),
    withMcp:        args.includes('--with-mcp'),
    withPlaywright: args.includes('--with-playwright'),
    nonInteractive: args.includes('--yes') || args.includes('-y') ||
                    args.includes('--global') || args.includes('--local'),
    help:           args.includes('--help') || args.includes('-h'),
  };
}

// ─── MCP Server definitions ────────────────────────────────────────────────
const MCP_SERVERS = [
  {
    key:     'context7',
    label:   'Context7',
    package: '@upstash/context7-mcp',
    desc:    'Context management — up-to-date library docs for Claude',
    config: {
      command: 'npx',
      args:    ['-y', '@upstash/context7-mcp'],
    },
  },
  {
    key:     'playwright',
    label:   'Playwright MCP',
    package: '@playwright/mcp',
    desc:    'E2E browser automation — required for /e2e command',
    config: {
      command: 'npx',
      args:    ['-y', '@playwright/mcp'],
    },
  },
  {
    key:     'sequential-thinking',
    label:   'Sequential Thinking',
    package: '@modelcontextprotocol/server-sequential-thinking',
    desc:    'Complex planning and multi-step reasoning',
    config: {
      command: 'npx',
      args:    ['-y', '@modelcontextprotocol/server-sequential-thinking'],
    },
  },
  {
    key:     'filesystem',
    label:   'Filesystem',
    package: '@modelcontextprotocol/server-filesystem',
    desc:    'File operations (read/write/search)',
    config: {
      command: 'npx',
      args:    ['-y', '@modelcontextprotocol/server-filesystem', process.cwd()],
    },
  },
];

// ─── Check if package is available via npx (quick dry-run) ────────────────
function checkPackageAvailable(pkg) {
  try {
    // Try `npm view` — fast, no install, works offline cache check
    const result = spawnSync('npm', ['view', pkg, 'version'], {
      timeout: 8000,
      stdio:   'pipe',
      encoding: 'utf8',
    });
    return result.status === 0 && result.stdout.trim().length > 0;
  } catch (_) {
    return false;
  }
}

// ─── Install / verify MCP servers ─────────────────────────────────────────
function installMcpServers(verbose = true) {
  const results = [];

  for (const server of MCP_SERVERS) {
    if (verbose) process.stdout.write(`     ${dim(server.label + '...')} `);

    try {
      const available = checkPackageAvailable(server.package);
      if (available) {
        if (verbose) console.log(green('✓') + dim(` ${server.package}`));
        results.push({ ...server, ok: true, note: 'available via npx' });
      } else {
        // Try npm install -g as fallback
        const install = spawnSync('npm', ['install', '-g', server.package], {
          timeout: 60000,
          stdio: 'pipe',
          encoding: 'utf8',
        });
        if (install.status === 0) {
          if (verbose) console.log(green('✓') + dim(' installed globally'));
          results.push({ ...server, ok: true, note: 'installed globally' });
        } else {
          if (verbose) console.log(yellow('⚠') + dim(' npm check failed — will use npx at runtime'));
          results.push({ ...server, ok: true, note: 'npx at runtime (not pre-installed)' });
        }
      }
    } catch (err) {
      if (verbose) console.log(red('✗') + ` ${err.message}`);
      results.push({ ...server, ok: false, error: err.message });
    }
  }

  return results;
}

// ─── Add MCP servers to settings.json ─────────────────────────────────────
function addMcpToSettings(settingsPath, mcpResults) {
  let settings = {};
  if (fs.existsSync(settingsPath)) {
    try {
      settings = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
    } catch (_) {}
  }

  if (!settings.mcpServers) settings.mcpServers = {};

  // Add each server that didn't hard-fail
  for (const result of mcpResults) {
    if (!result.ok) continue;
    if (!settings.mcpServers[result.key]) {
      settings.mcpServers[result.key] = result.config;
    }
  }

  // Also ensure mcp__playwright and mcp__sequential-thinking are in permissions.allow
  if (settings.permissions && Array.isArray(settings.permissions.allow)) {
    const toAdd = ['mcp__playwright', 'mcp__sequential-thinking', 'mcp__context7', 'mcp__filesystem'];
    for (const perm of toAdd) {
      if (!settings.permissions.allow.includes(perm)) {
        settings.permissions.allow.push(perm);
      }
    }
  }

  fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2) + '\n', 'utf8');
}

// ─── Install Playwright browsers ──────────────────────────────────────────
function installPlaywrightBrowsers(verbose = true) {
  if (verbose) process.stdout.write(`     ${dim('Installing Playwright browsers...')} `);
  try {
    const result = spawnSync('npx', ['playwright', 'install', '--with-deps', 'chromium'], {
      timeout: 120000,
      stdio: 'pipe',
      encoding: 'utf8',
    });
    if (result.status === 0) {
      if (verbose) console.log(green('✓'));
      return { ok: true };
    } else {
      // Try without --with-deps (CI environments)
      const result2 = spawnSync('npx', ['playwright', 'install', 'chromium'], {
        timeout: 120000,
        stdio: 'pipe',
        encoding: 'utf8',
      });
      if (result2.status === 0) {
        if (verbose) console.log(green('✓') + dim(' (chromium only)'));
        return { ok: true };
      }
      if (verbose) console.log(yellow('⚠') + dim(' browser install failed — run: npx playwright install'));
      return { ok: false, error: result.stderr };
    }
  } catch (err) {
    if (verbose) console.log(yellow('⚠') + dim(` ${err.message}`));
    return { ok: false, error: err.message };
  }
}

// ─── Create playwright.config.ts if missing ───────────────────────────────
function ensurePlaywrightConfig(targetDir) {
  const tsConfig  = path.join(targetDir, 'playwright.config.ts');
  const jsConfig  = path.join(targetDir, 'playwright.config.js');
  if (fs.existsSync(tsConfig) || fs.existsSync(jsConfig)) {
    return { status: 'skipped', dest: tsConfig };
  }
  const content = `import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
`;
  ensureDir(path.dirname(tsConfig));
  fs.writeFileSync(tsConfig, content, 'utf8');
  return { status: 'created', dest: tsConfig };
}

// ─── Verify ralph-loop command ────────────────────────────────────────────
function verifyRalphLoop(commandsDir) {
  const ralphPath = path.join(commandsDir, 'ralph-loop.md');
  return fs.existsSync(ralphPath);
}

// ─── Install logic ─────────────────────────────────────────────────────────
async function install(opts) {
  const { targetDir, repoRoot, isGlobal, runtime } = opts;

  // For global installs, .claude/ is the target dir itself
  const claudeDir   = isGlobal ? targetDir : path.join(targetDir, '.claude');
  const commandsDir = path.join(claudeDir, 'commands');

  const steps = [];

  // 1. system/commands/*.md → .claude/commands/  (always overwrite)
  const srcCommands = path.join(repoRoot, 'system', 'commands');
  const cmdResults  = copyDir(srcCommands, commandsDir, { skipExisting: false });
  steps.push(...cmdResults);

  // 2. AUTONOMOUS-WORKFLOW.md → target/
  const awSrc  = path.join(repoRoot, 'system', 'templates', 'AUTONOMOUS-WORKFLOW.md');
  const awDest = isGlobal
    ? path.join(os.homedir(), '.effectum', 'AUTONOMOUS-WORKFLOW.md')
    : path.join(targetDir, 'AUTONOMOUS-WORKFLOW.md');
  steps.push(copyFile(awSrc, awDest, { skipExisting: false }));

  // 3. settings.json — ALWAYS merge (template wins, existing keys preserved)
  const settingsSrc  = path.join(repoRoot, 'system', 'templates', 'settings.json.tmpl');
  const settingsDest = path.join(claudeDir, 'settings.json');
  steps.push(mergeSettings(settingsSrc, settingsDest));

  // 4. guardrails.md — ALWAYS overwrite
  const guardrailsSrc  = path.join(repoRoot, 'system', 'templates', 'guardrails.md.tmpl');
  const guardrailsDest = path.join(claudeDir, 'guardrails.md');
  steps.push(copyFile(guardrailsSrc, guardrailsDest, { skipExisting: false }));

  // 5. workshop/ — copy for BOTH local and global
  const workshopSrc  = path.join(repoRoot, 'workshop');
  const workshopDest = isGlobal
    ? path.join(os.homedir(), '.effectum', 'workshop')
    : path.join(targetDir, 'workshop');
  const wResults = copyDir(workshopSrc, workshopDest, { skipExisting: true });
  steps.push(...wResults);

  // 6. Copy templates + stacks so /setup can find them after npx install
  const templatesSrc = path.join(repoRoot, 'system', 'templates');
  const stacksSrc    = path.join(repoRoot, 'system', 'stacks');
  const effectumDir  = isGlobal
    ? path.join(os.homedir(), '.effectum')
    : path.join(targetDir, '.effectum');
  const tResults = copyDir(templatesSrc, path.join(effectumDir, 'templates'), { skipExisting: false });
  const sResults = copyDir(stacksSrc,    path.join(effectumDir, 'stacks'),    { skipExisting: false });
  steps.push(...tResults, ...sResults);

  return steps;
}

// ─── Status icon ──────────────────────────────────────────────────────────
function statusIcon(status) {
  switch (status) {
    case 'created':  return green('✓');
    case 'skipped':  return dim('─');
    case 'error':    return red('✗');
    default:         return dim('·');
  }
}

// ─── Main ──────────────────────────────────────────────────────────────────
async function main() {
  const args    = parseArgs(process.argv);
  const repoRoot = findRepoRoot();

  if (args.help) {
    console.log(`
${bold('effectum')} — autonomous development system for Claude Code

${bold('Usage:')}
  npx effectum                              Interactive installer
  npx effectum --global                     Install to ~/.claude/ (no prompts)
  npx effectum --local                      Install to ./.claude/ (no prompts)
  npx effectum --global --claude            Non-interactive, Claude Code runtime
  npx effectum --global --with-mcp          Include MCP server setup
  npx effectum --global --with-playwright   Include Playwright browser install
  npx effectum --global --claude --with-mcp --with-playwright   Full install

${bold('Options:')}
  --global, -g        Install globally for all projects (~/.claude/)
  --local,  -l        Install locally for this project (./.claude/)
  --claude            Select Claude Code runtime (default)
  --with-mcp          Install MCP servers (Context7, Playwright, Sequential Thinking, Filesystem)
  --with-playwright   Install Playwright browsers
  --yes, -y           Skip confirmation prompts
  --help, -h          Show this help
`);
    process.exit(0);
  }

  printBanner();

  // ── Check repo files exist ───────────────────────────────────────────────
  if (!fs.existsSync(path.join(repoRoot, 'system', 'commands'))) {
    console.log(red('✗ Error:') + ' Could not find Effectum system files.');
    console.log(dim('  Expected: ' + path.join(repoRoot, 'system', 'commands')));
    console.log(dim('  This is a bug — please report it at https://github.com/aslomon/effectum/issues'));
    process.exit(1);
  }

  let isGlobal;
  let runtime = 'claude';
  let wantMcp = args.withMcp;
  let wantPlaywright = args.withPlaywright;

  // ── Non-interactive mode ─────────────────────────────────────────────────
  if (args.global || args.local) {
    isGlobal = args.global;
    if (args.claude) runtime = 'claude';
    // wantMcp / wantPlaywright already set from flags
  } else {
    // ── Interactive mode ───────────────────────────────────────────────────
    const rl = createRL();

    try {
      // Scope question
      const scopeIdx = await askChoice(rl,
        bold('Where do you want to install Effectum?'),
        [
          { label: 'Global',  desc: 'all projects  (~/.claude/)' },
          { label: 'Local',   desc: 'this project only  (./.claude/)' },
        ],
        0
      );
      isGlobal = scopeIdx === 0;
      console.log();

      // Runtime question
      const runtimeIdx = await askChoice(rl,
        bold('Which AI coding runtime?'),
        [
          { label: 'Claude Code',                desc: 'default — recommended' },
          { label: 'Codex / Gemini / OpenCode',  desc: 'coming soon' },
        ],
        0
      );
      runtime = runtimeIdx === 0 ? 'claude' : 'other';
      console.log();

      if (runtime === 'other') {
        console.log(yellow('⚠') + '  Only Claude Code is fully supported right now.');
        console.log(dim('   Other runtimes are on the roadmap. Proceeding with Claude Code configuration.'));
        runtime = 'claude';
        console.log();
      }

      // MCP question
      wantMcp = await confirm(rl,
        bold('Install MCP servers?') + dim('  (Context7, Playwright MCP, Sequential Thinking, Filesystem)'),
        true
      );
      console.log();

      // Playwright question
      if (wantMcp) {
        wantPlaywright = await confirm(rl,
          bold('Install Playwright browsers?') + dim('  (required for /e2e command)'),
          true
        );
        console.log();
      }

    } finally {
      rl.close();
    }
  }

  // ── Determine target directory ───────────────────────────────────────────
  // For global: target is ~/.claude/  (so claudeDir = ~/.claude/)
  // For local:  target is ./          (so claudeDir = ./.claude/)
  const homeClaudeDir = path.join(os.homedir(), '.claude');
  const targetDir     = isGlobal ? homeClaudeDir : process.cwd();
  const displayTarget = isGlobal ? '~/.claude' : './.claude';

  console.log(`  ${dim('Scope:')}   ${cyan(isGlobal ? 'Global' : 'Local')}`);
  console.log(`  ${dim('Target:')}  ${cyan(displayTarget)}`);
  console.log(`  ${dim('Runtime:')} ${cyan('Claude Code')}`);
  console.log();

  // ── Step 1: Workflow commands + files ────────────────────────────────────
  console.log(bold('  1. Installing workflow commands...'));
  let steps;
  try {
    steps = await install({ targetDir, repoRoot, isGlobal, runtime });
  } catch (err) {
    console.log(red('  ✗ Installation failed:') + ' ' + err.message);
    process.exit(1);
  }

  // Print file results
  for (const step of steps) {
    if (!step || !step.dest) continue;
    const homeDir = os.homedir();
    const rel = step.dest.startsWith(homeDir)
      ? '~/' + path.relative(homeDir, step.dest)
      : path.relative(process.cwd(), step.dest);
    const icon = statusIcon(step.status);
    if (step.status === 'error') {
      console.log(`     ${icon}  ${red(rel)} — ${step.error || ''}`);
    } else {
      console.log(`     ${icon}  ${step.status === 'skipped' ? dim(rel) : rel}`);
    }
  }

  // Verify ralph-loop
  const settingsPath = isGlobal
    ? path.join(homeClaudeDir, 'settings.json')
    : path.join(targetDir, '.claude', 'settings.json');

  const commandsInstallDir = isGlobal
    ? path.join(homeClaudeDir, 'commands')
    : path.join(targetDir, '.claude', 'commands');

  if (verifyRalphLoop(commandsInstallDir)) {
    console.log(`     ${green('✓')}  ralph-loop command ${dim('verified')}`);
  } else {
    console.log(`     ${yellow('⚠')}  ralph-loop command not found`);
  }

  console.log(`  ${green('✅')} Done`);
  console.log();

  // ── Step 2: MCP servers ──────────────────────────────────────────────────
  if (wantMcp) {
    console.log(bold('  2. Installing MCP servers...'));
    const mcpResults = installMcpServers(true);

    // Inject into settings.json
    try {
      addMcpToSettings(settingsPath, mcpResults);
      console.log(`     ${green('✓')}  MCP servers added to settings.json`);
    } catch (err) {
      console.log(`     ${red('✗')}  Could not update settings.json: ${err.message}`);
    }

    console.log(`  ${green('✅')} Done`);
    console.log();
  }

  // ── Step 3: Playwright browsers ──────────────────────────────────────────
  if (wantPlaywright) {
    console.log(bold('  3. Setting up Playwright...'));
    installPlaywrightBrowsers(true);

    // Create playwright.config.ts in the current project (local installs only)
    if (!isGlobal) {
      const pcResult = ensurePlaywrightConfig(process.cwd());
      const icon = statusIcon(pcResult.status);
      const rel  = path.relative(process.cwd(), pcResult.dest);
      console.log(`     ${icon}  ${pcResult.status === 'skipped' ? dim(rel) : rel}`);
    }

    console.log(`  ${green('✅')} Done`);
    console.log();
  }

  // ── Step 4: Summary ──────────────────────────────────────────────────────
  const createdCount = steps.filter(s => s && s.status === 'created').length;
  const skippedCount = steps.filter(s => s && s.status === 'skipped').length;

  console.log(green('⚡') + bold(' Effectum ready!'));
  console.log();
  console.log(`  ${dim('Files installed:')}  ${createdCount}`);
  if (skippedCount) console.log(`  ${dim('Already existed:')} ${skippedCount} ${dim('(preserved)')}`);
  if (wantMcp)        console.log(`  ${dim('MCP servers:')}     ${MCP_SERVERS.length} configured`);
  if (wantPlaywright) console.log(`  ${dim('Playwright:')}      browsers installed`);
  console.log();

  if (isGlobal) {
    console.log('  ' + bold('Next steps:'));
    console.log(`  ${cyan('1.')} Open Claude Code in any project`);
    console.log(`  ${cyan('2.')} Run ${bold('/setup ~/your-project')} to configure it`);
    console.log(`       ${dim('↳ /setup substitutes placeholders in settings.json for your project')}`);
    console.log(`  ${cyan('3.')} Write a spec with ${bold('/prd:new')}`);
  } else {
    console.log('  ' + bold('Next steps:'));
    console.log(`  ${cyan('1.')} Open Claude Code here: ${dim('claude')}`);
    console.log(`  ${cyan('2.')} Run ${bold('/setup .')} to configure this project`);
    console.log(`       ${dim('↳ /setup substitutes placeholders in settings.json for your project')}`);
    console.log(`  ${cyan('3.')} Write a spec with ${bold('/prd:new')}`);
  }

  console.log();
  console.log(dim('  Docs: https://github.com/aslomon/effectum'));
  console.log();
}

main().catch(err => {
  console.error(red('Fatal error:'), err.message);
  process.exit(1);
});
