<script setup lang="ts">
import { useRouter } from 'vue-router'
import { NButton, NFlex, NIcon, NTag, NTooltip, useMessage } from 'naive-ui'
import { CreateOutline, CloudUploadOutline, GridOutline, DownloadOutline } from '@vicons/ionicons5'

import { formatDate, formatRelativeTime } from '@/shared/utils/date.utils'
import { CLASSIFICATION_ROUTE_NAMES } from '@/features/classifications/routes'
import { PHOTO_ROUTE_NAMES } from '@/features/photos/routes'
import { useDownloadZip } from '@/features/photos/composables/mutations/use-download-zip'
import { EVENT_ROUTE_NAMES } from '../../../routes'
import { EVENT_STATUS_CONFIG } from '../../../constants/status-config'
import type { IEventDetail } from '../../../types/responses/event-detail.response'

const props = defineProps<{
  event: IEventDetail
  eventId: string
}>()

const router = useRouter()
const message = useMessage()
const { downloadZip, isDownloading, progress } = useDownloadZip()

async function handleDownloadZip() {
  try {
    await downloadZip(props.eventId, props.event.name)
    message.success('ZIP descargado correctamente')
  } catch {
    message.error('Error al descargar el ZIP')
  }
}
</script>

<template>
  <NFlex justify="space-between" align="start" :size="16" wrap style="margin-bottom: 32px">
    <div>
      <NFlex align="center" :size="12" style="margin-bottom: 4px">
        <h1 class="event-header__title">{{ event.name }}</h1>
        <NTag :type="EVENT_STATUS_CONFIG[event.status].type" size="small" round>
          {{ EVENT_STATUS_CONFIG[event.status].label }}
        </NTag>
      </NFlex>
      <p class="event-header__subtitle">
        {{ formatDate(event.date) }} · Actualizado {{ formatRelativeTime(event.updatedAt) }}
      </p>
    </div>
    <NFlex :size="10">
      <NButton @click="router.push({ name: EVENT_ROUTE_NAMES.EDIT, params: { id: eventId } })">
        <template #icon><NIcon :component="CreateOutline" /></template>
        Editar evento
      </NButton>
      <NTooltip :disabled="event.photoCount > 0">
        <template #trigger>
          <NButton
            :disabled="event.photoCount === 0"
            @click="
              router.push({ name: CLASSIFICATION_ROUTE_NAMES.WORKSPACE, params: { eventId } })
            "
          >
            <template #icon><NIcon :component="GridOutline" /></template>
            Clasificar
          </NButton>
        </template>
        No hay fotos para clasificar
      </NTooltip>
      <NTooltip :disabled="event.photoCount > 0">
        <template #trigger>
          <NButton
            :disabled="event.photoCount === 0"
            :loading="isDownloading"
            @click="handleDownloadZip"
          >
            <template #icon><NIcon :component="DownloadOutline" /></template>
            {{ isDownloading ? `ZIP ${progress}%` : 'Descargar ZIP' }}
          </NButton>
        </template>
        No hay fotos para descargar
      </NTooltip>
      <NButton
        type="primary"
        @click="router.push({ name: PHOTO_ROUTE_NAMES.UPLOAD, params: { eventId } })"
      >
        <template #icon><NIcon :component="CloudUploadOutline" /></template>
        Subir fotos
      </NButton>
    </NFlex>
  </NFlex>
</template>

<style scoped src="./event-detail-header.css"></style>
