<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { NButton, NIcon, NResult, NSpin, useMessage } from 'naive-ui'
import {
  LogoWhatsapp,
  MailOutline,
  CheckmarkOutline,
  CloseOutline,
  SendOutline,
  ChevronBack,
} from '@vicons/ionicons5'

import { env } from '@/core/config/env'
import { formatWhatsAppNumber } from '@/shared/utils/phone.utils'
import {
  buildDeliveryTemplate,
  buildPaymentInfoTemplate,
  openWhatsApp,
} from '@/shared/utils/whatsapp.utils'
import { ORDER_STATUS } from '../../types/responses/order-list.response'
import { useOrderDetailQuery } from '../../composables/queries/use-order-detail'
import { useNotifyPaymentInfo } from '../../composables/mutations/use-notify-payment-info'
import { useOrderActions } from '../../composables/use-order-actions'
import { ORDERS_PATH } from '../../routes'
import OrderHeroCard from '../components/OrderHeroCard/OrderHeroCard.vue'
import OrderPhotosCarousel from '../components/OrderPhotosCarousel/OrderPhotosCarousel.vue'
import DeliveryLinkCard from '../components/DeliveryLinkCard/DeliveryLinkCard.vue'

const route = useRoute()
const router = useRouter()

const orderId = computed(() => route.params.id as string)
const { data: order, isPending, isError, refetch } = useOrderDetailQuery(orderId)

const message = useMessage()
const { handleConfirmPayment, handleSendDelivery, handleCancel, handleRegenerate, isRegenerating } =
  useOrderActions()
const { mutateAsync: notifyPaymentInfo } = useNotifyPaymentInfo()

function onConfirmPayment() {
  if (order.value) handleConfirmPayment(order.value.id)
}

function onSendDelivery() {
  if (order.value) handleSendDelivery(order.value.id, order.value.snapWhatsapp ?? undefined)
}

function onCancel() {
  if (order.value) handleCancel(order.value.id, order.value.userName)
}

function onSendDeliveryWhatsApp() {
  if (!order.value?.deliveryLink) return
  const deliveryUrl = `${env.VITE_APP_BASE_URL}/delivery/${order.value.deliveryLink.token}`
  const msg = buildDeliveryTemplate({
    customerFirstName: order.value.snapFirstName ?? order.value.userName,
    photoCount: order.value.photos.length,
    deliveryUrl,
  })
  openWhatsApp(order.value.snapWhatsapp, msg)
}

async function onSendPaymentInfo() {
  if (!order.value) return
  try {
    await notifyPaymentInfo(order.value.id)
  } catch {
    message.error('No se pudo registrar el envío. Intenta de nuevo.')
    return
  }
  const msg = buildPaymentInfoTemplate({
    customerFirstName: order.value.snapFirstName ?? order.value.userName,
    photoCount: order.value.photos.length,
    eventName: order.value.eventName,
  })
  openWhatsApp(order.value.snapWhatsapp, msg)
}

function onRegenerate() {
  if (order.value) handleRegenerate(order.value.id, order.value.snapWhatsapp ?? undefined)
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
            <span class="od-crumb__cur">{{ order.userName }}</span>
          </span>
        </div>

        <div class="od-layout">
          <div class="od-main">
            <OrderHeroCard :order="order" />
            <OrderPhotosCarousel :photos="order.photos" />

            <!-- Retouch progress -->
            <div v-if="order.retouchProgress" class="od-retouch">
              <div class="od-retouch__header">
                <span class="od-retouch__label">Retoque</span>
                <span class="od-retouch__count">
                  {{ order.retouchProgress.retouched }}/{{ order.retouchProgress.total }} retocadas
                </span>
              </div>
              <div class="od-retouch__bar">
                <div
                  class="od-retouch__fill"
                  :style="{
                    width: `${(order.retouchProgress.retouched / order.retouchProgress.total) * 100}%`,
                  }"
                />
              </div>
              <p
                v-if="
                  order.status === 'paid' &&
                  order.retouchProgress.retouched < order.retouchProgress.total
                "
                class="od-retouch__warning"
              >
                {{ order.retouchProgress.total - order.retouchProgress.retouched }} foto{{
                  order.retouchProgress.total - order.retouchProgress.retouched !== 1 ? 's' : ''
                }}
                sin retocar. Si envías ahora, se entregarán las originales.
              </p>
            </div>

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
                  <span>{{
                    order.snapWhatsapp ? formatWhatsAppNumber(order.snapWhatsapp) : '—'
                  }}</span>
                </div>
                <div v-if="order.snapEmail" class="od-contact__row">
                  <div class="od-contact__icon od-contact__icon--mail">
                    <NIcon :component="MailOutline" :size="13" />
                  </div>
                  <span>{{ order.snapEmail }}</span>
                </div>
              </div>
            </div>

            <div
              v-if="
                order.status === ORDER_STATUS.PENDING ||
                order.status === ORDER_STATUS.PAYMENT_INFO_SENT
              "
              class="od-side-card"
            >
              <div class="od-side-card__title">Comunicación</div>
              <button class="od-status-btn od-status-btn--wa" @click="onSendPaymentInfo">
                <NIcon :component="LogoWhatsapp" :size="13" />
                {{
                  order.status === ORDER_STATUS.PAYMENT_INFO_SENT
                    ? 'Reenviar info de pago'
                    : 'Enviar info de pago'
                }}
              </button>
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
                        order.status !== ORDER_STATUS.PAYMENT_INFO_SENT &&
                        order.status !== ORDER_STATUS.CANCELLED,
                    },
                  ]"
                  :disabled="
                    order.status !== ORDER_STATUS.PENDING &&
                    order.status !== ORDER_STATUS.PAYMENT_INFO_SENT
                  "
                  @click="onConfirmPayment"
                >
                  <NIcon :component="CheckmarkOutline" :size="13" />
                  {{
                    order.status === ORDER_STATUS.PENDING ||
                    order.status === ORDER_STATUS.PAYMENT_INFO_SENT
                      ? 'Confirmar pago'
                      : 'Pago confirmado ✓'
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
                  :disabled="
                    order.status !== ORDER_STATUS.PENDING &&
                    order.status !== ORDER_STATUS.PAYMENT_INFO_SENT
                  "
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
