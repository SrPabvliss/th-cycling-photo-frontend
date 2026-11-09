<script setup lang="ts">
import { computed } from 'vue'
import { NIcon } from 'naive-ui'
import { ChevronForwardOutline } from '@vicons/ionicons5'
import type { IPhotoOrder } from '@/shared/types/photo-detail.types'
import { formatDate } from '@/shared/utils/date.utils'
import { ORDER_STATUS_CONFIG } from '@/shared/constants/status-config'
import type { IStatusBadgeConfig } from '@/shared/types/badge-config.types'
import type { OrderStatus } from '@/shared/types/order-status.types'
import { pluralize } from '@/shared/utils/format.utils'

const props = defineProps<{
  orders: IPhotoOrder[]
}>()

defineEmits<{
  'view-order': [id: string]
}>()

const chipText = computed(
  () => `${props.orders.length} ${pluralize(props.orders.length, 'pedido', 'pedidos')}`,
)

const STATUS_TONE: Record<IStatusBadgeConfig['type'], string> = {
  success: 'green',
  info: 'blue',
  warning: 'amber',
  error: 'red',
  default: 'gray',
}

function statusLabel(status: string): string {
  return ORDER_STATUS_CONFIG[status as OrderStatus]?.label ?? status
}

function statusTone(status: string): string {
  const config = ORDER_STATUS_CONFIG[status as OrderStatus]
  return config ? STATUS_TONE[config.type] : 'gray'
}
</script>

<template>
  <section class="pd-card">
    <div class="pd-card-h">
      <h4>Venta</h4>
      <span v-if="orders.length" class="pd-mini green" data-test="sales-chip">
        {{ chipText }}
      </span>
    </div>
    <p v-if="!orders.length" class="pd-empty">
      Todavía nadie la ha comprado. Se puede borrar sin afectar a ningún pedido.
    </p>
    <div v-else class="pd-ords">
      <button
        v-for="order in orders"
        :key="order.id"
        type="button"
        class="pd-ord"
        data-test="sales-order-row"
        @click="$emit('view-order', order.id)"
      >
        <span class="pd-ord-t">
          <b>{{ order.buyerName }}</b>
          <i>{{ formatDate(order.createdAt) }}</i>
        </span>
        <span :class="['pd-mini', statusTone(order.status)]" data-test="sales-order-status">{{
          statusLabel(order.status)
        }}</span>
        <NIcon :component="ChevronForwardOutline" :size="13" />
      </button>
    </div>
  </section>
</template>

<style scoped src="./photo-sales-card.css" />
