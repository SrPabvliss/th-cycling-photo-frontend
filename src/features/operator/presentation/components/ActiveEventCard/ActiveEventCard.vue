<script setup lang="ts">
import { computed } from 'vue'
import { NButton, NIcon } from 'naive-ui'
import { PlayOutline } from '@vicons/ionicons5'

import { formatDate } from '@/shared/utils/date.utils'
import type { IActiveEvent } from '../../../types/responses/operator-dashboard.response'

const props = defineProps<{
  event: IActiveEvent
}>()

const emit = defineEmits<{
  select: [eventId: string]
}>()

const hasPendingWork = computed(() => props.event.retouch.pendingPhotos > 0)

const retouchLabel = computed(() => {
  if (!hasPendingWork.value) return 'Sin trabajo asignado'
  const { pendingPhotos, pendingOrders } = props.event.retouch
  const photoText = pendingPhotos === 1 ? '1 foto' : `${pendingPhotos} fotos`
  const orderText = pendingOrders === 1 ? '1 orden' : `${pendingOrders} órdenes`
  return `${photoText} en ${orderText} por retocar`
})
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
      <p class="active-event-card__retouch-info">{{ retouchLabel }}</p>

      <NButton
        type="primary"
        class="active-event-card__action"
        :disabled="!hasPendingWork"
        @click="emit('select', props.event.eventId)"
      >
        <template #icon>
          <NIcon :component="PlayOutline" />
        </template>
        Trabajar Evento
      </NButton>
    </div>
  </div>
</template>

<style scoped src="./active-event-card.css" />
