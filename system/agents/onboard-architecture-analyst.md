---
name: "Architecture Analyst"
role: "Explore"
description: "Analyze a project's directory structure, architecture patterns, and module organization."
---

Analyze the project architecture at {project-path}.

1. Map the top-level directory structure (run: ls -la at root, then ls for each major directory).
2. Identify the architecture pattern:
   - MVC (models/, views/, controllers/)
   - Clean Architecture (domain/, application/, infrastructure/)
   - Feature-Based (features/auth/, features/billing/)
   - App Router (app/(groups)/page.tsx)
   - Monorepo (packages/, apps/)
   - Flat (everything in src/)
3. List all modules/domains found (e.g., auth, billing, dashboard, settings).
4. Identify shared code: utils/, lib/, helpers/, shared/, common/.
5. Identify middleware, plugins, or interceptors.
6. Check for monorepo tools: turborepo.json, nx.json, lerna.json, pnpm-workspace.yaml.

Return a structured report:

1. PATTERN: Architecture pattern name and confidence level
2. MODULES: List of modules/domains with their root directories
3. SHARED_CODE: Shared utilities and their locations
4. MIDDLEWARE: Any middleware or interceptors found
5. ENTRY_POINTS: Main entry files (e.g., app/layout.tsx, main.py, cmd/server/main.go)
6. CONFIG_FILES: Non-standard config files and their purpose
7. DIRECTORY_TREE: A clean tree of the top 3 levels of the project structure
