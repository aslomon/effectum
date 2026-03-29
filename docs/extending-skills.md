# Extending Effectum: Adding a New Skill

Skills in Effectum are reusable, self-contained knowledge bundles that Claude can load on demand. Each skill lives in its own directory under `system/skills/` and is described by a `SKILL.md` file.

## Overview

| Part | Location | Purpose |
|------|----------|---------|
| Skill directory | `system/skills/<skill-name>/` | Root of the skill |
| Skill manifest | `system/skills/<skill-name>/SKILL.md` | Instructions Claude follows when the skill is active |
| Scripts (optional) | `system/skills/<skill-name>/scripts/` | Helper scripts the skill can invoke |
| References (optional) | `system/skills/<skill-name>/references/` | Reference files, schemas, templates |

---

## Step 1: Create the Skill Directory

```bash
mkdir -p system/skills/my-skill
```

Use kebab-case for the directory name. This becomes the skill's key.

---

## Step 2: Write `SKILL.md`

`SKILL.md` is the heart of the skill. It contains:

1. **YAML frontmatter** — identity and trigger description
2. **Instructions** — everything Claude needs to execute the skill

### Frontmatter Schema

```yaml
---
name: skill-name
description: "Trigger condition: when Claude should use this skill. One or two sentences."
---
```

- **`name`** — must match the directory name
- **`description`** — Claude reads this to decide when to activate the skill. Be specific about the trigger condition and what the skill does.

### Full `SKILL.md` Template

```markdown
---
name: my-skill
description: "Use when the user asks to [do X]. Handles [specific task] including [details]. NOT for: [explicit exclusions]."
---

[One paragraph overview: what this skill does and when to use it.]

## Prerequisites

[What must exist / be installed / be configured before this skill works. Be explicit.]

## Instructions

[Step-by-step execution instructions. Numbered list. Each step is an action Claude takes.]

1. **[Step Name]**: [What to do and why]

   Example:
   ```bash
   [concrete command or code]
   ```

2. **[Next Step]**: [...]

## Output

[What the skill produces — files, messages, side effects. Where output is written.]

## Error Handling

[Common failure modes and how to handle them.]

## Examples

[Concrete usage examples with expected results.]
```

---

## Step 3: Real Example — `supabase-migration`

Looking at `system/skills/supabase-migration/` as a reference:

```markdown
---
name: supabase-migration
description: "Use when creating, applying, or managing Supabase database migrations. Handles schema changes, RLS policies, and migration file management for Supabase projects."
---

This skill guides the creation and management of Supabase database migrations for projects using the Next.js + Supabase stack.

## Prerequisites

- Supabase CLI installed and authenticated
- `supabase/migrations/` directory exists in the project root
- Active Supabase project (local or remote)

## Instructions

1. **Identify the change**: Determine what schema change is needed (new table, column, index, RLS policy, etc.)

2. **Create a migration file**:
   ```bash
   supabase migration new <descriptive-name>
   # Creates: supabase/migrations/<timestamp>_<descriptive-name>.sql
   ```

3. **Write the SQL**: Open the migration file and write idiomatic PostgreSQL:
   - Always include `IF NOT EXISTS` / `IF EXISTS` guards
   - Add RLS policies immediately after creating tables
   - Include rollback comments for destructive changes

4. **Apply the migration**:
   ```bash
   supabase db push          # Remote
   supabase db reset         # Local (resets and replays all migrations)
   ```

5. **Generate TypeScript types**:
   ```bash
   supabase gen types typescript --local > src/lib/supabase/types.ts
   ```

6. **Verify RLS**:
   ```bash
   supabase db lint           # Check for missing RLS policies
   ```
```

---

## Step 4: Register the Skill in the Recommendation Engine

Open `bin/lib/recommendation.js` and add your skill to `SKILL_RULES`:

```js
const SKILL_RULES = [
  // ... existing rules ...
  {
    key: "my-skill",          // Must match the directory name
    label: "My Skill",        // Human-readable name for the UI
    tags: ["relevant-tag"],   // Tags that trigger this skill
    // Optional: force-include for specific stacks regardless of tags
    // mandatoryForStacks: ["nextjs-supabase"],
  },
];
```

### Choosing Tags

Tags are extracted from the user's chosen stack, app type, and description keywords. Pick tags from the existing vocabulary in `KEYWORD_TAG_MAP` and `STACK_TAGS`:

| Tag | Typical trigger keywords |
|-----|--------------------------|
| `frontend-heavy` | dashboard, react, nextjs, landing, portfolio |
| `auth-needed` | auth, login, signup, register |
| `db-needed` | database, postgres, supabase, migrations |
| `ai-agent` | ai, agent, llm, openai, claude, bot |
| `payments` | payment, stripe, e-commerce, shop |
| `testing-heavy` | test, testing, e2e, coverage |
| `docs-needed` | library, sdk, docs, documentation |
| `mcp` | mcp, model context protocol |
| `realtime` | chat, realtime, websocket, notifications |

If your skill is essential for a specific stack (not just optional), use `mandatoryForStacks`:

```js
{
  key: "supabase-migration",
  label: "Supabase Migration",
  tags: ["supabase", "db-needed"],
  mandatoryForStacks: ["nextjs-supabase"],  // Always included for this stack
}
```

---

## Step 5: (Optional) Add Scripts

If your skill includes helper scripts (shell, Python, Node.js), put them in a `scripts/` subdirectory:

```
system/skills/my-skill/
├── SKILL.md
└── scripts/
    ├── setup.sh
    ├── validate.sh
    └── generate.mjs
```

Reference scripts from `SKILL.md` instructions:

```markdown
3. **Run setup**:
   ```bash
   bash .claude/skills/my-skill/scripts/effectum:setup.sh
   ```
```

Make scripts executable:

```bash
chmod +x system/skills/my-skill/scripts/effectum:setup.sh
```

---

## Step 6: (Optional) Add Reference Files

If your skill needs reference material (JSON schemas, example files, templates), put them in a `references/` subdirectory:

```
system/skills/my-skill/
├── SKILL.md
├── scripts/
└── references/
    ├── schema.json
    ├── example-output.md
    └── template.sql
```

Reference these files in `SKILL.md`:

```markdown
Use the schema at `.claude/skills/my-skill/references/schema.json` to validate input.
```

---

## Step 7: Test Your Skill

```bash
# 1. Run the installer and select a stack that triggers your skill
mkdir /tmp/test-skill && cd /tmp/test-skill
node /path/to/effectum/bin/effectum.js --local

# 2. Verify the skill was installed
ls .claude/skills/
cat .claude/skills/my-skill/SKILL.md

# 3. Open Claude Code and verify the skill is discoverable
claude
# Ask Claude: "What skills do you have available?"
# Or trigger the skill directly with a relevant task

# 4. Test that SKILL.md instructions work end-to-end in a real project
```

### Checklist

- [ ] Directory exists at `system/skills/<name>/`
- [ ] `SKILL.md` exists with valid YAML frontmatter
- [ ] `name` in frontmatter matches the directory name
- [ ] `description` clearly states the trigger condition
- [ ] Instructions are complete and actionable (no hand-wavy steps)
- [ ] Skill is registered in `SKILL_RULES` in `recommendation.js`
- [ ] After install, `SKILL.md` appears in `.claude/skills/<name>/`
- [ ] Skill activates correctly when relevant tasks are requested

---

## Writing a Great `SKILL.md`

**Do:**
- Open with a concrete summary: what the skill does, not what it is
- Use numbered steps for procedures
- Include real, runnable command examples
- Specify exact file paths (relative to project root)
- Document error cases and how to recover
- List prerequisites explicitly

**Don't:**
- Write vague instructions ("handle errors appropriately")
- Assume the user knows the domain
- Hardcode absolute paths (use `$(pwd)` or project-relative paths)
- Forget to document the output — what files are created, where

---

## Reference: Existing Skills

Browse `system/skills/` for examples:

| Skill | Purpose |
|-------|---------|
| `frontend-design` | Design system, DESIGN.md, production-grade UI |
| `security-check` | OWASP checklist, auth audit, dependency scan |
| `webapp-testing` | Playwright setup, E2E test writing |
| `supabase-migration` | Supabase migrations, RLS, type generation |
| `api-endpoint` | REST endpoint scaffolding |
| `component` | React/UI component scaffolding |
| `feature` | Full feature from PRD to code |
| `doc-coauthoring` | Documentation writing workflow |
| `mcp-builder` | Building MCP servers |
| `canvas-design` | Visual design, posters, documents |
| `algorithmic-art` | Generative art with p5.js |
