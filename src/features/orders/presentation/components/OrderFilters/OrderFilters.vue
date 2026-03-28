<script setup lang="ts">
import { ref, watch } from 'vue'
import { NInput, NSelect, NIcon } from 'naive-ui'
import { SearchOutline } from '@vicons/ionicons5'
import { useDebounceFn } from '@vueuse/core'

import { useEventsDropdownQuery } from '../../../composables/queries/use-events-dropdown'

defineProps<{
  search: string
  eventId: string | null
}>()

const emit = defineEmits<{
  'update:search': [value: string]
  'update:eventId': [value: string | null]
}>()

const eventSearch = ref('')
const debouncedEventSearch = ref('')

watch(
  eventSearch,
  useDebounceFn((val: string) => {
    debouncedEventSearch.value = val
  }, 300),
)

const { options: eventOptions, isLoading: loadingEvents } =
  useEventsDropdownQuery(debouncedEventSearch)

const localSearch = ref('')

watch(
  () => localSearch.value,
  useDebounceFn((val: string) => emit('update:search', val), 300),
)
</script>

<template>
  <div class="order-filters">
    <NInput
      v-model:value="localSearch"
      placeholder="Buscar por nombre o WhatsApp..."
      clearable
      size="small"
      class="order-filters__search"
    >
      <template #prefix>
        <NIcon :component="SearchOutline" />
      </template>
    </NInput>

    <NSelect
      :value="eventId"
      placeholder="Filtrar por evento"
      clearable
      filterable
      remote
      size="small"
      :options="eventOptions"
      :loading="loadingEvents"
      class="order-filters__event"
      @search="(q: string) => (eventSearch = q)"
      @update:value="emit('update:eventId', $event)"
    />
  </div>
</template>

<style scoped src="./order-filters.css" />
