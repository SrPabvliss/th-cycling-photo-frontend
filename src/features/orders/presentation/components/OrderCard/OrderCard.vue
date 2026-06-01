<script setup lang="ts">
import { computed } from 'vue'
import { NIcon } from 'naive-ui'
import {
  CameraOutline,
  CheckmarkCircleOutline,
  CheckmarkDoneOutline,
  CheckmarkOutline,
  CloseCircleOutline,
  EyeOutline,
  LogoWhatsapp,
  MailOutline,
  RefreshOutline,
  SendOutline,
  TimeOutline,
} from '@vicons/ionicons5'

import { formatRelativeTime, isRecent } from '@/shared/utils/date.utils'
import { formatWhatsAppNumber } from '@/shared/utils/phone.utils'
import { openWhatsApp } from '@/shared/utils/whatsapp.utils'
import { formatCurrency } from '@/features/pricing/utils/format-currency'
import { ORDER_STATUS, type IOrderListItem } from '../../../types/responses/order-list.response'
import { ORDER_STATUS_CONFIG } from '../../../constants/status-config'

const MAX_THUMBS = 3

const props = defineProps<{
  order: IOrderListItem
}>()

const emit = defineEmits<{
  view: [id: string]
  confirmPayment: [id: string]
  sendDelivery: [id: string]
  sendPaymentInfo: [order: IOrderListItem]
  resendDelivery: [order: IOrderListItem]
  regenerate: [id: string]
}>()

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
    case ORDER_STATUS.CANCELLED:
      return CloseCircleOutline
    default:
      return TimeOutline
  }
})

const formattedPhone = computed(() =>
  props.order.snapWhatsapp ? formatWhatsAppNumber(props.order.snapWhatsapp) : null,
)

const initials = computed(() => {
  const parts = props.order.userName.trim().split(/\s+/)
  const first = parts[0]?.[0] ?? ''
  const last = parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? '') : ''
  return (first + last).toUpperCase() || '?'
})

const visibleThumbs = computed(() => props.order.previewPhotos.slice(0, MAX_THUMBS))
const placeholderCount = computed(() => Math.max(0, MAX_THUMBS - visibleThumbs.value.length))
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
  const infoReached =
    props.order.notifiedAt !== null ||
    s === ORDER_STATUS.PAYMENT_INFO_SENT ||
    s === ORDER_STATUS.PAID ||
    s === ORDER_STATUS.DELIVERED
  const paidReached =
    props.order.paidAt !== null || s === ORDER_STATUS.PAID || s === ORDER_STATUS.DELIVERED
  const deliveredReached = props.order.deliveredAt !== null || s === ORDER_STATUS.DELIVERED

  return [
    { key: 'created', label: 'Creado', reached: true },
    { key: 'info', label: 'Info pago', reached: infoReached },
    { key: 'paid', label: 'Pagado', reached: paidReached },
    { key: 'delivered', label: 'Entregado', reached: deliveredReached },
  ]
})

const currentStepIndex = computed(() => {
  const reached = timelineSteps.value.map((s) => s.reached)
  return reached.lastIndexOf(true)
})

const showTimeline = computed(() => props.order.status !== ORDER_STATUS.CANCELLED)

function onPhoneClick() {
  openWhatsApp(props.order.snapWhatsapp, '')
}
</script>

<template>
  <div :class="['oc', `oc--${order.status}`, { 'oc--new': isNew }]" @click="emit('view', order.id)">
    <!-- Header strip (status-tinted) -->
    <header :class="['oc__header', `oc__header--${order.status}`]">
      <div class="oc__header-left">
        <NIcon :component="statusIcon" :size="14" />
        <span class="oc__header-label">{{ statusConfig.label }}</span>
      </div>
      <div class="oc__header-right">
        <span v-if="isNew" class="oc__new-badge">Nuevo</span>
        <span class="oc__header-time">{{ formatRelativeTime(order.createdAt) }}</span>
      </div>
    </header>

    <!-- Body -->
    <div class="oc__body">
      <div class="oc__body-row">
        <div class="oc__body-left">
          <div class="oc__avatar" :title="order.userName">{{ initials }}</div>
          <div class="oc__identity">
            <div class="oc__name">{{ order.userName }}</div>
            <a
              v-if="formattedPhone"
              class="oc__phone"
              :href="`https://api.whatsapp.com/send?phone=${(order.snapWhatsapp ?? '').replace(/[^\d]/g, '')}`"
              target="_blank"
              rel="noopener noreferrer"
              @click.stop="onPhoneClick"
            >
              <NIcon :component="LogoWhatsapp" :size="13" color="#25D366" />
              <span>{{ formattedPhone }}</span>
            </a>
          </div>
        </div>

        <div class="oc__body-right">
          <span class="oc__subtotal-label">SUBTOTAL</span>
          <div v-if="order.subtotal !== null" class="oc__subtotal-value">
            {{ formatCurrency(order.subtotal, order.snapCurrency) }}
          </div>
          <div v-else class="oc__subtotal-value oc__subtotal-value--empty">—</div>
        </div>
      </div>

      <div class="oc__chips">
        <span class="oc__chip">{{ order.eventName }}</span>
        <span class="oc__chip">{{ order.photoCount }} fotos</span>
      </div>

      <!-- Thumbs strip -->
      <div class="oc__thumbs">
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
        <template v-for="n in placeholderCount" :key="`p-${n}`">
          <div class="oc__thumb oc__thumb--placeholder">
            <NIcon :component="CameraOutline" :size="20" />
          </div>
        </template>
      </div>
    </div>

    <!-- Progress timeline -->
    <ol v-if="showTimeline" class="oc__timeline">
      <li
        v-for="(step, idx) in timelineSteps"
        :key="step.key"
        :class="[
          'oc__step',
          {
            'oc__step--reached': step.reached,
            'oc__step--current': idx === currentStepIndex,
            'oc__step--has-line': idx < timelineSteps.length - 1,
            'oc__step--line-reached':
              idx < timelineSteps.length - 1 && !!timelineSteps[idx + 1]?.reached,
          },
        ]"
      >
        <span class="oc__step-dot" />
        <span class="oc__step-label">{{ step.label }}</span>
      </li>
    </ol>

    <!-- Actions -->
    <div class="oc__actions">
      <template
        v-if="
          order.status === ORDER_STATUS.PENDING || order.status === ORDER_STATUS.PAYMENT_INFO_SENT
        "
      >
        <button class="oc__btn oc__btn--wa" @click.stop="emit('sendPaymentInfo', order)">
          <NIcon :component="LogoWhatsapp" :size="13" />
          {{ order.status === ORDER_STATUS.PAYMENT_INFO_SENT ? 'Reenviar info' : 'Info de pago' }}
        </button>
        <button class="oc__btn oc__btn--confirm" @click.stop="emit('confirmPayment', order.id)">
          <NIcon :component="CheckmarkOutline" :size="13" />
          Confirmar pago
        </button>
      </template>

      <button
        v-else-if="order.status === ORDER_STATUS.PAID"
        class="oc__btn oc__btn--send"
        @click.stop="emit('sendDelivery', order.id)"
      >
        <NIcon :component="SendOutline" :size="13" />
        Enviar fotos
      </button>

      <button
        v-else-if="order.status === ORDER_STATUS.DELIVERED && order.hasDeliveryLink"
        class="oc__btn oc__btn--wa"
        @click.stop="emit('resendDelivery', order)"
      >
        <NIcon :component="LogoWhatsapp" :size="13" />
        Reenviar enlace
      </button>

      <button
        v-else-if="order.status === ORDER_STATUS.DELIVERED && !order.hasDeliveryLink"
        class="oc__btn"
        @click.stop="emit('regenerate', order.id)"
      >
        <NIcon :component="RefreshOutline" :size="13" />
        Regenerar enlace
      </button>

      <button v-else class="oc__btn" @click.stop="emit('view', order.id)">
        <NIcon :component="EyeOutline" :size="13" />
        Ver detalles
      </button>

      <button class="oc__icon-btn" @click.stop="emit('view', order.id)">
        <NIcon :component="EyeOutline" :size="14" />
      </button>
    </div>
  </div>
</template>

<style scoped src="./order-card.css" />
