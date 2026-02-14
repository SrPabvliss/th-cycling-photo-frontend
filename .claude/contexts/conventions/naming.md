# Naming Conventions

## Files (Screaming Architecture)

| Type | Pattern | Example |
|------|---------|---------|
| Component | `PascalCase.vue` | `EventCard.vue`, `PhotoGrid.vue` |
| View | `PascalCase` + `View` suffix | `EventListView.vue`, `PhotoDetailView.vue` |
| Query composable | `use-{entity}-{projection}.ts` | `use-events-list.ts`, `use-event-detail.ts` |
| Mutation composable | `use-{action}-{entity}.ts` | `use-create-event.ts`, `use-update-event.ts` |
| Mapper | `{entity}-{projection}.mapper.ts` | `event-list.mapper.ts`, `event-detail.mapper.ts` |
| Response types | `{entity}-{projection}.response.ts` | `event-list.response.ts`, `event-detail.response.ts` |
| Request types | `{action}-{entity}.request.ts` | `create-event.request.ts`, `update-event.request.ts` |
| Query keys | `query-keys.ts` | `features/events/constants/query-keys.ts` |
| Routes | `routes.ts` | `features/events/routes.ts` |
| Store (Pinia) | `{feature}.store.ts` | `auth.store.ts` |
| Utils | `kebab-case` | `date.utils.ts`, `format.utils.ts` |
| Folders | `kebab-case` | `query-keys/`, `photo-grid/` |

**All TypeScript files use kebab-case. All Vue files use PascalCase.**

## Code

| Type | Pattern | Example |
|------|---------|---------|
| Components | PascalCase | `<EventCard />`, `<PhotoGrid />` |
| Composables | camelCase + `use` | `useEventsListQuery()`, `useCreateEvent()` |
| Functions/variables | camelCase | `handleSubmit`, `isLoading` |
| Constants | UPPER_SNAKE_CASE | `MAX_FILE_SIZE`, `API_ROUTES` |
| Interfaces | PascalCase with `I` prefix | `IEvent`, `IApiEventListItem`, `ICreateEventRequest` |
| Enums | PascalCase | `EventStatus`, `PhotoClassification` |
| Props | camelCase in script | `defineProps<{ eventId: string }>()` |
| Events | camelCase | `defineEmits<{ select: [id: string] }>()` |

## Interface Naming (I prefix convention)

We use `I` prefix to clearly distinguish:
- `IApiEventListItem` — what comes from the API (snake_case fields)
- `IEventListItem` — what the frontend domain uses (camelCase fields)
- `ICreateEventRequest` — what gets sent to the API

## Query Keys

Factory functions reusing API_ROUTES base: `EVENT_QUERY_KEYS.all()`, `EVENT_QUERY_KEYS.detail(id)`

## Feature Scopes (for commits)

`events`, `photos`, `classifications`, `shared`, `app`, `core`
