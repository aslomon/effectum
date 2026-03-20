# PRD Examples

Three complete examples showing the progression from simple to complex, all agent-ready.

---

## Example A: Simple Feature (single PRD, ~20 iterations)

````markdown
# PRD: User Profile Avatar Upload

## Problem

Users cannot upload a profile picture. Profiles show a generic placeholder,
making it harder for team members to identify each other in a multi-user workspace.

## Goal

Users can upload, preview, and change their profile picture. The avatar is displayed
across the application wherever the user's identity appears.

## User Stories

- As a user, I want to upload a profile picture so that others can recognize me
- As a user, I want to preview my image before confirming the upload so that I can ensure it looks right
- As a user, I want to see a fallback avatar when no image is uploaded so that the UI remains consistent

## Acceptance Criteria

- [ ] AC1: Upload accepts JPG, PNG, and WebP files up to 5MB
- [ ] AC2: Given a file larger than 5MB, When the user attempts upload, Then an error message is shown
- [ ] AC3: Image is stored in Supabase Storage bucket "avatars"
- [ ] AC4: Avatar URL is persisted in the user profile (profiles.avatar_url)
- [ ] AC5: Preview is shown immediately after file selection, before upload confirmation
- [ ] AC6: Fallback avatar displays user initials when no image is uploaded
- [ ] AC7: Avatar is displayed in the header, team member list, and comment threads

## Scope

### In Scope

- Upload component with drag-and-drop and file picker
- Image preview before upload
- Supabase Storage integration
- Profile update (avatar_url field)
- Fallback avatar component
- Display in header, team list, and comments

### Out of Scope

- Image cropping or editing
- Image filters or effects
- Social media avatar import
- Avatar history or versioning
- Animated avatars (GIF support)

## Data Model

### profiles (existing table — add column)

| Column     | Type | Constraints | Description                       |
| ---------- | ---- | ----------- | --------------------------------- |
| avatar_url | text | NULL        | URL to avatar in Supabase Storage |

### Supabase Storage

- Bucket: "avatars"
- Path: `{org_id}/{user_id}/avatar.{ext}`
- Max size: 5MB
- Allowed MIME types: image/jpeg, image/png, image/webp
- RLS: Users can only upload/delete their own avatar

## API Design

### POST /api/profile/avatar

**Purpose:** Upload or replace profile avatar

**Request:** multipart/form-data with "file" field

**Response (200):**

```json
{
  "data": {
    "avatar_url": "https://[project].supabase.co/storage/v1/object/public/avatars/..."
  }
}
```
````

**Errors:**

- 400: File too large or invalid MIME type
- 401: Not authenticated
- 500: Storage upload failed

### DELETE /api/profile/avatar

**Purpose:** Remove profile avatar, revert to fallback

**Response (200):**

```json
{
  "data": { "avatar_url": null }
}
```

## Quality Gates

- Build: `pnpm build` — 0 errors
- Types: `tsc --noEmit` — 0 errors
- Tests: `pnpm vitest run` — all pass, 80%+ coverage on new code
- Lint: `pnpm lint` — 0 errors

## Autonomy Rules

- Design: Follow DESIGN.md for avatar sizing, border radius, and colors
- Libraries: Use existing project dependencies only
- Architecture: Follow existing patterns in src/lib/ and src/components/
- On ambiguity: Decide autonomously

## Completion Promise

"All acceptance criteria met, build passes, all tests pass, 0 lint errors, no console.log in production code"

````

---

## Example B: Standard Feature (single PRD, ~30 iterations)

```markdown
# PRD: Team Invitation System

## Problem

New team members can only be added manually via direct database insertion.
This is error-prone, unauditable, and requires developer involvement for
every new hire or collaborator.

## Goal

Admins can send email invitations from the settings page. Invited users receive
a magic link and are automatically assigned to the team with the correct role
upon acceptance. Pending invitations are visible and revocable.

## User Stories

- As an admin, I want to invite team members via email so that onboarding is self-service
- As an invitee, I want to join via a link without manual registration so that joining is frictionless
- As an admin, I want to see pending invitations and their status so that I can track onboarding
- As an admin, I want to revoke pending invitations so that I can correct mistakes

## Acceptance Criteria

- [ ] AC1: Admin can enter one or more email addresses and assign a role (member, admin)
- [ ] AC2: Each invitation generates a single-use token valid for 24 hours
- [ ] AC3: Given an expired token, When the invitee clicks the link, Then they see an expiration message
- [ ] AC4: Email is sent via Supabase Edge Function with invitation link
- [ ] AC5: Given a new user (no account), When they accept, Then they are redirected to onboarding
- [ ] AC6: Given an existing user, When they accept, Then they are directly assigned to the team
- [ ] AC7: Admin sees a list of pending invitations with email, role, status, and expiration
- [ ] AC8: Admin can revoke any pending invitation (immediate invalidation)
- [ ] AC9: Maximum 50 pending invitations per team
- [ ] AC10: Rate limit: 10 invitations per hour per admin
- [ ] AC11: Given a duplicate email (already invited or already a member), When the admin invites, Then an appropriate error message is shown

## Scope

### In Scope

- Invitation CRUD (create, list, revoke)
- Token generation and validation
- Email sending via Edge Function
- Invitation acceptance flow (new + existing users)
- Admin UI in settings page
- Rate limiting and invitation limits

### Out of Scope

- Bulk CSV import
- Custom invitation email templates
- Invitation analytics or reporting
- Role management beyond member/admin
- SSO-based invitations
- Re-sending expired invitations (user must create new invitation)

## Data Model

### invitations

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK, default gen_random_uuid() | |
| org_id | uuid | FK → organizations.id, NOT NULL | Tenant isolation |
| email | text | NOT NULL | Invitee email address |
| role | text | NOT NULL, CHECK (role IN ('member', 'admin')) | Assigned role |
| token | text | NOT NULL, UNIQUE | Single-use invitation token |
| status | text | NOT NULL, default 'pending', CHECK (status IN ('pending', 'accepted', 'revoked', 'expired')) | |
| invited_by | uuid | FK → profiles.id, NOT NULL | Admin who created |
| expires_at | timestamptz | NOT NULL | Token expiration (created_at + 24h) |
| accepted_at | timestamptz | NULL | When invitation was accepted |
| created_at | timestamptz | NOT NULL, default now() | |

### RLS Policies

- SELECT: Users can view invitations where org_id matches their org
- INSERT: Only admins of the same org can create invitations
- UPDATE: Only admins of the same org can update status (revoke)
- DELETE: Not allowed (use status = 'revoked' instead)

### Indexes

- UNIQUE on (org_id, email) WHERE status = 'pending' (prevent duplicate pending invitations)
- INDEX on token (lookup during acceptance)
- INDEX on (org_id, status) (admin list view)

## API Design

### POST /api/invitations

Create one or more invitations.

Request:
```json
{
  "invitations": [
    { "email": "user@example.com", "role": "member" },
    { "email": "admin@example.com", "role": "admin" }
  ]
}
````

Response (201):

```json
{
  "data": {
    "created": 2,
    "failed": 0,
    "invitations": [{ "id": "...", "email": "...", "status": "pending" }]
  }
}
```

Errors:

- 400: Invalid email format, invalid role, duplicate email
- 403: Not an admin
- 429: Rate limit exceeded (10/hour)

### GET /api/invitations

List invitations for current org. Query params: ?status=pending

Response (200):

```json
{
  "data": [
    {
      "id": "...",
      "email": "...",
      "role": "member",
      "status": "pending",
      "expires_at": "...",
      "invited_by": { "name": "..." }
    }
  ]
}
```

### DELETE /api/invitations/:id

Revoke invitation (sets status to 'revoked').

Response (200):

```json
{ "data": { "id": "...", "status": "revoked" } }
```

### POST /api/invitations/accept

Redeem invitation token.

Request:

```json
{ "token": "abc123..." }
```

Response (200): Redirect URL to dashboard or onboarding

Errors:

- 400: Invalid or expired token
- 409: Already accepted

## Constraints

- Use Supabase Auth for magic links (no external email providers)
- Edge Function for email sending (supabase/functions/send-invitation/)
- Token format: 32 random bytes, hex-encoded
- Rate limiting: Implemented via database count query, not in-memory

## Quality Gates

- Build: `pnpm build` — 0 errors
- Types: `tsc --noEmit` — 0 errors
- Tests: `pnpm vitest run` — all pass, 80%+ coverage
- Lint: `pnpm lint` — 0 errors
- E2E: `npx playwright test tests/e2e/invitations.spec.ts` — all pass
- RLS: Supabase security advisor — no warnings

## Autonomy Rules

- Design: Follow DESIGN.md
- Libraries: Use existing project dependencies
- Architecture: Follow patterns in src/lib/billing/ for service layer
- Edge Functions: Follow patterns in supabase/functions/
- On ambiguity: Decide autonomously, document decisions in code comments

## Completion Promise

"All acceptance criteria met, migration applied, RLS policies active, all tests pass, build succeeds, 0 lint errors, types generated"

````

---

## Example C: Large Project — Vision + Multiple PRDs

### Project Vision Document

```markdown
# Project Vision: TaskFlow — AI-Powered Project Management

## Problem

Small teams (3-15 people) use spreadsheets and chat messages to manage projects.
They lack visibility into progress, miss deadlines, and waste time in status meetings.
Existing tools (Jira, Asana) are too complex and expensive for their needs.

## Goal

A lightweight project management tool where teams can organize work, track progress,
and get AI-generated insights — without enterprise complexity. Launch MVP within 8 weeks.

## Target Users

- **Team Lead (primary):** Manages 3-15 people, needs progress visibility, assigns work
- **Team Member:** Needs clear task list, updates status, logs time
- **Stakeholder (secondary):** Needs high-level progress reports, no daily interaction

## Tech Stack

- Frontend: Next.js 16, App Router, TypeScript, Tailwind CSS v4, Shadcn UI
- Backend: Supabase (DB, Auth, Storage, Edge Functions, Realtime)
- AI: Claude API for insights and summaries
- Hosting: Vercel
- Auth: Supabase Auth (email + Google OAuth)

## Constraints

- Multi-tenant from day one (org_id on every table)
- GDPR-compliant (EU data residency option in v2)
- Mobile-responsive (not native app)
- Budget: Supabase Pro plan, Vercel Pro plan

## PRD Overview

| PRD | Name | Description | Dependencies |
|-----|------|-------------|--------------|
| 001 | Auth & Org Setup | Registration, login, org creation, member management | None |
| 002 | Projects & Tasks | Create projects, manage tasks, assign members, track status | 001 |
| 003 | AI Insights | AI-generated project summaries, risk detection, suggestions | 001, 002 |
| 004 | Notifications & Activity | Real-time notifications, activity feed, email digests | 001, 002 |

## Dependency Graph

001-Auth ──► 002-Projects & Tasks ──► 003-AI Insights
    │              │
    │              └──────────────► 004-Notifications
    └──────────────────────────────►

## Roadmap

| Phase | PRDs | Milestone | Effort |
|-------|------|-----------|--------|
| 1 | 001 | Users can register, create org, invite members | Small (20 iter) |
| 2 | 002 | Teams can create projects and manage tasks | Standard (30 iter) |
| 3 | 003, 004 (parallel) | AI insights + notifications functional | Large (40 iter each) |
````

### Requirements Map (excerpt)

```markdown
## v1 (Must-Have)

| ID    | Requirement                    | PRD |
| ----- | ------------------------------ | --- |
| R-001 | Email registration + login     | 001 |
| R-002 | Google OAuth login             | 001 |
| R-003 | Organization creation          | 001 |
| R-004 | Member invitation (email)      | 001 |
| R-005 | Project CRUD                   | 002 |
| R-006 | Task CRUD with status workflow | 002 |
| R-007 | Task assignment to members     | 002 |
| R-008 | Kanban board view              | 002 |
| R-009 | AI project summary             | 003 |
| R-010 | In-app notifications           | 004 |

## v2

| ID    | Requirement            | PRD |
| ----- | ---------------------- | --- |
| R-011 | Time tracking          | 002 |
| R-012 | AI risk detection      | 003 |
| R-013 | Email digest           | 004 |
| R-014 | Gantt chart view       | 002 |
| R-015 | Custom fields on tasks | 002 |

## Out of Scope

- Native mobile apps
- Custom workflows / automation builder
- Integration marketplace (Slack, GitHub, etc.)
- White-label / custom branding
- On-premise deployment
```

Each individual PRD (001, 002, 003, 004) would then follow the full template from Example B, with complete data models, API designs, and quality gates.
