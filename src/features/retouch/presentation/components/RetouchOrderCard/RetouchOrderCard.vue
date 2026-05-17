<script setup lang="ts">
import { computed } from 'vue'
import { NCard, NIcon, NProgress, NTag } from 'naive-ui'
import { CameraOutline, FlashOutline } from '@vicons/ionicons5'

import { formatRelativeTime } from '@/shared/utils/date.utils'

interface IRetouchOrderCardThumb {
  thumbnailUrl: string
  alt?: string
}

interface IRetouchOrderCardProps {
  orderId: string
  buyerName: string
  eventName?: string
  showEventBadge?: boolean
  createdAt: Date
  pendingPhotosCount: number
  totalPhotosCount: number
  retouchedPhotosCount: number
  thumbs: IRetouchOrderCardThumb[]
  isFirst?: boolean
}

const MAX_THUMBS = 3

const props = defineProps<IRetouchOrderCardProps>()
defineEmits<{ click: [] }>()

const shortOrderId = computed(() => props.orderId.slice(0, 8))
const relativeTime = computed(() => formatRelativeTime(props.createdAt))

const visibleThumbs = computed(() => props.thumbs.slice(0, MAX_THUMBS))
const placeholderCount = computed(() => Math.max(0, MAX_THUMBS - visibleThumbs.value.length))
const overflowCount = computed(() =>
  props.totalPhotosCount > MAX_THUMBS ? props.totalPhotosCount - MAX_THUMBS : 0,
)

const progressPercent = computed(() => {
  if (props.totalPhotosCount === 0) return 0
  return Math.round((props.retouchedPhotosCount / props.totalPhotosCount) * 100)
})

const isCompleted = computed(() => props.pendingPhotosCount === 0 && props.totalPhotosCount > 0)
const progressStatus = computed<'success' | 'info' | 'default'>(() => {
  if (isCompleted.value) return 'success'
  if (progressPercent.value > 0) return 'info'
  return 'default'
})
</script>

<template>
  <NCard
    :bordered="true"
    hoverable
    size="small"
    content-class="retouch-card__content"
    class="retouch-card"
    :class="{
      'retouch-card--first': isFirst,
      'retouch-card--completed': isCompleted,
    }"
    @click="$emit('click')"
  >
    <div class="retouch-card__thumbs">
      <div v-for="(thumb, index) in visibleThumbs" :key="index" class="retouch-card__thumb">
        <img
          :src="thumb.thumbnailUrl"
          :alt="thumb.alt ?? ''"
          loading="lazy"
          decoding="async"
          class="retouch-card__thumb-img"
          @load="($event.target as HTMLImageElement).dataset.loaded = 'true'"
        />
        <div
          v-if="index === MAX_THUMBS - 1 && overflowCount > 0"
          class="retouch-card__thumb-overflow"
        >
          <span>+{{ overflowCount }}</span>
        </div>
      </div>
      <template v-for="n in placeholderCount" :key="`p-${n}`">
        <div class="retouch-card__thumb retouch-card__thumb--placeholder">
          <NIcon :component="CameraOutline" :size="22" />
        </div>
      </template>
    </div>

    <div class="retouch-card__body">
      <div class="retouch-card__row">
        <span class="retouch-card__buyer">{{ buyerName || 'Cliente sin nombre' }}</span>
        <span v-if="isFirst" class="retouch-card__fifo-pill">
          <NIcon :component="FlashOutline" :size="12" />
          Próxima
        </span>
      </div>

      <div class="retouch-card__event-row">
        <NTag
          v-if="showEventBadge && eventName"
          size="small"
          round
          :bordered="false"
          type="info"
          class="retouch-card__event"
        >
          {{ eventName }}
        </NTag>
        <span v-else class="retouch-card__event-placeholder" aria-hidden="true">&nbsp;</span>
      </div>

      <div class="retouch-card__meta">
        <span class="retouch-card__order-id">#{{ shortOrderId }}</span>
        <span class="retouch-card__sep">·</span>
        <span>{{ relativeTime }}</span>
      </div>

      <div class="retouch-card__progress">
        <NProgress
          :percentage="progressPercent"
          :status="progressStatus"
          :show-indicator="false"
          :height="6"
          :border-radius="999"
          :fill-border-radius="999"
        />
        <span class="retouch-card__progress-label">
          {{ retouchedPhotosCount }}/{{ totalPhotosCount }} retocadas
        </span>
      </div>
    </div>
  </NCard>
</template>

<style scoped src="./retouch-order-card.css" />
