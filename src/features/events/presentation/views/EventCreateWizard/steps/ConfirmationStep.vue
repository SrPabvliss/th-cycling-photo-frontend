<script setup lang="ts">
import { computed } from 'vue'
import { NButton, NIcon } from 'naive-ui'
import {
  AlertCircleOutline,
  CheckmarkCircleOutline,
  RemoveCircleOutline,
  WarningOutline,
} from '@vicons/ionicons5'

import type {
  EventWizardRole,
  IConfirmationResourceState,
} from '../../../../types/event-wizard.types'
import { formatNumber, pluralize } from '@/shared/utils/format.utils'

const props = defineProps<{
  eventName: string
  eventDateRangeLabel: string
  role: EventWizardRole
  slotsRemaining?: number | null
  photoQuota?: number | null
  coverImage: IConfirmationResourceState
  categories: IConfirmationResourceState
  profileSave?: IConfirmationResourceState
}>()

const emit = defineEmits<{
  retry: [target: 'coverImage' | 'categories']
  'go-to-event': []
  'create-another': []
}>()

const PENDING_WORDS: Record<number, string> = { 1: 'una', 2: 'dos' }

const profileSaveStatus = computed(() => props.profileSave?.status ?? 'skipped')

const failedCount = computed(
  () =>
    [props.coverImage.status, props.categories.status, profileSaveStatus.value].filter(
      (s) => s === 'bad',
    ).length,
)

const hasFailures = computed(() => failedCount.value > 0)

const heading = computed(() => {
  const count = failedCount.value
  if (count === 0) return 'Evento creado'
  const word = PENDING_WORDS[count] ?? String(count)
  const noun = pluralize(count, 'cosa pendiente', 'cosas pendientes')
  return `Evento creado, con ${word} ${noun}`
})

const photoQuotaLabel = computed(() =>
  props.photoQuota === null || props.photoQuota === undefined
    ? 'fotos sin límite'
    : `${formatNumber(props.photoQuota)} fotos`,
)

const slotSummary = computed(() => {
  const remaining = props.slotsRemaining ?? 0
  const verb = remaining === 1 ? 'Queda' : 'Quedan'
  const noun = pluralize(remaining, 'cupo', 'cupos')
  return `${verb} ${remaining} ${noun} en tu contrato y ${photoQuotaLabel.value} para este evento.`
})
</script>

<template>
  <div class="ce-done" data-test="confirmation-step">
    <span class="ce-done-ic" :class="{ warn: hasFailures }">
      <NIcon :component="hasFailures ? WarningOutline : CheckmarkCircleOutline" :size="26" />
    </span>
    <h2 data-test="confirmation-heading">{{ heading }}</h2>
    <p>{{ eventName }} · {{ eventDateRangeLabel }}</p>

    <ul class="ce-receipt">
      <li class="ok" data-test="line-event">
        <NIcon :component="CheckmarkCircleOutline" :size="16" />
        <span>
          <b>Evento creado</b>
          Ya existe en la plataforma con su configuración copiada dentro.
        </span>
      </li>

      <li class="ok" data-test="line-configuration">
        <NIcon :component="CheckmarkCircleOutline" :size="16" />
        <span>
          <b>Configuración guardada</b>
          Nombre público, marca de agua, WhatsApp, Payphone y transferencia.
        </span>
      </li>

      <li v-if="role === 'organizer'" class="ok" data-test="line-slot">
        <NIcon :component="CheckmarkCircleOutline" :size="16" />
        <span>
          <b>Cupo consumido</b>
          {{ slotSummary }}
        </span>
      </li>

      <li v-if="profileSaveStatus === 'ok'" class="ok" data-test="line-profile">
        <NIcon :component="CheckmarkCircleOutline" :size="16" />
        <span>
          <b>Perfil actualizado</b>
          Guardamos {{ profileSave?.detail }} en tu perfil para tus próximos eventos.
        </span>
      </li>
      <li v-else-if="profileSaveStatus === 'bad'" class="bad" data-test="line-profile">
        <NIcon :component="AlertCircleOutline" :size="16" />
        <span>
          <b>Tu perfil no se actualizó</b>
          No pudimos guardar {{ profileSave?.detail }} en tu perfil. El evento sí quedó con esos
          datos; puedes actualizar tu perfil cuando quieras.
        </span>
      </li>

      <li v-if="coverImage.status === 'ok'" class="ok" data-test="line-cover">
        <NIcon :component="CheckmarkCircleOutline" :size="16" />
        <span>
          <b>Portada subida</b>
          {{ coverImage.detail }}
        </span>
      </li>
      <li v-else-if="coverImage.status === 'skipped'" class="skip" data-test="line-cover">
        <NIcon :component="RemoveCircleOutline" :size="16" />
        <span>
          <b>Sin portada</b>
          No agregaste una imagen de portada. Puedes subirla cuando quieras desde el evento.
        </span>
      </li>
      <li v-else class="bad" data-test="line-cover">
        <NIcon :component="AlertCircleOutline" :size="16" />
        <span>
          <b>La portada no se subió</b>
          El evento quedó sin imagen de portada. Puedes subirla desde el evento.
        </span>
        <NButton size="small" data-test="retry-cover" @click="emit('retry', 'coverImage')">
          Reintentar
        </NButton>
      </li>

      <li v-if="categories.status === 'ok'" class="ok" data-test="line-categories">
        <NIcon :component="CheckmarkCircleOutline" :size="16" />
        <span>
          <b>Categorías creadas</b>
          {{ categories.detail }}
        </span>
      </li>
      <li v-else-if="categories.status === 'skipped'" class="skip" data-test="line-categories">
        <NIcon :component="RemoveCircleOutline" :size="16" />
        <span>
          <b>Sin categorías de foto</b>
          No elegiste categorías. Puedes crearlas desde la galería del evento.
        </span>
      </li>
      <li v-else class="bad" data-test="line-categories">
        <NIcon :component="AlertCircleOutline" :size="16" />
        <span>
          <b>Las categorías de foto no se guardaron</b>
          Se pueden crear desde la galería del evento.
        </span>
        <NButton size="small" data-test="retry-categories" @click="emit('retry', 'categories')">
          Reintentar
        </NButton>
      </li>
    </ul>

    <div class="ce-acts">
      <NButton type="primary" @click="emit('go-to-event')">Ir al evento</NButton>
      <NButton @click="emit('create-another')">Crear otro evento</NButton>
    </div>
  </div>
</template>

<style scoped src="./confirmation-step.css" />
