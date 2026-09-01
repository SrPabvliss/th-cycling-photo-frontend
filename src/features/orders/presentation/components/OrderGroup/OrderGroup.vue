<script setup lang="ts">
import { computed } from 'vue'
import { useMediaQuery } from '@vueuse/core'

import type { IOrderListItem } from '../../../types/responses/order-list.response'
import type { IOrderCustomerGroup } from '../../../types/order-customer-group.type'
import type { OrderOperatorRole } from '../../../utils/order-actions'
import OrderCustomerSeparator from '../OrderCustomerSeparator/OrderCustomerSeparator.vue'
import OrderRow from '../OrderRow/OrderRow.vue'
import OrderCard from '../OrderCard/OrderCard.vue'

const props = defineProps<{
  group: IOrderCustomerGroup
  role: OrderOperatorRole
}>()

const emit = defineEmits<{
  view: [id: string]
  confirmPayment: [id: string]
  sendDelivery: [order: IOrderListItem]
  sendPaymentInfo: [order: IOrderListItem]
  resendDelivery: [order: IOrderListItem]
}>()

const isMobile = useMediaQuery('(max-width: 767px)')

const usesRows = computed(() => !isMobile.value && props.group.orders.length <= 2)
const isHeaderless = computed(() => usesRows.value && props.group.orders.length === 1)

function forwardView(id: string) {
  emit('view', id)
}

function forwardConfirmPayment(id: string) {
  emit('confirmPayment', id)
}

function forwardSendDelivery(order: IOrderListItem) {
  emit('sendDelivery', order)
}

function forwardResendDelivery(order: IOrderListItem) {
  emit('resendDelivery', order)
}

function forwardSendPaymentInfo(order: IOrderListItem) {
  emit('sendPaymentInfo', order)
}
</script>

<template>
  <div
    class="og"
    :class="{ 'og--rows': usesRows, 'og--solo': isHeaderless }"
    data-test="order-group"
  >
    <OrderCustomerSeparator v-if="!isHeaderless" :group="group" />

    <div v-if="usesRows" class="og__rows">
      <OrderRow
        v-for="(order, index) in group.orders"
        :key="order.id"
        :order="order"
        :role="role"
        :show-customer="isHeaderless"
        :customer-label="group.name"
        :customer-phone="group.phone"
        :position-in-group="index + 1"
        :total-in-group="group.orders.length"
        @view="forwardView"
        @confirm-payment="forwardConfirmPayment"
        @send-delivery="forwardSendDelivery"
        @resend-delivery="forwardResendDelivery"
        @send-payment-info="forwardSendPaymentInfo"
      />
    </div>

    <div v-else class="og__grid">
      <OrderCard
        v-for="(order, index) in group.orders"
        :key="order.id"
        :order="order"
        :role="role"
        :position-in-group="index + 1"
        :total-in-group="group.orders.length"
        @view="forwardView"
        @confirm-payment="forwardConfirmPayment"
        @send-delivery="forwardSendDelivery"
        @resend-delivery="forwardResendDelivery"
        @send-payment-info="forwardSendPaymentInfo"
      />
    </div>
  </div>
</template>

<style scoped src="./order-group.css" />
