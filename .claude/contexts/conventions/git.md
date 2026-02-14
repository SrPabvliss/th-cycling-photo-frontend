# Git & Jira Conventions

## Branches

- Format: `type/TTV-XXX`
- Types: `feat/`, `fix/`, `chore/`, `refactor/`
- Examples: `feat/TTV-30`, `fix/TTV-31`, `chore/TTV-32`
- No description in branch name — just the ticket

## Commits

- Format: `type(scope): [TTV-XXX] description`
- Imperative mood, first line <72 characters
- Scopes: `events`, `photos`, `classifications`, `auth`, `shared`, `core`, `app`
- Types: `feat`, `fix`, `chore`, `refactor`, `style`, `docs`

Examples:
```
feat(events): [TTV-30] add event types and mappers
feat(events): [TTV-30] add event query composables
feat(events): [TTV-30] add EventListView with pagination
fix(core): [TTV-31] fix error interceptor toast handling
chore(app): [TTV-32] configure TanStack Query provider
refactor(photos): [TTV-33] extract upload logic to composable
style(events): [TTV-30] format EventCard template
```

## Commit Checkpoints

Commit after each logical unit during implementation:
```
types + mappers + query-keys → "feat(events): [TTV-30] add event types and mappers"
composables (queries+mutations) → "feat(events): [TTV-30] add event composables"
components + views           → "feat(events): [TTV-30] add EventListView"
route + wiring               → "feat(events): [TTV-30] register event routes"
```

## Jira Workflow

| Moment | Action |
|--------|--------|
| Start ticket | Transition to "In Progress" via Jira MCP |
| End ticket | Push, create PR, transition to "Ready for Review" |
| PR created | Add PR link as Jira comment |

## Pre-Push Checklist

- [ ] `pnpm lint` passes
- [ ] `pnpm build` passes (includes type-check)
- [ ] All commits include `[TTV-XXX]`
- [ ] Branch name is `type/TTV-XXX`
