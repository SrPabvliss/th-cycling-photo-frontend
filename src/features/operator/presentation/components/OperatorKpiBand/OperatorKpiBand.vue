<script setup lang="ts">
import { computed } from 'vue'
import type { Component } from 'vue'
import { NCard, NFlex, NGrid, NGridItem, NIcon } from 'naive-ui'
import { CalendarOutline, CheckmarkDoneOutline, ColorWandOutline } from '@vicons/ionicons5'

import type { IDashboardSummary } from '../../../types/responses/operator-dashboard-summary.response'

type KpiAccent = 'review' | 'retouch' | 'neutral'

interface IKpiTile {
  icon: Component
  accent: KpiAccent
  label: string
  value: number
  hint: string
}

const props = defineProps<{
  summary: IDashboardSummary
}>()

const tiles = computed<IKpiTile[]>(() => [
  {
    icon: CheckmarkDoneOutline,
    accent: 'review',
    label: 'Pendientes review',
    value: props.summary.pendingReviewCount,
    hint: props.summary.pendingReviewCount === 0 ? 'todo al día' : 'fotos',
  },
  {
    icon: ColorWandOutline,
    accent: 'retouch',
    label: 'Pendientes retoque',
    value: props.summary.pendingRetouchCount,
    hint: props.summary.pendingRetouchCount === 0 ? '—' : 'fotos',
  },
  {
    icon: CalendarOutline,
    accent: 'neutral',
    label: 'Eventos asignados',
    value: props.summary.assignedEventsCount,
    hint: 'activos',
  },
])
</script>

<template>
  <NGrid :cols="3" :x-gap="16" :y-gap="16" responsive="screen" :item-responsive="true">
    <NGridItem v-for="tile in tiles" :key="tile.label" span="3 m:1">
      <NCard>
        <NFlex justify="space-between" align="start">
          <div>
            <p class="kpi__label">{{ tile.label }}</p>
            <h3 class="kpi__value">{{ tile.value }}</h3>
            <p class="kpi__hint">{{ tile.hint }}</p>
          </div>
          <div :class="['kpi__icon', `kpi__icon--${tile.accent}`]">
            <NIcon :component="tile.icon" :size="18" />
          </div>
        </NFlex>
      </NCard>
    </NGridItem>
  </NGrid>
</template>

<style scoped src="./operator-kpi-band.css" />
