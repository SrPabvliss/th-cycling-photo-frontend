<script setup lang="ts">
import { NIcon } from 'naive-ui'
import {
  ImageOutline,
  ChatbubblesOutline,
  CardOutline,
  CloudDownloadOutline,
} from '@vicons/ionicons5'

import { formatDate } from '@/shared/utils/date.utils'
import type { IPreviewPhoto } from '../../../types/responses/preview-data.response'

defineProps<{
  eventName: string
  eventDate: Date
  selectedPhotos: IPreviewPhoto[]
  photoCount: number
}>()
</script>

<template>
  <div class="cf-summary">
    <p class="cf-section-label">Tu selección</p>

    <div class="cf-photos">
      <div v-for="photo in selectedPhotos" :key="photo.id" class="cf-photo-tile">
        <img :src="photo.url" alt="" />
      </div>
    </div>

    <div class="cf-count-chip">
      <span class="cf-count-chip__label">Fotos seleccionadas</span>
      <span class="cf-count-chip__num">{{ photoCount }}</span>
    </div>

    <div class="cf-event-card">
      <div class="cf-event-row">
        <span class="cf-event-row__label">Evento</span>
        <span class="cf-event-row__value">{{ eventName }}</span>
      </div>
      <div class="cf-event-row">
        <span class="cf-event-row__label">Fecha</span>
        <span class="cf-event-row__value">{{ formatDate(eventDate) }}</span>
      </div>
      <div class="cf-event-row cf-event-row--last">
        <span class="cf-event-row__label">Fotógrafo</span>
        <span class="cf-event-row__value">Titan TV</span>
      </div>
    </div>

    <div class="cf-promises">
      <div class="cf-promise">
        <NIcon :component="ImageOutline" :size="14" color="#18a058" />
        <span>Alta resolución, sin marcas de agua</span>
      </div>
      <div class="cf-promise">
        <NIcon :component="ChatbubblesOutline" :size="14" color="#18a058" />
        <span>Contacto vía WhatsApp en menos de 24h</span>
      </div>
      <div class="cf-promise">
        <NIcon :component="CardOutline" :size="14" color="#18a058" />
        <span>Pago por transferencia o depósito</span>
      </div>
      <div class="cf-promise">
        <NIcon :component="CloudDownloadOutline" :size="14" color="#18a058" />
        <span>Entrega digital inmediata tras el pago</span>
      </div>
    </div>
  </div>
</template>

<style scoped src="./order-summary.css" />
