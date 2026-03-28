<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { NButton, NIcon, NResult, NSpin } from 'naive-ui'
import {
  LogoWhatsapp,
  MailOutline,
  CheckmarkOutline,
  CloseOutline,
  SendOutline,
  ChevronBack,
} from '@vicons/ionicons5'

import { formatWhatsAppNumber } from '@/shared/utils/phone.utils'
import { openWhatsApp } from '@/shared/utils/whatsapp.utils'
import { ORDER_STATUS } from '../../types/responses/order-list.response'
import { useOrderDetailQuery } from '../../composables/queries/use-order-detail'
import { useOrderActions } from '../../composables/use-order-actions'
import { ORDERS_PATH } from '../../routes'
import OrderHeroCard from '../components/OrderHeroCard/OrderHeroCard.vue'
import OrderPhotosCarousel from '../components/OrderPhotosCarousel/OrderPhotosCarousel.vue'
import DeliveryLinkCard from '../components/DeliveryLinkCard/DeliveryLinkCard.vue'

const route = useRoute()
const router = useRouter()

const orderId = computed(() => route.params.id as string)
const { data: order, isPending, isError, refetch } = useOrderDetailQuery(orderId)

const { handleConfirmPayment, handleSendDelivery, handleCancel, handleRegenerate, isRegenerating } =
  useOrderActions()

function onConfirmPayment() {
  if (order.value) handleConfirmPayment(order.value.id)
}

function onSendDelivery() {
  if (order.value) handleSendDelivery(order.value.id, order.value.customer.whatsapp)
}

function onCancel() {
  if (order.value) handleCancel(order.value.id, order.value.customer.firstName)
}

function onSendDeliveryWhatsApp() {
  if (!order.value?.deliveryLink) return
  const deliveryUrl = `${window.location.origin}/delivery/${order.value.deliveryLink.token}`
  const msg = `¡Hola ${order.value.customer.firstName}! ✅ Aquí tienes tus ${order.value.photos.length} fotos en alta calidad: ${deliveryUrl}. El link estará disponible por 7 días. ¡Gracias! 🎉`
  openWhatsApp(order.value.customer.whatsapp, msg)
}

function onRegenerate() {
  if (order.value) handleRegenerate(order.value.id, order.value.customer.whatsapp)
}
</script>

<template>
  <div class="page-view">
    <div class="page-view__content">
      <div v-if="isPending" class="od-loading">
        <NSpin size="large" />
      </div>

      <NResult v-else-if="isError" status="error" title="Error al cargar pedido">
        <template #footer>
          <NButton @click="refetch()">Reintentar</NButton>
        </template>
      </NResult>

      <template v-else-if="order">
        <!-- Breadcrumb -->
        <div class="od-crumb">
          <button class="od-crumb__back" @click="router.push(ORDERS_PATH)">
            <NIcon :component="ChevronBack" :size="14" />
          </button>
          <span class="od-crumb__text">
            Pedidos
            <span class="od-crumb__sep">/</span>
            <span class="od-crumb__cur"
              >{{ order.customer.firstName }} {{ order.customer.lastName }}</span
            >
          </span>
        </div>

        <div class="od-layout">
          <div class="od-main">
            <OrderHeroCard :order="order" />
            <OrderPhotosCarousel :photos="order.photos" />
            <DeliveryLinkCard
              v-if="order.deliveryLink"
              :delivery-link="order.deliveryLink"
              :is-regenerating="isRegenerating"
              @send-whats-app="onSendDeliveryWhatsApp"
              @regenerate="onRegenerate"
            />
          </div>

          <!-- Sidebar -->
          <div class="od-side">
            <div class="od-side-card">
              <div class="od-side-card__title">Contacto</div>
              <div class="od-contact">
                <div class="od-contact__row">
                  <div class="od-contact__icon od-contact__icon--wa">
                    <NIcon :component="LogoWhatsapp" :size="13" />
                  </div>
                  <span>{{ formatWhatsAppNumber(order.customer.whatsapp) }}</span>
                </div>
                <div v-if="order.customer.email" class="od-contact__row">
                  <div class="od-contact__icon od-contact__icon--mail">
                    <NIcon :component="MailOutline" :size="13" />
                  </div>
                  <span>{{ order.customer.email }}</span>
                </div>
              </div>
            </div>

            <div class="od-side-card">
              <div class="od-side-card__title">Estado del pedido</div>
              <div class="od-status-list">
                <button
                  :class="[
                    'od-status-btn',
                    {
                      'od-status-btn--current':
                        order.status !== ORDER_STATUS.PENDING &&
                        order.status !== ORDER_STATUS.CANCELLED,
                    },
                  ]"
                  :disabled="order.status !== ORDER_STATUS.PENDING"
                  @click="onConfirmPayment"
                >
                  <NIcon :component="CheckmarkOutline" :size="13" />
                  {{
                    order.status === ORDER_STATUS.PENDING ? 'Confirmar pago' : 'Pago confirmado ✓'
                  }}
                </button>
                <button
                  :class="[
                    'od-status-btn',
                    { 'od-status-btn--current': order.status === ORDER_STATUS.DELIVERED },
                  ]"
                  :disabled="order.status !== ORDER_STATUS.PAID"
                  @click="onSendDelivery"
                >
                  <NIcon :component="SendOutline" :size="13" />
                  {{ order.status === ORDER_STATUS.DELIVERED ? 'Entregado ✓' : 'Enviar fotos' }}
                </button>
                <button
                  :class="[
                    'od-status-btn',
                    'od-status-btn--cancel',
                    { 'od-status-btn--current-cancel': order.status === ORDER_STATUS.CANCELLED },
                  ]"
                  :disabled="order.status !== ORDER_STATUS.PENDING"
                  @click="onCancel"
                >
                  <NIcon :component="CloseOutline" :size="13" />
                  {{ order.status === ORDER_STATUS.CANCELLED ? 'Cancelado' : 'Cancelar pedido' }}
                </button>
              </div>
            </div>

            <div v-if="order.notes" class="od-side-card">
              <div class="od-side-card__title">Notas del cliente</div>
              <div class="od-notes">
                <span class="od-notes__label">Observación</span>
                {{ order.notes }}
              </div>
            </div>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<style scoped src="./order-detail-view.css" />
