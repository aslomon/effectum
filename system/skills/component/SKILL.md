---
name: component
description: Create a new React component with TypeScript, Tailwind CSS, and optional tests. Follows project conventions for Server/Client Components and Shadcn patterns.
disable-model-invocation: true
argument-hint: "[component name] [description]"
---

Create component: $ARGUMENTS

## Process

1. **Determine component type** — Server Component (default) or Client Component
2. **Check existing patterns** — Find similar components in `src/components/` to match conventions
3. **Create the component** — TypeScript + Tailwind + proper exports
4. **Add tests** if the component contains logic (not for pure presentational wrappers)

## Decision: Server vs Client Component

**Server Component (default)** when:
- Renders static or fetched data
- No interactivity (no onClick, onChange, onSubmit)
- No React hooks (useState, useEffect, useRef)
- No browser APIs (window, document, localStorage)

**Client Component** (`"use client"`) when:
- User interaction required
- React hooks needed
- Browser APIs needed
- Third-party client libraries (Framer Motion, etc.)

## File Location

```
src/components/
  ui/                    # Shadcn/base components (Button, Input, Card)
  [feature]/             # Feature-specific components
    [ComponentName].tsx
    [ComponentName].test.tsx  # Only if component has logic
```

## Component Template

```typescript
// Props interface — always named exports, no default export
interface [Name]Props {
  // Required props first, optional props after
}

export function [Name]({ ...props }: [Name]Props) {
  return (
    // Tailwind classes, no inline styles
    // Use Shadcn primitives where possible (Button, Card, Input, etc.)
  )
}
```

## Rules

### TypeScript
- Export a props interface: `[Name]Props`
- Use named export: `export function [Name]`
- Never use `any` — use proper types or generics
- Props with children: use `React.PropsWithChildren<[Name]Props>`

### Styling
- Tailwind CSS only — no CSS modules, no styled-components
- Use `cn()` utility for conditional classes (from `@/lib/utils`)
- Use Shadcn UI primitives as building blocks
- Responsive: mobile-first (`sm:`, `md:`, `lg:` breakpoints)

### Composition
- Prefer composition over configuration (slots > boolean props)
- Extract sub-components when a component exceeds 80 lines
- Use compound component pattern for complex UI:
  ```typescript
  <Card>
    <Card.Header>...</Card.Header>
    <Card.Body>...</Card.Body>
  </Card>
  ```

### Data Fetching (Server Components)
- Fetch data directly in the component (no useEffect)
- Use `createServerClient` for Supabase queries
- Handle loading states with `<Suspense>` at the parent level

### Data Fetching (Client Components)
- Use `createBrowserClient` for Supabase
- Use Supabase Realtime for live data
- Handle loading/error states inline

### Accessibility
- Semantic HTML elements (`button`, `nav`, `main`, `article`)
- ARIA labels on interactive elements without visible text
- Keyboard navigation support for custom interactive components
- Color contrast: don't rely on color alone to convey information

### Testing (only for components with logic)
- Test user interactions (clicks, inputs, form submissions)
- Test conditional rendering
- Test error states
- Use Testing Library: `render`, `screen`, `userEvent`
- Do NOT test implementation details (internal state, refs)
