<script setup lang="ts">
import { NCard, NFlex, NIcon, NTag } from 'naive-ui'
import { CalendarOutline, CameraOutline } from '@vicons/ionicons5'

import { formatDate } from '@/shared/utils/date.utils'
import { EVENT_STATUS_CONFIG } from '@/shared/constants/event-status.constants'
import type { IEventDetail } from '@/shared/types/event.types'

defineProps<{
  event: IEventDetail
}>()
</script>

<template>
  <NCard size="small">
    <NFlex align="center" :size="12">
      <div>
        <NFlex align="center" :size="8" style="margin-bottom: 4px">
          <span class="upload-event__name">{{ event.name }}</span>
          <NTag :type="EVENT_STATUS_CONFIG[event.status].type" size="tiny" round>
            {{ EVENT_STATUS_CONFIG[event.status].label }}
          </NTag>
        </NFlex>
        <NFlex :size="16" class="upload-event__meta">
          <NFlex :size="4" align="center">
            <NIcon :component="CalendarOutline" :size="13" />
            <span v-if="event.startDate.getTime() === event.endDate.getTime()">
              {{ formatDate(event.startDate) }}
            </span>
            <span v-else>
              {{ formatDate(event.startDate) }} – {{ formatDate(event.endDate) }}
            </span>
          </NFlex>
          <NFlex :size="4" align="center">
            <NIcon :component="CameraOutline" :size="13" />
            <span>{{ event.photoCount }} fotos</span>
          </NFlex>
        </NFlex>
      </div>
    </NFlex>
  </NCard>
</template>

<style scoped src="./upload-event-card.css"></style>
