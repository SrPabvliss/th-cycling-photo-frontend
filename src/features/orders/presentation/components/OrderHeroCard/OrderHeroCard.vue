<script setup lang="ts">
import { computed } from 'vue'
import { NTag } from 'naive-ui'

import { formatDate, formatRelativeTime } from '@/shared/utils/date.utils'
import { formatCurrency } from '@/features/pricing/utils/format-currency'
import type { IOrderDetail } from '../../../types/responses/order-detail.response'
import { ORDER_STATUS_CONFIG } from '../../../constants/status-config'

const props = defineProps<{
  order: IOrderDetail
}>()

const statusConfig = computed(() => ORDER_STATUS_CONFIG[props.order.status])

const initials = computed(() => {
  const first = props.order.snapFirstName?.[0] ?? ''
  const last = props.order.snapLastName?.[0] ?? ''
  return (first + last).toUpperCase() || (props.order.userName[0]?.toUpperCase() ?? '')
})

const displayName = computed(() => {
  if (props.order.snapFirstName || props.order.snapLastName) {
    return [props.order.snapFirstName, props.order.snapLastName].filter(Boolean).join(' ')
  }
  return props.order.userName
})
</script>

<template>
  <div class="od-hero">
    <div class="od-hero__top">
      <div class="od-hero__identity">
        <div class="od-hero__avatar">{{ initials }}</div>
        <div>
          <div class="od-hero__name">
            {{ displayName }}
          </div>
          <div class="od-hero__sub">
            {{ order.eventName }} &nbsp;·&nbsp; {{ formatRelativeTime(order.createdAt) }}
          </div>
        </div>
      </div>
      <NTag :type="statusConfig.type" size="small" round :bordered="false">
        {{ statusConfig.label }}
      </NTag>
    </div>
    <div class="od-hero__stats">
      <div class="od-hstat">
        <div class="od-hstat__label">Total a cobrar</div>
        <div class="od-hstat__val od-hstat__val--big">
          {{ order.subtotal === null ? '—' : formatCurrency(order.subtotal, order.snapCurrency) }}
        </div>
      </div>
      <div class="od-hstat">
        <div class="od-hstat__label">Fotos compradas</div>
        <div class="od-hstat__val od-hstat__val--big">{{ order.photos.length }}</div>
      </div>
      <div class="od-hstat">
        <div class="od-hstat__label">Fecha pedido</div>
        <div class="od-hstat__val">{{ formatDate(order.createdAt) }}</div>
      </div>
      <div class="od-hstat">
        <div class="od-hstat__label">Pagado</div>
        <div class="od-hstat__val">{{ order.paidAt ? formatDate(order.paidAt) : '—' }}</div>
      </div>
      <div class="od-hstat">
        <div class="od-hstat__label">Entregado</div>
        <div class="od-hstat__val">
          {{ order.deliveredAt ? formatDate(order.deliveredAt) : '—' }}
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped src="./order-hero-card.css" />
