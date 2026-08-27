<script setup lang="ts">
import { computed } from 'vue'
import { NButton, NIcon, NResult, NSpin } from 'naive-ui'
import { CloseOutline } from '@vicons/ionicons5'

import { formatDateTime } from '@/shared/utils/date.utils'
import { useOrderDetailPanel } from '../../../composables/use-order-detail-panel'
import type { OrderOperatorRole } from '../../../utils/order-actions'
import OrderDetailBody from './OrderDetailBody.vue'

const props = defineProps<{
  orderId: string
  role: OrderOperatorRole
}>()

const emit = defineEmits<{
  close: []
}>()

const orderIdRef = computed(() => props.orderId)

const {
  order,
  isPending,
  isError,
  refetch,
  isRegenerating,
  onAction,
  onRegenerateDelivery,
  onSendDeliveryWhatsApp,
} = useOrderDetailPanel(orderIdRef)

function close() {
  emit('close')
}
</script>

<template>
  <div class="odd">
    <div class="odd__scrim" @click="close" />
    <aside class="odd__panel" data-test="order-detail-drawer">
      <div class="odd__head">
        <span>{{ order ? `Pedido · ${formatDateTime(order.createdAt)}` : 'Pedido' }}</span>
        <button class="odd__close" @click="close">
          <NIcon :component="CloseOutline" :size="15" />
        </button>
      </div>

      <div v-if="isPending" class="odd__state">
        <NSpin size="large" />
      </div>

      <NResult v-else-if="isError" class="odd__state" status="error" title="Error al cargar pedido">
        <template #footer>
          <NButton @click="refetch()">Reintentar</NButton>
        </template>
      </NResult>

      <OrderDetailBody
        v-else-if="order"
        class="odd__body"
        :order="order"
        :role="role"
        :is-regenerating="isRegenerating"
        @action="onAction"
        @regenerate-delivery="onRegenerateDelivery"
        @send-delivery-whats-app="onSendDeliveryWhatsApp"
      />
    </aside>
  </div>
</template>

<style scoped src="./order-detail-drawer.css" />
