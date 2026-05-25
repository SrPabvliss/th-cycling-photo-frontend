<script setup lang="ts">
import { NFlex, NSelect } from 'naive-ui'

import type { TReviewQueueStatusFilter } from '../../../types/review-queue-status-filter'

interface IStatusTab {
  label: string
  value: TReviewQueueStatusFilter
}

const STATUS_TABS: IStatusTab[] = [
  { label: 'Todas', value: 'all' },
  { label: 'Pendientes', value: 'pending' },
  { label: 'Revisadas', value: 'reviewed' },
]

defineProps<{
  status: TReviewQueueStatusFilter
  selectedEventSlug: string | null
  eventOptions: Array<{ label: string; value: string }>
}>()

defineEmits<{
  'update:status': [value: TReviewQueueStatusFilter]
  'update:selectedEventSlug': [value: string]
}>()
</script>

<template>
  <section class="filter-bar">
    <NFlex :size="8" align="center" class="filter-bar__main">
      <NFlex :size="8" class="filter-bar__tabs">
        <button
          v-for="tab in STATUS_TABS"
          :key="tab.value"
          :class="['filter-tab', { 'filter-tab--active': tab.value === status }]"
          @click="$emit('update:status', tab.value)"
        >
          {{ tab.label }}
        </button>
      </NFlex>

      <div class="filter-bar__divider" />

      <NSelect
        :value="selectedEventSlug"
        :options="eventOptions"
        :filterable="true"
        placeholder="Filtrar por evento"
        size="small"
        class="filter-bar__select"
        @update:value="$emit('update:selectedEventSlug', $event)"
      />
    </NFlex>
  </section>
</template>

<style scoped src="./operator-review-queue-filter-bar.css" />
