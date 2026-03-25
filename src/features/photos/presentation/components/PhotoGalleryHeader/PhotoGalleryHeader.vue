<script setup lang="ts">
import { useRouter } from 'vue-router'
import { NButton, NFlex, NIcon, NTag } from 'naive-ui'
import { ArrowBack, CloudUploadOutline } from '@vicons/ionicons5'

import { formatDate } from '@/shared/utils/date.utils'
import { EVENT_STATUS_CONFIG } from '@/features/events/constants/status-config'
import { PHOTO_ROUTE_NAMES } from '../../../routes'
import type { IEventDetail } from '@/features/events/types/responses/event-detail.response'

defineProps<{
  event: IEventDetail
  eventId: string
  backTo?: string
}>()

const router = useRouter()
</script>

<template>
  <NFlex justify="space-between" align="start" :size="16" wrap style="margin-bottom: 24px">
    <NFlex align="start" :size="12">
      <button
        v-if="backTo !== undefined"
        class="gallery-header__back"
        @click="router.push(backTo!)"
      >
        <NIcon :component="ArrowBack" :size="20" />
      </button>
      <div>
        <NFlex align="center" :size="12" style="margin-bottom: 4px">
          <h1 class="gallery-header__title">{{ event.name }}</h1>
          <NTag :type="EVENT_STATUS_CONFIG[event.status].type" size="small" round>
            {{ EVENT_STATUS_CONFIG[event.status].label }}
          </NTag>
        </NFlex>
        <p class="gallery-header__subtitle">
          {{ formatDate(event.date) }} · {{ event.photoCount }} fotos
        </p>
      </div>
    </NFlex>
    <NFlex :size="8">
      <slot name="extra-actions" />
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

<style scoped src="./photo-gallery-header.css"></style>
