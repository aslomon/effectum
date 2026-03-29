# DESIGN.md Workflow

> Effectum feature — available in v0.13.0+

---

## What is DESIGN.md?

`DESIGN.md` is a structured visual specification document that lives in your project root. It defines **how your UI should look and behave** — tokens, typography, component patterns, layout rules, and explicit constraints.

> **PRD defines the product. DESIGN.md defines the interface.**

It bridges the gap between product requirements and implementation by giving agents (and humans) a single source of truth for visual decisions.

Without `DESIGN.md`, agents improvise visual choices and default to generic UI patterns. With it, they can produce consistent, intentional interfaces on the first pass.

---

## When to use it

Use `DESIGN.md` for projects with a meaningful frontend:

| Project type | Use DESIGN.md? |
|--------------|----------------|
| Web app | ✅ Yes |
| Mobile app | ✅ Yes |
| Fullstack product | ✅ Yes |
| CLI tool | ❌ No |
| API backend | ❌ No |
| Library / SDK | ❌ No |
| Automation agent | ❌ No |

Generate it **before** implementation begins:

```
/effect:prd:new → PRD approved → /effect:design → DESIGN.md generated → /effect:dev:plan → /ralph-loop
```

---

## How to run `/effect:design`

In Claude Code, run:

```
/effect:design
```

The command will:
1. **Read your active PRD** — extracts project name, app type, and context
2. **Scan for design signals** — checks for Tailwind, shadcn/ui, CSS variables
3. **Ask 3–5 questions** — color palette, typography feel, UI complexity, anything to avoid
4. **Generate `DESIGN.md`** in your project root

The whole flow takes about 2–5 minutes including the Q&A.

---

## What the sections mean

### Overview
Project name, stack, and a one-sentence design philosophy. Sets the tone for everything below.

### Color System
All color tokens with hex values and usage context. Divided into primary, secondary, semantic (success/warning/error), and neutral scales. Agents use this to avoid inventing colors.

### Typography
Font families, type scale (sizes + line heights + weights), and weight conventions. Keeps text hierarchy consistent across components.

### Component Patterns
Which component library you're using (shadcn/ui, Radix, custom, etc.), preferred patterns to follow, and — critically — patterns to avoid. The "avoid" list prevents agents from adding unwanted dependencies.

### Layout & Spacing
Max content width, page padding, column system, spacing scale, and breakpoints. Eliminates guesswork in layout decisions.

### Interaction Design
Animation philosophy, transition timings, hover state patterns, and loading conventions (skeleton vs spinner, optimistic updates, error states).

### Constraints
⚠️ **The most important section for agents.** Hard rules that must never be broken, style prohibitions, library prohibitions, and tone guidance. Be specific and opinionated here.

### Appendix: Codebase Signals
Auto-populated by `/effect:design`. Lists what was detected in the project (Tailwind, shadcn config, CSS variables) so you can see what was observed vs. proposed.

---

## Maintaining DESIGN.md

Update `DESIGN.md` when:
- You introduce a new component library or UI framework
- The color palette changes significantly
- You establish new patterns that agents should follow (or avoid)
- You add dark mode support (document both token sets)

It's a living document — keep it accurate or agents will follow outdated conventions.

---

## Example: Next.js + Tailwind + shadcn/ui

Below is a realistic excerpt showing the Constraints and Color System sections for a SaaS app:

```markdown
## Color System

| Token | Hex | Usage |
|-------|-----|-------|
| `--color-primary` | `#6366f1` | Primary actions, links, focus rings |
| `--color-primary-hover` | `#4f46e5` | Hover state for primary buttons |
| `--color-primary-foreground` | `#ffffff` | Text on primary background |
| `--color-destructive` | `#ef4444` | Error states, delete actions |
| `--color-background` | `#fafafa` | Page background |
| `--color-foreground` | `#0f172a` | Default text |
| `--color-border` | `#e2e8f0` | Borders, dividers |

## Constraints

### Hard Rules
- All styles via Tailwind classes — no inline styles
- Use shadcn/ui Dialog for modals — no custom implementations
- All interactive elements must be keyboard accessible
- Use semantic HTML (button, nav, main, section, article)

### Style Prohibitions
- No pure black (#000) — use `--color-foreground` token
- No gradients outside hero sections
- No box shadows heavier than `shadow-md`
- No animations longer than 300ms

### Library Prohibitions
- Do not add MUI, Chakra UI, or Ant Design
- Do not import lodash — use native JS

### Tone
- Professional but approachable — clear information hierarchy, generous whitespace
```

---

## FAQ

**Can I edit DESIGN.md manually?**  
Yes. It's a plain Markdown file. Edit it any time. Agents will use whatever is in the file.

**What if I skip questions in `/effect:design`?**  
The command will generate reasonable defaults marked with `<!-- ASSUMED -->`. You can replace them later.

**Should I commit DESIGN.md?**  
Yes — commit it alongside PRDs and CLAUDE.md. It's part of your project's spec layer.

**Can I have DESIGN.md without running `/effect:design`?**  
Yes. Copy `system/templates/DESIGN.md.tmpl` and fill it in manually if you prefer.

**Does DESIGN.md affect non-UI agents?**  
No. Backend and CLI agents ignore it. It only influences agents working on frontend tasks.
