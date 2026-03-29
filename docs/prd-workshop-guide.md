# PRD Workshop Guide

How to use the PRD Workshop to create production-ready Product Requirements Documents for autonomous implementation.

## What Is a PRD and Why It Matters

A Product Requirements Document (PRD) is a structured specification that defines what to build, why to build it, and how to verify it is done. In the context of autonomous development with Claude Code, the PRD is the single highest-leverage input you can provide.

**Why it matters for AI-driven development:**

- A well-written PRD eliminates most interaction stops. Claude knows what to build, what not to build, and when to stop.
- Vague requirements cause Claude to either guess wrong or stop and ask repeatedly.
- The PRD's acceptance criteria become the tests. If a criterion is not testable, Claude cannot verify it autonomously.
- Spending 10-15 minutes on a thorough PRD saves 5+ rounds of back-and-forth during implementation.

## The Two Modes

### Workshop Mode (`/effect:prd:new`)

The full guided experience for complex features, new projects, or vague ideas.

**When to use**: You have an idea but have not fully thought through the requirements, scope, data model, or edge cases.

**The 7 phases:**

1. **Vision and Problem Discovery** — Claude asks questions to understand what you want to build and why. Adapts depth based on input specificity (4-6 rounds for vague ideas, 1-2 for specific ones).

2. **Scope Definition** — Features are sorted into v1, v2, and out-of-scope. Explicit boundaries prevent scope creep.

3. **Decomposition and Network Map** — If the scope is too large for a single PRD, it gets split into multiple PRDs with dependency tracking. A Mermaid network map visualizes the structure.

4. **Discussion** — Clarify gray areas, edge cases, and ambiguities per PRD. Every uncertainty is resolved or marked as `[ASSUMPTION]`.

5. **PRD Creation** — The full agent-ready PRD is written with all sections: Problem, Goal, User Stories, Acceptance Criteria, Scope, Data Model, API Design, Quality Gates, Autonomy Rules, Completion Promise.

6. **Prompt Generation** — A handoff prompt is generated that includes the PRD, workflow instructions, and the right autonomy level.

7. **Verification** — Quality review with readiness scoring. The PRD must score >= 2.0 to be considered ready for handoff.

### Express Mode (`/effect:prd:express`)

Quick mode for small, well-understood features.

**When to use**: You know exactly what to build. The scope is clear, the feature is small (1-3 acceptance criteria), and you do not need a full discovery process.

**What happens:**

1. Claude intelligently fills in missing sections based on your input.
2. Suggests scope boundaries.
3. Marks assumptions with `[ASSUMPTION]`.
4. Produces the complete PRD in one pass.

## Step-by-Step: Creating Your First PRD

### 1. Start the Workshop

Open Claude Code in the autonomous-dev repository:

```bash
cd autonomous-dev
claude
```

Run the new project command:

```
/effect:prd:new
```

Claude asks: "What do you want to build?"

### 2. Describe Your Idea

Be as specific or as vague as you want. Examples:

- **Vague**: "I want to build a project management tool"
- **Moderate**: "A Kanban board with drag-and-drop, team collaboration, and Supabase backend"
- **Specific**: "Add an invitation system to my existing SaaS app. Admins send email invites, invitees join via magic link."

Claude detects the specificity level and adjusts the question depth accordingly.

### 3. Answer Discovery Questions

Claude asks structured questions in rounds. Each round has 3-5 questions. After each round, Claude summarizes what it understood and lets you correct.

**Tips for effective answers:**

- "Whatever" or "You decide" is valid — Claude makes a reasonable choice and documents it.
- Be explicit about what you do NOT want (out-of-scope items).
- If you have a data model in mind, share it early — this is the highest-leverage input.

### 4. Review the PRD

Claude writes the PRD to `workshop/projects/{slug}/prds/001-{name}.md`. Review it:

- Are the acceptance criteria testable?
- Is the scope clear?
- Is the data model correct?
- Are the out-of-scope items explicit?

### 5. Run Quality Review

```
/effect:prd:review
```

Claude evaluates the PRD against a quality checklist and produces a readiness score:

- **< 1.5**: Significant gaps. Needs more work.
- **1.5 - 2.0**: Acceptable for manual implementation. Not ready for full autonomy.
- **2.0 - 2.5**: Ready for autonomous implementation.
- **>= 2.5**: Excellent. Ready for Ralph Loop (fully unattended).

### 6. Hand Off

```
/effect:prd:handoff
```

Claude generates a handoff prompt with the right workflow mode:

- **Normal Session**: For features with subjective decisions.
- **Full-Auto**: For well-defined features.
- **Ralph Loop**: For features with quality gates and completion promise.

The prompt is saved to `workshop/projects/{slug}/prompts/`.

## Working with Multiple PRDs

### When to Decompose

Claude suggests decomposition when:

- More than 6-8 acceptance criteria.
- Multiple independent user roles or domains.
- Features that could be developed and tested independently.
- Dependencies that create a natural ordering.

### How Decomposition Works

```
/effect:prd:decompose
```

Claude analyzes the scope and suggests splitting into multiple PRDs. Each PRD:

- Has its own acceptance criteria and quality gates.
- Can be implemented independently (with dependency ordering).
- Is numbered sequentially: `001-auth.md`, `002-invitations.md`, `003-dashboard.md`.

### Dependency Types

| Type            | Meaning                            | Example                                  |
| --------------- | ---------------------------------- | ---------------------------------------- |
| Hard dependency | B cannot start until A is deployed | API must exist before frontend           |
| Soft dependency | B uses A's output but can mock it  | Frontend can mock API during development |
| No dependency   | A and B are fully independent      | Different features, different domains    |

## The Network Map

Every project gets a Mermaid network map (`network-map.mmd`) that visualizes how PRDs, features, and dependencies connect.

### What It Shows

- Feature nodes grouped by PRD.
- Dependencies between features and PRDs.
- Status of each PRD (discovery, drafting, ready, handed-off).
- Shared components and data models.

### When It Updates

- After Phase 2 (Scope): First version with features.
- After Phase 3 (Decomposition): PRD assignments.
- After each completed PRD: Refined details.
- When new insights emerge: Immediately.

### Viewing the Map

```
/effect:prd:network-map
```

The map is written as `.mmd` (Mermaid source). View it in any Mermaid-compatible tool (GitHub renders Mermaid natively, or use mermaid.live).

## Quality Review and Readiness Scoring

The quality review (`/effect:prd:review`) checks three dimensions:

### 1. Completeness

- All required sections present.
- No placeholder text remaining.
- No unresolved `[ASSUMPTION]` tags.

### 2. Consistency

- Acceptance criteria align with user stories.
- Data model supports all acceptance criteria.
- API design covers all use cases.
- Out-of-scope items do not contradict in-scope items.

### 3. Agent Readiness

- Acceptance criteria are testable (each maps to at least one test).
- Quality gates are defined with specific commands.
- Autonomy rules are explicit.
- Completion promise is measurable.

### Scoring

| Score     | Meaning    | Action                             |
| --------- | ---------- | ---------------------------------- |
| < 1.5     | Major gaps | Go back to discussion phase        |
| 1.5 - 2.0 | Acceptable | Good for manual implementation     |
| 2.0 - 2.5 | Ready      | Good for autonomous implementation |
| >= 2.5    | Excellent  | Ready for Ralph Loop (unattended)  |

## Handoff to Your Project

### The Handoff Process

1. PRD passes quality review (score >= 2.0).
2. Run `/effect:prd:handoff`.
3. Claude determines the workflow mode.
4. Generates a handoff prompt with PRD, workflow, and autonomy settings.
5. Copies the PRD and prompt to the target project's directory.

### In the Target Project

1. Open Claude Code in the target project.
2. Paste the handoff prompt.
3. Claude executes the workflow: `/effect:dev:plan` -> `/effect:dev:tdd` -> `/effect:dev:verify` -> `/effect:dev:e2e` -> `/effect:dev:review`.
4. Review the results.

## All Workshop Commands

| Command             | Purpose                                            |
| ------------------- | -------------------------------------------------- |
| `/effect:prd:new`          | Start a new project with discovery questions       |
| `/effect:prd:discuss`      | Clarify gray areas in an existing PRD              |
| `/effect:prd:express`      | Quick PRD for small, well-understood features      |
| `/effect:prd:review`       | Quality checklist evaluation and readiness scoring |
| `/effect:prd:handoff`      | Generate implementation prompt and export          |
| `/effect:prd:status`       | Dashboard of all projects and PRDs                 |
| `/effect:prd:resume`       | Continue working on an existing project            |
| `/effect:prd:decompose`    | Split scope into multiple PRDs                     |
| `/effect:prd:network-map`  | Create or update the project network map           |
| `/effect:prd:handoff --prompt-only`       | Generate or regenerate the handoff prompt          |
| `/workshop:init`    | Create project workspace structure                 |
| `/workshop:archive` | Archive a completed project                        |
| `/effectum:setup`            | Install the workflow in a target project           |
