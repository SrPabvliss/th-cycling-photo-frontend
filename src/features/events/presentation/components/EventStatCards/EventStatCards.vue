<script setup lang="ts">
import { computed } from 'vue'
import { NCard, NFlex, NGrid, NGridItem, NIcon } from 'naive-ui'
import { Camera, ServerOutline, ImagesOutline, AlertCircleOutline } from '@vicons/ionicons5'

import { formatFileSize } from '@/shared/utils/format.utils'
import type { IEventDetail } from '../../../types/responses/event-detail.response'
import type { IStatCard } from '../../../types/stat-card.types'

const props = defineProps<{
  event: IEventDetail
}>()

const stats = computed<IStatCard[]>(() => [
  {
    icon: Camera,
    color: 'blue',
    label: 'Fotos',
    value: props.event.photoCount,
    description: 'Fotos en el evento',
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
    value: '—',
    description: 'Disponible próximamente',
  },
  {
    icon: AlertCircleOutline,
    color: 'gray',
    label: 'Sin clasificar',
    value: '—',
    description: 'Disponible próximamente',
  },
])
</script>

<template>
  <NGrid :cols="4" :x-gap="16" :y-gap="16">
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
