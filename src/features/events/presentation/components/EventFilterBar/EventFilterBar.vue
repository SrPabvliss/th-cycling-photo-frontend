<script setup lang="ts">
import { NFlex, NPagination } from 'naive-ui'

import { EVENT_FILTER_TABS } from '../../../constants/status-config'

defineProps<{
  page: number
  pageCount: number
}>()

defineEmits<{
  'update:page': [page: number]
}>()
</script>

<template>
  <section class="filter-bar">
    <NFlex :size="8" class="filter-bar__tabs">
      <button
        v-for="tab in EVENT_FILTER_TABS"
        :key="tab.label"
        :class="['filter-tab', { 'filter-tab--active': tab.status === null }]"
        :disabled="!tab.enabled"
      >
        {{ tab.label }}
      </button>
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

<style scoped src="./event-filter-bar.css"></style>
