# Effectum Demo Script

> For terminal recordings (asciinema / VHS). Run with: `vhs demo-script.tape`
> Or use as reference for manual recording.

---

## Quickstart Demo (~45 seconds)

```
# 1. Install
$ npx @aslomon/effectum

  ┌─────────────────────────────────────┐
  │       Effectum v0.13.0              │
  │  Autonomous dev system for Claude   │
  └─────────────────────────────────────┘

  ◆ Install location?
  ● Current project  ○ Different directory

  ◆ Project name: my-app
  ◆ Stack detected: Next.js + Supabase ✓

  ◆ Autonomy level?
  ● Standard  ○ Conservative  ○ Full Autonomy

  ✓ Effectum configured in 12 seconds.

  → Next: /effectum:setup . then /effect:prd:new

# 2. Write a spec
$ claude code
> /effect:prd:new

  Starting PRD Workshop...
  ◆ What are you building?
  > User authentication with email + magic link

  ✓ PRD generated: .effectum/workshop/prds/001-auth.md
  → 5 acceptance criteria defined
  → Completion promise: "build passes, 12 tests green, 0 type errors"

# 3. Implement
> /ralph-loop

  Starting Ralph Loop (max 30 iterations)...
  
  [1/30] Planning implementation...
  [1/30] Writing code...
  [1/30] ✓ build — PASS
  [1/30] ✗ tests — 7/12 (need 80%)
  
  [2/30] Fixing failing tests...
  [2/30] ✓ build — PASS
  [2/30] ✓ tests — 12/12
  [2/30] ✓ types — 0 errors
  [2/30] ✓ lint — clean
  
  ✓ Completion promise satisfied in 2 iterations.
  ✓ All 8 quality gates passed.
  
  Done. Ready for review: /effect:dev:review
```

---

## VHS Tape (if vhs is installed)

```tape
Output demo.gif
Set FontSize 14
Set Width 900
Set Height 500
Set Theme "Catppuccin Mocha"

Type "npx @aslomon/effectum"
Enter
Sleep 2s

Type "# Effectum installs in seconds..."
Sleep 1s
```

---

## Static Screenshot Equivalent (for README)

```
╭─────────────────────────────────────────────────────────────╮
│  $ npx @aslomon/effectum                                    │
│                                                             │
│  ┌─────────────────────────────────────┐                   │
│  │       Effectum v0.13.0              │                   │
│  │  Autonomous dev system for Claude   │                   │
│  └─────────────────────────────────────┘                   │
│                                                             │
│  ◆ Install location?                                        │
│  ● Current project                                          │
│                                                             │
│  ◆ Stack detected: Next.js + Supabase ✓                    │
│  ◆ Autonomy level: Standard                                 │
│                                                             │
│  ✓ Configured in 12s. Run /effect:prd:new to start.               │
╰─────────────────────────────────────────────────────────────╯
```
