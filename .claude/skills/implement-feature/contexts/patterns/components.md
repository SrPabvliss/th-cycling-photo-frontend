# Component Patterns

## Folder Structure

Each component lives in its own folder with a separate CSS file:

```
presentation/components/
├── EventCard/
│   ├── EventCard.vue              # PascalCase .vue
│   └── event-card.css             # kebab-case .css (scoped)
├── EventCardSkeleton/
│   └── EventCardSkeleton.vue      # Skeleton variant (CSS inline if small)
├── EventForm/
│   ├── EventForm.vue
│   └── event-form.css
└── EventFilterBar/
    ├── EventFilterBar.vue
    └── event-filter-bar.css
```

## Presentation Component

Props in, events out. No API calls, no composables.

```vue
<script setup lang="ts">
import { computed } from 'vue'
import { NButton, NFlex, NIcon, NTag } from 'naive-ui'
import { LocationOutline, CalendarOutline } from '@vicons/ionicons5'

import { formatDate } from '@/shared/utils/date.utils'
import { EVENT_STATUS_CONFIG } from '../../../constants/status-config'
import type { IEventListItem } from '../../../types/responses/event-list.response'

const props = defineProps<{
  event: IEventListItem
}>()

const emit = defineEmits<{
  view: [id: IEventListItem['id']]
}>()
</script>

<template>
  <article class="event-card" @click="emit('view', event.id)">
    <div class="event-card__cover">...</div>
    <div class="event-card__body">
      <h3 class="event-card__title">{{ event.name }}</h3>
      <div class="event-card__meta-row">
        <NFlex v-if="event.location" :size="6" align="center" class="event-card__meta">
          <NIcon :component="LocationOutline" :size="14" />
          <span>{{ event.location }}</span>
        </NFlex>
        <span v-if="event.location" class="event-card__meta-divider" />
        <NFlex :size="6" align="center" class="event-card__meta">
          <NIcon :component="CalendarOutline" :size="14" />
          <span>{{ formatDate(event.date) }}</span>
        </NFlex>
      </div>
    </div>
    <div class="event-card__footer">...</div>
  </article>
</template>

<style scoped src="./event-card.css"></style>
```

## External Scoped CSS

CSS lives in a separate file, linked with `scoped src`:

```css
/* event-card.css */
.event-card {
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid var(--tt-neutral-light);
  display: flex;
  flex-direction: column;
  height: 100%;
}

.event-card__cover {
  height: 155px;
}
.event-card__body {
  padding: 16px;
  flex: 1;
  display: flex;
  flex-direction: column;
}
.event-card__footer {
  margin-top: auto;
  padding-top: 16px;
  border-top: 1px solid #f3f4f6;
}
```

Class naming follows BEM-ish convention: `.component-name__element`.

## Skeleton Components

Every visual component should have a skeleton variant with **matched dimensions**:

```vue
<!-- EventCardSkeleton.vue -->
<script setup lang="ts">
import { NSkeleton } from 'naive-ui'
</script>

<template>
  <div class="event-card-skeleton">
    <!-- Cover: 155px matches .event-card__cover -->
    <NSkeleton height="155px" :sharp="false" />
    <div class="event-card-skeleton__body">
      <!-- Title: 21px matches font-size 16px × line-height 1.3 -->
      <NSkeleton :sharp="false" height="21px" style="width: 75%" />
      <!-- Meta row: 18px matches icon/text height -->
      <div class="event-card-skeleton__meta">
        <NSkeleton :sharp="false" height="18px" style="width: 45%" />
        <NSkeleton :sharp="false" height="18px" style="width: 35%" />
      </div>
      <!-- Button: 36px matches NButton rendered height -->
      <div class="event-card-skeleton__footer">
        <NSkeleton :sharp="false" height="36px" />
      </div>
    </div>
  </div>
</template>
```

Key rules for skeletons:

- Heights must match the real component (measure font-size × line-height)
- Use `:sharp="false"` for rounded edges
- Structure mirrors the real component (same flex layout, same margins)
- Inline styles for variable widths, CSS for structural layout

## Container Component (View)

Views use composables and handle the 3-state pattern: loading → error → content.

```vue
<!-- EventListView.vue -->
<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { NButton, NGrid, NGridItem, NResult } from 'naive-ui'

import AppTopBar from '@/core/layout/AppTopBar.vue'
import { useEventsListQuery } from '../../composables/queries/use-events-list'
import { EVENT_ROUTE_NAMES } from '../../routes'
import EventCard from '../components/EventCard/EventCard.vue'
import EventCardSkeleton from '../components/EventCardSkeleton/EventCardSkeleton.vue'

const page = ref(1)
const { data, isPending, isError, refetch } = useEventsListQuery(page, 5)
</script>

<template>
  <div class="page-view">
    <AppTopBar title="Gestión de Eventos" />

    <div class="page-view__content list-content">
      <!-- Skeleton loading -->
      <EventCardSkeleton v-if="isPending" />

      <!-- Error (centered in remaining space) -->
      <div v-else-if="isError" class="error-container">
        <NResult status="error" title="Error al cargar" description="...">
          <template #footer>
            <NButton @click="refetch()">Reintentar</NButton>
          </template>
        </NResult>
      </div>

      <!-- Content -->
      <template v-else-if="data">
        <NGrid :cols="3" :x-gap="24" :y-gap="16">
          <NGridItem v-for="event in data.items" :key="event.id">
            <EventCard :event="event" />
          </NGridItem>
        </NGrid>
      </template>
    </div>
  </div>
</template>

<style scoped>
.list-content {
  padding: 24px 32px;
  display: flex;
  flex-direction: column;
}

.error-container {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
```

Key view patterns:

- **`.page-view`** wrapper — AppTopBar stays fixed, content scrolls
- **`.error-container`** with `flex: 1` — centers error in remaining space
- **Content area as flex column** — enables error centering
- **`refetch()`** for retry buttons

## Shared UI Types

Types shared across multiple components within a feature go at the feature root:

```typescript
// types/stat-card.types.ts
import type { Component } from 'vue'

export type StatCardColor = 'blue' | 'green' | 'amber' | 'gray'

export interface IStatCard {
  icon: Component
  color: StatCardColor
  label: string
  value: string | number
  description?: string
}
```

## Rules

- `<script setup>` always — no Options API
- One folder per component: `ComponentName/ComponentName.vue` + `component-name.css`
- CSS in separate file with `<style scoped src="./component-name.css">`
- BEM-ish classes: `.event-card__cover`, `.event-card__body`
- Props typed with generics: `defineProps<{ ... }>()`
- Emits typed with generics: `defineEmits<{ ... }>()`
- Props use domain interfaces (`IEventListItem`), never API interfaces
- Every visual component has a skeleton with matched heights
- Views follow 3-state pattern: skeleton → error (centered) → content
- Constants imported from `constants/`, never inline in components
- Naive UI components imported from 'naive-ui', icons from '@vicons/ionicons5'
