# Composable Patterns

## Query Composable (Read)

Composables call `httpClient` directly — there is NO services layer.

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
      return toEventListItems(response.data);  // mapper handles snake→camel
    },
  });
}
```

```typescript
// composables/queries/use-event-detail.ts
import { useQuery } from '@tanstack/vue-query';
import { httpClient } from '@/core/http/http-client';
import { API_ROUTES } from '@/core/api/api-routes';
import { EVENT_QUERY_KEYS } from '../../constants/query-keys';
import { toEventDetail } from '../../mappers/event-detail.mapper';
import type { IApiEventDetail } from '../../types/responses/event-detail.response';

export function useEventDetailQuery(id: Ref<string>) {
  return useQuery({
    queryKey: computed(() => EVENT_QUERY_KEYS.detail(id.value)),
    queryFn: async () => {
      const response = await httpClient.get<IApiEventDetail>(API_ROUTES.EVENTS.GET_BY_ID(id.value));
      return toEventDetail(response.data);
    },
    enabled: computed(() => !!id.value),
  });
}
```

## Mutation Composable (Write)

```typescript
// composables/mutations/use-create-event.ts
import { useMutation, useQueryClient } from '@tanstack/vue-query';
import { httpClient } from '@/core/http/http-client';
import { API_ROUTES } from '@/core/api/api-routes';
import { EVENT_QUERY_KEYS } from '../../constants/query-keys';
import type { ICreateEventRequest } from '../../types/requests/create-event.request';

export function useCreateEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (request: ICreateEventRequest) => {
      return await httpClient.post(API_ROUTES.EVENTS.CREATE, request);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: EVENT_QUERY_KEYS.all() });
      // Success toast comes from interceptor (meta.message from backend)
    },
  });
}
```

## Query Keys (Factory Functions)

```typescript
// constants/query-keys.ts
import { API_ROUTES } from '@/core/api/api-routes';

export const EVENT_QUERY_KEYS = {
  all: () => [API_ROUTES.EVENTS.BASE] as const,
  list: () => [API_ROUTES.EVENTS.BASE, 'list'] as const,
  detail: (id: string) => [API_ROUTES.EVENTS.BASE, 'detail', id] as const,
} as const;
```

Keys reuse `API_ROUTES.*.BASE` — one source of truth for the module identifier.

## Rules

- One file per query, one file per mutation (Screaming Architecture)
- Composables call `httpClient` directly — NO services/datasources
- Mappers handle all data transformation (snake_case → camelCase)
- Use factory functions for query keys, reusing API_ROUTES base
- Use `enabled: computed(...)` for conditional queries
- Query files: `use-{entity}-{projection}.ts` (e.g., `use-events-list.ts`)
- Mutation files: `use-{action}-{entity}.ts` (e.g., `use-create-event.ts`)
- Errors are thrown by httpClient, caught naturally by TanStack Query

## Research Step

IMPORTANT: If unfamiliar with TanStack Query Vue API, query Context7 BEFORE implementing.
Check `.claude/ledger/research/tanstack-query.md` first for cached findings.
