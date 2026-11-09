<script setup lang="ts">
import { computed } from 'vue'
import { NIcon } from 'naive-ui'
import {
  AlertCircle,
  BagOutline,
  CalendarOutline,
  CheckmarkCircle,
  LocationOutline,
  LogoWhatsapp,
  Repeat,
  TimeOutline,
} from '@vicons/ionicons5'

import { calculateAge, formatDate, formatRelativeTime } from '@/shared/utils/date.utils'
import { getInitials, pluralize } from '@/shared/utils/format.utils'
import { formatWhatsAppNumber } from '@/shared/utils/phone.utils'
import {
  ORDER_STATUS_CONFIG,
  PAYMENT_METHOD_LABELS,
} from '@/shared/constants/status-config'
import { GENDER_LABELS } from '../../../constants/buyer-filters.constants'
import {
  BUYER_DETAIL_FALLBACKS,
  CONSENT_TYPE_LABELS,
} from '../../../constants/buyer-detail.constants'
import type { IBuyerDetail } from '../../../types/responses/buyer-detail.response'

const props = defineProps<{
  buyer: IBuyerDetail
}>()

const fullName = computed(() =>
  [props.buyer.firstName, props.buyer.lastName].filter(Boolean).join(' '),
)

const initials = computed(() =>
  getInitials(props.buyer.firstName, props.buyer.lastName, props.buyer.email),
)

const formattedPhone = computed(() =>
  props.buyer.primaryPhone ? formatWhatsAppNumber(props.buyer.primaryPhone) : null,
)

const isBuyer = computed(() => props.buyer.orderCount > 0)
const isRecurrent = computed(() => props.buyer.orderCount >= 2)

const location = computed(
  () =>
    [props.buyer.cityName, props.buyer.provinceName, props.buyer.countryName]
      .filter(Boolean)
      .join(', ') || BUYER_DETAIL_FALLBACKS.NO_LOCATION,
)

const age = computed(() => {
  const birthDate = props.buyer.birthDate
  if (!birthDate) return null
  return calculateAge(birthDate.getFullYear(), birthDate.getMonth() + 1, birthDate.getDate())
})

const genderLabel = computed(() => (props.buyer.gender ? GENDER_LABELS[props.buyer.gender] : null))

const profileLabel = computed(
  () =>
    [age.value ? `${age.value} años` : null, genderLabel.value].filter(Boolean).join(' · ') ||
    BUYER_DETAIL_FALLBACKS.NO_DATA,
)

const createdRelative = computed(() => formatRelativeTime(props.buyer.createdAt))
const createdDate = computed(() => formatDate(props.buyer.createdAt))
const lastLoginLabel = computed(() =>
  props.buyer.lastLoginAt ? formatDate(props.buyer.lastLoginAt) : BUYER_DETAIL_FALLBACKS.NEVER,
)

const unpaidNoOrdersLabel = computed(() => {
  const count = props.buyer.unpaidCount
  return `Tiene ${count} ${pluralize(count, 'pedido registrado', 'pedidos registrados')} que nunca pagó.`
})

function paymentMethodLabel(method: IBuyerDetail['orders'][number]['paymentMethod']): string {
  return method ? (PAYMENT_METHOD_LABELS[method] ?? '—') : '—'
}

function orderStatusLabel(status: IBuyerDetail['orders'][number]['status']): string {
  return ORDER_STATUS_CONFIG[status]?.label ?? status
}
</script>

<template>
  <div class="bd">
    <div class="bd-hero">
      <div class="bd-id">
        <span class="bd-ava" :class="{ 'bd-ava--muted': !isBuyer }">{{ initials }}</span>
        <div class="bd-id__txt">
          <div class="bd-id__name">
            <span v-if="fullName">{{ fullName }}</span>
            <span v-else class="bd-noname">{{ BUYER_DETAIL_FALLBACKS.NO_NAME }}</span>
            <span v-if="!buyer.isActive" class="bd-tag bd-tag--off">Desactivada</span>
          </div>
          <div class="bd-id__mail" :class="{ 'bd-id__mail--warn': !buyer.emailVerified }">
            <NIcon :component="buyer.emailVerified ? CheckmarkCircle : AlertCircle" :size="13" />
            <span class="bd-ellip">{{ buyer.email }}</span>
            <b v-if="!buyer.emailVerified">sin verificar</b>
          </div>
        </div>
      </div>
      <div class="bd-hero__tags">
        <span v-if="isRecurrent" class="bd-tag bd-tag--rec">
          <NIcon :component="Repeat" :size="12" />Recurrente ×{{ buyer.orderCount }}
        </span>
        <span v-else-if="isBuyer" class="bd-tag bd-tag--one">1 pedido</span>
        <span v-else class="bd-tag bd-tag--none">Sin compras</span>
        <span v-if="!buyer.isActive" class="bd-tag bd-tag--off">Cuenta desactivada</span>
      </div>
    </div>

    <div class="bd-minis">
      <div class="bd-mini">
        <span class="bd-mini__v bd-mini__v--green">${{ buyer.spent }}</span>
        <span class="bd-mini__l">Gastado</span>
      </div>
      <div class="bd-mini">
        <span class="bd-mini__v">{{ buyer.orderCount }}</span>
        <span class="bd-mini__l">Pedidos</span>
      </div>
      <div class="bd-mini">
        <span class="bd-mini__v">{{ buyer.photoCount }}</span>
        <span class="bd-mini__l">Fotos</span>
      </div>
      <div class="bd-mini">
        <span class="bd-mini__v">${{ buyer.averageTicket }}</span>
        <span class="bd-mini__l">Ticket prom.</span>
      </div>
      <div class="bd-mini">
        <span class="bd-mini__v">{{ buyer.eventCount }}</span>
        <span class="bd-mini__l">Eventos</span>
      </div>
      <div class="bd-mini">
        <span class="bd-mini__v" :class="{ 'bd-mini__v--amber': buyer.unpaidCount > 0 }">{{
          buyer.unpaidCount
        }}</span>
        <span class="bd-mini__l">Sin pagar</span>
      </div>
    </div>

    <section class="bd-sec">
      <h4>Contacto</h4>
      <dl class="bd-dl">
        <div>
          <dt>Correo</dt>
          <dd>
            {{ buyer.email }}
            <span v-if="buyer.emailVerified" class="bd-ok">verificado</span>
            <span v-else class="bd-warn">sin verificar</span>
          </dd>
        </div>
        <div>
          <dt>Teléfono</dt>
          <dd>
            {{ formattedPhone || '—' }}
            <span v-if="buyer.isWhatsapp" class="bd-ok"
              ><NIcon :component="LogoWhatsapp" :size="12" />WhatsApp</span
            >
          </dd>
        </div>
        <div>
          <dt>Ubicación</dt>
          <dd><NIcon :component="LocationOutline" :size="13" />{{ location }}</dd>
        </div>
        <div>
          <dt>Perfil</dt>
          <dd>{{ profileLabel }}</dd>
        </div>
        <div>
          <dt>Registro</dt>
          <dd>
            {{ createdDate }} <span class="bd-sub">({{ createdRelative }})</span>
          </dd>
        </div>
        <div>
          <dt>Último ingreso</dt>
          <dd><NIcon :component="TimeOutline" :size="13" />{{ lastLoginLabel }}</dd>
        </div>
      </dl>
    </section>

    <section class="bd-sec">
      <h4>
        Historial de pedidos <span class="bd-count">{{ buyer.orderCount }}</span>
      </h4>
      <div v-if="buyer.orders.length === 0" class="bd-empty">
        <span class="bd-empty__title">{{ BUYER_DETAIL_FALLBACKS.NO_ORDERS }}</span>
        <span class="bd-empty__sub">
          <NIcon :component="CalendarOutline" :size="13" />Se registró {{ createdRelative }} y nunca
          ha comprado.
          <span v-if="buyer.unpaidCount > 0" class="bd-empty__warn"
            ><NIcon :component="BagOutline" :size="13" />{{ unpaidNoOrdersLabel }}</span
          >
        </span>
      </div>
      <ul v-else class="bd-orders">
        <li v-for="order in buyer.orders" :key="order.id">
          <span class="bd-o__ev">{{ order.eventName }}</span>
          <span class="bd-o__meta">
            {{ formatDate(order.date) }} · {{ order.photoCount }}
            {{ pluralize(order.photoCount, 'foto', 'fotos') }} ·
            {{ paymentMethodLabel(order.paymentMethod) }}
          </span>
          <span class="bd-o__amt">${{ order.amount }}</span>
          <span :class="['bd-st', `bd-st--${order.status}`]">{{
            orderStatusLabel(order.status)
          }}</span>
        </li>
      </ul>
    </section>

    <section class="bd-sec bd-sec--last">
      <h4>Consentimientos</h4>
      <dl v-if="buyer.consents.length > 0" class="bd-dl">
        <div v-for="consent in buyer.consents" :key="`${consent.type}-${consent.policyVersion}`">
          <dt>{{ CONSENT_TYPE_LABELS[consent.type] ?? consent.type }}</dt>
          <dd>{{ consent.policyVersion }} · aceptado el {{ formatDate(consent.acceptedAt) }}</dd>
        </div>
      </dl>
      <p v-else class="bd-empty__sub">{{ BUYER_DETAIL_FALLBACKS.NO_CONSENTS }}</p>
      <p class="bd-readonly">
        {{ BUYER_DETAIL_FALLBACKS.READONLY_NOTICE }}
      </p>
    </section>
  </div>
</template>

<style scoped src="./buyer-detail-body.css" />
