<script setup lang="ts">
import { NButton, NIcon, NProgress } from 'naive-ui'
import { PlayOutline } from '@vicons/ionicons5'

import { formatDate } from '@/shared/utils/date.utils'
import type { IActiveEvent } from '../../../types/responses/operator-dashboard.response'

const props = defineProps<{
  event: IActiveEvent
}>()

const emit = defineEmits<{
  select: [eventId: string]
}>()
</script>

<template>
  <div class="active-event-card">
    <div
      class="active-event-card__cover"
      :style="event.coverUrl ? { backgroundImage: `url(${event.coverUrl})` } : undefined"
    >
      <div class="active-event-card__overlay">
        <h3 class="active-event-card__name">{{ event.name }}</h3>
        <p class="active-event-card__meta">
          📍 {{ event.location }} · {{ formatDate(event.date) }}
        </p>
      </div>
    </div>

    <div class="active-event-card__body">
      <div class="active-event-card__progress-info">
        <span class="active-event-card__progress-text">
          {{ event.classification.classified }} / {{ event.classification.total }} fotos
        </span>
        <span class="active-event-card__progress-pct">
          {{ event.classification.percentage }}%
        </span>
      </div>
      <NProgress
        type="line"
        :percentage="event.classification.percentage"
        :show-indicator="false"
        :height="6"
        :border-radius="3"
      />

      <NButton
        type="primary"
        class="active-event-card__action"
        @click="emit('select', props.event.eventId)"
      >
        <template #icon>
          <NIcon :component="PlayOutline" />
        </template>
        Abrir Workspace
      </NButton>
    </div>
  </div>
</template>

<style scoped src="./active-event-card.css" />
