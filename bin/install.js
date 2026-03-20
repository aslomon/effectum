#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const readline = require('readline');
const os = require('os');

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
const magenta = s => `${c.magenta}${s}${c.reset}`;

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
  const { askOverwrite = false, rl = null } = opts;
  if (fs.existsSync(dest) && askOverwrite) {
    return { status: 'ask', src, dest };
  }
  if (fs.existsSync(dest) && opts.skipExisting) {
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

// ─── Find repo root ────────────────────────────────────────────────────────
function findRepoRoot() {
  // When run via `npx effectum`, the package files live next to bin/install.js
  const binDir = path.dirname(__filename);
  const repoRoot = path.resolve(binDir, '..');
  // Verify it looks like the effectum repo
  if (fs.existsSync(path.join(repoRoot, 'system', 'commands'))) {
    return repoRoot;
  }
  // Fallback: look for a globally installed package
  // (npm resolves __dirname correctly even in npx cache)
  return repoRoot;
}

// ─── Parse CLI args ────────────────────────────────────────────────────────
function parseArgs(argv) {
  const args = argv.slice(2);
  return {
    global:      args.includes('--global') || args.includes('-g'),
    local:       args.includes('--local')  || args.includes('-l'),
    claude:      args.includes('--claude'),
    nonInteractive: args.includes('--yes') || args.includes('-y') ||
                    args.includes('--global') || args.includes('--local'),
    help:        args.includes('--help') || args.includes('-h'),
  };
}

// ─── Install logic ─────────────────────────────────────────────────────────
async function install(opts) {
  const { targetDir, repoRoot, isGlobal, runtime } = opts;

  const claudeDir   = path.join(targetDir, '.claude');
  const commandsDir = path.join(claudeDir, 'commands');

  const steps = [];

  // 1. system/commands/*.md → .claude/commands/
  const srcCommands = path.join(repoRoot, 'system', 'commands');
  const cmdResults  = copyDir(srcCommands, commandsDir, { skipExisting: false });
  steps.push(...cmdResults);

  // 2. system/templates/AUTONOMOUS-WORKFLOW.md → target/
  const awSrc  = path.join(repoRoot, 'system', 'templates', 'AUTONOMOUS-WORKFLOW.md');
  const awDest = path.join(targetDir, 'AUTONOMOUS-WORKFLOW.md');
  steps.push(copyFile(awSrc, awDest, { skipExisting: false }));

  // 3. settings.json (skip if exists)
  const settingsSrc  = path.join(repoRoot, 'system', 'templates', 'settings.json.tmpl');
  const settingsDest = path.join(claudeDir, 'settings.json');
  steps.push(copyFile(settingsSrc, settingsDest, { skipExisting: true }));

  // 4. guardrails.md
  const guardrailsSrc  = path.join(repoRoot, 'system', 'templates', 'guardrails.md.tmpl');
  const guardrailsDest = path.join(claudeDir, 'guardrails.md');
  steps.push(copyFile(guardrailsSrc, guardrailsDest, { skipExisting: true }));

  // 5. workshop/ (only for local installs)
  if (!isGlobal) {
    const workshopSrc  = path.join(repoRoot, 'workshop');
    const workshopDest = path.join(targetDir, 'workshop');
    const wResults     = copyDir(workshopSrc, workshopDest, { skipExisting: true });
    steps.push(...wResults);
  }

  return steps;
}

// ─── Status icon ──────────────────────────────────────────────────────────
function statusIcon(status) {
  switch (status) {
    case 'created':  return green('✓');
    case 'skipped':  return dim('─');
    case 'ask':      return yellow('?');
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
  npx effectum               Interactive installer
  npx effectum --global      Install to ~/.claude/ (no prompts)
  npx effectum --local       Install to ./.claude/ (no prompts)
  npx effectum --global --claude   Non-interactive, Claude Code runtime

${bold('Options:')}
  --global, -g    Install globally for all projects (~/.claude/)
  --local,  -l    Install locally for this project (./.claude/)
  --claude        Select Claude Code runtime (default)
  --yes, -y       Skip confirmation prompts
  --help, -h      Show this help
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

  // ── Non-interactive mode ─────────────────────────────────────────────────
  if (args.global || args.local) {
    isGlobal = args.global;
    if (args.claude) runtime = 'claude';
    // proceed without asking
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

    } finally {
      rl.close();
    }
  }

  // ── Determine target directory ───────────────────────────────────────────
  const targetDir = isGlobal ? path.join(os.homedir(), '.claude') : process.cwd();
  const displayTarget = isGlobal ? '~/.claude' : './.claude';

  console.log(`  ${dim('Scope:')}   ${cyan(isGlobal ? 'Global' : 'Local')}`);
  console.log(`  ${dim('Target:')}  ${cyan(displayTarget)}`);
  console.log(`  ${dim('Runtime:')} ${cyan('Claude Code')}`);
  console.log();

  // ── Run install ──────────────────────────────────────────────────────────
  console.log(bold('Installing…'));
  console.log();

  let steps;
  try {
    steps = await install({ targetDir, repoRoot, isGlobal, runtime });
  } catch (err) {
    console.log(red('✗ Installation failed:') + ' ' + err.message);
    process.exit(1);
  }

  // Print results
  for (const step of steps) {
    if (!step || !step.dest) continue;
    const rel = isGlobal
      ? path.relative(os.homedir(), step.dest).replace(/^/, '~/')
      : path.relative(process.cwd(), step.dest);
    console.log(`  ${statusIcon(step.status)}  ${step.status === 'skipped' ? dim(rel) : rel}`);
  }

  console.log();

  // ── MCP servers ───────────────────────────────────────────────────────────
  if (!args.global && !args.local) {
    const rl2 = createRL();
    try {
      const wantMcp = await confirm(rl2, bold('Set up MCP servers?'), false);
      console.log();
      if (wantMcp) {
        console.log(dim('  MCP setup coming soon. Stay tuned!'));
        console.log();
      }
    } finally {
      rl2.close();
    }
  }

  // ── Done ──────────────────────────────────────────────────────────────────
  const createdCount = steps.filter(s => s && s.status === 'created').length;
  const skippedCount = steps.filter(s => s && s.status === 'skipped').length;

  console.log(green('✅') + bold(' Effectum installed!'));
  console.log();
  console.log(`  ${dim('Files created:')}  ${createdCount}`);
  if (skippedCount) console.log(`  ${dim('Already existed:')} ${skippedCount} ${dim('(preserved)')}`);
  console.log();

  if (isGlobal) {
    console.log('  ' + bold('Next steps:'));
    console.log(`  ${cyan('1.')} Open Claude Code in any project`);
    console.log(`  ${cyan('2.')} Run ${bold('/setup ~/your-project')} to configure it`);
    console.log(`  ${cyan('3.')} Write a spec with ${bold('/prd:new')}`);
  } else {
    console.log('  ' + bold('Next steps:'));
    console.log(`  ${cyan('1.')} Open Claude Code here: ${dim('claude')}`);
    console.log(`  ${cyan('2.')} Run ${bold('/setup .')} to configure this project`);
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
