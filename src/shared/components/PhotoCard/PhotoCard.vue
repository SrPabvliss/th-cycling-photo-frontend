<script setup lang="ts">
import { NFlex, NIcon, NTag } from 'naive-ui'
import { CalendarOutline, CheckmarkCircle, TrashOutline } from '@vicons/ionicons5'

import { formatRelativeTime } from '@/shared/utils/date.utils'
import { PHOTO_STATUS_CONFIG } from '@/shared/constants/photo-status.constants'
import type { IPhotoListItem } from '@/shared/types/photo.types'

const props = defineProps<{
  photo: IPhotoListItem
  selectable?: boolean
  selected?: boolean
  deletable?: boolean
  deleting?: boolean
}>()

const emit = defineEmits<{
  click: [slug: string]
  select: [id: string]
  delete: [id: string]
}>()

function handleClick() {
  if (props.selectable) {
    emit('select', props.photo.id)
  } else {
    emit('click', props.photo.publicSlug)
  }
}

function handleCheckboxClick(e: MouseEvent) {
  e.stopPropagation()
  emit('select', props.photo.id)
}
</script>

<template>
  <article :class="['photo-card', { 'photo-card--selected': selected }]" @click="handleClick">
    <div class="photo-card__cover">
      <img
        :src="props.photo.thumbnailUrl"
        :alt="props.photo.filename"
        class="photo-card__image"
        loading="lazy"
        decoding="async"
        @load="($event.target as HTMLImageElement).dataset.loaded = 'true'"
      />
      <!-- Selection checkbox -->
      <div
        v-if="selectable"
        :class="['photo-card__checkbox', { 'photo-card__checkbox--checked': selected }]"
        @click="handleCheckboxClick"
      >
        <svg v-if="selected" width="12" height="12" viewBox="0 0 12 12" fill="none">
          <path
            d="M2 6L5 9L10 3"
            stroke="white"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </div>
      <div class="photo-card__badge">
        <NTag :type="PHOTO_STATUS_CONFIG[props.photo.status].type" size="small" round>
          {{ PHOTO_STATUS_CONFIG[props.photo.status].label }}
        </NTag>
      </div>
      <div v-if="props.photo.reviewedAt" class="photo-card__classified-badge">
        <NIcon :component="CheckmarkCircle" :size="20" color="#18a058" />
      </div>
      <button
        v-if="deletable"
        type="button"
        class="photo-card__delete"
        title="Eliminar foto"
        :disabled="deleting"
        @click.stop="emit('delete', props.photo.id)"
      >
        <NIcon :component="TrashOutline" :size="18" />
      </button>
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
