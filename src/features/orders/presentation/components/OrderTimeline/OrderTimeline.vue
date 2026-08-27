<script setup lang="ts">
import { computed } from 'vue'

import { formatDate } from '@/shared/utils/date.utils'
import type { IOrderTimelineFacts } from '../../../types/order-timeline.types'
import { ORDER_STATUS } from '@/shared/types/order-status.types'
import { getOrderStatusPresentation } from '../../../utils/order-status-presentation'

const props = withDefaults(
  defineProps<{
    order: IOrderTimelineFacts
    showDates?: boolean
  }>(),
  {
    showDates: false,
  },
)

interface IStep {
  key: 'created' | 'info' | 'paid' | 'delivered'
  label: string
  date: Date | null
  reached: boolean
  isSkip: boolean
}

const isGifted = computed(() => props.order.status === ORDER_STATUS.GIFTED)
const isCancelled = computed(() => props.order.status === ORDER_STATUS.CANCELLED)

const steps = computed<IStep[]>(() => {
  const o = props.order
  const gift = isGifted.value

  const infoReached =
    o.notifiedAt !== null ||
    o.status === ORDER_STATUS.PAYMENT_INFO_SENT ||
    o.status === ORDER_STATUS.PAID ||
    o.status === ORDER_STATUS.DELIVERED ||
    gift

  const paidReached =
    gift ||
    o.paidAt !== null ||
    o.status === ORDER_STATUS.PAID ||
    o.status === ORDER_STATUS.DELIVERED

  const deliveredReached = o.deliveredAt !== null || o.status === ORDER_STATUS.DELIVERED

  return [
    { key: 'created', label: 'Pedido', date: o.createdAt, reached: true, isSkip: false },
    { key: 'info', label: 'Info', date: o.notifiedAt, reached: infoReached, isSkip: false },
    {
      key: 'paid',
      label: gift ? 'Regalada' : 'Pago',
      date: o.paidAt,
      reached: paidReached,
      isSkip: gift,
    },
    {
      key: 'delivered',
      label: 'Entrega',
      date: o.deliveredAt,
      reached: deliveredReached,
      isSkip: false,
    },
  ]
})

const currentStepIndex = computed(() => {
  const reachedFlags = steps.value.map((step) => step.reached)
  return reachedFlags.lastIndexOf(true)
})

const tone = computed(() => getOrderStatusPresentation(props.order).tone)

function stepDateLabel(step: IStep): string {
  if (step.isSkip) return 'sin pago'
  return step.date ? formatDate(step.date) : '—'
}
</script>

<template>
  <div
    :class="['ot', `ot--${tone}`, { 'ot--cancelled': isCancelled, 'ot--gift': isGifted }]"
    data-test="order-timeline"
  >
    <div
      v-for="(step, index) in steps"
      :key="step.key"
      :class="[
        'ot__step',
        {
          'ot__step--reached': step.reached,
          'ot__step--skip': step.isSkip,
          'ot__step--current': index === currentStepIndex,
        },
      ]"
    >
      <span v-if="index > 0" class="ot__line" />
      <span class="ot__dot" />
      <span class="ot__label">{{ step.label }}</span>
      <span v-if="showDates" class="ot__date">{{ stepDateLabel(step) }}</span>
    </div>
    <span v-if="isCancelled" class="ot__cancelled">
      Cancelado {{ order.cancelledAt ? formatDate(order.cancelledAt) : '' }}
    </span>
  </div>
</template>

<style scoped src="./order-timeline.css" />
