<script setup lang="ts">
import { computed } from 'vue'
import { NIcon } from 'naive-ui'
import {
  AlertCircle,
  BagOutline,
  CalendarOutline,
  CallOutline,
  CheckmarkCircle,
  ChevronForward,
  LocationOutline,
  LogoWhatsapp,
  Repeat,
  TimeOutline,
} from '@vicons/ionicons5'

import { formatDate, formatRelativeTime } from '@/shared/utils/date.utils'
import { getInitials, pluralize } from '@/shared/utils/format.utils'
import { formatWhatsAppNumber } from '@/shared/utils/phone.utils'
import { BUYER_DETAIL_FALLBACKS } from '../../../constants/buyer-detail.constants'
import type { IBuyerListItem } from '../../../types/responses/buyer-list.response'

const props = defineProps<{
  buyer: IBuyerListItem
}>()

const emit = defineEmits<{
  open: []
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

const visibleEventNames = computed(() => props.buyer.eventNames.slice(0, 2))
const extraEventCount = computed(() => Math.max(props.buyer.eventCount - 2, 0))

const location = computed(
  () =>
    [props.buyer.cityName, props.buyer.provinceName].filter(Boolean).join(', ') ||
    props.buyer.countryName ||
    BUYER_DETAIL_FALLBACKS.NO_LOCATION,
)

const lastLoginLabel = computed(() =>
  props.buyer.lastLoginAt ? formatRelativeTime(props.buyer.lastLoginAt) : BUYER_DETAIL_FALLBACKS.NEVER,
)
const createdRelative = computed(() => formatRelativeTime(props.buyer.createdAt))
const createdDate = computed(() => formatDate(props.buyer.createdAt))
const lastOrderRelative = computed(() =>
  props.buyer.lastOrderAt ? formatRelativeTime(props.buyer.lastOrderAt) : '—',
)
const firstOrderDate = computed(() =>
  props.buyer.firstOrderAt ? formatDate(props.buyer.firstOrderAt) : '—',
)
const unpaidLabel = computed(
  () =>
    `${props.buyer.unpaidCount} ${pluralize(props.buyer.unpaidCount, 'pedido', 'pedidos')} sin pagar`,
)

function handleOpen() {
  emit('open')
}
</script>

<template>
  <article class="bc-card" @click="handleOpen">
    <div class="bc-card__top">
      <div class="bc-id">
        <span class="bc-ava" :class="{ 'bc-ava--muted': !isBuyer }">{{ initials }}</span>
        <div class="bc-id__txt">
          <div class="bc-id__name">
            <span v-if="fullName">{{ fullName }}</span>
            <span v-else class="bc-noname">{{ BUYER_DETAIL_FALLBACKS.NO_NAME }}</span>
            <span v-if="!buyer.isActive" class="bc-tag bc-tag--off">Desactivada</span>
          </div>
          <div class="bc-id__mail" :class="{ 'bc-id__mail--warn': !buyer.emailVerified }">
            <NIcon :component="buyer.emailVerified ? CheckmarkCircle : AlertCircle" :size="13" />
            <span class="bc-ellip">{{ buyer.email }}</span>
            <b v-if="!buyer.emailVerified">sin verificar</b>
          </div>
        </div>
      </div>
      <span v-if="isRecurrent" class="bc-tag bc-tag--rec">
        <NIcon :component="Repeat" :size="12" />Recurrente ×{{ buyer.orderCount }}
      </span>
      <span v-else-if="isBuyer" class="bc-tag bc-tag--one">1 pedido</span>
      <span v-else class="bc-tag bc-tag--none">Sin compras</span>
    </div>

    <div class="bc-body">
      <div v-if="isBuyer" class="bc-figures">
        <div class="bc-minis">
          <div class="bc-mini">
            <span class="bc-mini__v bc-mini__v--green">${{ buyer.spent }}</span>
            <span class="bc-mini__l">Gastado</span>
          </div>
          <div class="bc-mini">
            <span class="bc-mini__v">{{ buyer.orderCount }}</span>
            <span class="bc-mini__l">Pedidos</span>
          </div>
          <div class="bc-mini">
            <span class="bc-mini__v">{{ buyer.photoCount }}</span>
            <span class="bc-mini__l">Fotos</span>
          </div>
          <div class="bc-mini">
            <span class="bc-mini__v">{{ buyer.eventCount }}</span>
            <span class="bc-mini__l">Eventos</span>
          </div>
        </div>
        <div class="bc-evs">
          <span v-for="name in visibleEventNames" :key="name" class="bc-evchip">{{ name }}</span>
          <span v-if="extraEventCount > 0" class="bc-evchip bc-evchip--more"
            >+{{ extraEventCount }}</span
          >
        </div>
        <div class="bc-timeline">
          <NIcon :component="TimeOutline" :size="13" />
          <span>Última compra {{ lastOrderRelative }}</span>
          <i>·</i>
          <span>primera {{ firstOrderDate }}</span>
        </div>
      </div>
      <div v-else class="bc-empty-band">
        <span class="bc-empty-band__title"
          >Registrado {{ createdRelative }}, todavía no compra</span
        >
        <div class="bc-empty-band__rows">
          <span><NIcon :component="CalendarOutline" :size="13" />Registro {{ createdDate }}</span>
          <span
            ><NIcon :component="TimeOutline" :size="13" />Último ingreso {{ lastLoginLabel }}</span
          >
          <span v-if="buyer.unpaidCount > 0" class="bc-empty-band__warn">
            <NIcon :component="BagOutline" :size="13" />{{ unpaidLabel }}
          </span>
        </div>
      </div>
    </div>

    <div class="bc-foot">
      <div class="bc-contact">
        <span v-if="formattedPhone" class="bc-contact__item">
          <NIcon :component="buyer.isWhatsapp ? LogoWhatsapp : CallOutline" :size="14" />
          {{ formattedPhone }}
          <i v-if="buyer.isWhatsapp" class="bc-wa-tag">WhatsApp</i>
        </span>
        <span v-else class="bc-contact__item bc-contact__item--muted">
          <NIcon :component="CallOutline" :size="14" />Sin teléfono
        </span>
        <span class="bc-contact__item">
          <NIcon :component="LocationOutline" :size="14" />{{ location }}
        </span>
      </div>
      <button type="button" class="bc-ghost" @click.stop="handleOpen">
        Ver perfil
        <NIcon :component="ChevronForward" :size="13" />
      </button>
    </div>
  </article>
</template>

<style scoped src="./buyer-card.css" />
