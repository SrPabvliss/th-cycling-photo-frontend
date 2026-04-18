<script setup lang="ts">
import { NIcon } from 'naive-ui'
import { CheckmarkCircle } from '@vicons/ionicons5'

import type { IRetouchQueueItem } from '@/features/operator/types/responses/retouch-queue.response'

defineProps<{
  photos: IRetouchQueueItem[]
  currentPhotoId: string | null
  buyerName: string
  progress: { retouched: number; total: number }
  isPhotoRetouched: (photoId: string) => boolean
}>()

const emit = defineEmits<{
  select: [photoId: string]
}>()
</script>

<template>
  <div class="retouch-photos">
    <div class="retouch-photos__header">
      <span class="retouch-photos__title">{{ buyerName }}</span>
      <span class="retouch-photos__progress">{{ progress.retouched }}/{{ progress.total }}</span>
    </div>

    <div class="retouch-photos__grid">
      <div
        v-for="photo in photos"
        :key="photo.photoId"
        class="retouch-photos__item"
        :class="{
          'retouch-photos__item--active': photo.photoId === currentPhotoId,
          'retouch-photos__item--done': isPhotoRetouched(photo.photoId),
        }"
        @click="emit('select', photo.photoId)"
      >
        <img :src="photo.thumbnailUrl" alt="" loading="lazy" class="retouch-photos__thumb" />
        <div v-if="isPhotoRetouched(photo.photoId)" class="retouch-photos__check">
          <NIcon :component="CheckmarkCircle" :size="18" color="#fff" />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped src="./retouch-order-photos.css" />
