<script setup lang="ts">
import { computed } from 'vue'
import { EVENT_ROUTE_NAMES } from '@/features/events/routes'

const props = defineProps<{
  eventName: string
  eventSlug: string
  reviewedCount: number
  totalCount: number
  onlyPending: boolean
}>()

const eventDetailRoute = computed(() => ({
  name: EVENT_ROUTE_NAMES.DETAIL,
  params: { slug: props.eventSlug },
}))

const emit = defineEmits<{
  'update:onlyPending': [value: boolean]
  'show-cheatsheet': []
}>()

const progressPercent = computed(() =>
  props.totalCount > 0 ? Math.round((props.reviewedCount / props.totalCount) * 100) : 0,
)
</script>

<template>
  <header class="rv-header">
    <RouterLink
      :to="eventDetailRoute"
      class="rv-btn rv-header__back"
      :title="`Salir al evento ${eventName}`"
    >
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="1.7"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <path d="m15 18-6-6 6-6" />
      </svg>
      Salir
      <span class="rv-kbd">⌘Esc</span>
    </RouterLink>

    <div class="rv-header__brand">
      <span class="rv-header__tile mono">tt</span>
      <div>
        <div class="rv-header__title">Workspace de revisión</div>
        <div class="rv-header__subtitle mono">Eventos · {{ eventName }}</div>
      </div>
    </div>

    <div class="rv-header__spacer" />

    <div class="rv-header__progress">
      <div class="rv-header__progress-label">
        <span class="rv-header__progress-value">{{ reviewedCount }}</span>
        / {{ totalCount }} fotos revisadas
      </div>
      <div class="rv-progress">
        <span :style="{ width: `${progressPercent}%` }" />
      </div>
    </div>

    <label
      class="rv-header__toggle"
      :data-on="onlyPending"
      role="switch"
      :aria-checked="onlyPending"
      tabindex="0"
      @click="emit('update:onlyPending', !onlyPending)"
      @keydown.space.prevent="emit('update:onlyPending', !onlyPending)"
      @keydown.enter.prevent="emit('update:onlyPending', !onlyPending)"
    >
      <span class="rv-header__toggle-track">
        <span class="rv-header__toggle-thumb" />
      </span>
      Solo no revisadas
      <span class="rv-kbd" style="margin-left: 4px">F</span>
    </label>

    <button type="button" class="rv-btn" @click="emit('show-cheatsheet')">
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="1.7"
        stroke-linecap="round"
        stroke-linejoin="round"
        style="flex: 0 0 auto"
      >
        <rect x="3" y="6" width="18" height="12" rx="2" />
        <path d="M7 10h.01" />
        <path d="M11 10h.01" />
        <path d="M15 10h.01" />
        <path d="M7 14h10" />
      </svg>
      Atajos
      <span class="rv-kbd">?</span>
    </button>
  </header>
</template>

<style scoped src="./workspace-header.css" />
