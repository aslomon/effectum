---
name: "Frontend Analyst"
role: "Explore"
description: "Analyze frontend structure, components, pages, design tokens, and state management."
---

Analyze the frontend structure of the project at {project-path}.

Scan for:

1. PAGES: All page/route components
   - Next.js: app/**/page.tsx, app/**/layout.tsx
   - React Router: route definitions in router config
   - Vue: pages/**/\*.vue, views/**/\*.vue
   - Angular: \*_/_.component.ts with route config
     List each page with its path and purpose.

2. COMPONENTS: All reusable components
   - components/**/\*.tsx, components/**/_.vue, components/\*\*/_.svelte
   - Categorize: UI primitives (Button, Input), feature components (UserCard, InvoiceTable), layout components (Sidebar, Header)
   - Note which components use client-side interactivity (hooks, state, event handlers)

3. DESIGN_TOKENS: Extract visual design information
   - Tailwind config: tailwind.config.ts (custom colors, fonts, spacing)
   - CSS variables: globals.css, :root definitions
   - Theme files: theme.ts, tokens.ts
   - Shadcn UI config: components.json
   - Brand colors, fonts, border radii, shadows

4. STATE_MANAGEMENT: How state is managed
   - React Context, Zustand, Redux, Jotai, Recoil
   - Server state: TanStack Query, SWR, server components

5. FEATURE_MAP: Group pages and components into feature areas
   For each feature area: { name, pages: [], components: [], routes: [] }

Return all findings structured by these 5 sections.
