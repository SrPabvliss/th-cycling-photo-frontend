<script setup lang="ts">
import { ref, watch } from 'vue'
import { useDebounceFn } from '@vueuse/core'
import { NSelect, NIcon } from 'naive-ui'
import { SearchOutline } from '@vicons/ionicons5'

import { useEventsDropdownQuery } from '../../../composables/queries/use-events-dropdown'
import { useInjectedOrderFilterState } from '../../../composables/use-order-filters'
import {
  ORDER_INVOICE_FILTER_LABELS,
  ORDER_INVOICE_FILTERS,
  type OrderInvoiceFilter,
} from '../../../types/requests/order-filters.request'

const filterState = useInjectedOrderFilterState()

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

const invoiceOptions = ORDER_INVOICE_FILTERS.map((value) => ({
  label: ORDER_INVOICE_FILTER_LABELS[value],
  value,
}))

const eventSearch = ref('')
const debouncedEventSearch = ref('')
watch(
  eventSearch,
  useDebounceFn((value: string) => {
    debouncedEventSearch.value = value
  }, 300),
)

const { options: eventOptions, isLoading: loadingEvents } =
  useEventsDropdownQuery(debouncedEventSearch)
</script>

<template>
  <div class="of-bar">
    <div class="of-search">
      <NIcon :component="SearchOutline" :size="15" />
      <input
        v-model="searchInput"
        data-test="search"
        placeholder="Buscar por nombre del cliente o WhatsApp…"
      />
    </div>

    <NSelect
      class="of-event"
      :value="filterState.eventId.value"
      placeholder="Todos los eventos"
      clearable
      filterable
      remote
      :options="eventOptions"
      :loading="loadingEvents"
      @search="(query: string) => (eventSearch = query)"
      @update:value="(value: string | null) => (filterState.eventId.value = value)"
    />

    <NSelect
      class="of-invoice"
      data-test="invoice-filter"
      :value="filterState.invoiceState.value"
      placeholder="Factura"
      clearable
      :options="invoiceOptions"
      @update:value="(value: OrderInvoiceFilter | null) => (filterState.invoiceState.value = value)"
    />
  </div>
</template>

<style scoped src="./order-filters.css" />
