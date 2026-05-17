<script setup lang="ts">
import { NFlex, NPagination, NSelect } from 'naive-ui'

import type { TRetouchOrderScope } from '../../../types/responses/operator-retouch-orders.response'

interface IScopeTab {
  label: string
  value: TRetouchOrderScope
}

const SCOPE_TABS: IScopeTab[] = [
  { label: 'Pendientes', value: 'pending' },
  { label: 'Completadas', value: 'completed' },
]

defineProps<{
  scope: TRetouchOrderScope
  selectedEventSlug?: string | null
  eventOptions?: Array<{ label: string; value: string }>
  page: number
  pageCount: number
}>()

defineEmits<{
  'update:scope': [value: TRetouchOrderScope]
  'update:selectedEventSlug': [value: string | null]
  'update:page': [page: number]
}>()
</script>

<template>
  <section class="filter-bar">
    <NFlex :size="8" align="center" class="filter-bar__main">
      <NFlex :size="8" class="filter-bar__tabs">
        <button
          v-for="tab in SCOPE_TABS"
          :key="tab.value"
          :class="['filter-tab', { 'filter-tab--active': tab.value === scope }]"
          @click="$emit('update:scope', tab.value)"
        >
          {{ tab.label }}
        </button>
      </NFlex>

      <template v-if="eventOptions && eventOptions.length > 0">
        <div class="filter-bar__divider" />

        <NSelect
          :value="selectedEventSlug ?? null"
          :options="eventOptions"
          :filterable="true"
          clearable
          placeholder="Todos los eventos"
          size="small"
          class="filter-bar__select"
          @update:value="$emit('update:selectedEventSlug', $event)"
        />
      </template>
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

<style scoped src="./retouch-queue-filter-bar.css" />
