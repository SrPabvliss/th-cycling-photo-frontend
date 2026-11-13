<script setup lang="ts">
import { computed, ref, watch } from 'vue'

import { ROUTE_PATHS } from '@/core/navigation/route-paths'
import { eventDateLabel, eventDateParts } from './event-date'
import type { IPublicEventListItem } from './public-event.types'

const props = defineProps<{
  event: IPublicEventListItem
}>()

const photoCountFormat = new Intl.NumberFormat('es-EC')

const date = computed(() => eventDateParts(props.event.startDate, props.event.endDate))

const photosLabel = computed(() => {
  const count = props.event.photoCount
  return `${photoCountFormat.format(count)} ${count === 1 ? 'foto' : 'fotos'}`
})

const accessibleName = computed(() =>
  [
    props.event.name,
    props.event.placeLabel,
    eventDateLabel(props.event.startDate, props.event.endDate),
  ]
    .filter(Boolean)
    .join(', '),
)

// A cover that fails to load leaves the reserved space, not a broken image.
const coverFailed = ref(false)
watch(
  () => props.event.coverUrl,
  () => (coverFailed.value = false),
)
</script>

<template>
  <RouterLink
    class="event-card"
    :to="`${ROUTE_PATHS.PUBLIC_GALLERY}/${event.slug}`"
    :aria-label="accessibleName"
  >
    <span class="event-card__cover">
      <img
        v-if="event.coverUrl && !coverFailed"
        :src="event.coverUrl"
        alt=""
        loading="lazy"
        decoding="async"
        @error="coverFailed = true"
      />
    </span>

    <span class="event-card__tag">
      <span
        class="event-card__count"
        :class="{ 'event-card__count--soon': event.photoCount === 0 }"
      >
        <template v-if="event.photoCount === 0">Próximamente</template>
        <template v-else>
          <svg class="event-card__camera" viewBox="0 0 24 24" aria-hidden="true">
            <path
              d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3z"
            />
            <circle cx="12" cy="13" r="3.2" />
          </svg>
          {{ photosLabel }}
        </template>
      </span>

      <span class="event-card__info">
        <span class="event-card__date">
          <span class="event-card__day">{{ date.day }}</span>
          <span class="event-card__month">{{ date.month }}</span>
        </span>
        <span class="event-card__text">
          <span class="event-card__name">{{ event.name }}</span>
          <span v-if="event.placeLabel" class="event-card__place">{{ event.placeLabel }}</span>
        </span>
        <span class="event-card__go" aria-hidden="true">
          <svg class="event-card__arrow" viewBox="0 0 24 24">
            <path d="M5 12h14M13 6l6 6-6 6" />
          </svg>
        </span>
      </span>
    </span>
  </RouterLink>
</template>

<style scoped src="./public-event-card.css" />

<style scoped>
.event-card__count {
  display: flex;
  align-items: center;
  gap: var(--tt-space-1);
  block-size: var(--tt-icon-xl);
  margin-inline-start: var(--tt-space-3);
  padding-inline: calc(var(--tt-space-2) + var(--tt-space-1) / 2);
  border-radius: var(--tt-radius-s) var(--tt-radius-s) 0 0;
  background: var(--tt-primary);
  color: var(--tt-on-primary);
  font-size: var(--tt-type-label-size);
  font-weight: var(--tt-type-label-weight);
}

.event-card__count--soon {
  background: var(--tt-navy);
  color: var(--tt-on-navy);
}

.event-card__camera,
.event-card__arrow {
  fill: none;
  stroke: currentColor;
  stroke-width: 1.8;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.event-card__camera {
  inline-size: var(--tt-icon-xs);
  block-size: var(--tt-icon-xs);
}

.event-card__day {
  font-size: var(--tt-type-body-size);
  line-height: 1.15;
  font-weight: var(--tt-type-heading-m-weight);
  white-space: nowrap;
}

.event-card__month {
  font-size: var(--tt-type-count-size);
  line-height: var(--tt-type-count-line);
  font-weight: var(--tt-type-count-weight);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  white-space: nowrap;
}

.event-card__name {
  display: -webkit-box;
  overflow: hidden;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  font-size: var(--tt-type-body-size);
  line-height: 1.25;
  font-weight: var(--tt-type-title-weight);
  overflow-wrap: anywhere;
}

.event-card__place {
  overflow: hidden;
  color: var(--tt-ink-muted);
  font-size: var(--tt-type-caption-size);
  line-height: var(--tt-type-caption-line);
  text-overflow: ellipsis;
  white-space: nowrap;
}

.event-card__go {
  flex: none;
  display: flex;
  align-items: center;
  justify-content: center;
  inline-size: var(--tt-logo-mark-desktop);
  block-size: var(--tt-logo-mark-desktop);
  border-radius: var(--tt-radius-pill);
  background: var(--tt-primary);
  color: var(--tt-on-primary);
}

.event-card__arrow {
  inline-size: var(--tt-icon-s);
  block-size: var(--tt-icon-s);
}
</style>
