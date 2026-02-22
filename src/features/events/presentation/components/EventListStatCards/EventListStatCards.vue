<script setup lang="ts">
import { computed } from 'vue'
import { NCard, NFlex, NGrid, NGridItem, NIcon } from 'naive-ui'
import { FlagOutline, ImagesOutline, HourglassOutline, ServerOutline } from '@vicons/ionicons5'

import type { IStatCard } from '../../../types/stat-card.types'

const props = defineProps<{
  totalEvents: number | undefined
}>()

const stats = computed<IStatCard[]>(() => [
  {
    icon: FlagOutline,
    color: 'blue',
    label: 'Total Eventos',
    value: props.totalEvents ?? '—',
  },
  {
    icon: ImagesOutline,
    color: 'green',
    label: 'Total Fotos',
    value: '—',
  },
  {
    icon: HourglassOutline,
    color: 'amber',
    label: 'Pendientes',
    value: '—',
  },
  {
    icon: ServerOutline,
    color: 'gray',
    label: 'Almacenamiento',
    value: '—',
  },
])
</script>

<template>
  <NGrid :cols="4" :x-gap="16" :y-gap="16" style="margin-bottom: 16px">
    <NGridItem v-for="stat in stats" :key="stat.label">
      <NCard>
        <NFlex justify="space-between" align="start">
          <div>
            <p class="stat-card__label">{{ stat.label }}</p>
            <h3
              :class="[
                'stat-card__value',
                { 'stat-card__value--muted': typeof stat.value === 'string' },
              ]"
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
    </NGridItem>
  </NGrid>
</template>

<style scoped src="./event-list-stat-cards.css"></style>
