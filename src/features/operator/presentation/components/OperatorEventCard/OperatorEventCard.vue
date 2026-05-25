<script setup lang="ts">
import { computed } from 'vue'
import { NButton, NFlex, NIcon, NProgress } from 'naive-ui'
import {
  CalendarOutline,
  CheckmarkCircleOutline,
  CheckmarkDoneOutline,
  ColorWandOutline,
  ImageOutline,
  LocationOutline,
} from '@vicons/ionicons5'

import { formatDate } from '@/shared/utils/date.utils'
import type { IOperatorActiveEvent } from '../../../types/responses/operator-active-event.response'

const props = defineProps<{
  item: IOperatorActiveEvent
}>()

const emit = defineEmits<{
  reviewClick: [item: IOperatorActiveEvent]
  retouchClick: [item: IOperatorActiveEvent]
}>()

const reviewPct = computed(() => {
  const total = props.item.stats.review.totalProcessedPhotos
  if (total === 0) return 0
  const reviewed = total - props.item.stats.review.pendingPhotos
  return Math.round((reviewed / total) * 100)
})

const allClear = computed(
  () => props.item.stats.review.pendingPhotos === 0 && props.item.stats.retouch.pendingPhotos === 0,
)

const coverStyle = computed(() =>
  props.item.event.coverUrl ? { backgroundImage: `url(${props.item.event.coverUrl})` } : undefined,
)
</script>

<template>
  <article class="event-card">
    <div class="event-card__cover" :style="coverStyle">
      <span v-if="!item.event.coverUrl" class="event-card__cover-placeholder">
        <NIcon :component="ImageOutline" :size="24" />
      </span>
      <div class="event-card__overlay">
        <NIcon :component="CalendarOutline" :size="14" />
        <span>{{ formatDate(item.event.startDate) }}</span>
      </div>
    </div>

    <div class="event-card__body">
      <div class="event-card__header">
        <h3 class="event-card__title">{{ item.event.name }}</h3>
        <NFlex :size="6" align="center" class="event-card__meta">
          <NIcon :component="LocationOutline" :size="14" />
          <span>{{ item.event.location }}</span>
        </NFlex>
      </div>

      <div class="event-card__progress">
        <div class="event-card__progress-row">
          <span>Revisado</span>
          <span class="event-card__progress-value">
            {{ reviewPct }}% ·
            {{ item.stats.review.totalProcessedPhotos - item.stats.review.pendingPhotos }}/{{
              item.stats.review.totalProcessedPhotos
            }}
          </span>
        </div>
        <NProgress
          :percentage="reviewPct"
          :show-indicator="false"
          :height="6"
          color="var(--tt-primary)"
          rail-color="rgba(16,80,128,0.1)"
        />
      </div>

      <div class="event-card__stats">
        <div class="event-card__stat">
          <NIcon
            :component="CheckmarkDoneOutline"
            :size="14"
            class="event-card__stat-icon event-card__stat-icon--review"
          />
          <div>
            <div class="event-card__stat-label">Por revisar</div>
            <div class="event-card__stat-value">{{ item.stats.review.pendingPhotos }}</div>
          </div>
        </div>
        <div class="event-card__stat">
          <NIcon
            :component="ColorWandOutline"
            :size="14"
            class="event-card__stat-icon event-card__stat-icon--retouch"
          />
          <div>
            <div class="event-card__stat-label">Por retocar</div>
            <div class="event-card__stat-value">{{ item.stats.retouch.pendingPhotos }}</div>
          </div>
        </div>
      </div>

      <div class="event-card__footer">
        <div class="event-card__actions">
          <NButton class="event-card__action" @click="emit('reviewClick', item)">
            <template #icon><NIcon :component="CheckmarkDoneOutline" /></template>
            Revisión
          </NButton>
          <NButton class="event-card__action" @click="emit('retouchClick', item)">
            <template #icon><NIcon :component="ColorWandOutline" /></template>
            Retoque
          </NButton>
        </div>
        <div v-if="allClear" class="event-card__clear">
          <NIcon :component="CheckmarkCircleOutline" :size="14" />
          <span>Al día</span>
        </div>
      </div>
    </div>
  </article>
</template>

<style scoped src="./operator-event-card.css" />
