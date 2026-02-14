# Feature Module Anatomy

## Structure (Screaming Architecture)

```
features/{name}/
├── composables/                    # TanStack Query wrappers
│   ├── queries/                    # Read operations (one file per query)
│   │   ├── use-{entity}-{projection}.ts
│   │   └── use-{entity}-detail.ts
│   └── mutations/                  # Write operations (one file per mutation)
│       ├── use-create-{entity}.ts
│       └── use-update-{entity}.ts
├── mappers/                        # API ↔ Domain transformations
│   ├── {entity}-{projection}.mapper.ts
│   └── {entity}-detail.mapper.ts
├── types/                          # TypeScript interfaces per projection
│   ├── responses/                  # One file per backend query projection
│   │   ├── {entity}-list.response.ts     # IApi* + I* pair
│   │   └── {entity}-detail.response.ts
│   └── requests/                   # One file per action
│       ├── create-{entity}.request.ts
│       └── update-{entity}.request.ts
├── constants/
│   └── query-keys.ts               # Factory functions reusing API_ROUTES.*.BASE
├── presentation/
│   ├── views/                      # Route-level container components
│   │   ├── {Entity}ListView.vue
│   │   └── {Entity}DetailView.vue
│   └── components/                 # Presentation components (props in, events out)
│       ├── {Entity}Card.vue
│       └── {Entity}Form.vue
├── store/                          # Pinia (ONLY for client state, e.g. auth)
│   └── {name}.store.ts
└── routes.ts                       # Feature routes with DRY path constant
```

## Creation Order

When building a new feature, follow this sequence:

1. **Types** → `types/responses/` and `types/requests/` matching backend projections
2. **Mappers** → `mappers/` with pure functions (toEntityListItem, toEntityDetail)
3. **Query Keys** → `constants/query-keys.ts` factory functions
4. **Composables** → `composables/queries/` and `composables/mutations/`
5. **Components** → `presentation/components/` (props in, events out)
6. **Views** → `presentation/views/` (container using composables)
7. **Routes** → `routes.ts` with DRY path constant
8. **Register** → Import routes in `app/router.ts`

## Key Principles

### No Services Layer
Composables call `httpClient` directly. We control the backend — no need for a service/datasource/repository abstraction layer.

### Types Per Projection (aligned with backend CQRS)
The backend has separate queries (`GetEventsListQuery`, `GetEventByIdQuery`) returning different fields. Each projection gets its own pair of interfaces:

```typescript
// types/responses/event-list.response.ts
export interface IApiEventListItem {  // What the API returns (snake_case)
  id: string;
  name: string;
  event_date: string;
  total_photos: number;
}

export interface IEventListItem {     // What the frontend uses (camelCase)
  id: string;
  name: string;
  eventDate: string;
  totalPhotos: number;
}
```

### Mappers Per Projection
Each projection has its own mapper file with pure exported functions:

```typescript
// mappers/event-list.mapper.ts
import type { IApiEventListItem, IEventListItem } from '../types/responses/event-list.response';

export function toEventListItem(api: IApiEventListItem): IEventListItem {
  return {
    id: api.id,
    name: api.name,
    eventDate: api.event_date,
    totalPhotos: api.total_photos,
  };
}

export function toEventListItems(apiList: IApiEventListItem[]): IEventListItem[] {
  return apiList.map(toEventListItem);
}
```

### Composable Pattern (no service layer)

```typescript
// composables/queries/use-events-list.ts
import { useQuery } from '@tanstack/vue-query';
import { httpClient } from '@/core/http/http-client';
import { API_ROUTES } from '@/core/api/api-routes';
import { EVENT_QUERY_KEYS } from '../../constants/query-keys';
import { toEventListItems } from '../../mappers/event-list.mapper';
import type { IApiEventListItem } from '../../types/responses/event-list.response';

export function useEventsListQuery() {
  return useQuery({
    queryKey: EVENT_QUERY_KEYS.list(),
    queryFn: async () => {
      const response = await httpClient.get<IApiEventListItem[]>(API_ROUTES.EVENTS.GET_ALL);
      return toEventListItems(response.data);
    },
  });
}
```

## Rules

- Each feature is self-contained — all its code lives in its directory
- No importing internal files from other features
- Views are lazy-loaded via `() => import(...)` in router
- One file per query, mutation, mapper, and response type (Screaming Architecture)
- NO `index.ts` public API — features communicate via Pinia stores or route params
