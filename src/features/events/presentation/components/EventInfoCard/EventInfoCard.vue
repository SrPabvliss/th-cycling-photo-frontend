<script setup lang="ts">
import { computed } from 'vue'
import { NFlex, NIcon } from 'naive-ui'

import CollapsibleCard from '@/shared/components/CollapsibleCard.vue'
import { CalendarOutline, LocationOutline } from '@vicons/ionicons5'

import { formatDate } from '@/shared/utils/date.utils'
import { formatLocation } from '@/shared/utils/location.utils'
import type { IEventDetail } from '../../../types/responses/event-detail.response'

const props = defineProps<{
  event: IEventDetail
}>()

const displayLocation = computed(() => formatLocation(props.event) ?? 'Sin ubicación')
</script>

<template>
  <CollapsibleCard title="Información del Evento" subtitle="Fecha, ubicación y detalles">
    <NFlex vertical :size="20">
      <NFlex align="start" :size="12">
        <div class="info-item__icon">
          <NIcon :component="CalendarOutline" :size="18" />
        </div>
        <div>
          <p class="info-item__label">Fecha</p>
          <p v-if="event.startDate.getTime() === event.endDate.getTime()" class="info-item__value">
            {{ formatDate(event.startDate) }}
          </p>
          <p v-else class="info-item__value">
            {{ formatDate(event.startDate) }} – {{ formatDate(event.endDate) }}
          </p>
        </div>
      </NFlex>
      <NFlex align="start" :size="12">
        <div class="info-item__icon">
          <NIcon :component="LocationOutline" :size="18" />
        </div>
        <div>
          <p class="info-item__label">Ubicación</p>
          <p class="info-item__value">{{ displayLocation }}</p>
        </div>
      </NFlex>
    </NFlex>
  </CollapsibleCard>
</template>

<style scoped src="./event-info-card.css"></style>
