<script setup lang="ts">
import { NFlex, NPagination, NSelect } from 'naive-ui'

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
  page: number
  pageCount: number
}>()

defineEmits<{
  'update:status': [value: TReviewQueueStatusFilter]
  'update:selectedEventSlug': [value: string]
  'update:page': [page: number]
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

    <NPagination
      v-if="pageCount > 1"
      :page="page"
      :page-count="pageCount"
      size="small"
      :page-slot="7"
      @update:page="$emit('update:page', $event)"
    />
  </section>
</template>

<style scoped src="./operator-review-queue-filter-bar.css" />
