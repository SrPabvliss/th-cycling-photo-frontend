# CLAUDE.md - Cycling Photo Frontend

Frontend for automated cycling photography classification system.
Software Engineering Thesis - Universidad Técnica de Ambato.
Companion to: `cycling-photo-backend` (NestJS API).

## Stack

- **Framework:** Vue 3 (Composition API) + Vite + TypeScript 5.9
- **UI:** Naive UI
- **Server State:** TanStack Query (`@tanstack/vue-query`)
- **Client State:** Pinia (auth only)
- **HTTP:** Axios (AxiosClient singleton implementing IHttpHandler)
- **Validation:** Zod
- **Router:** Vue Router (distributed routes per feature)
- **Utilities:** VueUse
- **Linting:** OxLint + ESLint + Prettier
- **Testing:** Vitest + Vue Test Utils
- **Package Manager:** pnpm (enforced)
- **Deploy:** Cloudflare Pages

## Commands

```bash
pnpm dev              # dev server
pnpm build            # type-check + production build
pnpm preview          # preview production build
pnpm lint             # oxlint + eslint fix
pnpm format           # prettier
pnpm test:unit        # vitest
pnpm type-check       # vue-tsc
```

## Skills

IMPORTANT: Always invoke `find-skills` first to determine the right skill.

| Skill | When |
|-------|------|
| `find-skills` | ALWAYS first — routes to correct skill |
| `plan-task` | Starting a ticket, breaking down features |
| `implement-feature` | Writing components, composables, views, mappers |
| `manage-git` | Branches, commits, PRs, Jira transitions |

## MCP Servers

| Server | When |
|--------|------|
| **Context7** | BEFORE implementing with unfamiliar APIs (Naive UI, TanStack Query, Vue 3) |
| **Jira** | Start/end of tickets |

## Context Files

| Area | Files | Content |
|------|-------|---------|
| `patterns/` | `composables.md`, `components.md` | TanStack Query patterns (NO services layer), Vue 3 components |
| `structure/` | `project-layout.md`, `feature-module.md` | core/features/shared organization, screaming architecture |
| `conventions/` | `naming.md`, `git.md` | Kebab-case TS, I prefix, git/Jira workflow |
| `infrastructure/` | `api-client.md`, `app-setup.md` | AxiosClient in core/http/, ADR-002 envelope, providers |

## Research Cache

Save research findings to `.claude/ledger/research/{technology}.md`.
Check cache BEFORE querying Context7 to avoid duplicate lookups.

## Critical Rules

1. **Composition API + `<script setup>` ONLY** — no Options API, no mixins
2. **TanStack Query for ALL server data** — never fetch in onMounted
3. **NO services/datasource layer** — composables call httpClient directly
4. **Mappers per projection** — pure functions transforming IApi* → I* (snake→camel)
5. **Screaming Architecture** — one file per query, mutation, mapper, response type
6. **Types with I prefix** — IEvent, IApiEventListItem, ICreateEventRequest
7. **DRY constants** — API_ROUTES base feeds query keys, path constants feed routes
8. **Research before implementing** — Context7 for unfamiliar APIs
9. **Pinia = client state only** — auth store, UI preferences. Never server data
10. **Commits reference ticket** — `type(scope): [TTV-XXX] description`

## Architecture Anti-Patterns (REJECTED)

Do NOT create any of these — they were explicitly rejected after reviewing 8 past projects:

- ❌ `services/` or `datasource/` layer (composables call httpClient directly)
- ❌ Repository interface + implementation (we control the backend)
- ❌ Use cases (passthrough without logic in frontend)
- ❌ Models with fromJson/toJson classes (TypeScript interfaces suffice)
- ❌ BaseCrud* inheritance (project too small to justify)
- ❌ `{ data?, error? }` pattern (swallows errors, loses TanStack Query potential)
- ❌ Single monolithic types file per feature (use types/responses/ and types/requests/)
- ❌ `select` for data transformation (mappers handle it explicitly)
- ❌ Centralized routes in one file (distribute per feature with DRY path constant)
