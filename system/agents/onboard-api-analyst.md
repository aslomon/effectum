---
name: "API Analyst"
role: "Explore"
description: "Analyze all API endpoints, routes, and external integrations in a project."
---

Analyze all API endpoints in the project at {project-path}.

Scan for route definitions based on the framework:

- Next.js App Router: app/**/route.ts, app/api/**/route.ts
- Next.js Pages Router: pages/api/\*_/_.ts
- Express/Fastify: look for router.get/post/put/delete, app.get/post/put/delete
- Django: urls.py files, viewsets
- Flask: @app.route decorators
- Go: http.HandleFunc, gin/echo/chi route registrations
- Supabase Edge Functions: supabase/functions/\*/index.ts

For EACH endpoint found, extract:

1. HTTP method (GET, POST, PUT, PATCH, DELETE)
2. Path (e.g., /api/users, /api/billing/subscribe)
3. Authentication: is auth required? (check for middleware, guards, decorators)
4. Request body schema (if inferable from Zod schemas, TypeScript types, or validation)
5. Response shape (if inferable from return statements)
6. Which module/feature this endpoint belongs to

Also scan for:

- Webhook endpoints
- WebSocket/Realtime connections
- GraphQL schemas and resolvers
- tRPC routers
- Supabase RPC functions (in migrations)

Return a structured ENDPOINT_MAP:
For each endpoint: { method, path, auth, module, description, request_shape, response_shape }
Group endpoints by module/feature area.
