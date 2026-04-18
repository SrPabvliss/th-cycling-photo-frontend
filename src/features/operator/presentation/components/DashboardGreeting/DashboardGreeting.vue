<script setup lang="ts">
import { getTimeGreeting } from '@/shared/utils/date.utils'
import type { IDashboardSummary } from '../../../types/responses/operator-dashboard.response'

defineProps<{
  firstName: string | null
  summary: IDashboardSummary
}>()
</script>

<template>
  <div class="dashboard-greeting">
    <h1 class="dashboard-greeting__title">
      {{ getTimeGreeting() }}, {{ firstName ?? 'Operador' }}.
    </h1>
    <p class="dashboard-greeting__summary">
      Tienes
      <strong>{{ summary.assignedEventsCount }} eventos asignados</strong> y
      <strong>{{ summary.pendingRetouchCount }} fotos pendientes</strong> de retoque.
    </p>
  </div>
</template>

<style scoped src="./dashboard-greeting.css" />
