<script setup lang="ts">
import { ref, watch } from 'vue'
import { useDebounceFn } from '@vueuse/core'
import { NIcon, NSelect } from 'naive-ui'
import { SearchOutline } from '@vicons/ionicons5'

import {
  SORT_LABELS,
  useInjectedOrganizerFilterState,
} from '../../../composables/use-organizer-filters'
import { ORGANIZER_SORTS } from '../../../types/requests/organizer-filters.request'

const filterState = useInjectedOrganizerFilterState()

const searchInput = ref(filterState.search.value)
const debouncedApply = useDebounceFn((value: string) => {
  filterState.search.value = value
}, 400)

watch(searchInput, (value) => debouncedApply(value))
watch(
  () => filterState.search.value,
  (value) => {
    if (value !== searchInput.value) searchInput.value = value ?? ''
  },
)

const sortOptions = ORGANIZER_SORTS.map((sort) => ({ label: SORT_LABELS[sort], value: sort }))
</script>

<template>
  <div class="ofb-bar">
    <div class="ofb-search">
      <NIcon :component="SearchOutline" :size="15" />
      <input
        v-model="searchInput"
        placeholder="Buscar por nombre comercial o correo del titular…"
      />
    </div>
    <div class="ofb-spacer" />
    <span class="ofb-sortlabel">Ordenar por</span>
    <NSelect
      class="ofb-sort"
      :value="filterState.sort.value"
      :options="sortOptions"
      @update:value="(value: typeof filterState.sort.value) => (filterState.sort.value = value)"
    />
  </div>
</template>

<style scoped src="./organizer-filter-bar.css" />
