# /prd:network-map — Create or Update the Project Network Map

You create or update the visual network map of a project as a Mermaid diagram.

## Step 1: Parse Arguments

Interpret `$ARGUMENTS`:

- **Project slug**: Required. The project identifier (e.g., `auth-system`).
- **`--validate` flag**: Optional. When present, run validation checks instead of generating/updating the map.

If no arguments: List available projects, ask the user.

## Step 2: Load Project Data

Read all relevant files:

- All PRDs under `workshop/projects/{slug}/prds/*.md` — **parse YAML frontmatter** for `features[]` and `connections[]`
- `workshop/projects/{slug}/vision.md` if present
- `workshop/projects/{slug}/requirements-map.md` if present
- `workshop/projects/{slug}/network-map.mmd` if present (existing map)
- `workshop/projects/{slug}/tasks.md` if present (for status synchronization)

### Frontmatter-Driven Generation

When PRDs have YAML frontmatter, use it as the **primary source** for deterministic map generation:

1. **Nodes**: Each entry in `features[]` across all PRDs becomes a node. Use the `id` as the node ID and `label` as the display text.
2. **Status**: Map feature `status` to CSS class: `planned` → `:::planned`, `in-progress` → `:::inProgress`, `done` → `:::done`.
3. **Connections**: Each entry in `connections[]` becomes an edge. Use `type: hard` for solid arrows (`-->`), `type: soft` for dashed arrows (`-.->`)..
4. **PRD Grouping**: Group features by their parent PRD using `subgraph PRD-{number} [PRD-{number}: {title}]`.
5. **Cross-PRD dependencies**: `depends_on[]` in frontmatter generates edges between PRD subgraphs.

This ensures the map is always consistent with the PRD frontmatter. Freetext analysis is only used as a fallback for PRDs without frontmatter.

## Step 3: Load Conventions

Read `workshop/knowledge/06-network-map-guide.md` for the Mermaid conventions and styling rules.

## Step 4: Determine Stage

Determine the appropriate level of detail based on the project status:

| Stage              | When                | Content                                          |
| ------------------ | ------------------- | ------------------------------------------------ |
| 1 — Feature Map    | Early discovery     | Only features and their relationships            |
| 2 — PRD Boundaries | After decomposition | Features grouped into PRD boundaries             |
| 3 — Full Technical | PRDs in detail      | Data models, APIs, external services, tech stack |

## Step 5: Analyze Network

Identify and catalog:

- **Features/Modules**: All described functionalities
- **Data Entities**: Tables, models, schemas
- **External Services**: Third-party APIs, auth providers, payment, etc.
- **Connections**: Dependencies, data flows, event chains
- **PRD Assignment**: Which feature belongs to which PRD

## Step 6: Generate Mermaid Diagram

Create the diagram according to the conventions from the guide:

- Use status colors: `planned` (gray), `inProgress` (blue), `done` (green)
- Group with `subgraph` for PRD boundaries
- Label edges with relationship types
- Keep the diagram readable — split or simplify if >20 nodes

## Step 7: Write File

Write the updated Network Map to `workshop/projects/{slug}/network-map.mmd`.

## Step 8: Validate (if `--validate` flag)

When `--validate` is passed, skip map generation and instead perform these checks:

### Validation Checks

1. **Circular dependencies**: Walk the dependency graph (both feature connections and PRD `depends_on`). Report any cycles found.
2. **Isolated nodes**: Find features that have zero incoming AND zero outgoing connections. These may be missing relationships.
3. **Missing PRD assignments**: Find features in the map that don't belong to any PRD subgraph.
4. **Orphaned references**: Find `connections[]` entries in frontmatter that reference feature IDs that don't exist in any PRD's `features[]`.
5. **Status consistency**: Cross-check feature status in frontmatter against task status in `tasks.md`. Flag mismatches (e.g., feature is `planned` but all its tasks are `DONE`).
6. **Completeness**: Check that every feature in every PRD's frontmatter appears as a node in the network map.

### Validation Output

```
## Network Map Validation: {project-slug}

✅ No circular dependencies
⚠️ 2 isolated nodes: [FEAT_X, FEAT_Y]
✅ All features assigned to PRDs
❌ 1 orphaned reference: FEAT_Z referenced in PRD-002 connections but not defined
⚠️ 1 status mismatch: AUTH is "planned" in frontmatter but all tasks are DONE
✅ Map is complete — all features present

Overall: {PASS | WARN | FAIL}
```

Report FAIL if circular dependencies or orphaned references are found. Report WARN for isolated nodes or status mismatches. Report PASS if all checks pass.

## Step 9: Display Result

Show the user:

1. The complete Mermaid source in a code block (if generating/updating).
2. A brief summary: number of features, PRDs, connections, identified dependencies.
3. Validation results (if `--validate` was used, or always run basic checks after generation).
4. Notes on potential issues (circular dependencies, isolated nodes, too many connections).

## Communication

Follow the language settings defined in CLAUDE.md.
All file content must be written in English.
User-facing communication uses the language configured in CLAUDE.md.

## Step 8b: Sanitize Mermaid Syntax

Before writing the `.mmd` file, ensure valid Mermaid syntax:

1. **Wrap labels containing special characters in double quotes:**
   - Labels with `/` (paths): `NODE["/docs/getting-started"]` not `NODE[/docs/getting-started]`
   - Labels with `&`, `<`, `>`, `(`, `)`: must be quoted
2. **Node IDs must be alphanumeric + underscore only** — no dots, slashes, or hyphens in IDs
3. **Validate subgraph names don't conflict with node IDs**
4. **Test:** The generated Mermaid must parse without errors on mermaid.live

## Step 9: Generate HTML Viewer

After writing the `.mmd` file, ALWAYS generate an interactive HTML viewer:

1. Read `system/templates/network-map-viewer.html` as template
2. Replace `{{PROJECT_NAME}}` with the project name
3. Replace `{{GENERATED_AT}}` with current timestamp
4. Replace `{{MERMAID_CONTENT}}` with the content of `network-map.mmd`
5. Write to `workshop/projects/{slug}/network-map.html`
6. Open the HTML file in the default browser: `open network-map.html` (macOS) or `xdg-open network-map.html` (Linux)

The HTML viewer includes:
- Dark/Light theme toggle
- Top-Bottom / Left-Right direction switch
- SVG export button
- Legend (Planned / In Progress / Done)

## Step 10: Also Generate on /onboard

When called as part of `/onboard`, the HTML viewer is generated automatically after the Network Map is written. The user can immediately see the visual map in their browser.
