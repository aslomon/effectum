---
name: "effect:design"
description: "Generate a structured DESIGN.md visual specification for frontend projects."
allowed-tools: ["Read", "Write", "Bash", "Glob", "Grep"]
effort: "medium"
---

> ⚠️ **`/design` is deprecated → use `/effect:design`** (removed in v0.20)


# effect:design — Generate DESIGN.md

Generate a structured `DESIGN.md` visual specification for this project.

`DESIGN.md` is to frontend work what the PRD is to feature logic: a clear, explicit constraint document that reduces ambiguity and rework.

---

## When to run

Run `effect:design` before starting frontend implementation:

```
effect:prd:new → PRD approved → effect:design → DESIGN.md generated → effect:dev:plan → effect:dev:run
```

---

## Steps

### 1. Read the active PRD

Look for a PRD in these locations (in order):

- `docs/prds/` — find the most recently modified `.md` file
- `PRD.md` in project root
- Any file matching `*PRD*.md`

If found, extract: project name, app type, key features, target users.

### 2. Scan for existing design signals

Check the project directory for:

- **Tailwind:** `tailwind.config.js`, `tailwind.config.ts`, or `tailwindcss` in `package.json`
- **shadcn/ui:** `components.json` in project root
- **CSS variables:** `src/app/globals.css`, `src/styles/globals.css`, `styles/globals.css`, `app/globals.css`
- **UI libraries in package.json:** Look for `@radix-ui/*`, `@headlessui/*`, `framer-motion`, `lucide-react`, `@mui/*`, `antd`, `chakra-ui`

Note what you find. These are **Observed** conventions — report them as-is.

### 3. Ask the user 3–5 lightweight questions

Ask only what you cannot infer from the codebase. Keep it conversational — one message with all questions:

1. **Color palette hint** — Any color preferences? (e.g. "clean white + indigo", "dark mode first", "warm earthy tones", "monochrome + one accent")
2. **Typography feel** — Font personality? (e.g. "clean sans-serif like Inter", "editorial with serifs", "technical mono-heavy", "system fonts only")
3. **UI complexity level** — How data-dense is the UI? (e.g. "minimal/content-first", "standard SaaS", "dense B2B dashboard", "mobile-first consumer app")
4. **Reference / mood** (optional) — Any app, site, or style you want it to feel like?
5. **Anything NOT to do** — Any strong opinions on what to avoid?

Wait for the user's response before generating.

### 4. Generate DESIGN.md

Use the template at `system/templates/DESIGN.md.tmpl`.

Fill in:

- `{{projectName}}` — from PRD or directory name
- `{{stack}}` — detected stack (e.g. "Next.js + Tailwind + shadcn/ui")
- `{{date}}` — today's date (YYYY-MM-DD)

For each section:

- Replace `<!-- TODO: fill in -->` with content based on user answers and detected signals
- Clearly label **Observed** (from codebase) vs **Proposed** (new conventions)
- Keep entries practical and implementation-oriented — no design essays
- Prefer concrete values (hex codes, px sizes, class names) over vague descriptions

Write the file to the **project root** as `DESIGN.md`.

### 5. Confirm

After writing `DESIGN.md`, tell the user:

- File written to `DESIGN.md`
- Key decisions summarized in 3–5 bullet points
- Suggest next step: `effect:dev:plan` to begin implementation

---

## Next Steps

After DESIGN.md is generated:

- → `effect:dev:plan` — Create an implementation plan for the next feature or PRD
- → `effect:dev:tdd` — Start implementing with test-driven development

ℹ️ Alternative: If working from a PRD, the design step feeds into `effect:dev:plan` which creates the implementation roadmap.

## Notes

- `DESIGN.md` is **optional** for CLI tools, API backends, and libraries. Only suggest it for web apps, mobile apps, and fullstack projects.
- The Constraints section is the most valuable part for agents — fill it in carefully.
- If user skips the questions, generate reasonable defaults and mark them clearly with `<!-- ASSUMED -->`.
