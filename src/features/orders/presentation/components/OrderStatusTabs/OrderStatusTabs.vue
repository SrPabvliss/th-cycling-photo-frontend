<script setup lang="ts">
import { ORDER_TAB_LABELS } from '../../../composables/use-order-filters'
import type { OrderTab } from '../../../types/requests/order-filters.request'
import type { IOrderStatsTabs } from '../../../types/responses/order-stats.response'
import { formatNumber } from '@/shared/utils/format.utils'

const props = defineProps<{
  active: OrderTab
  counts: IOrderStatsTabs | undefined
}>()

const emit = defineEmits<{
  'update:active': [tab: OrderTab]
}>()

const TABS: OrderTab[] = [
  'all',
  'pending',
  'paymentInfoSent',
  'paid',
  'delivered',
  'gifted',
  'cancelled',
]

function countFor(tab: OrderTab): string {
  if (props.counts == null) return '—'
  return formatNumber(props.counts[tab])
}

function isWarn(tab: OrderTab): boolean {
  return tab === 'pending' && props.counts != null && props.counts.pending > 0
}

function select(tab: OrderTab) {
  emit('update:active', tab)
}
</script>

<template>
  <div class="ost-tabs" role="tablist">
    <button
      v-for="tab in TABS"
      :key="tab"
      type="button"
      role="tab"
      :aria-selected="active === tab"
      class="ost-tab"
      :class="{ 'ost-tab--on': active === tab, 'ost-tab--warn': isWarn(tab) }"
      @click="select(tab)"
    >
      {{ ORDER_TAB_LABELS[tab] }}<span class="ost-tab__n">{{ countFor(tab) }}</span>
    </button>
  </div>
</template>

<style scoped src="./order-status-tabs.css" />
