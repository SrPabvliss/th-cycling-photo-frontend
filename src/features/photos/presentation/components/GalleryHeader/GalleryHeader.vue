<script setup lang="ts">
import { useRouter } from 'vue-router'
import { NButton, NIcon } from 'naive-ui'
import {
  BusinessOutline,
  CalendarOutline,
  ChevronForwardOutline,
  CloudUploadOutline,
  CheckmarkOutline,
  CubeOutline,
  ImageOutline,
  SnowOutline,
} from '@vicons/ionicons5'

import { formatDate } from '@/shared/utils/date.utils'
import { EVENT_ROUTE_NAMES } from '@/features/events/routes'
import type { IEventDetail } from '@/features/events/types/responses/event-detail.response'
import { formatNumber } from '@/shared/utils/format.utils'

const props = defineProps<{
  event: IEventDetail
  eventSlug: string
  canReview: boolean
}>()

defineEmits<{
  upload: []
  review: []
}>()

const router = useRouter()

function goToEventList() {
  router.push({ name: EVENT_ROUTE_NAMES.LIST })
}

function goToEventDetail() {
  router.push({ name: EVENT_ROUTE_NAMES.DETAIL, params: { slug: props.eventSlug } })
}
</script>

<template>
  <div class="gp-head">
    <div class="gp-head-t">
      <div class="ev-dcrumb">
        <button type="button" data-test="gallery-header-crumb-events" @click="goToEventList">
          Eventos
        </button>
        <NIcon :component="ChevronForwardOutline" :size="11" />
        <button type="button" data-test="gallery-header-crumb-event" @click="goToEventDetail">
          {{ event.name }}
        </button>
      </div>
      <h1>Galería del evento</h1>
      <div class="ev-dmeta">
        <span>
          <NIcon :component="ImageOutline" :size="13" />
          <b>{{ formatNumber(event.photoCount) }}</b> fotos en línea
        </span>
        <span>
          <NIcon :component="CalendarOutline" :size="13" />
          <span v-if="event.startDate.getTime() === event.endDate.getTime()">
            {{ formatDate(event.startDate) }}
          </span>
          <span v-else>{{ formatDate(event.startDate) }} – {{ formatDate(event.endDate) }}</span>
        </span>
        <span v-if="event.provinceName || event.cantonName">
          <NIcon :component="BusinessOutline" :size="13" />
          {{ [event.cantonName, event.provinceName].filter(Boolean).join(', ') }}
        </span>
        <span v-if="event.photoQuota !== null" class="dt-upd">
          <NIcon :component="CubeOutline" :size="13" />
          <b>{{ formatNumber(event.photosUploaded) }}</b> de
          <b>{{ formatNumber(event.photoQuota) }}</b> del cupo consumidas
        </span>
      </div>
    </div>
    <div class="gp-head-actions">
      <span v-if="event.isFrozen" class="dt-blocked">
        <NIcon :component="SnowOutline" :size="13" />
        Congelado · sin cambios
      </span>
      <NButton v-else type="primary" data-test="gallery-header-upload" @click="$emit('upload')">
        <template #icon><NIcon :component="CloudUploadOutline" /></template>
        Subir fotos
      </NButton>
      <NButton v-if="canReview" data-test="gallery-header-review" @click="$emit('review')">
        <template #icon><NIcon :component="CheckmarkOutline" /></template>
        Revisar dorsales
      </NButton>
    </div>
  </div>
</template>

<style scoped src="./gallery-header.css" />
