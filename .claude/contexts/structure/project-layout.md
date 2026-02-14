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

- **features → core:** Allowed. Features import httpClient, API_ROUTES, layout
- **features → shared:** Allowed. Features import shared components/utils
- **features → features:** FORBIDDEN. No direct cross-feature imports
- **shared → features:** FORBIDDEN. Shared never imports from features
- **core → features:** FORBIDDEN. Core never imports from features (except auth store in interceptor)
- **Cross-feature communication:** Via Pinia stores or route params only

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
