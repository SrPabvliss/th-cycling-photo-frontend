<script setup lang="ts">
import { computed } from 'vue'

import { formatWhatsAppNumber } from '@/shared/utils/phone.utils'
import { formatCurrency } from '@/shared/utils/currency.utils'
import { ORDER_STATUS } from '../../../types/responses/order-list.response'
import type { IOrderCustomerGroup } from '../../../types/order-customer-group.type'
import { centsToDecimal, sumSubtotalCents } from '../../../utils/order-money'
import { pluralize } from '@/shared/utils/format.utils'

const props = defineProps<{
  group: IOrderCustomerGroup
}>()

const formattedPhone = computed(() =>
  props.group.phone ? formatWhatsAppNumber(props.group.phone) : null,
)

const initials = computed(() => {
  if (props.group.isUnassigned) return '—'
  const parts = props.group.name.trim().split(/\s+/).filter(Boolean)
  const first = parts[0]?.[0] ?? ''
  const second = parts[1]?.[0] ?? ''
  return (first + second).toUpperCase() || '?'
})

const openOrders = computed(() =>
  props.group.orders.filter(
    (order) =>
      order.status === ORDER_STATUS.PENDING || order.status === ORDER_STATUS.PAYMENT_INFO_SENT,
  ),
)

const awaitingDeliveryOrders = computed(() =>
  props.group.orders.filter(
    (order) =>
      order.deliveredAt === null &&
      (order.status === ORDER_STATUS.PAID || order.status === ORDER_STATUS.GIFTED),
  ),
)

const openTotalDisplay = computed(() => {
  const currency = openOrders.value.find((order) => order.snapCurrency)?.snapCurrency ?? null
  const cents = sumSubtotalCents(openOrders.value)
  return formatCurrency(Number(centsToDecimal(cents)), currency)
})

const orderCount = computed(() => props.group.orders.length)
const orderCountLabel = computed(
  () => `${orderCount.value} ${pluralize(orderCount.value, 'pedido', 'pedidos')}`,
)
</script>

<template>
  <div class="ocs" :class="{ 'ocs--none': group.isUnassigned }" data-test="group-head">
    <span class="ocs__avatar" :class="{ 'ocs__avatar--none': group.isUnassigned }">{{
      initials
    }}</span>
    <span class="ocs__identity">
      <b class="ocs__name">{{ group.name }}</b>
      <i class="ocs__sub">
        <template v-if="group.isUnassigned">Pedidos sin cuenta asociada</template>
        <template v-else>{{ formattedPhone }}</template>
      </i>
    </span>
    <div class="ocs__right">
      <span v-if="openOrders.length > 0" class="ocs__tag ocs__tag--red"
        >{{ openTotalDisplay }} por cobrar</span
      >
      <span v-if="awaitingDeliveryOrders.length > 0" class="ocs__tag ocs__tag--amber">
        {{ awaitingDeliveryOrders.length }} por entregar
      </span>
      <span class="ocs__count">{{ orderCountLabel }} <em>cargados</em></span>
    </div>
  </div>
</template>

<style scoped src="./order-customer-separator.css" />
