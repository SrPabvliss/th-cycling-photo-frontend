<script setup lang="ts">
import { useRouter } from 'vue-router'
import { NButton, NFlex, NIcon, NTag } from 'naive-ui'
import { CreateOutline, CloudUploadOutline } from '@vicons/ionicons5'

import { formatDate, formatRelativeTime } from '@/shared/utils/date.utils'
import { EVENT_ROUTE_NAMES } from '../../../routes'
import { EVENT_STATUS_CONFIG } from '../../../constants/status-config'
import type { IEventDetail } from '../../../types/responses/event-detail.response'

defineProps<{
  event: IEventDetail
  eventId: string
}>()

const router = useRouter()
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
      <NButton type="primary" disabled>
        <template #icon><NIcon :component="CloudUploadOutline" /></template>
        Subir fotos
      </NButton>
    </NFlex>
  </NFlex>
</template>

<style scoped src="./event-detail-header.css"></style>
