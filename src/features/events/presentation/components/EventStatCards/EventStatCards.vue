<script setup lang="ts">
import { computed } from 'vue'
import { NCard, NFlex, NGrid, NGridItem, NIcon } from 'naive-ui'
import {
  Camera,
  ServerOutline,
  ImagesOutline,
  AlertCircleOutline,
  StatsChartOutline,
} from '@vicons/ionicons5'

import { formatFileSize } from '@/shared/utils/format.utils'
import type { IEventDetail } from '../../../types/responses/event-detail.response'
import type { IStatCard } from '../../../types/stat-card.types'

const props = defineProps<{
  event: IEventDetail
}>()

const unclassifiedCount = computed(() => props.event.photoCount - props.event.classifiedCount)

// photosUploaded is cumulative and never decreases; photoCount drops when photos are deleted
const quotaValue = computed(() =>
  props.event.photoQuota === null
    ? 'Sin límite'
    : `${props.event.photosUploaded.toLocaleString('es-EC')} / ${props.event.photoQuota.toLocaleString('es-EC')}`,
)

const quotaDescription = computed(() => {
  if (props.event.photoQuota === null) return 'Fotos usadas'
  if (props.event.photosUploaded === props.event.photoCount) return 'Fotos usadas'
  return `${props.event.photoCount.toLocaleString('es-EC')} en la galería`
})

const stats = computed<IStatCard[]>(() => [
  {
    icon: Camera,
    color: 'blue',
    label: 'Fotos',
    value: props.event.photoCount,
    description: 'Fotos en el evento',
  },
  {
    icon: StatsChartOutline,
    color: 'blue',
    label: 'Cupo de fotos',
    value: quotaValue.value,
    description: quotaDescription.value,
  },
  {
    icon: ServerOutline,
    color: 'green',
    label: 'Almacenamiento',
    value: formatFileSize(props.event.totalFileSize),
    description: 'Espacio utilizado',
  },
  {
    icon: ImagesOutline,
    color: 'amber',
    label: 'Clasificadas',
    value: props.event.classifiedCount,
    description: `${props.event.photoCount > 0 ? Math.round((props.event.classifiedCount / props.event.photoCount) * 100) : 0}% del total`,
  },
  {
    icon: AlertCircleOutline,
    color: 'gray',
    label: 'Sin clasificar',
    value: unclassifiedCount.value,
    description: 'Pendientes de revisión',
  },
])
</script>

<template>
  <NGrid cols="2 600:3 900:5" :x-gap="16" :y-gap="16" responsive="screen">
    <NGridItem v-for="stat in stats" :key="stat.label">
      <NCard>
        <NFlex justify="space-between" align="start" style="margin-bottom: 16px">
          <div :class="['stat-card__icon', `stat-card__icon--${stat.color}`]">
            <NIcon :component="stat.icon" :size="16" />
          </div>
          <span class="stat-card__tag">{{ stat.label }}</span>
        </NFlex>
        <div :class="['stat-card__value', { 'stat-card__value--muted': stat.value === '—' }]">
          {{ stat.value }}
        </div>
        <p class="stat-card__desc">{{ stat.description }}</p>
      </NCard>
    </NGridItem>
  </NGrid>
</template>

<style scoped src="./event-stat-cards.css"></style>
