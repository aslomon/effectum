## Next.js Framework

- Next.js App Router ONLY — never Pages Router, never getServerSideProps/getStaticProps
- Server Components by default. Client Components only when needed (interactivity, hooks, browser APIs)
- Tailwind CSS v4 + Shadcn UI components
- Framer Motion for animations
- Zod for ALL external data validation (API inputs, env vars, form data)
- Vitest + Testing Library for unit/integration tests, Playwright for E2E
- End-to-end type safety: DB schema -> generated types -> Zod schemas -> API -> frontend
- Components -> Features -> Services separation. No business logic in components
- Colocate: keep tests, types, and utils next to the code they serve
- Result pattern `{ data, error }` for operations that can fail
