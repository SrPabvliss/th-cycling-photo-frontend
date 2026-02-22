<script setup lang="ts">
import { NFlex, NPagination } from 'naive-ui'

import { PHOTO_FILTER_TABS } from '../../../constants/status-config'
import type { PhotoStatus } from '../../../types/responses/photo-list.response'

defineProps<{
  page: number
  pageCount: number
  activeStatus: PhotoStatus | null
}>()

const emit = defineEmits<{
  'update:page': [page: number]
  'update:status': [status: PhotoStatus | null]
}>()
</script>

<template>
  <section class="filter-bar">
    <NFlex :size="8" class="filter-bar__tabs">
      <button
        v-for="tab in PHOTO_FILTER_TABS"
        :key="tab.label"
        :class="['filter-tab', { 'filter-tab--active': tab.status === activeStatus }]"
        @click="emit('update:status', tab.status)"
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

<style scoped src="./photo-filter-bar.css"></style>
