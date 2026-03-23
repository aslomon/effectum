## Prisma ORM

- Schema-first development: define models in `schema.prisma`
- `prisma migrate dev` for development migrations, `prisma migrate deploy` for production
- Generate TypeScript types via `prisma generate` — never hand-write DB types
- Use Prisma Client for all database operations — no raw SQL unless absolutely necessary
- Seed data via `prisma db seed` script
- Use `@unique`, `@@unique`, and `@@index` for constraints and query optimization
- Relations: explicit `@relation` annotations for clarity
