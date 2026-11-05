<script setup lang="ts">
import { computed } from 'vue'
import { NButton, NResult, NSpin } from 'naive-ui'

import DetailDrawer from '@/shared/components/DetailDrawer/DetailDrawer.vue'
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

const title = computed(() =>
  order.value ? `Pedido · ${formatDateTime(order.value.createdAt)}` : 'Pedido',
)

function close() {
  emit('close')
}
</script>

<template>
  <DetailDrawer show :title="title" :padded="false" data-test="order-detail-drawer" @close="close">
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
  </DetailDrawer>
</template>

<style scoped src="./order-detail-drawer.css" />
