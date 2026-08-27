<script setup lang="ts">
import { computed, ref } from 'vue'
import { NButton, NIcon, NResult, NSpin } from 'naive-ui'
import { CloseOutline } from '@vicons/ionicons5'

import { formatDateTime } from '@/shared/utils/date.utils'
import { useOrderDetailPanel } from '../../../composables/use-order-detail-panel'
import type { OrderOperatorRole } from '../../../utils/order-actions'
import OrderDetailBody from './OrderDetailBody.vue'

const DRAG_CLOSE_THRESHOLD = 110
const SCRIM_FADE_DISTANCE = 320

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

const dragOffset = ref(0)
const dragStartY = ref<number | null>(null)

const sheetStyle = computed(() => ({ transform: `translateY(${dragOffset.value}px)` }))
const scrimStyle = computed(() => ({
  opacity: String(Math.max(0, 1 - dragOffset.value / SCRIM_FADE_DISTANCE)),
}))

function onGrabPointerDown(event: PointerEvent) {
  dragStartY.value = event.clientY
  ;(event.currentTarget as HTMLElement).setPointerCapture(event.pointerId)
}

function onGrabPointerMove(event: PointerEvent) {
  if (dragStartY.value === null) return
  dragOffset.value = Math.max(0, event.clientY - dragStartY.value)
}

function onGrabPointerUp() {
  if (dragOffset.value > DRAG_CLOSE_THRESHOLD) {
    close()
  }
  dragOffset.value = 0
  dragStartY.value = null
}
</script>

<template>
  <div class="ods">
    <div class="ods__scrim" :style="scrimStyle" @click="close" />
    <section class="ods__sheet" :style="sheetStyle" data-test="order-detail-sheet">
      <div
        class="ods__grab"
        @pointerdown="onGrabPointerDown"
        @pointermove="onGrabPointerMove"
        @pointerup="onGrabPointerUp"
        @pointercancel="onGrabPointerUp"
      >
        <span class="ods__grab-handle" />
      </div>

      <header class="ods__head">
        <div>
          <b>Pedido</b>
          <span>{{ order ? formatDateTime(order.createdAt) : '' }}</span>
        </div>
        <button class="ods__close" @click="close">
          <NIcon :component="CloseOutline" :size="14" />
          Cerrar
        </button>
      </header>

      <div v-if="isPending" class="ods__state">
        <NSpin size="large" />
      </div>

      <NResult v-else-if="isError" class="ods__state" status="error" title="Error al cargar pedido">
        <template #footer>
          <NButton @click="refetch()">Reintentar</NButton>
        </template>
      </NResult>

      <OrderDetailBody
        v-else-if="order"
        class="ods__body"
        :order="order"
        :role="role"
        :is-regenerating="isRegenerating"
        @action="onAction"
        @regenerate-delivery="onRegenerateDelivery"
        @send-delivery-whats-app="onSendDeliveryWhatsApp"
      />
    </section>
  </div>
</template>

<style scoped src="./order-detail-sheet.css" />
