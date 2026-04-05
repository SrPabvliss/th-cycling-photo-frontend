<script setup lang="ts">
import { computed } from 'vue'
import { NIcon, NTag } from 'naive-ui'
import {
  LogoWhatsapp,
  CheckmarkOutline,
  EyeOutline,
  RefreshOutline,
  SendOutline,
} from '@vicons/ionicons5'

import { formatRelativeTime, isRecent } from '@/shared/utils/date.utils'
import { formatWhatsAppNumber } from '@/shared/utils/phone.utils'
import { ORDER_STATUS, type IOrderListItem } from '../../../types/responses/order-list.response'
import { ORDER_STATUS_CONFIG } from '../../../constants/status-config'

const props = defineProps<{
  order: IOrderListItem
}>()

const emit = defineEmits<{
  view: [id: string]
  confirmPayment: [id: string]
  sendDelivery: [id: string]
  sendWhatsApp: [order: IOrderListItem]
  regenerate: [id: string]
}>()

const isNew = computed(
  () => isRecent(props.order.createdAt) && props.order.status === ORDER_STATUS.PENDING,
)

const statusConfig = computed(() => ORDER_STATUS_CONFIG[props.order.status])
const formattedPhone = computed(() =>
  props.order.snapWhatsapp ? formatWhatsAppNumber(props.order.snapWhatsapp) : null,
)
</script>

<template>
  <div :class="['oc', { 'oc--new': isNew }]" @click="emit('view', order.id)">
    <!-- Top: name + badges -->
    <div class="oc__top">
      <span class="oc__name">{{ order.userName }}</span>
      <div class="oc__badges">
        <NTag :type="statusConfig.type" size="tiny" round :bordered="false">
          {{ statusConfig.label }}
        </NTag>
        <NTag v-if="isNew" type="warning" size="tiny" round :bordered="false"> Nuevo </NTag>
      </div>
    </div>

    <!-- Meta -->
    <div class="oc__meta">
      <div v-if="formattedPhone" class="oc__phone">
        <NIcon :component="LogoWhatsapp" :size="12" color="#25D366" />
        {{ formattedPhone }}
      </div>
      <div class="oc__chips">
        <span class="oc__chip">{{ order.eventName }}</span>
        <span class="oc__chip">{{ order.photoCount }} fotos</span>
        <span class="oc__chip">{{ formatRelativeTime(order.createdAt) }}</span>
      </div>
    </div>

    <!-- Actions -->
    <div class="oc__actions">
      <!-- Pending: confirm payment -->
      <button
        v-if="order.status === ORDER_STATUS.PENDING"
        class="oc__btn oc__btn--confirm"
        @click.stop="emit('confirmPayment', order.id)"
      >
        <NIcon :component="CheckmarkOutline" :size="13" />
        Confirmar pago
      </button>

      <!-- Paid: send delivery -->
      <button
        v-else-if="order.status === ORDER_STATUS.PAID"
        class="oc__btn oc__btn--send"
        @click.stop="emit('sendDelivery', order.id)"
      >
        <NIcon :component="SendOutline" :size="13" />
        Enviar fotos
      </button>

      <!-- Delivered with link: resend WhatsApp -->
      <button
        v-else-if="order.status === ORDER_STATUS.DELIVERED && order.hasDeliveryLink"
        class="oc__btn oc__btn--wa"
        @click.stop="emit('sendWhatsApp', order)"
      >
        <NIcon :component="LogoWhatsapp" :size="13" />
        Reenviar enlace
      </button>

      <!-- Delivered without link (expired): regenerate -->
      <button
        v-else-if="order.status === ORDER_STATUS.DELIVERED && !order.hasDeliveryLink"
        class="oc__btn"
        @click.stop="emit('regenerate', order.id)"
      >
        <NIcon :component="RefreshOutline" :size="13" />
        Regenerar enlace
      </button>

      <!-- Cancelled: view only -->
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
