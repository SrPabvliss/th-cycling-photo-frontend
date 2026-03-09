<script setup lang="ts">
import { computed } from 'vue'
import { NCard, NFlex, NGrid, NGridItem, NIcon, NTooltip } from 'naive-ui'
import { FlagOutline, ImagesOutline, HourglassOutline, ServerOutline } from '@vicons/ionicons5'

import { formatFileSize } from '@/shared/utils/format.utils'
import type { IApiEventsStats } from '../../../types/responses/events-stats.response'
import type { IStatCard } from '../../../types/stat-card.types'

const props = defineProps<{
  stats: IApiEventsStats | undefined
}>()

const cards = computed<IStatCard[]>(() => [
  {
    icon: FlagOutline,
    color: 'blue',
    label: 'Total Eventos',
    value: props.stats?.totalEvents ?? '—',
  },
  {
    icon: ImagesOutline,
    color: 'green',
    label: 'Total Fotos',
    value: props.stats?.totalPhotos ?? '—',
  },
  {
    icon: ServerOutline,
    color: 'gray',
    label: 'Almacenamiento',
    value: props.stats ? formatFileSize(props.stats.totalStorageBytes) : '—',
  },
  {
    icon: HourglassOutline,
    color: 'amber',
    label: 'Pendientes',
    value: '—',
    tooltip: 'Disponible cuando se active el sistema de clasificación',
  },
])
</script>

<template>
  <NGrid :cols="4" :x-gap="16" :y-gap="16" style="margin-bottom: 16px">
    <NGridItem v-for="stat in cards" :key="stat.label">
      <NTooltip :disabled="!stat.tooltip">
        <template #trigger>
          <NCard>
            <NFlex justify="space-between" align="start">
              <div>
                <p class="stat-card__label">{{ stat.label }}</p>
                <h3
                  :class="['stat-card__value', { 'stat-card__value--muted': stat.value === '—' }]"
                >
                  {{ stat.value }}
                </h3>
                <p v-if="stat.description" class="stat-card__hint">{{ stat.description }}</p>
              </div>
              <div :class="['stat-card__icon', `stat-card__icon--${stat.color}`]">
                <NIcon :component="stat.icon" :size="18" />
              </div>
            </NFlex>
          </NCard>
        </template>
        {{ stat.tooltip }}
      </NTooltip>
    </NGridItem>
  </NGrid>
</template>

<style scoped src="./event-list-stat-cards.css"></style>
