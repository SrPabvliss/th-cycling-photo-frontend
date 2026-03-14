<script setup lang="ts">
import { NFlex, NIcon, NTag } from 'naive-ui'
import { CalendarOutline, CheckmarkCircle } from '@vicons/ionicons5'

import { formatRelativeTime } from '@/shared/utils/date.utils'
import { PHOTO_STATUS_CONFIG } from '../../../constants/status-config'
import type { IPhotoListItem } from '../../../types/responses/photo-list.response'

const props = defineProps<{
  photo: IPhotoListItem
}>()

const emit = defineEmits<{
  click: [id: IPhotoListItem['id']]
}>()
</script>

<template>
  <article class="photo-card" @click="emit('click', props.photo.id)">
    <div class="photo-card__cover">
      <img
        :src="props.photo.thumbnailUrl"
        :alt="props.photo.filename"
        class="photo-card__image"
        loading="lazy"
        decoding="async"
        @load="($event.target as HTMLImageElement).dataset.loaded = 'true'"
      />
      <div class="photo-card__badge">
        <NTag :type="PHOTO_STATUS_CONFIG[props.photo.status].type" size="small" round>
          {{ PHOTO_STATUS_CONFIG[props.photo.status].label }}
        </NTag>
      </div>
      <div v-if="props.photo.classifiedAt" class="photo-card__classified-badge">
        <NIcon :component="CheckmarkCircle" :size="20" color="#18a058" />
      </div>
    </div>

    <div class="photo-card__body">
      <p class="photo-card__filename">{{ props.photo.filename }}</p>
      <NFlex :size="6" align="center" class="photo-card__meta">
        <NIcon :component="CalendarOutline" :size="13" />
        <span>{{ formatRelativeTime(props.photo.uploadedAt) }}</span>
      </NFlex>
    </div>
  </article>
</template>

<style scoped src="./photo-card.css"></style>
