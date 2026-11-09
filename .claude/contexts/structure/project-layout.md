# Project Layout

## Directory Structure

```
src/
├── app/                        # App shell — global setup
│   ├── App.vue                 # Root component (NConfigProvider wrapper)
│   ├── main.ts                 # Entry point (Pinia, Router, VueQuery)
│   └── router.ts               # Central router (composes feature routes)
├── core/                       # Infrastructure (NOT business logic)
│   ├── http/
│   │   ├── http-client.ts              # AxiosClient singleton implementing IHttpHandler
│   │   ├── http-handler.interface.ts   # Abstract interface (get, post, put, patch, delete)
│   │   ├── http-response.interface.ts  # ADR-002 envelope types
│   │   └── interceptors/
│   │       ├── auth.interceptor.ts     # Injects JWT from auth store
│   │       └── error.interceptor.ts    # Toast on error, logout on 401
│   ├── api/
│   │   └── api-routes.ts               # Centralized API route constants (DRY base per module)
│   ├── config/
│   │   └── env.ts                      # Typed environment variables
│   └── layout/
│       └── AppLayout.vue               # Main layout (sidebar, navbar, content slot)
├── features/                   # Self-contained business modules
│   ├── auth/
│   ├── events/
│   ├── photos/
│   └── classifications/
├── shared/                     # Cross-feature (2+ features use it)
│   ├── components/             # Generic UI components
│   ├── composables/            # Generic composables (usePagination, etc.)
│   ├── types/                  # Shared types (pagination)
│   └── utils/                  # Helper functions
└── assets/                     # Static assets (images, fonts, styles)
```

## Import Rules

Four layers, each may only import downward:

```
app/        composes everything
  |
features/domain/    events, photos, orders, cart, review, ...
  |                 MAY NOT import each other
features/base/      auth, locations, pricing, tenant-profile, legal,
  |                 event-types, participant-categories
  |                 Any feature may import these. They import nothing from features.
shared/     generic components, composables, utils, types
  |
core/       http, api routes, config, layout, theme, auth primitives
```

### Base features

A feature is **base** when it holds platform-wide identity or reference data and has
**zero outgoing imports to other features**. Any feature may import a base feature.

Current base tier: `auth`, `account`, `locations`, `pricing`, `tenant-profile`, `legal`,
`event-types`, `participant-categories`, `event-assets`, `photo-categories`, `organizers`,
`contracts`, `review`.

Promoting a feature to base requires it to have no feature imports of its own (except
other base features). That property is what makes the tier safe, and it is checked by lint.

### Domain features

Everything else. Domain features may import `core/`, `shared/` and base features.
They may **NOT** import another domain feature — no exceptions, and specifically no
cycles. Cross-domain communication goes through:

1. Route params / route `meta`
2. A Pinia store promoted to `shared/stores/`
3. A registry in `core/` that one feature fills and another consumes
   (see `core/auth/post-login-tasks.ts`)
4. Props and events, when both sit under a common parent

### Hard rules

- **shared → features:** FORBIDDEN, always.
- **core → features:** FORBIDDEN, always. Core sits underneath everything.
  Layout shells expose slots; they never mount feature components directly.
- **base → domain:** FORBIDDEN. This is what keeps the base tier a tier.
- **domain → domain:** FORBIDDEN.

Enforced by `no-restricted-imports` in `eslint.config.ts`.

## Where Things Go

| What | Where |
|------|-------|
| New business feature | `features/{name}/` |
| HTTP client, interceptors | `core/http/` |
| API route constants | `core/api/api-routes.ts` |
| Environment config | `core/config/env.ts` |
| App layout shell | `core/layout/` |
| Generic button/modal | `shared/components/` |
| Pagination types | `shared/types/` |
| Feature routes | `features/{name}/routes.ts` (composed in `app/router.ts`) |

## Path Alias

`@` resolves to `src/`. Use it for all imports: `import { httpClient } from '@/core/http/http-client'`

## Scaling Rule

> **Start co-located, move to shared when needed. Never preemptively.**

If a type, util, or component starts in a feature and later another feature needs it, THEN move to `shared/`.
