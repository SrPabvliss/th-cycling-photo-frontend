<script setup lang="ts">
import { BUYER_PURCHASE_FILTERS, type BuyerPurchaseFilter } from '../../../types/requests/buyer-filters.request'
import type { IApiBuyersStats } from '../../../types/responses/buyers-stats.response'
import { PURCHASE_LABELS } from '../../../constants/buyer-filters.constants'
import { useInjectedBuyerFilterState } from '../../../composables/use-buyer-filters'
import { formatNumber } from '@/shared/utils/format.utils'

const props = defineProps<{
  tabs: IApiBuyersStats['tabs'] | undefined
}>()

const filterState = useInjectedBuyerFilterState()

const tabsList = BUYER_PURCHASE_FILTERS.map((id) => ({
  id,
  label: PURCHASE_LABELS[id],
}))

function countFor(id: BuyerPurchaseFilter): string {
  if (props.tabs == null) return '—'
  return formatNumber(props.tabs[id])
}

function select(id: BuyerPurchaseFilter) {
  filterState.purchase.value = id
}
</script>

<template>
  <div class="bt-tabs">
    <button
      v-for="tab in tabsList"
      :key="tab.id"
      type="button"
      class="bt-tab"
      :class="{ 'bt-tab--on': filterState.purchase.value === tab.id }"
      @click="select(tab.id)"
    >
      {{ tab.label }}
      <span class="bt-tab__n">{{ countFor(tab.id) }}</span>
    </button>
  </div>
</template>

<style scoped src="./buyer-tabs.css" />
