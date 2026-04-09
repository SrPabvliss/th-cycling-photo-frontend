<script setup lang="ts">
import { computed } from 'vue'
import { NCard, NFlex, NGrid, NGridItem, NIcon } from 'naive-ui'
import { CalendarOutline, ImagesOutline, BrushOutline } from '@vicons/ionicons5'

import type { IDashboardSummary } from '../../../types/responses/operator-dashboard.response'

const props = defineProps<{
  summary: IDashboardSummary
}>()

const stats = computed(() => [
  {
    icon: CalendarOutline,
    color: 'blue',
    label: 'Eventos',
    value: props.summary.assignedEventsCount,
    description: 'Eventos asignados',
  },
  {
    icon: ImagesOutline,
    color: 'amber',
    label: 'Clasificación',
    value: props.summary.pendingPhotosCount,
    description: 'Fotos pendientes',
  },
  {
    icon: BrushOutline,
    color: 'purple',
    label: 'Retoque',
    value: props.summary.pendingRetouchCount,
    description: 'Fotos por retocar',
  },
])
</script>

<template>
  <NGrid :cols="3" :x-gap="16" :y-gap="16">
    <NGridItem v-for="stat in stats" :key="stat.label">
      <NCard>
        <NFlex justify="space-between" align="start" style="margin-bottom: 16px">
          <div :class="['stat-card__icon', `stat-card__icon--${stat.color}`]">
            <NIcon :component="stat.icon" :size="16" />
          </div>
          <span class="stat-card__tag">{{ stat.label }}</span>
        </NFlex>
        <div class="stat-card__value">{{ stat.value }}</div>
        <p class="stat-card__desc">{{ stat.description }}</p>
      </NCard>
    </NGridItem>
  </NGrid>
</template>

<style scoped src="./dashboard-stat-cards.css" />
