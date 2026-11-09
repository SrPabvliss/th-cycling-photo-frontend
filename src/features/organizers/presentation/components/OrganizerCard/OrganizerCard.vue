<script setup lang="ts">
import { computed } from 'vue'
import { NIcon } from 'naive-ui'
import { differenceInCalendarDays } from 'date-fns'
import {
  AlertCircle,
  BanOutline,
  CalendarOutline,
  CheckmarkCircle,
  CheckmarkCircleOutline,
  ChevronForwardOutline,
  HourglassOutline,
  RefreshOutline,
} from '@vicons/ionicons5'

import { formatDate, parseDateOnly } from '@/shared/utils/date.utils'
import type { IOrganizerCard } from '../../../types/responses/organizer-list.response'

const props = defineProps<{
  organizer: IOrganizerCard
}>()

const emit = defineEmits<{
  open: [organizer: IOrganizerCard]
  renew: [organizer: IOrganizerCard]
}>()

const initials = computed(() =>
  props.organizer.name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join('')
    .toUpperCase(),
)

const tone = computed(() => {
  if (props.organizer.state === 'no_quota') return 'red'
  if (props.organizer.state === 'expiring') return 'amber'
  return 'green'
})

const capacityPercent = computed(() =>
  props.organizer.totalCapacity
    ? Math.round((props.organizer.usedCapacity / props.organizer.totalCapacity) * 100)
    : 100,
)

const capacityLabel = computed(() =>
  props.organizer.available === 0
    ? 'Sin cupo'
    : `${props.organizer.available} de ${props.organizer.totalCapacity} disponibles`,
)

const daysToExpiry = computed(() => {
  if (!props.organizer.nextExpiry) return null
  return differenceInCalendarDays(parseDateOnly(props.organizer.nextExpiry), new Date())
})

const nextExpiryLabel = computed(() =>
  props.organizer.nextExpiry ? formatDate(parseDateOnly(props.organizer.nextExpiry)) : null,
)

const isBlockedByConsumedContract = computed(
  () => props.organizer.state === 'no_quota' && props.organizer.nextExpiry !== null,
)

const isBlockedByExpiredContract = computed(
  () => props.organizer.state === 'no_quota' && props.organizer.nextExpiry === null,
)

const lastExpiryLabel = computed(() =>
  props.organizer.lastExpiry ? formatDate(parseDateOnly(props.organizer.lastExpiry)) : null,
)

const showPhotoBlock = computed(() => props.organizer.photosPerEventInUse !== null)

const photoLimitLabel = computed(() =>
  props.organizer.photosPerEventInUse == null
    ? 'Sin límite'
    : props.organizer.photosPerEventInUse.toLocaleString('de-DE'),
)

function handleOpen() {
  emit('open', props.organizer)
}

function handleRenew(e: Event) {
  e.stopPropagation()
  emit('renew', props.organizer)
}
</script>

<template>
  <article
    class="oc-card"
    :class="{ 'oc-card--blocked': organizer.state === 'no_quota' }"
    @click="handleOpen"
  >
    <div class="oc-card__top">
      <div class="oc-id">
        <span class="oc-ava">{{ initials }}</span>
        <div class="oc-id__txt">
          <div class="oc-id__name">{{ organizer.name }}</div>
          <div class="oc-id__holder">
            <span class="oc-ellip">{{ organizer.holderName }}</span>
            <i>·</i>
            <span
              class="oc-mailbit"
              :class="{ 'ic-mailbit--warn': !organizer.holderEmailVerified }"
            >
              <NIcon
                :component="organizer.holderEmailVerified ? CheckmarkCircle : AlertCircle"
                :size="12"
              />
              <span class="oc-ellip">{{ organizer.holderEmail }}</span>
            </span>
          </div>
        </div>
      </div>
      <span v-if="organizer.state === 'no_quota'" class="oc-tag oc-tag--sin">
        <NIcon :component="BanOutline" :size="12" />Sin cupo
      </span>
      <span v-else-if="organizer.state === 'expiring'" class="oc-tag oc-tag--venc">
        <NIcon :component="HourglassOutline" :size="12" />Por vencer · {{ daysToExpiry }} d
      </span>
      <span v-else class="oc-tag oc-tag--act">
        <NIcon :component="CheckmarkCircleOutline" :size="12" />Activo
      </span>
    </div>

    <div class="oc-cap">
      <div class="oc-cap__head">
        <span>Cupo de eventos</span>
        <b :class="'oc-tone--' + tone">{{ capacityLabel }}</b>
      </div>
      <div class="oc-bar">
        <i :class="'oc-tone-bg--' + tone" :style="{ width: capacityPercent + '%' }" />
      </div>
      <div v-if="organizer.available > 0" class="oc-cap__foot">
        <span><NIcon :component="CalendarOutline" :size="12" />Vence {{ nextExpiryLabel }}</span>
      </div>
      <div v-if="showPhotoBlock" class="oc-cap__photos">
        <span>Fotos por evento</span>
        <b>{{ photoLimitLabel }}<i v-if="organizer.photoLimitsDiffer">contrato en uso</i></b>
      </div>
    </div>

    <div v-if="organizer.state === 'no_quota'" class="oc-blocked">
      <NIcon :component="BanOutline" :size="14" />
      <div class="oc-blocked__txt">
        <span v-if="isBlockedByConsumedContract">
          Consumió los {{ organizer.totalCapacity }} eventos del contrato vigente.
        </span>
        <span v-else-if="isBlockedByExpiredContract">
          El último contrato venció el {{ lastExpiryLabel }}.
          <i v-if="organizer.lostSlots > 0">
            Perdió {{ organizer.lostSlots }} {{ organizer.lostSlots === 1 ? 'cupo' : 'cupos' }} no
            utilizados.
          </i>
        </span>
      </div>
    </div>

    <div class="oc-foot">
      <button type="button" class="oc-ghost" @click="handleRenew">
        <NIcon :component="RefreshOutline" :size="12" />Renovar contrato
      </button>
      <button type="button" class="oc-view" @click="handleOpen">
        Ver organizador <NIcon :component="ChevronForwardOutline" :size="12" />
      </button>
    </div>
  </article>
</template>

<style scoped src="./organizer-card.css" />
