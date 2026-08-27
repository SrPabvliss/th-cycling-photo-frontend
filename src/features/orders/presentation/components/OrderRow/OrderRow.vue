<script setup lang="ts">
import { computed } from 'vue'
import { NIcon } from 'naive-ui'
import { ChevronForwardOutline, FlagOutline, CardOutline, StarOutline } from '@vicons/ionicons5'

import { formatRelativeTime, formatDateTime, isRecent } from '@/shared/utils/date.utils'
import { formatWhatsAppNumber } from '@/shared/utils/phone.utils'
import { formatCurrency } from '@/shared/utils/currency.utils'
import { ORDER_STATUS } from '@/shared/types/order-status.types'
import { type IOrderListItem } from '../../../types/responses/order-list.response'
import { PAYMENT_METHOD_LABELS } from '../../../constants/status-config'
import { getOrderStatusPresentation } from '../../../utils/order-status-presentation'
import {
  primaryOrderAction,
  isPlatformRole,
  type OrderOperatorRole,
} from '../../../utils/order-actions'
import OrderTimeline from '../OrderTimeline/OrderTimeline.vue'
import { pluralize } from '@/shared/utils/format.utils'

const MAX_THUMBS = 3

const props = withDefaults(
  defineProps<{
    order: IOrderListItem
    role: OrderOperatorRole
    showCustomer?: boolean
    customerLabel?: string
    customerPhone?: string | null
    positionInGroup?: number
    totalInGroup?: number
  }>(),
  {
    showCustomer: false,
    customerLabel: '',
    customerPhone: null,
    positionInGroup: 1,
    totalInGroup: 1,
  },
)

const emit = defineEmits<{
  view: [id: string]
  confirmPayment: [id: string]
  sendDelivery: [id: string]
  sendPaymentInfo: [order: IOrderListItem]
}>()

const statusPresentation = computed(() => getOrderStatusPresentation(props.order))

const isNew = computed(
  () => isRecent(props.order.createdAt) && props.order.status === ORDER_STATUS.PENDING,
)

const isFirstInGroup = computed(() => props.positionInGroup === 1)

const positionLabel = computed(() =>
  props.totalInGroup > 1 ? `${props.positionInGroup} de ${props.totalInGroup}` : 'único',
)

const formattedCustomerPhone = computed(() =>
  props.customerPhone ? formatWhatsAppNumber(props.customerPhone) : null,
)

const customerInitials = computed(() => {
  const parts = props.customerLabel.trim().split(/\s+/).filter(Boolean)
  const first = parts[0]?.[0] ?? ''
  const second = parts[1]?.[0] ?? ''
  return (first + second).toUpperCase() || '—'
})

const visibleThumbs = computed(() => props.order.previewPhotos.slice(0, MAX_THUMBS))
const overflowCount = computed(() =>
  props.order.photoCount > MAX_THUMBS ? props.order.photoCount - MAX_THUMBS : 0,
)

const paymentMethodLabel = computed(() =>
  props.order.paymentMethod
    ? (PAYMENT_METHOD_LABELS[props.order.paymentMethod] ?? 'Sin método')
    : 'Sin método',
)

const isPlatform = computed(() => isPlatformRole(props.role))

const primaryAction = computed(() =>
  primaryOrderAction(
    { status: props.order.status, deliveredAt: props.order.deliveredAt },
    isPlatform.value,
  ),
)

function handlePrimaryAction() {
  const action = primaryAction.value
  if (!action) return

  if (action.id === 'notify' || action.id === 'resend') {
    emit('sendPaymentInfo', props.order)
    return
  }
  if (action.id === 'confirm') {
    emit('confirmPayment', props.order.id)
    return
  }
  if (action.id === 'deliver') {
    emit('sendDelivery', props.order.id)
  }
}
</script>

<template>
  <article
    :class="[
      'or',
      `or--${statusPresentation.tone}`,
      { 'or--cancelled': order.status === ORDER_STATUS.CANCELLED },
    ]"
    data-test="order-row"
    @click="emit('view', order.id)"
  >
    <div v-if="showCustomer" class="or__customer">
      <span class="or__avatar">{{ customerInitials }}</span>
      <span class="or__customer-text">
        <b>{{ customerLabel }}</b>
        <i>{{ formattedCustomerPhone ?? 'sin cuenta asociada' }}</i>
      </span>
    </div>
    <div v-else class="or__position">
      <span class="or__position-label">
        <NIcon v-if="isFirstInGroup" :component="StarOutline" :size="11" class="or__star" />
        {{ positionLabel }}
      </span>
      <span class="or__code">{{ formatDateTime(order.createdAt) }}</span>
    </div>

    <div class="or__thumbs">
      <div v-for="(thumb, index) in visibleThumbs" :key="thumb.photoId" class="or__thumb">
        <img
          :src="thumb.thumbnailUrl"
          :alt="thumb.filename"
          loading="lazy"
          class="or__thumb-img"
          @error="(event) => ((event.target as HTMLImageElement).style.visibility = 'hidden')"
        />
        <div v-if="index === MAX_THUMBS - 1 && overflowCount > 0" class="or__thumb-overflow">
          +{{ overflowCount }}
        </div>
      </div>
    </div>

    <div class="or__amount">
      <b
        :class="{
          'or__amount-value--gift': order.status === ORDER_STATUS.GIFTED,
          'or__amount-value--off': order.status === ORDER_STATUS.CANCELLED,
        }"
      >
        {{ order.subtotal !== null ? formatCurrency(order.subtotal, order.snapCurrency) : '—' }}
      </b>
      <span> {{ order.photoCount }} {{ pluralize(order.photoCount, 'foto', 'fotos') }} </span>
    </div>

    <div class="or__status">
      <span class="or__status-line">
        <span v-if="isNew" class="or__new">Nuevo</span>
        <span
          :class="[
            'or__badge',
            `or__badge--${statusPresentation.tone}`,
            { 'or__badge--soft': statusPresentation.soft },
          ]"
        >
          {{ statusPresentation.label }}
          <i v-if="statusPresentation.suffix">{{ statusPresentation.suffix }}</i>
        </span>
        <span v-if="showCustomer" class="or__code">{{ formatDateTime(order.createdAt) }}</span>
      </span>
      <span class="or__meta-line or__meta-line--event">
        <NIcon :component="FlagOutline" :size="12" />
        {{ order.eventName }}
      </span>
      <span class="or__meta-line or__meta-line--payment">
        <NIcon :component="CardOutline" :size="11" />
        {{ paymentMethodLabel }} · {{ formatRelativeTime(order.createdAt) }}
      </span>
    </div>

    <div class="or__timeline">
      <OrderTimeline :order="order" show-dates />
    </div>

    <div class="or__actions">
      <button v-if="primaryAction" class="or__btn or__btn--solid" @click.stop="handlePrimaryAction">
        {{ primaryAction.label }}
      </button>
      <button class="or__btn or__btn--ghost" @click.stop="emit('view', order.id)">
        {{ primaryAction ? 'Detalle' : 'Ver detalle' }}
        <NIcon :component="ChevronForwardOutline" :size="12" />
      </button>
    </div>
  </article>
</template>

<style scoped src="./order-row.css" />
