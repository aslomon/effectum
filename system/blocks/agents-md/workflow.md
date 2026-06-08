## Workflow

Follow this cycle for all non-trivial changes in **{{projectName}}**:

1. **Goal** — define the outcome, mandate, workflow mode, evidence, and stop conditions (`effect:goal`)
2. **PRD** — read or create a PRD when requirements need product detail (`effect:prd:new` or `effect:prd:update`)
3. **Plan** — outline the approach; confirm with the user if scope is large
4. **Implement** — write code in small, reviewable increments
5. **Test** — run tests after each meaningful change; do not skip failing tests
6. **Review** — self-review the diff before marking work complete

For bugs: reproduce first, then fix, then verify the fix closes the issue.
For features: Goal → PRD if needed → implement → test → review — no shortcuts.

Do not mark a task done until tests pass and the code is committed.
