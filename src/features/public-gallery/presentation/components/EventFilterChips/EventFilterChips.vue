<script setup lang="ts">
import { computed } from 'vue'

import type { IPublicEventType } from '@/shared/public-events'
import type { EventListChip } from '../../../composables/use-event-list-filters'

const props = defineProps<{
  eventTypes: IPublicEventType[]
}>()

// One chip at a time: every event, only those with photos, or one event type.
const chosen = defineModel<EventListChip>({ required: true })

const chips = computed<{ value: EventListChip; label: string }[]>(() => [
  { value: 'all', label: 'Todos' },
  { value: 'photos', label: 'Con fotos' },
  ...props.eventTypes.map((type) => ({ value: type.id, label: type.name })),
])
</script>

<template>
  <div class="event-chips" role="group" aria-label="Filtrar eventos">
    <button
      v-for="chip in chips"
      :key="chip.value"
      type="button"
      class="event-chips__chip"
      :aria-pressed="chosen === chip.value ? 'true' : 'false'"
      @click="chosen = chip.value"
    >
      {{ chip.label }}
    </button>
  </div>
</template>

<style scoped>
/* One row that scrolls sideways on mobile, with no visible scrollbar. */
.event-chips {
  display: flex;
  gap: var(--tt-space-2);
  overflow-x: auto;
  scrollbar-width: none;
}

.event-chips::-webkit-scrollbar {
  display: none;
}

.event-chips__chip {
  flex: none;
  block-size: var(--tt-control-s);
  padding-inline: calc(var(--tt-space-3) + var(--tt-space-1) / 2);
  border: thin solid var(--tt-line);
  border-radius: var(--tt-radius-pill);
  background: var(--tt-surface-raised);
  color: var(--tt-ink);
  font-family: var(--tt-font-sans);
  font-size: var(--tt-type-body-s-medium-size);
  font-weight: var(--tt-type-title-weight);
  cursor: pointer;
}

.event-chips__chip[aria-pressed='true'] {
  border-color: var(--tt-primary-soft-border);
  background: var(--tt-primary-soft);
  color: var(--tt-primary-ink);
}
</style>
