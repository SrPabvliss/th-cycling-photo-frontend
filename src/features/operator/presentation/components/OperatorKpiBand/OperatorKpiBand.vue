<script setup lang="ts">
import { NCard, NIcon } from 'naive-ui'
import { CalendarOutline, CheckmarkDoneOutline, ColorWandOutline } from '@vicons/ionicons5'

import type { IDashboardSummary } from '../../../types/responses/operator-dashboard-summary.response'

defineProps<{
  summary: IDashboardSummary
}>()
</script>

<template>
  <div class="operator-kpi-band">
    <NCard size="small" class="operator-kpi" content-style="padding: 14px 16px;">
      <div class="operator-kpi__head">
        <span class="operator-kpi__icon operator-kpi__icon--review">
          <NIcon :component="CheckmarkDoneOutline" :size="16" />
        </span>
        <span class="operator-kpi__label">Pendientes review</span>
      </div>
      <div class="operator-kpi__value">
        {{ summary.pendingReviewCount }}
        <span class="operator-kpi__sub">
          {{ summary.pendingReviewCount === 0 ? 'todo al día' : 'fotos' }}
        </span>
      </div>
    </NCard>

    <NCard size="small" class="operator-kpi" content-style="padding: 14px 16px;">
      <div class="operator-kpi__head">
        <span class="operator-kpi__icon operator-kpi__icon--retouch">
          <NIcon :component="ColorWandOutline" :size="16" />
        </span>
        <span class="operator-kpi__label">Pendientes retoque</span>
      </div>
      <div class="operator-kpi__value">
        {{ summary.pendingRetouchCount }}
        <span class="operator-kpi__sub">
          {{ summary.pendingRetouchCount === 0 ? '—' : 'fotos' }}
        </span>
      </div>
    </NCard>

    <NCard size="small" class="operator-kpi" content-style="padding: 14px 16px;">
      <div class="operator-kpi__head">
        <span class="operator-kpi__icon operator-kpi__icon--neutral">
          <NIcon :component="CalendarOutline" :size="16" />
        </span>
        <span class="operator-kpi__label">Eventos asignados</span>
      </div>
      <div class="operator-kpi__value">
        {{ summary.assignedEventsCount }}
        <span class="operator-kpi__sub">activos</span>
      </div>
    </NCard>
  </div>
</template>

<style scoped src="./operator-kpi-band.css" />
