<script setup lang="ts">
import { ref, watch } from 'vue'
import { useDebounceFn } from '@vueuse/core'
import { NIcon, NSelect } from 'naive-ui'
import { BusinessOutline, SearchOutline } from '@vicons/ionicons5'

import { SORT_LABELS, useInjectedEventFilterState } from '../../../composables/use-event-filters'
import { EVENT_SORTS } from '../../../types/requests/event-filters.request'
import type { EventRole } from '../../../types/event-role'

const props = defineProps<{
  role: EventRole
  organizerOptions?: Array<{ label: string; value: string }>
}>()

const filterState = useInjectedEventFilterState()

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

const sortOptions = EVENT_SORTS.map((sort) => ({ label: SORT_LABELS[sort], value: sort }))
</script>

<template>
  <div class="efb-bar">
    <div class="efb-search">
      <NIcon :component="SearchOutline" :size="15" />
      <input v-model="searchInput" placeholder="Buscar por nombre del evento o lugar…" />
    </div>
    <div v-if="props.role === 'titan'" class="efb-org-wrap">
      <NIcon class="efb-org-ic" :component="BusinessOutline" :size="14" />
      <NSelect
        class="efb-org"
        clearable
        placeholder="Todos los organizadores"
        :value="filterState.organizerId.value"
        :options="props.organizerOptions ?? []"
        @update:value="(value: string | null) => (filterState.organizerId.value = value)"
      />
    </div>
    <div class="efb-spacer" />
    <span class="efb-sortlabel">Ordenar por</span>
    <NSelect
      class="efb-sort"
      :value="filterState.sort.value"
      :options="sortOptions"
      @update:value="(value: typeof filterState.sort.value) => (filterState.sort.value = value)"
    />
  </div>
</template>

<style scoped src="./event-filter-bar.css" />
