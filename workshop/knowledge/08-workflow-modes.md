# Workflow Modes — Decision Matrix & Guide

How to choose the right workflow mode for handing off a PRD to Claude Code or another AI agent.

---

## Workflow Mode Decision Matrix

| Criterion              | Normal Session                | Full-Auto                    | Ralph Loop                       |
| ---------------------- | ----------------------------- | ---------------------------- | -------------------------------- |
| **Agent stops**        | 2-3 times (plan, review, end) | 0-1 times (only on error)    | 0 times (until promise or max)   |
| **You review**         | Plan + final diff             | Final diff only              | Only if max-iterations reached   |
| **Best for**           | Most features                 | Small, well-defined features | Complex, multi-layer features    |
| **PRD quality needed** | Good (score >= 2.0)           | Very good (score >= 2.5)     | Excellent (score >= 2.5)         |
| **Risk tolerance**     | Low                           | Medium                       | Medium-High                      |
| **Time investment**    | 15-30 min active              | 5 min setup, then wait       | 5 min setup, then wait           |
| **Commit control**     | You commit manually           | Agent commits when green     | Agent commits when promise met   |
| **Error recovery**     | You intervene                 | Agent retries, then stops    | Agent iterates, then stops       |
| **Command chain**      | /plan → /tdd → /verify        | Single prompt, agent decides | /ralph-loop with gates + promise |

---

## Quick Recommendation Rules

1. **Not sure?** → Use Normal Session. It is the safest default.
2. **Small feature, clear PRD?** → Full-Auto. Fastest for simple work.
3. **Complex feature, excellent PRD?** → Ralph Loop. Most autonomous for big work.
4. **Bugfix with reproduction steps?** → Express (skip plan, straight to TDD).
5. **Refactoring only?** → Normal Session with refactoring prompt. Behavior must not change.
6. **Multiple PRDs, large project?** → Normal Session per PRD, sequential execution.

---

## When to Use Each Mode

### Normal Session

Best choice when:

- You are working on a feature for the first time in a new codebase
- The PRD has [ASSUMPTION] or [NEEDS CLARIFICATION] tags remaining
- You want to review the implementation plan before execution
- The feature touches critical systems (auth, billing, data migration)
- You want to learn from the agent's approach

Avoid when:

- You have done similar features before and trust the patterns
- The feature is straightforward and well-defined

### Full-Auto

Best choice when:

- The PRD scores >= 2.5 on the readiness checklist
- The feature follows existing patterns in the codebase
- You have done similar features before
- The feature is small to medium (1-8 ACs)
- You want to minimize your time investment

Avoid when:

- The feature touches auth, billing, or sensitive data for the first time
- The codebase does not have established patterns to follow
- The PRD has ambiguities or unresolved questions

### Ralph Loop

Best choice when:

- The PRD is comprehensive and scores >= 2.5
- The feature is complex (8+ ACs, multiple layers)
- You want fully autonomous execution with guardrails
- You have well-defined quality gates
- You trust the completion promise to be accurate

Avoid when:

- The PRD is incomplete or has unresolved questions
- The feature requires design decisions you want to make
- You are unfamiliar with the codebase

---

## Autonomy Levels

| Level     | Agent Stops | Your Time | Best For                          |
| --------- | ----------- | --------- | --------------------------------- |
| Standard  | 2-3 times   | 15-30 min | Most features, first-time setups  |
| High      | 0-1 times   | 5-10 min  | Well-defined features, patterns   |
| Full Auto | 0 times     | 2-5 min   | Simple features, trusted codebase |

### Standard Autonomy (Normal Session)

- Agent creates plan → waits for approval
- Agent implements → waits for review at phase boundaries
- Agent runs final quality check → waits for commit approval

### High Autonomy (Full-Auto)

- Agent reads PRD → implements without plan approval
- Agent commits when all quality gates pass
- Agent stops only on unrecoverable errors

### Full Autonomy (Ralph Loop)

- Agent iterates in a loop until completion promise is met
- No human intervention unless max-iterations reached
- Quality gates are checked automatically each iteration

---

## Command Chains by Feature Type

### New Feature (Standard)

```
/plan → approve → /tdd → /verify → /e2e → /code-review → commit
```

### Bugfix (Express)

```
/tdd (write failing test) → fix → /verify → commit
```

### Large Feature (Ralph Loop)

```
/ralph-loop --max-iterations 50 --completion-promise '...'
→ Agent loops: implement → test → check gates → repeat
→ Outputs <promise>...</promise> when done
```

### Refactoring (Normal Session)

```
Run tests (baseline) → refactor → /verify → /code-review → commit
```

### Performance Optimization

```
/plan (identify bottlenecks) → benchmark → optimize → benchmark → /verify → commit
```

---

## Agent Teams — When to Scale Up

### Subagents (Default, Always Available)

Use Task tool to spawn focused agents for parallel work.

**When to use Subagents:**

- Research tasks (explore codebase, read docs)
- Code reviews of specific files
- Independent test writing
- Type checking or linting analysis
- Any task that does not modify files

**Example:**

```
Task: "Analyze the data model in src/lib/billing/ and summarize the schema"
Task: "Review src/components/auth/ for accessibility issues"
```

### Agent Teams (Opt-In, Experimental)

Independent Claude instances working on separate branches.

**When to use Agent Teams:**

- 3+ independent workstreams in parallel
- Each workstream has its own PRD or clear scope
- Work does not overlap (different files/directories)
- Feature is large enough to justify coordination overhead

**When NOT to use Agent Teams:**

- Single PRD with sequential steps
- Work that requires shared state or coordination
- Small features (overhead > benefit)
- Tightly coupled code where merge conflicts are likely

### Decision Table

| Scenario                     | Approach     |
| ---------------------------- | ------------ |
| Single feature, any size     | Single Agent |
| Research + implementation    | Subagents    |
| 2 independent features       | Subagents    |
| 3+ independent PRDs          | Agent Teams  |
| Frontend + Backend + DB      | Agent Teams  |
| Bugfix                       | Single Agent |
| Code review + implementation | Subagents    |
