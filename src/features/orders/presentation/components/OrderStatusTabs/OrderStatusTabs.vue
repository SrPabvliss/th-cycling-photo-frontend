<script setup lang="ts">
import { ORDER_STATUS, type OrderStatus } from '../../../types/responses/order-list.response'
import type { IOrderStats } from '../../../types/responses/order-stats.response'
import { ORDER_FILTER_TABS } from '../../../constants/status-config'

type TabVariant = 'all' | 'error' | 'warning' | 'info' | 'success' | 'gift' | 'neutral'

const STATUS_TO_STATS_KEY: Record<OrderStatus, keyof IOrderStats> = {
  [ORDER_STATUS.PENDING]: 'pendingCount',
  [ORDER_STATUS.PAYMENT_INFO_SENT]: 'paymentInfoSentCount',
  [ORDER_STATUS.PAID]: 'paidCount',
  [ORDER_STATUS.DELIVERED]: 'deliveredCount',
  [ORDER_STATUS.GIFTED]: 'giftedCount',
  [ORDER_STATUS.CANCELLED]: 'cancelledCount',
}

const STATUS_TO_VARIANT: Record<OrderStatus, TabVariant> = {
  [ORDER_STATUS.PENDING]: 'error',
  [ORDER_STATUS.PAYMENT_INFO_SENT]: 'warning',
  [ORDER_STATUS.PAID]: 'info',
  [ORDER_STATUS.DELIVERED]: 'success',
  [ORDER_STATUS.GIFTED]: 'gift',
  [ORDER_STATUS.CANCELLED]: 'neutral',
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
  if (!status) return stats.activeOrders
  return stats[STATUS_TO_STATS_KEY[status]] as number
}

function getVariant(status: OrderStatus | null): TabVariant {
  return status === null ? 'all' : STATUS_TO_VARIANT[status]
}
</script>

<template>
  <div class="status-tabs" role="tablist">
    <button
      v-for="tab in ORDER_FILTER_TABS"
      :key="tab.label"
      role="tab"
      :aria-selected="activeStatus === tab.status"
      :class="[
        'status-tab',
        `status-tab--${getVariant(tab.status)}`,
        { 'status-tab--active': activeStatus === tab.status },
      ]"
      @click="emit('update:activeStatus', tab.status)"
    >
      <span v-if="getVariant(tab.status) !== 'all'" class="status-tab__dot" aria-hidden="true" />
      <span class="status-tab__label">{{ tab.label }}</span>
      <span v-if="getCount(tab.status, stats) !== null" class="status-tab__count">
        {{ getCount(tab.status, stats) }}
      </span>
    </button>
  </div>
</template>

<style scoped src="./order-status-tabs.css" />
