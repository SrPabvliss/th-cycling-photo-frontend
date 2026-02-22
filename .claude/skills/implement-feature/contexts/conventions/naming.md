# Naming Conventions

## Files (Screaming Architecture)

| Type                | Pattern                                  | Example                                        |
| ------------------- | ---------------------------------------- | ---------------------------------------------- |
| Component           | `PascalCase.vue` in `PascalCase/` folder | `EventCard/EventCard.vue`                      |
| Component CSS       | `kebab-case.css` in same folder          | `EventCard/event-card.css`                     |
| Skeleton            | `{Component}Skeleton.vue`                | `EventCardSkeleton/EventCardSkeleton.vue`      |
| View                | `PascalCase` + `View` suffix             | `EventListView.vue`                            |
| View CSS (shared)   | `kebab-case.css` in views/               | `event-form-view.css`                          |
| Query composable    | `use-{entity}-{projection}.ts`           | `use-events-list.ts`                           |
| Mutation composable | `use-{action}-{entity}.ts`               | `use-create-event.ts`                          |
| Mapper              | `{entity}-{projection}.mapper.ts`        | `event-list.mapper.ts`, `event-form.mapper.ts` |
| Response types      | `{entity}-{projection}.response.ts`      | `event-list.response.ts`                       |
| Request types       | `{action}-{entity}.request.ts`           | `create-event.request.ts`                      |
| Form types          | `{entity}-form.types.ts`                 | `event-form.types.ts`                          |
| Shared UI types     | `{concept}.types.ts`                     | `stat-card.types.ts`                           |
| Query keys          | `query-keys.ts`                          | `constants/query-keys.ts`                      |
| Status config       | `status-config.ts`                       | `constants/status-config.ts`                   |
| Form schema         | `{entity}-form.schema.ts`                | `constants/event-form.schema.ts`               |
| Breadcrumbs         | `{entity}-breadcrumbs.ts`                | `constants/event-breadcrumbs.ts`               |
| Routes              | `routes.ts`                              | `features/events/routes.ts`                    |
| Store (Pinia)       | `{feature}.store.ts`                     | `auth.store.ts`                                |
| Utils               | `kebab-case`                             | `date.utils.ts`, `form.utils.ts`               |

**All TypeScript files use kebab-case. All Vue files use PascalCase.**

## Component Folder Convention

Each component gets its own folder:

```
EventCard/
├── EventCard.vue          # PascalCase
└── event-card.css         # kebab-case (linked via <style scoped src="...">)
```

Skeleton variants are sibling folders:

```
EventCard/
EventCardSkeleton/
```

## Code

| Type                | Pattern                    | Example                                       |
| ------------------- | -------------------------- | --------------------------------------------- |
| Components          | PascalCase                 | `<EventCard />`                               |
| Composables         | camelCase + `use`          | `useEventsListQuery()`                        |
| Functions/variables | camelCase                  | `handleSubmit`, `isPending`                   |
| Constants           | UPPER_SNAKE_CASE           | `API_ROUTES`, `EVENT_ROUTE_NAMES`             |
| Interfaces          | PascalCase with `I` prefix | `IEvent`, `IApiEventListItem`                 |
| Type aliases        | PascalCase (no prefix)     | `EventStatus`, `StatCardColor`                |
| CSS classes         | BEM-ish                    | `.event-card__cover`, `.event-card__meta-row` |

## Constants Naming

| Constant      | Pattern                   | Example                  |
| ------------- | ------------------------- | ------------------------ |
| Route names   | `{FEATURE}_ROUTE_NAMES`   | `EVENT_ROUTE_NAMES.LIST` |
| Path constant | `{FEATURE}S_PATH`         | `EVENTS_PATH`            |
| Status config | `{FEATURE}_STATUS_CONFIG` | `EVENT_STATUS_CONFIG`    |
| Filter tabs   | `{FEATURE}_FILTER_TABS`   | `EVENT_FILTER_TABS`      |
| Query keys    | `{FEATURE}_QUERY_KEYS`    | `EVENT_QUERY_KEYS`       |
| Form defaults | `{FEATURE}_FORM_DEFAULTS` | `EVENT_FORM_DEFAULTS`    |

All use `as const` for literal type inference where applicable.

## Interface Naming (I prefix convention)

- `IApiEventListItem` — what comes from the API (strings for dates, untyped status)
- `IEventListItem` — what the frontend uses (Date objects, typed status)
- `ICreateEventRequest` — what gets sent to the API
- `IEventFormData` — form state (timestamp numbers for date pickers)
- `IStatCard` — shared UI component type
- `IStatusConfig` — status display configuration
- `IFilterTab` — filter tab configuration

## Feature Scopes (for commits)

`events`, `photos`, `classifications`, `shared`, `app`, `core`
