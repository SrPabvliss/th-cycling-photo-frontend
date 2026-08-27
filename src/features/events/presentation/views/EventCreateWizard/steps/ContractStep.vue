<script setup lang="ts">
import { computed, watchEffect } from 'vue'
import { useRouter } from 'vue-router'
import { NButton, NIcon } from 'naive-ui'
import { BanOutline, LogoWhatsapp, TimeOutline, WarningOutline } from '@vicons/ionicons5'
import { differenceInCalendarDays } from 'date-fns'

import { formatDate, parseDateOnly } from '@/shared/utils/date.utils'
import { useEventCreationContext } from '../../../../composables/queries/use-event-creation-context'
import { EVENT_ROUTE_NAMES } from '../../../../routes'
import { formatNumber } from '@/shared/utils/format.utils'

const emit = defineEmits<{
  'update:can-continue': [boolean]
}>()

const router = useRouter()
const { data } = useEventCreationContext()

const contract = computed(() => data.value?.contract ?? null)
const hasSlot = computed(() => data.value?.hasSlot ?? false)

const freeSlots = computed(() => {
  if (!contract.value) return 0
  return contract.value.eventsTotal - contract.value.eventsUsed
})

const tone = computed(() => {
  if (freeSlots.value === 0) return 'red'
  if (freeSlots.value === 1) return 'amber'
  return 'green'
})

const photosPerEventLabel = computed(() => {
  const photosPerEvent = contract.value?.photosPerEvent ?? null
  return photosPerEvent === null ? 'Sin límite' : formatNumber(photosPerEvent)
})

const photosPerEventNote = computed(() =>
  contract.value?.photosPerEvent === null
    ? 'Tu contrato no fija un máximo por evento'
    : 'Cupo de fotos que se fija al crear el evento',
)

const afterCreatingLabel = computed(() => {
  const remaining = freeSlots.value - 1
  return `Queda${remaining === 1 ? '' : 'n'} ${remaining}`
})

const formattedValidUntil = computed(() =>
  contract.value ? formatDate(parseDateOnly(contract.value.validUntil)) : '',
)

const daysToExpiry = computed(() => {
  if (!contract.value) return null
  return differenceInCalendarDays(parseDateOnly(contract.value.validUntil), new Date())
})

const expiresSoon = computed(() => daysToExpiry.value !== null && daysToExpiry.value < 30)

const isExpired = computed(() => daysToExpiry.value !== null && daysToExpiry.value < 0)

watchEffect(() => {
  emit('update:can-continue', hasSlot.value)
})

function goToEvents() {
  router.push({ name: EVENT_ROUTE_NAMES.LIST })
}
</script>

<template>
  <div class="contract-step">
    <div class="ce-sechead">
      <div>
        <h2>Tu contrato</h2>
        <p>Cada evento que creas consume un cupo de tu contrato aceptado.</p>
      </div>
    </div>

    <template v-if="hasSlot && contract">
      <div class="tt-capbig" :class="tone" data-test="contract-capbig">
        <div class="tt-capbig-main">
          <span class="tt-capbig-l">Cupos disponibles</span>
          <span class="tt-capbig-v"
            >{{ freeSlots }}<em>de {{ contract.eventsTotal }}</em></span
          >
          <span class="tt-capbig-n"
            >{{ contract.eventsUsed }} eventos creados con este contrato</span
          >
        </div>
        <div class="tt-capbig-side">
          <div>
            <span>Contrato con</span>
            <b>{{ contract.commercialName }}</b>
          </div>
          <div>
            <span>Vence</span>
            <b :class="{ red: expiresSoon }">{{ formattedValidUntil }}</b>
          </div>
        </div>
      </div>

      <div class="ce-facts">
        <div>
          <span class="tt-capbig-l">Fotos para este evento</span>
          <b>{{ photosPerEventLabel }}</b>
          <i>{{ photosPerEventNote }}</i>
        </div>
        <div>
          <span class="tt-capbig-l">Al crear el evento</span>
          <b>{{ afterCreatingLabel }}</b>
          <i>El cupo se consume al crear, no ahora</i>
        </div>
      </div>

      <div v-if="freeSlots === 1" class="tt-notice amber" data-test="last-slot-warning">
        <NIcon :component="WarningOutline" :size="18" />
        <div>
          <b>Es tu último cupo</b>
          Después de este evento necesitarás un contrato nuevo para crear otro.
        </div>
      </div>

      <p class="ce-frozen">
        <NIcon :component="TimeOutline" :size="14" />
        El cupo se descuenta recién cuando termines de crear el evento. Si otra pestaña usa el
        último cupo mientras estás aquí, te lo diremos antes de crear.
      </p>
    </template>

    <template v-else>
      <div v-if="contract" class="tt-capbig red" data-test="contract-capbig">
        <div class="tt-capbig-main">
          <span class="tt-capbig-l">Cupos disponibles</span>
          <span class="tt-capbig-v"
            >{{ freeSlots }}<em>de {{ contract.eventsTotal }}</em></span
          >
          <span class="tt-capbig-n"
            >{{ contract.eventsUsed }} eventos creados con este contrato</span
          >
        </div>
        <div class="tt-capbig-side">
          <div>
            <span>Contrato con</span>
            <b>{{ contract.commercialName }}</b>
          </div>
          <div>
            <span>{{ isExpired ? 'Venció' : 'Vence' }}</span>
            <b :class="{ red: expiresSoon }">{{ formattedValidUntil }}</b>
          </div>
        </div>
      </div>

      <div class="tt-notice red" data-test="no-slots-notice">
        <NIcon :component="BanOutline" :size="18" />
        <div v-if="isExpired">
          <b>No puedes crear un evento ahora</b>
          Tu contrato venció el {{ formattedValidUntil }}. Escríbenos para renovarlo y este paso se
          desbloquea.
        </div>
        <div v-else>
          <b>No puedes crear un evento ahora</b>
          Tu contrato no tiene cupos libres. Escríbenos para ampliarlo y este paso se desbloquea.
        </div>
      </div>
      <div class="ce-acts">
        <NButton type="primary" data-test="contact-titan">
          <template #icon><NIcon :component="LogoWhatsapp" :size="15" /></template>
          Escribir a Titan TV
        </NButton>
        <NButton data-test="back-to-events" @click="goToEvents">Volver a Eventos</NButton>
      </div>
    </template>
  </div>
</template>

<style scoped src="./contract-step.css" />
