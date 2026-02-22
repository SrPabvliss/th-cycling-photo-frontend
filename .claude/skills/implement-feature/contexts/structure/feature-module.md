# Feature Module Anatomy

## Structure (Screaming Architecture)

```
features/{name}/
├── composables/
│   ├── queries/                         # One file per query
│   │   ├── use-{entity}-list.ts
│   │   └── use-{entity}-detail.ts
│   └── mutations/                       # One file per mutation
│       ├── use-create-{entity}.ts
│       └── use-update-{entity}.ts
├── mappers/
│   ├── {entity}-list.mapper.ts          # API → Domain (per projection)
│   ├── {entity}-detail.mapper.ts
│   └── {entity}-form.mapper.ts          # Domain ↔ Form ↔ Request
├── types/
│   ├── responses/                       # One file per backend projection
│   │   ├── {entity}-list.response.ts    # IApi* + I* pair + status union
│   │   └── {entity}-detail.response.ts
│   ├── requests/                        # One file per action
│   │   ├── create-{entity}.request.ts
│   │   └── update-{entity}.request.ts
│   ├── {entity}-form.types.ts           # Form data interface (IEventFormData)
│   └── stat-card.types.ts              # Shared UI types (IStatCard, StatCardColor)
├── constants/
│   ├── query-keys.ts                    # Factory functions → API_ROUTES.*.BASE
│   ├── status-config.ts                 # STATUS_CONFIG + FILTER_TABS
│   ├── {entity}-form.schema.ts          # Zod schema + FORM_DEFAULTS
│   └── {entity}-breadcrumbs.ts          # Breadcrumb factory functions
├── presentation/
│   ├── views/
│   │   ├── {Entity}ListView.vue
│   │   ├── {Entity}DetailView.vue
│   │   ├── {Entity}CreateView.vue
│   │   ├── {Entity}EditView.vue
│   │   └── {entity}-form-view.css       # Shared CSS for create/edit views
│   └── components/                      # One folder per component
│       ├── {Entity}Card/
│       │   ├── {Entity}Card.vue
│       │   └── {entity}-card.css
│       ├── {Entity}CardSkeleton/
│       │   └── {Entity}CardSkeleton.vue  # Matched heights to real card
│       ├── {Entity}DetailSkeleton/
│       │   └── {Entity}DetailSkeleton.vue
│       ├── {Entity}FormSkeleton/
│       │   └── {Entity}FormSkeleton.vue
│       ├── {Entity}Form/
│       │   ├── {Entity}Form.vue
│       │   └── {entity}-form.css
│       ├── {Entity}FilterBar/
│       │   ├── {Entity}FilterBar.vue
│       │   └── {entity}-filter-bar.css
│       └── ...
├── store/                               # Pinia (ONLY for client state)
│   └── {name}.store.ts
└── routes.ts                            # ROUTE_NAMES + path constant + route definitions
```

## Creation Order

When building a new feature, follow this sequence:

1. **Types** → `types/responses/` and `types/requests/` matching backend projections
2. **Types** → `types/` shared UI types if needed (form data, stat cards)
3. **Mappers** → `mappers/` with pure functions (toEntityListItem, toEntityDetail, toEntityFormData)
4. **Constants** → `constants/query-keys.ts` factory functions
5. **Constants** → `constants/status-config.ts` with STATUS_CONFIG + FILTER_TABS
6. **Constants** → `constants/{entity}-form.schema.ts` with Zod + defaults
7. **Constants** → `constants/{entity}-breadcrumbs.ts` with factory functions
8. **Composables** → `composables/queries/` and `composables/mutations/`
9. **Components** → `presentation/components/` (one folder per component + skeleton variants)
10. **Views** → `presentation/views/` (page-view structure, 3-state pattern)
11. **Routes** → `routes.ts` with `ROUTE_NAMES as const` + `{FEATURE}_PATH`
12. **Register** → Import routes in `app/router.ts`

## Key Principles

### No Services Layer

Composables call `httpClient` directly. We control the backend — no need for a service/datasource/repository abstraction.

### Types Per Projection

The backend returns camelCase (projections handle this). Each projection gets its own pair:

```typescript
// types/responses/event-list.response.ts

// What the API returns (strings for dates, untyped status)
export interface IApiEventListItem {
  id: string
  name: string
  date: string // ISO 8601
  location: string | null
  status: string
  totalPhotos: number
  processedPhotos: number
}

// What the frontend uses (parsed dates, typed status)
export interface IEventListItem {
  id: string
  name: string
  date: Date // parsed by mapper
  location: string | null
  status: EventStatus // union type
  totalPhotos: number
  processedPhotos: number
}

export type EventStatus = 'draft' | 'uploading' | 'processing' | 'completed'
```

### Mappers Per Projection

Pure functions handling: ISO string → Date, string → union type, trim/null coercion.

```typescript
// mappers/event-list.mapper.ts
export function toEventListItem(api: IApiEventListItem): IEventListItem {
  return {
    ...api,
    date: parseDateOnly(api.date),
    status: api.status as EventStatus,
  }
}
```

### Route Names (type-safe navigation)

```typescript
// routes.ts
export const EVENTS_PATH = '/events'

export const EVENT_ROUTE_NAMES = {
  LIST: 'events-list',
  CREATE: 'events-create',
  DETAIL: 'events-detail',
  EDIT: 'events-edit',
} as const

// Usage: router.push({ name: EVENT_ROUTE_NAMES.DETAIL, params: { id } })
```

### Status Config + Filter Tabs

```typescript
// constants/status-config.ts
export const EVENT_STATUS_CONFIG: Record<EventStatus, IStatusConfig> = {
  draft: { label: 'Borrador', type: 'default' },
  processing: { label: 'Procesando', type: 'warning' },
  completed: { label: 'Completado', type: 'success' },
}

export const EVENT_FILTER_TABS: IFilterTab[] = [
  { label: 'Todos', status: null, enabled: true },
  { label: 'Completados', status: 'completed', enabled: false },
  // ...
]
```

### Form Schema + Defaults

```typescript
// constants/event-form.schema.ts
export const EVENT_FORM_DEFAULTS: IEventFormData = {
  name: '',
  date: null,
  location: '',
}

export const eventFormSchema = z.object({
  name: z.string().min(3, 'Mínimo 3 caracteres').max(200, 'Máximo 200 caracteres'),
  date: z.number({ error: 'La fecha es requerida' }),
  location: z.string(),
})
```

### Breadcrumb Factories

```typescript
// constants/event-breadcrumbs.ts
const root: IBreadcrumbItem = { label: 'Eventos', to: EVENTS_PATH }

export function detailBreadcrumbs(name: string): IBreadcrumbItem[] {
  return [root, { label: name }]
}

export function editBreadcrumbs(id: string, name: string): IBreadcrumbItem[] {
  return [root, { label: name, to: `${EVENTS_PATH}/${id}` }, { label: 'Editar' }]
}
```

## Rules

- Each feature is self-contained — all its code lives in its directory
- No importing internal files from other features
- Views are lazy-loaded via `() => import(...)` in router
- One file per query, mutation, mapper, and response type
- One folder per component with separate CSS file
- Every visual component has a skeleton variant with matched heights
- Constants extracted from components — never inline arrays/configs
- NO `index.ts` public API — features communicate via Pinia stores or route params
