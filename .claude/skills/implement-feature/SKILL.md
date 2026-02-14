---
name: implement-feature
description: >
  Implements features following Vue 3 + Composition API patterns.
  Use when building components, composables, views, mappers,
  or connecting to the backend API.
  Triggers: "implementa", "crea el componente", "agrega la vista"
---

# Implement Feature

Write code following project patterns and conventions.

## Context Files to Load
- `contexts/patterns/composables.md` — query/mutation patterns, NO services layer
- `contexts/patterns/components.md` — component patterns
- `contexts/structure/feature-module.md` — creation order, screaming architecture
- `contexts/conventions/naming.md` — file and code naming (kebab-case TS, I prefix)
- `contexts/infrastructure/api-client.md` — API response format, httpClient, interceptors

## Pre-Implementation (MANDATORY)

1. **Check research cache:** `.claude/ledger/research/{technology}.md`
2. If unfamiliar API → Context7 query → save to research cache
3. NEVER guess API syntax — verify first

## Implementation Order

Follow `feature-module.md` creation order:

1. **Types** → `types/responses/{entity}-{projection}.response.ts` (IApi* + I* pair)
2. **Types** → `types/requests/{action}-{entity}.request.ts`
3. **Mappers** → `mappers/{entity}-{projection}.mapper.ts` (pure functions, snake→camel)
4. **Query Keys** → `constants/query-keys.ts` (factory functions using API_ROUTES.*.BASE)
5. **Composables** → `composables/queries/use-{entity}-{projection}.ts`
6. **Composables** → `composables/mutations/use-{action}-{entity}.ts`
7. **Components** → `presentation/components/` (`<script setup>`, typed props/emits)
8. **Views** → `presentation/views/` (container using composables, loading/error)
9. **Route** → `routes.ts` with DRY path constant
10. **Register** → Import in `app/router.ts`

## Commit at Checkpoints

After each logical unit:
```bash
git add .
git commit -m "feat({scope}): [TTV-XXX] add {description}"
```

Suggested checkpoints:
```
types + mappers + query-keys  → "feat(events): [TTV-XXX] add event types and mappers"
composables (queries+mutations) → "feat(events): [TTV-XXX] add event composables"
components + views             → "feat(events): [TTV-XXX] add EventListView"
route + wiring                 → "feat(events): [TTV-XXX] register event routes"
```

## Quick Rules

- `<script setup>` always — no Options API
- TanStack Query for ALL server data — never fetch in onMounted
- NO services/datasource layer — composables call httpClient directly
- Mappers per projection — pure functions, not static classes
- Types per projection — IApi* (snake_case) + I* (camelCase) pairs
- One file per query, mutation, mapper, response (Screaming Architecture)
- Query keys as factory functions reusing API_ROUTES.*.BASE
- `I` prefix on all interfaces (IEvent, IApiEventListItem, ICreateEventRequest)
- Naive UI `n-` prefix components
- Feature routes in `routes.ts` with DRY path constant
