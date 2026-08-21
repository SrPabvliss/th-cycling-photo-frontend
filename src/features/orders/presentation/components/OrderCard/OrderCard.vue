<script setup lang="ts">
import { computed } from 'vue'
import { NIcon } from 'naive-ui'
import {
  CheckmarkCircleOutline,
  CheckmarkDoneOutline,
  CheckmarkOutline,
  CloseCircleOutline,
  EyeOutline,
  GiftOutline,
  LogoWhatsapp,
  MailOutline,
  RefreshOutline,
  SendOutline,
  TimeOutline,
} from '@vicons/ionicons5'

import { PERMISSIONS } from '@/core/auth/permissions'
import { usePermissions } from '@/core/auth/use-permissions'
import { formatRelativeTime, isRecent } from '@/shared/utils/date.utils'
import { formatCurrency } from '@/features/pricing/utils/format-currency'
import { ORDER_STATUS, type IOrderListItem } from '../../../types/responses/order-list.response'
import { ORDER_STATUS_CONFIG, PAYMENT_METHOD_LABELS } from '../../../constants/status-config'

const MAX_THUMBS = 3

const props = withDefaults(
  defineProps<{
    /** Order data to render. */
    order: IOrderListItem
    /**
     * 1-based position of this order within its customer group.
     * Used together with `groupTotal` to render the "X de N" badge.
     * Default: 1 (treated as single-order group).
     */
    groupPosition?: number
    /**
     * Total amount of orders in this customer's group.
     * When > 1, the "X de N" badge is rendered.
     * Default: 1 (no badge).
     */
    groupTotal?: number
    /**
     * Marks this order as the latest one for the customer.
     * When true AND `groupTotal > 1`, the "Última" pill is rendered.
     * Default: true.
     */
    isLatestForCustomer?: boolean
  }>(),
  {
    groupPosition: 1,
    groupTotal: 1,
    isLatestForCustomer: true,
  },
)

const showGroupBadge = computed(() => props.groupTotal > 1)
const showLatestBadge = computed(() => props.isLatestForCustomer && props.groupTotal > 1)

const emit = defineEmits<{
  view: [id: string]
  confirmPayment: [id: string]
  markGift: [id: string]
  sendDelivery: [id: string]
  sendPaymentInfo: [order: IOrderListItem]
  resendDelivery: [order: IOrderListItem]
  regenerate: [id: string]
}>()

const { has } = usePermissions()

const isNew = computed(
  () => isRecent(props.order.createdAt) && props.order.status === ORDER_STATUS.PENDING,
)

const statusConfig = computed(() => ORDER_STATUS_CONFIG[props.order.status])

const statusIcon = computed(() => {
  switch (props.order.status) {
    case ORDER_STATUS.PENDING:
      return TimeOutline
    case ORDER_STATUS.PAYMENT_INFO_SENT:
      return MailOutline
    case ORDER_STATUS.PAID:
      return CheckmarkCircleOutline
    case ORDER_STATUS.DELIVERED:
      return CheckmarkDoneOutline
    case ORDER_STATUS.GIFTED:
      return GiftOutline
    case ORDER_STATUS.CANCELLED:
      return CloseCircleOutline
    default:
      return TimeOutline
  }
})

const visibleThumbs = computed(() => props.order.previewPhotos.slice(0, MAX_THUMBS))
const overflowCount = computed(() =>
  props.order.photoCount > MAX_THUMBS ? props.order.photoCount - MAX_THUMBS : 0,
)

interface ITimelineStep {
  key: 'created' | 'info' | 'paid' | 'delivered'
  label: string
  reached: boolean
}

const timelineSteps = computed<ITimelineStep[]>(() => {
  const s = props.order.status
  const isGift = s === ORDER_STATUS.GIFTED
  const infoReached =
    props.order.notifiedAt !== null ||
    s === ORDER_STATUS.PAYMENT_INFO_SENT ||
    s === ORDER_STATUS.PAID ||
    s === ORDER_STATUS.DELIVERED ||
    isGift
  const paidOrGiftReached =
    isGift || props.order.paidAt !== null || s === ORDER_STATUS.PAID || s === ORDER_STATUS.DELIVERED
  const deliveredReached = props.order.deliveredAt !== null || s === ORDER_STATUS.DELIVERED

  return [
    { key: 'created', label: 'Creado', reached: true },
    { key: 'info', label: 'Info pago', reached: infoReached },
    { key: 'paid', label: isGift ? 'Regalo' : 'Pagado', reached: paidOrGiftReached },
    { key: 'delivered', label: 'Entregado', reached: deliveredReached },
  ]
})

const currentStepIndex = computed(() => {
  const reached = timelineSteps.value.map((s) => s.reached)
  return reached.lastIndexOf(true)
})

const showTimeline = computed(() => props.order.status !== ORDER_STATUS.CANCELLED)

const paymentMethodLabel = computed(() =>
  props.order.paymentMethod ? (PAYMENT_METHOD_LABELS[props.order.paymentMethod] ?? '—') : '—',
)
</script>

<template>
  <div :class="['oc', `oc--${order.status}`, { 'oc--new': isNew }]" @click="emit('view', order.id)">
    <!-- Header strip (status-tinted) -->
    <header :class="['oc__header', `oc__header--${order.status}`]">
      <div class="oc__header-left">
        <NIcon :component="statusIcon" :size="16" />
        <span class="oc__header-label">{{ statusConfig.label }}</span>
      </div>
      <div class="oc__header-right">
        <span v-if="showGroupBadge" class="oc__group-position">
          <span v-if="showLatestBadge" class="oc__group-position-star">★ Última · </span>
          <span>{{ groupPosition }} de {{ groupTotal }}</span>
        </span>
        <span v-if="isNew" class="oc__new-badge">Nuevo</span>
        <span class="oc__header-time">{{ formatRelativeTime(order.createdAt) }}</span>
      </div>
    </header>

    <!-- Body principal: thumbs izq · (precio + barra progreso) der -->
    <div :class="['oc__body', `oc__body--${order.status}`]">
      <div v-if="visibleThumbs.length > 0" class="oc__thumbs">
        <div v-for="(thumb, index) in visibleThumbs" :key="thumb.photoId" class="oc__thumb">
          <img
            :src="thumb.thumbnailUrl"
            :alt="thumb.filename"
            loading="lazy"
            decoding="async"
            class="oc__thumb-img"
            @load="($event.target as HTMLImageElement).dataset.loaded = 'true'"
          />
          <div v-if="index === MAX_THUMBS - 1 && overflowCount > 0" class="oc__thumb-overflow">
            <span>+{{ overflowCount }}</span>
          </div>
        </div>
      </div>

      <div class="oc__info">
        <div v-if="order.subtotal !== null" class="oc__subtotal-value">
          {{ formatCurrency(order.subtotal, order.snapCurrency) }}
        </div>
        <div v-else class="oc__subtotal-value oc__subtotal-value--empty">—</div>

        <div
          v-if="showTimeline"
          class="oc__progress"
          role="progressbar"
          :aria-valuemin="0"
          :aria-valuemax="timelineSteps.length"
          :aria-valuenow="currentStepIndex + 1"
          :aria-label="`Avance: ${currentStepIndex + 1} de ${timelineSteps.length}`"
        >
          <span
            v-for="step in timelineSteps"
            :key="step.key"
            :class="['oc__progress-seg', { 'oc__progress-seg--reached': step.reached }]"
          />
        </div>
      </div>
    </div>

    <!-- Meta inferior: evento abraza su contenido, fotos fijo -->
    <div class="oc__meta">
      <span class="oc__chip oc__chip--event" :title="order.eventName">{{ order.eventName }}</span>
      <span class="oc__chip oc__chip--photos">
        {{ order.photoCount }} {{ order.photoCount === 1 ? 'foto' : 'fotos' }}
      </span>
      <span v-if="order.paymentMethod" class="oc__chip oc__chip--payment">{{
        paymentMethodLabel
      }}</span>
    </div>

    <!-- Actions -->
    <div class="oc__actions">
      <template
        v-if="
          order.status === ORDER_STATUS.PENDING || order.status === ORDER_STATUS.PAYMENT_INFO_SENT
        "
      >
        <button class="oc__btn oc__btn--wa" @click.stop="emit('sendPaymentInfo', order)">
          <NIcon :component="LogoWhatsapp" :size="16" />
          {{ order.status === ORDER_STATUS.PAYMENT_INFO_SENT ? 'Reenviar info' : 'Info de pago' }}
        </button>
        <button class="oc__btn oc__btn--confirm" @click.stop="emit('confirmPayment', order.id)">
          <NIcon :component="CheckmarkOutline" :size="16" />
          Confirmar pago
        </button>
        <button
          v-if="has(PERMISSIONS.ORDER_GIFT)"
          class="oc__icon-btn oc__icon-btn--gift"
          title="Enviar como regalo"
          aria-label="Enviar como regalo"
          @click.stop="emit('markGift', order.id)"
        >
          <NIcon :component="GiftOutline" :size="19" />
        </button>
      </template>

      <button
        v-else-if="
          order.status === ORDER_STATUS.PAID ||
          (order.status === ORDER_STATUS.GIFTED && !order.deliveredAt)
        "
        class="oc__btn oc__btn--send"
        @click.stop="emit('sendDelivery', order.id)"
      >
        <NIcon :component="SendOutline" :size="16" />
        Enviar fotos
      </button>

      <button
        v-else-if="
          (order.status === ORDER_STATUS.DELIVERED || order.status === ORDER_STATUS.GIFTED) &&
          order.hasDeliveryLink
        "
        class="oc__btn oc__btn--wa"
        @click.stop="emit('resendDelivery', order)"
      >
        <NIcon :component="LogoWhatsapp" :size="16" />
        Reenviar enlace
      </button>

      <button
        v-else-if="
          (order.status === ORDER_STATUS.DELIVERED ||
            (order.status === ORDER_STATUS.GIFTED && order.deliveredAt)) &&
          !order.hasDeliveryLink
        "
        class="oc__btn"
        @click.stop="emit('regenerate', order.id)"
      >
        <NIcon :component="RefreshOutline" :size="16" />
        Regenerar enlace
      </button>

      <button v-else class="oc__btn" @click.stop="emit('view', order.id)">
        <NIcon :component="EyeOutline" :size="16" />
        Ver detalles
      </button>

      <button class="oc__icon-btn" @click.stop="emit('view', order.id)">
        <NIcon :component="EyeOutline" :size="18" />
      </button>
    </div>
  </div>
</template>

<style scoped src="./order-card.css" />
