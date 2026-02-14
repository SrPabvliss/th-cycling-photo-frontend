# Component Patterns

## Standard Component Template

```vue
<script setup lang="ts">
import type { IEventListItem } from '../../types/responses/event-list.response';

const props = defineProps<{
  event: IEventListItem
  loading?: boolean
}>();

const emit = defineEmits<{
  select: [id: string]
  delete: [id: string]
}>();
</script>

<template>
  <n-card hoverable @click="emit('select', props.event.id)">
    <template #header>{{ event.name }}</template>
    <template #header-extra>
      <n-tag :type="event.status === 'ACTIVE' ? 'success' : 'default'">
        {{ event.status }}
      </n-tag>
    </template>
  </n-card>
</template>
```

## Presentation vs Container

**Presentation components** — receive data via props, emit events up:
- Located in `features/{name}/presentation/components/`
- No direct composable usage, no API calls
- Reusable, testable

**Container components (Views)** — orchestrate data and pass to presentation:
- Located in `features/{name}/presentation/views/`
- Use query/mutation composables for data fetching
- Handle loading/error states
- Connected to router

```vue
<!-- Container: EventListView.vue -->
<script setup lang="ts">
import { useEventsListQuery } from '../../composables/queries/use-events-list';
import EventCard from '../components/EventCard.vue';

const { data: events, isLoading, error } = useEventsListQuery();
</script>

<template>
  <n-spin :show="isLoading">
    <n-grid v-if="events" :cols="3" :x-gap="16" :y-gap="16">
      <n-grid-item v-for="event in events" :key="event.id">
        <EventCard :event="event" @select="handleSelect" />
      </n-grid-item>
    </n-grid>
    <n-result v-if="error" status="error" title="Error loading data" />
  </n-spin>
</template>
```

## Rules

- `<script setup>` always — no Options API
- Props typed with generics: `defineProps<{ ... }>()`
- Emits typed with generics: `defineEmits<{ ... }>()`
- Naive UI components use `n-` prefix — check Context7 for unfamiliar component APIs
- Keep components focused: one responsibility per component
- Props use domain interfaces (`IEventListItem`), never API interfaces (`IApiEventListItem`)

## Research Step

IMPORTANT: Query Context7 for Naive UI component APIs before using unfamiliar components.
Check `.claude/ledger/research/naive-ui.md` first for cached findings.
