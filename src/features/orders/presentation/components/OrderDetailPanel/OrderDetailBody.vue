<script setup lang="ts">
import { computed } from 'vue'
import { NIcon } from 'naive-ui'
import { LogoWhatsapp } from '@vicons/ionicons5'

import { formatCurrency } from '@/shared/utils/currency.utils'
import { formatDateTime, formatRelativeTime } from '@/shared/utils/date.utils'
import { formatWhatsAppNumber } from '@/shared/utils/phone.utils'
import { ORDER_STATUS } from '@/shared/types/order-status.types'
import type { IOrderDetail } from '../../../types/responses/order-detail.response'
import { getOrderStatusPresentation } from '../../../utils/order-status-presentation'
import {
  isPlatformRole,
  type OrderActionId,
  type OrderOperatorRole,
} from '../../../utils/order-actions'
import {
  getOrderAvatarInitials,
  getPaymentMethodLabel,
  shouldShowInternalNote,
} from '../../../utils/order-detail.utils'
import OrderTimeline from '../OrderTimeline/OrderTimeline.vue'
import OrderPhotosCarousel from '../OrderPhotosCarousel/OrderPhotosCarousel.vue'
import DeliveryLinkCard from '../DeliveryLinkCard/DeliveryLinkCard.vue'
import PayoutMethodsCard from '../PayoutMethodsCard/PayoutMethodsCard.vue'
import OrderDetailNotice from './OrderDetailNotice.vue'
import OrderDetailIdentity from './OrderDetailIdentity.vue'
import OrderDetailActions from './OrderDetailActions.vue'

const props = withDefaults(
  defineProps<{
    order: IOrderDetail
    role: OrderOperatorRole
    isRegenerating?: boolean
  }>(),
  {
    isRegenerating: false,
  },
)

const emit = defineEmits<{
  action: [id: OrderActionId]
  regenerateDelivery: []
  sendDeliveryWhatsApp: []
}>()

const isPlatform = computed(() => isPlatformRole(props.role))

const statusPresentation = computed(() =>
  getOrderStatusPresentation({ status: props.order.status, deliveredAt: props.order.deliveredAt }),
)

const avatarInitials = computed(() => getOrderAvatarInitials(props.order.userName))

const formattedContactPhone = computed(() =>
  props.order.snapWhatsapp ? formatWhatsAppNumber(props.order.snapWhatsapp) : null,
)

const showInternalNote = computed(() => shouldShowInternalNote(props.order))

const paymentMethodLabel = computed(() => getPaymentMethodLabel(props.order.paymentMethod))
</script>

<template>
  <div class="odp">
    <div class="odp__scroll">
      <div class="odp__hero">
        <div class="odp__hero-l">
          <span class="odp__avatar">{{ avatarInitials }}</span>
          <div class="odp__hero-identity">
            <b>{{ order.userName }}</b>
            <i>
              <NIcon v-if="formattedContactPhone" :component="LogoWhatsapp" :size="12" />
              {{ formattedContactPhone ?? 'sin WhatsApp registrado' }}
            </i>
          </div>
        </div>
        <div class="odp__hero-r">
          <span
            :class="[
              'odp__badge',
              `odp__badge--${statusPresentation.tone}`,
              { 'odp__badge--soft': statusPresentation.soft },
            ]"
          >
            {{ statusPresentation.label }}
            <i v-if="statusPresentation.suffix">{{ statusPresentation.suffix }}</i>
          </span>
          <b
            :class="{
              'odp__amount--gift': order.status === ORDER_STATUS.GIFTED,
              'odp__amount--off': order.status === ORDER_STATUS.CANCELLED,
            }"
          >
            {{ order.subtotal !== null ? formatCurrency(order.subtotal, order.snapCurrency) : '—' }}
          </b>
          <i>
            <template v-if="order.status === ORDER_STATUS.GIFTED"
              >valor de referencia, no cobrado</template
            >
            <template v-else-if="order.status === ORDER_STATUS.CANCELLED">no cobrado</template>
            <template v-else
              >{{ order.photos.length }} fotos · {{ formatDateTime(order.createdAt) }}</template
            >
          </i>
        </div>
      </div>

      <OrderDetailNotice :order="order" :role="role" />

      <section class="odp__sec">
        <h4>Avance del pedido</h4>
        <div class="odp__timeline-box">
          <OrderTimeline :order="order" show-dates />
        </div>
        <p v-if="showInternalNote" class="odp__note">Nota interna: {{ order.notes }}</p>
      </section>

      <section v-if="order.photos.length > 0" class="odp__sec">
        <h4>
          Fotos del pedido<span class="odp__count">{{ order.photos.length }}</span>
        </h4>
        <OrderPhotosCarousel :photos="order.photos" />
      </section>

      <section class="odp__sec">
        <h4>Entrega</h4>
        <DeliveryLinkCard
          v-if="order.deliveryLink"
          :delivery-link="order.deliveryLink"
          :is-regenerating="isRegenerating"
          @send-whats-app="emit('sendDeliveryWhatsApp')"
          @regenerate="emit('regenerateDelivery')"
        />
        <div v-else class="odp__empty">
          <span class="odp__empty-title">Todavía no hay enlace de entrega</span>
          <span class="odp__empty-sub"
            >Se genera al entregar las fotos. Antes de eso el comprador no tiene nada que
            descargar.</span
          >
        </div>
      </section>

      <section class="odp__sec">
        <h4>Datos del pedido</h4>
        <dl class="odp__dl">
          <div>
            <dt>Evento</dt>
            <dd>{{ order.eventName }}</dd>
          </div>
          <div v-if="isPlatform">
            <dt>Organizador</dt>
            <dd>{{ order.organizerName }}</dd>
          </div>
          <div>
            <dt>Método de pago</dt>
            <dd>
              {{ paymentMethodLabel }}
              <span v-if="!order.paymentMethod" class="odp__warn">aún sin elegir</span>
            </dd>
          </div>
          <div>
            <dt>Subtotal</dt>
            <dd>
              {{
                order.subtotal !== null ? formatCurrency(order.subtotal, order.snapCurrency) : '—'
              }}
            </dd>
          </div>
          <div>
            <dt>Pedido</dt>
            <dd>
              {{ formatDateTime(order.createdAt) }} · {{ formatRelativeTime(order.createdAt) }}
            </dd>
          </div>
          <div>
            <dt>Info enviada</dt>
            <dd>{{ order.notifiedAt ? formatDateTime(order.notifiedAt) : '—' }}</dd>
          </div>
          <div>
            <dt>Pago confirmado</dt>
            <dd>
              {{
                order.paidAt
                  ? formatDateTime(order.paidAt)
                  : order.status === ORDER_STATUS.GIFTED
                    ? 'no aplica · regalada'
                    : '—'
              }}
            </dd>
          </div>
          <div>
            <dt>Entrega</dt>
            <dd>{{ order.deliveredAt ? formatDateTime(order.deliveredAt) : '—' }}</dd>
          </div>
        </dl>

        <OrderDetailIdentity :order="order" />
      </section>

      <section v-if="order.payoutMethods?.length" class="odp__sec odp__sec--last">
        <h4>
          Cómo puede pagar<span class="odp__count">{{ order.payoutMethods.length }}</span>
        </h4>
        <PayoutMethodsCard :methods="order.payoutMethods" />
        <p class="odp__readonly">
          Son las cuentas de cobro del organizador. Se envían tal cual en el mensaje de info de
          pago.
        </p>
      </section>
    </div>

    <OrderDetailActions :order="order" :role="role" @action="emit('action', $event)" />
  </div>
</template>

<style scoped src="./order-detail-body.css" />
