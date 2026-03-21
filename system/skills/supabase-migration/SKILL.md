---
name: supabase-migration
description: Create Supabase database migrations with RLS policies, indexes, and generated types. Use when adding tables, columns, or changing schema.
disable-model-invocation: true
argument-hint: "[description of the schema change]"
---

Create a Supabase migration for: $ARGUMENTS

## Process

1. **Analyze the request** — Understand what schema changes are needed
2. **Check existing schema** — Use `list_tables` and `execute_sql` to understand current state
3. **Write the migration** — Use `apply_migration` with a descriptive snake_case name
4. **Verify** — Run `list_tables` to confirm changes applied
5. **Security check** — Run `get_advisors` (type: security) to catch missing RLS

## Migration Rules

### Tables
- Every table MUST have `id uuid DEFAULT gen_random_uuid() PRIMARY KEY`
- Every table MUST have `created_at timestamptz DEFAULT now() NOT NULL`
- Every table MUST have `updated_at timestamptz DEFAULT now() NOT NULL`
- Multi-tenant tables MUST have `tenant_id uuid NOT NULL REFERENCES tenants(id)`
- Add `ON DELETE CASCADE` for child relationships, `ON DELETE RESTRICT` for references

### RLS (mandatory)
- ALWAYS `ALTER TABLE ... ENABLE ROW LEVEL SECURITY` on every new table
- Create at minimum these policies:
  - SELECT: authenticated users can read their tenant's rows
  - INSERT: authenticated users can insert for their tenant
  - UPDATE: authenticated users can update their tenant's rows
  - DELETE: authenticated users can delete their tenant's rows (if applicable)
- Policy pattern:
```sql
CREATE POLICY "tenant_select" ON table_name
  FOR SELECT TO authenticated
  USING (tenant_id = (auth.jwt() ->> 'tenant_id')::uuid);
```

### Indexes
- Add indexes on all foreign keys
- Add indexes on columns used in WHERE clauses
- Add composite indexes for common query patterns
- Use `CREATE INDEX CONCURRENTLY` for large tables

### Naming
- Migration name: `create_[table]`, `add_[column]_to_[table]`, `alter_[table]_[change]`
- Table names: plural snake_case (`user_profiles`, not `UserProfile`)
- Column names: snake_case
- Index names: `idx_[table]_[columns]`
- Policy names: `[table]_[operation]` or descriptive like `users_can_read_own`

## After Migration

1. Run security advisors: `get_advisors(type: "security")`
2. Run performance advisors: `get_advisors(type: "performance")`
3. Generate TypeScript types: `generate_typescript_types`
4. Report any advisor warnings to the user
