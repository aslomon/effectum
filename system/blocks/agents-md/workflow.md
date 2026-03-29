## Workflow

Follow this cycle for all non-trivial changes in **{{projectName}}**:

1. **PRD** — read or create a PRD before coding (`effect:prd:new` or `effect:prd:update`)
2. **Plan** — outline the approach; confirm with the user if scope is large
3. **Implement** — write code in small, reviewable increments
4. **Test** — run tests after each meaningful change; do not skip failing tests
5. **Review** — self-review the diff before marking work complete

For bugs: reproduce first, then fix, then verify the fix closes the issue.
For features: PRD → implement → test → review — no shortcuts.

Do not mark a task done until tests pass and the code is committed.
