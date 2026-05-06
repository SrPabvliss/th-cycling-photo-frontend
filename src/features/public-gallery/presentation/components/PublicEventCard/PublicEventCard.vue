<script setup lang="ts">
import { computed } from 'vue'

import { formatDate } from '@/shared/utils/date.utils'
import { getAssetPresetUrl } from '@/shared/utils/cdn.utils'
import type { IPublicEventListItem } from '../../../types/responses/public-event-list.response'

const props = defineProps<{
  event: IPublicEventListItem
  expiring?: { label: string; daysLeft: number; urgencyPct: number }
}>()

const emit = defineEmits<{
  click: [slug: string]
}>()

const coverUrl = computed(() =>
  props.event.coverSlug ? getAssetPresetUrl(props.event.coverSlug, 'cover-sm') : null,
)

const location = computed(() => {
  const parts = [props.event.cantonName, props.event.provinceName].filter(Boolean)
  return parts.join(', ') || null
})
</script>

<template>
  <article
    class="ev-card"
    :class="{ expiring: !!expiring }"
    :style="expiring ? `--w: ${expiring.urgencyPct}%` : ''"
    @click="emit('click', event.slug)"
  >
    <div class="cover">
      <!-- Expiring top banner -->
      <div v-if="expiring" class="top-banner">
        <span><span class="dot" />{{ expiring.label }}</span>
        <span>{{ expiring.daysLeft }} días</span>
      </div>

      <img v-if="coverUrl" :src="coverUrl" :alt="event.name" loading="lazy" />
      <div v-else class="cover-placeholder" />

      <!-- Photo count badge -->
      <div class="photos">
        <svg
          width="11"
          height="11"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2.5"
        >
          <rect x="3" y="6" width="18" height="14" rx="1" />
          <circle cx="12" cy="13" r="4" />
          <path d="M9 6l2-3h2l2 3" />
        </svg>
        {{ event.photoCount.toLocaleString() }} fotos
      </div>

      <!-- Body overlay -->
      <div class="body">
        <h3>{{ event.name }}</h3>
        <div class="meta">
          <span v-if="location">📍 {{ location }}</span>
          <span>{{ formatDate(event.date) }}</span>
        </div>
      </div>

      <!-- Arrow -->
      <div class="arrow">
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2.5"
        >
          <path d="M5 12h14M13 6l6 6-6 6" />
        </svg>
      </div>

      <!-- Urgency bar (expiring only) -->
      <div v-if="expiring" class="urgency-bar" />
    </div>
  </article>
</template>

<style scoped src="./public-event-card.css" />
