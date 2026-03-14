<script setup lang="ts">
import { computed } from 'vue'
import { NButton, NFlex, NIcon, NTag } from 'naive-ui'
import {
  LocationOutline,
  CalendarOutline,
  CameraOutline,
  CloudUploadOutline,
  ImageOutline,
} from '@vicons/ionicons5'

import { formatDate } from '@/shared/utils/date.utils'
import { formatFileSize } from '@/shared/utils/format.utils'
import { formatLocation } from '@/shared/utils/location.utils'
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
</script>

<template>
  <article class="event-card" @click="emit('view', event.id)">
    <!-- Cover -->
    <div class="event-card__cover">
      <img
        v-if="event.coverImageUrl"
        :src="event.coverImageUrl"
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
      <div class="event-card__badge">
        <NTag :type="EVENT_STATUS_CONFIG[event.status].type" size="small" round>
          {{ EVENT_STATUS_CONFIG[event.status].label }}
        </NTag>
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
