<script setup lang="ts">
import { computed } from 'vue'
import { NButton, NFlex, NIcon } from 'naive-ui'
import {
  LocationOutline,
  CalendarOutline,
  CameraOutline,
  CloudUploadOutline,
  ImageOutline,
  Star,
} from '@vicons/ionicons5'

import { formatDate } from '@/shared/utils/date.utils'
import { formatFileSize } from '@/shared/utils/format.utils'
import { formatLocation } from '@/shared/utils/location.utils'
import { getAssetPresetUrl } from '@/shared/utils/cdn.utils'
import { EVENT_STATUS_CONFIG } from '../../../constants/status-config'
import type { IEventListItem } from '../../../types/responses/event-list.response'

const props = defineProps<{
  event: IEventListItem
}>()

const emit = defineEmits<{
  view: [id: IEventListItem['id']]
  upload: [id: IEventListItem['id']]
}>()

const displayLocation = computed(() => formatLocation(props.event))

/** Cover card variant (400px/q80) — keeps memory/bandwidth low in lists. */
const coverUrl = computed(() =>
  props.event.coverImageSlug ? getAssetPresetUrl(props.event.coverImageSlug, 'cover-sm') : null,
)
</script>

<template>
  <article
    class="event-card"
    :class="{ 'event-card--featured': event.isFeatured }"
    @click="emit('view', event.id)"
  >
    <!-- Cover -->
    <div class="event-card__cover">
      <img
        v-if="coverUrl"
        :src="coverUrl"
        :alt="event.name"
        class="event-card__cover-image"
        loading="lazy"
        decoding="async"
        @load="($event.target as HTMLImageElement).dataset.loaded = 'true'"
      />
      <NFlex
        v-else
        vertical
        align="center"
        justify="center"
        :size="8"
        class="event-card__cover-placeholder"
      >
        <div class="event-card__cover-icon">
          <NIcon :component="ImageOutline" :size="24" />
        </div>
        <span class="event-card__cover-text">Sin portada</span>
      </NFlex>

      <!-- Status badge -->
      <div class="event-card__badge" :class="`event-card__badge--${event.status}`">
        {{ EVENT_STATUS_CONFIG[event.status].label }}
      </div>

      <!-- Not-public warning: event is active but has no cover → hidden from buyers -->
      <div
        v-if="event.status === 'active' && !event.coverImageUrl"
        class="event-card__badge event-card__badge--draft"
      >
        Sin portada — no visible al público
      </div>

      <!-- Featured badge -->
      <div v-if="event.isFeatured" class="event-card__featured-badge">
        <NIcon :component="Star" :size="12" />
        Destacado
      </div>

      <!-- Photo count + size overlay -->
      <div v-if="event.photoCount > 0" class="event-card__overlay">
        <NIcon :component="CameraOutline" :size="14" />
        <span>{{ event.photoCount }} fotos &middot; {{ formatFileSize(event.totalFileSize) }}</span>
      </div>
    </div>

    <!-- Body -->
    <div class="event-card__body">
      <div class="event-card__header">
        <h3 class="event-card__title">{{ event.name }}</h3>
      </div>

      <div class="event-card__meta-row">
        <NFlex v-if="displayLocation" :size="6" align="center" class="event-card__meta">
          <NIcon :component="LocationOutline" :size="14" />
          <span>{{ displayLocation }}</span>
        </NFlex>

        <span v-if="displayLocation" class="event-card__meta-divider" />

        <NFlex :size="6" align="center" class="event-card__meta">
          <NIcon :component="CalendarOutline" :size="14" />
          <span>{{ formatDate(event.date) }}</span>
        </NFlex>
      </div>

      <!-- Footer -->
      <div class="event-card__footer">
        <NButton
          v-if="event.photoCount === 0"
          block
          type="primary"
          @click.stop="emit('upload', event.id)"
        >
          <template #icon><NIcon :component="CloudUploadOutline" /></template>
          Subir Fotos
        </NButton>
        <NButton v-else block @click.stop="emit('view', event.id)"> Ver Detalle </NButton>
      </div>
    </div>
  </article>
</template>

<style scoped src="./event-card.css"></style>
