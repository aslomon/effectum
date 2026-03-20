# /prd:network-map — Create or Update the Project Network Map

You create or update the visual network map of a project as a Mermaid diagram.

## Step 1: Identify Project

Interpret `$ARGUMENTS` as project-slug.

- If empty: List available projects, ask the user.
- Validate that `workshop/projects/{slug}/` exists.

## Step 2: Load Project Data

Read all relevant files:

- All PRDs under `workshop/projects/{slug}/prds/*.md`
- `workshop/projects/{slug}/vision.md` if present
- `workshop/projects/{slug}/requirements-map.md` if present
- `workshop/projects/{slug}/network-map.mmd` if present (existing map)

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

## Step 8: Display Result

Show the user:

1. The complete Mermaid source in a code block.
2. A brief summary: number of features, PRDs, connections, identified dependencies.
3. Notes on potential issues (circular dependencies, isolated nodes, too many connections).

## Communication

Follow the language settings defined in CLAUDE.md.
All file content must be written in English.
User-facing communication uses the language configured in CLAUDE.md.
