<script setup lang="ts">
import { computed } from 'vue'
import { NCard, NFlex, NIcon } from 'naive-ui'
import { CalendarOutline, LocationOutline } from '@vicons/ionicons5'

import { formatDate } from '@/shared/utils/date.utils'
import { formatLocation } from '@/shared/utils/location.utils'
import type { IEventDetail } from '../../../types/responses/event-detail.response'

const props = defineProps<{
  event: IEventDetail
}>()

const displayLocation = computed(() => formatLocation(props.event) ?? 'Sin ubicación')
</script>

<template>
  <NCard :segmented="{ content: true }">
    <template #header>
      <div>
        <div class="info-card__title">Información del Evento</div>
        <p class="info-card__subtitle">Detalles generales de la competencia</p>
      </div>
    </template>
    <NFlex vertical :size="20">
      <NFlex align="start" :size="12">
        <div class="info-item__icon">
          <NIcon :component="CalendarOutline" :size="18" />
        </div>
        <div>
          <p class="info-item__label">Fecha</p>
          <p class="info-item__value">{{ formatDate(event.date) }}</p>
        </div>
      </NFlex>
      <NFlex align="start" :size="12">
        <div class="info-item__icon">
          <NIcon :component="LocationOutline" :size="18" />
        </div>
        <div>
          <p class="info-item__label">Ubicación</p>
          <p class="info-item__value">{{ displayLocation }}</p>
        </div>
      </NFlex>
    </NFlex>
  </NCard>
</template>

<style scoped src="./event-info-card.css"></style>
