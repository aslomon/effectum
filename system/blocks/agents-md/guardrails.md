## Guardrails

### File Boundaries
- Only modify files within the project root (`{{projectName}}/`) unless explicitly told otherwise
- Never write to system directories, user home, or paths outside the project
- Keep generated files out of version control when appropriate (respect `.gitignore`)

### Data Handling
- Never log, print, or expose secrets, credentials, or API keys
- Do not read `.env` files unless required for the current task
- Do not hard-code credentials — use environment variables

### External Actions
- Do not make network requests to external services without explicit instruction
- Do not publish packages, push to remote branches, or trigger CI/CD pipelines autonomously
- Do not send emails, webhooks, or notifications without confirmation

### Safety
- Prefer `trash` / soft-delete over permanent deletion
- Run database migrations in dry-run mode first when available
- Validate inputs with a schema library before passing to external services
- When in doubt, pause and ask — do not proceed with an irreversible action
