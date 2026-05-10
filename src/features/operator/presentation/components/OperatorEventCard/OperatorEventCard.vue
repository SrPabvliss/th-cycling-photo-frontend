<script setup lang="ts">
import { computed } from 'vue'
import { NButton, NCard, NIcon, NProgress, NTooltip } from 'naive-ui'
import {
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

defineEmits<{
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
  <NCard class="event-card" :bordered="true" content-style="padding: 0;">
    <div class="event-card__cover" :style="coverStyle">
      <span class="event-card__date">{{ formatDate(item.event.date) }}</span>
    </div>

    <div class="event-card__body">
      <div>
        <div class="event-card__name">{{ item.event.name }}</div>
        <div class="event-card__location">
          <NIcon :component="LocationOutline" :size="11" />
          <span>{{ item.event.location }}</span>
        </div>
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
          :height="4"
          color="var(--tt-primary)"
          rail-color="rgba(16,80,128,0.12)"
        />
      </div>

      <div class="event-card__stats">
        <div class="event-card__stat">
          <NIcon :component="ImageOutline" :size="14" class="event-card__stat-icon" />
          <div>
            <div class="event-card__stat-label">Total</div>
            <div class="event-card__stat-value">{{ item.event.totalPhotos }}</div>
          </div>
        </div>
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

      <div v-if="allClear" class="event-card__clear">
        <NIcon :component="CheckmarkCircleOutline" :size="14" />
        Al día
      </div>
      <div v-else class="event-card__actions">
        <NTooltip :disabled="item.stats.review.pendingPhotos > 0">
          <template #trigger>
            <NButton
              size="small"
              :disabled="item.stats.review.pendingPhotos === 0"
              class="event-card__action"
              @click="$emit('reviewClick', item)"
            >
              <template #icon><NIcon :component="CheckmarkDoneOutline" /></template>
              Revisión
            </NButton>
          </template>
          Sin fotos por revisar
        </NTooltip>
        <NTooltip :disabled="item.stats.retouch.pendingPhotos > 0">
          <template #trigger>
            <NButton
              size="small"
              :disabled="item.stats.retouch.pendingPhotos === 0"
              class="event-card__action"
              @click="$emit('retouchClick', item)"
            >
              <template #icon><NIcon :component="ColorWandOutline" /></template>
              Retoque
            </NButton>
          </template>
          Sin fotos por retocar
        </NTooltip>
      </div>
    </div>
  </NCard>
</template>

<style scoped src="./operator-event-card.css" />
