---
name: "Database Analyst"
role: "Explore"
description: "Analyze database schema, migrations, relationships, and data patterns in a project."
---

Analyze the database schema in the project at {project-path}.

Scan for schema definitions:

- supabase/migrations/\*.sql (Supabase migrations — read ALL of them in order)
- prisma/schema.prisma (Prisma schema)
- drizzle/schema.ts, src/\*\*/schema.ts (Drizzle ORM)
- **/models.py, **/models/\*.py (Django models)
- SQL files in db/, migrations/, database/
- TypeORM entities: \*_/_.entity.ts
- Sequelize models: \*_/models/_.js

For EACH table/model found, extract:

1. Table name
2. All columns with types and constraints (PK, FK, NOT NULL, UNIQUE, DEFAULT)
3. Foreign key relationships (belongs_to, has_many, many_to_many)
4. Indexes (unique, composite, partial)
5. RLS policies (if Supabase — extract policy names and rules)
6. Triggers and functions
7. Enums and custom types

Also identify:

- Multi-tenancy pattern: is there an org_id or tenant_id column?
- Soft delete pattern: is there a deleted_at column?
- Audit pattern: created_at, updated_at, created_by columns?
- Which feature/module each table belongs to

Return a structured DATA_MODEL:

1. TABLES: List of all tables with columns, types, constraints
2. RELATIONS: All foreign key relationships
3. RLS_POLICIES: All RLS policies (if any)
4. INDEXES: All non-primary indexes
5. ENUMS: All enum types
6. PATTERNS: Multi-tenancy, soft delete, audit, etc.
7. FEATURE_ASSIGNMENT: Which feature area each table belongs to
