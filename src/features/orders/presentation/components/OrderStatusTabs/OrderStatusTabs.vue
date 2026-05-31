<script setup lang="ts">
import { NTag } from 'naive-ui'

import { ORDER_STATUS, type OrderStatus } from '../../../types/responses/order-list.response'
import type { IOrderStats } from '../../../types/responses/order-stats.response'
import { ORDER_FILTER_TABS } from '../../../constants/status-config'

const STATUS_TO_STATS_KEY: Record<OrderStatus, keyof IOrderStats> = {
  [ORDER_STATUS.PENDING]: 'pendingCount',
  [ORDER_STATUS.PAYMENT_INFO_SENT]: 'paymentInfoSentCount',
  [ORDER_STATUS.PAID]: 'paidCount',
  [ORDER_STATUS.DELIVERED]: 'deliveredCount',
  [ORDER_STATUS.CANCELLED]: 'cancelledCount',
}

defineProps<{
  activeStatus: OrderStatus | null
  stats: IOrderStats | undefined
}>()

const emit = defineEmits<{
  'update:activeStatus': [status: OrderStatus | null]
}>()

function getCount(status: OrderStatus | null, stats: IOrderStats | undefined): number | null {
  if (!stats) return null
  if (!status) return stats.totalOrders
  return stats[STATUS_TO_STATS_KEY[status]] as number
}
</script>

<template>
  <div class="status-tabs">
    <button
      v-for="tab in ORDER_FILTER_TABS"
      :key="tab.label"
      :class="['status-tab', { 'status-tab--active': activeStatus === tab.status }]"
      @click="emit('update:activeStatus', tab.status)"
    >
      {{ tab.label }}
      <NTag v-if="getCount(tab.status, stats) !== null" size="small" :bordered="false" round>
        {{ getCount(tab.status, stats) }}
      </NTag>
    </button>
  </div>
</template>

<style scoped src="./order-status-tabs.css" />
