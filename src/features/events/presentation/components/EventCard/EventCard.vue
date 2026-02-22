<script setup lang="ts">
import { computed } from 'vue'
import { NButton, NFlex, NIcon, NProgress, NTag } from 'naive-ui'
import {
  LocationOutline,
  CalendarOutline,
  CameraOutline,
  ImageOutline,
  CloudUploadOutline,
} from '@vicons/ionicons5'

import { formatDate } from '@/shared/utils/date.utils'
import { calculateProgress } from '@/shared/utils/progress.utils'
import { EVENT_STATUS_CONFIG } from '../../../constants/status-config'
import type { IEventListItem } from '../../../types/responses/event-list.response'

const props = defineProps<{
  event: IEventListItem
}>()

const emit = defineEmits<{
  view: [id: IEventListItem['id']]
}>()

const progress = computed(() =>
  calculateProgress(props.event.processedPhotos, props.event.totalPhotos),
)
</script>

<template>
  <article class="event-card" @click="emit('view', event.id)">
    <!-- Cover -->
    <div class="event-card__cover">
      <NFlex
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
          <span v-if="event.status === 'processing'" class="badge-dot" />
          {{ EVENT_STATUS_CONFIG[event.status].label }}
        </NTag>
      </div>

      <!-- Photo count overlay -->
      <div v-if="event.totalPhotos > 0" class="event-card__overlay">
        <NIcon :component="CameraOutline" :size="14" />
        <span>{{ event.totalPhotos }} fotos</span>
      </div>
    </div>

    <!-- Body -->
    <div class="event-card__body">
      <div class="event-card__header">
        <h3 class="event-card__title">{{ event.name }}</h3>
      </div>

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

      <!-- Footer -->
      <div class="event-card__footer">
        <!-- Draft -->
        <template v-if="event.status === 'draft'">
          <NButton type="primary" block @click.stop>
            <template #icon><NIcon :component="CloudUploadOutline" :size="14" /></template>
            Subir Fotos
          </NButton>
        </template>

        <!-- Processing / Uploading -->
        <template v-else-if="event.status === 'processing' || event.status === 'uploading'">
          <NFlex justify="space-between" align="center" style="margin-bottom: 6px">
            <span class="event-card__progress-label">Progreso</span>
            <span class="event-card__progress-value">{{ progress }}%</span>
          </NFlex>
          <NProgress
            type="line"
            :percentage="progress"
            :height="6"
            :show-indicator="false"
            status="warning"
            style="margin-bottom: 16px"
          />
          <NButton block @click.stop="emit('view', event.id)"> Ver detalle </NButton>
        </template>

        <!-- Completed -->
        <template v-else-if="event.status === 'completed'">
          <NButton block @click.stop="emit('view', event.id)"> Ver detalle </NButton>
        </template>
      </div>
    </div>
  </article>
</template>

<style scoped src="./event-card.css"></style>
