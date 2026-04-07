<script setup lang="ts">
import { NTag } from 'naive-ui'

import { formatDate, formatDateTime } from '@/shared/utils/date.utils'
import type { ICompletedEvent } from '../../../types/responses/operator-dashboard.response'

defineProps<{
  event: ICompletedEvent
}>()
</script>

<template>
  <div
    class="completed-event-card"
    :style="event.coverUrl ? { backgroundImage: `url(${event.coverUrl})` } : undefined"
  >
    <div class="completed-event-card__overlay">
      <NTag type="success" size="small" round class="completed-event-card__badge">
        ✓ Completado
      </NTag>

      <h3 class="completed-event-card__name">{{ event.name }}</h3>
      <p class="completed-event-card__meta">
        📍 {{ event.location }} · {{ formatDate(event.date) }}
      </p>

      <div class="completed-event-card__footer">
        <span>{{ event.totalClassified }} fotos clasificadas</span>
        <span>{{ formatDateTime(event.completedAt) }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped src="./completed-event-card.css" />
