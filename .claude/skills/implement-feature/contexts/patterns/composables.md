# Composable Patterns

## Query Composable (Read)

Composables call `httpClient` directly — there is NO services layer.

### Paginated List Query

```typescript
// composables/queries/use-events-list.ts
import { computed, type Ref } from 'vue'
import { keepPreviousData, useQuery } from '@tanstack/vue-query'
import { httpClient } from '@/core/http/axios-client'
import { API_ROUTES } from '@/core/api/api-routes'
import type { IApiPagination } from '@/core/http/http-response.interface'
import { EVENT_QUERY_KEYS } from '../../constants/query-keys'
import { toEventListItems } from '../../mappers/event-list.mapper'
import type { IApiEventListItem } from '../../types/responses/event-list.response'

export function useEventsListQuery(page: Ref<number>, limit = 20) {
  return useQuery({
    queryKey: computed(() => EVENT_QUERY_KEYS.list(page.value)), // reactive: refetches on page change
    queryFn: async () => {
      const response = await httpClient.get<IApiEventListItem[]>(API_ROUTES.EVENTS.GET_ALL, {
        params: { page: page.value, limit },
      })
      return {
        items: toEventListItems(response.data),
        pagination: response.meta.pagination as IApiPagination,
      }
    },
    placeholderData: keepPreviousData, // keep stale data while fetching next page
  })
}
```

Key patterns:

- **Reactive queryKey** via `computed()` — page changes trigger automatic refetch
- **`keepPreviousData`** — smooth pagination transitions (no flash to loading)
- **Compound return** — `{ items, pagination }` exposes both data and meta
- **`response.meta.pagination`** — pagination comes from the backend envelope

### Detail Query (conditional)

```typescript
// composables/queries/use-event-detail.ts
import { computed, type Ref } from 'vue'
import { useQuery } from '@tanstack/vue-query'
import { httpClient } from '@/core/http/axios-client'
import { API_ROUTES } from '@/core/api/api-routes'
import { EVENT_QUERY_KEYS } from '../../constants/query-keys'
import { toEventDetail } from '../../mappers/event-detail.mapper'
import type { IApiEventDetail, IEventDetail } from '../../types/responses/event-detail.response'

export function useEventDetailQuery(id: Ref<IEventDetail['id']>) {
  return useQuery({
    queryKey: computed(() => EVENT_QUERY_KEYS.detail(id.value)),
    queryFn: async () => {
      const response = await httpClient.get<IApiEventDetail>(API_ROUTES.EVENTS.GET_BY_ID(id.value))
      return toEventDetail(response.data)
    },
    enabled: computed(() => !!id.value), // don't query until id exists
  })
}
```

### Usage in Views

```typescript
// Queries — destructure data, isPending, isError, refetch
const { data, isPending, isError, refetch } = useEventsListQuery(page, ITEMS_PER_PAGE)

// refetch is used for retry buttons:
// <NButton @click="refetch()">Reintentar</NButton>
```

## Mutation Composable (Write)

```typescript
// composables/mutations/use-create-event.ts
import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { useRouter } from 'vue-router'
import { httpClient } from '@/core/http/axios-client'
import { API_ROUTES } from '@/core/api/api-routes'
import { EVENT_QUERY_KEYS } from '../../constants/query-keys'
import { EVENT_ROUTE_NAMES } from '../../routes'
import type { ICreateEventRequest } from '../../types/requests/create-event.request'

export function useCreateEvent() {
  const queryClient = useQueryClient()
  const router = useRouter()

  return useMutation({
    mutationFn: (data: ICreateEventRequest) =>
      httpClient.post<{ id: string }>(API_ROUTES.EVENTS.CREATE, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: EVENT_QUERY_KEYS.all() })
      router.push({ name: EVENT_ROUTE_NAMES.LIST })
      // Success toast comes from interceptor (meta.message from backend)
    },
  })
}
```

Key patterns:

- **`EVENT_ROUTE_NAMES`** — type-safe navigation, no magic strings
- **Invalidate `all()`** — busts all event queries (list + details)
- **No onError** — error handling via interceptor (toast) + TanStack Query catches errors

### Usage in Views

```typescript
const { mutate, isPending: isSubmitting } = useCreateEvent()

function handleSubmit(formData: IEventFormData) {
  mutate(toCreateEventRequest(formData))
}
```

## Form Data Flow

Forms follow a 3-phase mapping pipeline with explicit null coercion:

```
API (IEventDetail) → Form (IEventFormData) → Request (ICreateEventRequest)
   Date object          timestamp number          ISO string "yyyy-MM-dd"
   null                 ''  (empty string)        null
   "  padded  "         "  padded  "              "padded" (trimmed)
```

### Form Types

UI-friendly types — timestamps for NDatePicker, empty strings for NInput:

```typescript
// types/event-form.types.ts
export interface IEventFormData {
  name: string
  date: number | null // NDatePicker works with timestamps
  location: string // empty string, NOT null (NInput needs string)
}
```

### Form Mapper (Domain ↔ Form ↔ Request)

```typescript
// mappers/event-form.mapper.ts

// Domain → Form (for edit views: pre-populate form from API data)
export function toEventFormData(event: IEventDetail): IEventFormData {
  return {
    name: event.name,
    date: event.date.getTime(), // Date → timestamp
    location: event.location ?? '', // null → empty string
  }
}

// Form → Request (submit: clean up for backend)
export function toCreateEventRequest(form: IEventFormData): ICreateEventRequest {
  return {
    name: form.name.trim(),
    date: format(new Date(form.date!), 'yyyy-MM-dd'), // timestamp → ISO
    location: form.location?.trim() || null, // empty/whitespace → null
  }
}
```

**Null coercion rule:** optional string fields use `?.trim() || null` — converts empty strings and whitespace-only back to `null` for the backend.

### Form Utils (`shared/utils/form.utils.ts`)

Bridge TanStack Form ↔ Naive UI:

```typescript
// Binds field value + events to any Naive UI input component
// Usage: <NInput v-bind="fieldInput(field)" />
export function fieldInput(field: AnyFieldApi) {
  return {
    value: field.state.value,
    'onUpdate:value': field.handleChange,
    onBlur: field.handleBlur,
  }
}

// Binds validation status + feedback to NFormItem
// Usage: <NFormItem v-bind="fieldStatus(field)" />
export function fieldStatus(field: AnyFieldApi) {
  const { isTouched, isValid, errors } = field.state.meta
  return {
    validationStatus: isTouched && !isValid ? ('error' as const) : undefined,
    feedback: isTouched ? getFieldErrors(errors) : undefined,
  }
}
```

### View → Form → Mutation Wiring

The **view** owns the mapping, not the form component:

```typescript
// EventCreateView.vue
const { mutate, isPending } = useCreateEvent()

function handleSubmit(formData: IEventFormData) {
  mutate(toCreateEventRequest(formData)) // view maps form → request
}

// <EventForm :is-submitting="isPending" @submit="handleSubmit" />
```

## Query Keys (Factory Functions)

```typescript
// constants/query-keys.ts
import { API_ROUTES } from '@/core/api/api-routes'

export const EVENT_QUERY_KEYS = {
  all: () => [API_ROUTES.EVENTS.BASE] as const,
  list: (page?: number) => [API_ROUTES.EVENTS.BASE, 'list', { page }] as const,
  detail: (id: string) => [API_ROUTES.EVENTS.BASE, 'detail', id] as const,
} as const
```

Keys reuse `API_ROUTES.*.BASE` — one source of truth for the module identifier.

## Rules

- One file per query, one file per mutation (Screaming Architecture)
- Composables call `httpClient` directly — NO services/datasources
- Mappers handle all data transformation in queryFn
- Use `computed()` for reactive queryKey (pagination, filters)
- Use `keepPreviousData` for paginated queries
- Use `enabled: computed(...)` for conditional queries
- Use `refetch` for retry buttons (not reactive state tricks)
- Mutations navigate with `EVENT_ROUTE_NAMES` (type-safe)
- Mutations invalidate `QUERY_KEYS.all()` to bust entire module cache
- Errors are thrown by httpClient, caught naturally by TanStack Query
