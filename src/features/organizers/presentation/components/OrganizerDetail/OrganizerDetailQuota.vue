<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { NIcon } from 'naive-ui'
import { differenceInCalendarDays } from 'date-fns'
import { BanOutline } from '@vicons/ionicons5'

import { formatDate, parseDateOnly } from '@/shared/utils/date.utils'
import type { IOrganizerDetail } from '../../../types/responses/organizer-detail.response'
import { getTone, perLabel } from './organizer-detail.utils'

const QUOTA_STEP = 50

const props = withDefaults(
  defineProps<{
    organizer: IOrganizerDetail
    canEditQuota?: boolean
    showSummary?: boolean
    showSettings?: boolean
  }>(),
  { canEditQuota: false, showSummary: true, showSettings: true },
)

const emit = defineEmits<{
  'update-quota': [value: number | null]
}>()

const quotaValue = ref<number | null>(props.organizer.defaultEventPhotoQuota)

watch(
  () => props.organizer.defaultEventPhotoQuota,
  (value) => {
    quotaValue.value = value
  },
)

function commitQuota(value: number | null) {
  quotaValue.value = value
  emit('update-quota', value)
}

function decrementQuota() {
  const current = quotaValue.value ?? QUOTA_STEP
  commitQuota(Math.max(0, current - QUOTA_STEP))
}

function incrementQuota() {
  commitQuota((quotaValue.value ?? 0) + QUOTA_STEP)
}

const tone = computed(() => getTone(props.organizer.state))

const capacityPercent = computed(() =>
  props.organizer.totalCapacity
    ? Math.round((props.organizer.usedCapacity / props.organizer.totalCapacity) * 100)
    : 100,
)

const nextExpiryLabel = computed(() =>
  props.organizer.nextExpiry ? formatDate(parseDateOnly(props.organizer.nextExpiry)) : null,
)

const daysToExpiry = computed(() => {
  if (!props.organizer.nextExpiry) return null
  return differenceInCalendarDays(parseDateOnly(props.organizer.nextExpiry), new Date())
})

const lastEventLabel = computed(() =>
  props.organizer.lastEventAt ? formatDate(props.organizer.lastEventAt) : '—',
)
</script>

<template>
  <template v-if="showSummary">
    <div class="od-capbig" :class="`od-capbig--${tone}`">
      <div class="od-capbig__main">
        <span class="od-capbig__l">Cupo disponible</span>
        <span class="od-capbig__v"
          >{{ organizer.available }}<em>de {{ organizer.totalCapacity }} eventos</em></span
        >
        <div class="od-bar">
          <i :class="`od-tone-bg--${tone}`" :style="{ width: capacityPercent + '%' }" />
        </div>
        <span class="od-capbig__n">
          {{ organizer.usedCapacity }} consumidos en {{ organizer.validContractCount }} contrato{{
            organizer.validContractCount === 1 ? '' : 's'
          }}
          vigente{{ organizer.validContractCount === 1 ? '' : 's' }}
        </span>
      </div>
      <div class="od-capbig__side">
        <div>
          <b>{{ nextExpiryLabel ?? '—' }}</b>
          <span>{{ nextExpiryLabel ? `Vence en ${daysToExpiry} d` : 'Sin contrato vigente' }}</span>
        </div>
        <div>
          <b>{{ perLabel(organizer.photosPerEventInUse) }}</b>
          <span>Fotos/evento · contrato en uso</span>
        </div>
        <div v-if="organizer.lostSlots > 0">
          <b class="od-tone--red">{{ organizer.lostSlots }}</b>
          <span>Cupos perdidos</span>
        </div>
      </div>
    </div>

    <div class="od-minis">
      <div class="od-mini">
        <span class="od-mini__v">{{ organizer.eventCount }}</span>
        <span class="od-mini__l">Eventos creados</span>
      </div>
      <div class="od-mini">
        <span class="od-mini__v">{{ lastEventLabel }}</span>
        <span class="od-mini__l">Último evento</span>
      </div>
      <div class="od-mini">
        <span class="od-mini__v">{{ organizer.contracts.length }}</span>
        <span class="od-mini__l">Contratos</span>
      </div>
    </div>

    <div v-if="organizer.state === 'no_quota'" class="od-notice">
      <NIcon :component="BanOutline" :size="16" />
      <div>
        <b>No puede crear eventos ahora mismo.</b>
        <span>Necesita un contrato nuevo con cupo para volver a publicar.</span>
      </div>
    </div>
  </template>

  <section v-if="showSettings" class="od-sec od-sec--last">
    <h4>Ajustes</h4>
    <div class="od-set">
      <div class="od-set__txt">
        <b>Fotos por evento por defecto</b>
        <span
          >Se aplica a los eventos nuevos de este organizador. No cambia los contratos ya
          emitidos.</span
        >
      </div>
      <div v-if="canEditQuota" class="od-stepper">
        <button type="button" @click="decrementQuota">−</button>
        <span class="od-stepper__value">{{ perLabel(quotaValue) }}</span>
        <button type="button" @click="incrementQuota">+</button>
      </div>
      <span v-else class="od-set__value">{{ perLabel(organizer.defaultEventPhotoQuota) }}</span>
    </div>
    <p class="od-readonly">
      Lo demás es de solo lectura: identidad, marca de agua y formas de pago las administra el
      organizador.
    </p>
  </section>
</template>

<style scoped src="./organizer-detail-quota.css" />
