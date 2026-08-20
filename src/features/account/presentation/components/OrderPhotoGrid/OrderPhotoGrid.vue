<script setup lang="ts">
import { NButton, NIcon } from 'naive-ui'
import { DownloadOutline } from '@vicons/ionicons5'

import type { IApiMyOrderPhoto } from '../../../types/responses/my-order.response'

defineProps<{
  photos: IApiMyOrderPhoto[]
  canDownload: boolean
  downloadingPhotoId: string | null
}>()

const emit = defineEmits<{
  download: [photoId: string]
}>()
</script>

<template>
  <div class="opg">
    <div v-for="photo in photos" :key="photo.id" class="opg__cell">
      <img :src="photo.galleryUrl" alt="" class="opg__img" loading="lazy" />

      <NButton
        v-if="canDownload"
        class="opg__download"
        circle
        type="primary"
        :loading="downloadingPhotoId === photo.id"
        :disabled="downloadingPhotoId !== null"
        @click="emit('download', photo.id)"
      >
        <template #icon><NIcon :component="DownloadOutline" /></template>
      </NButton>
    </div>
  </div>
</template>

<style scoped src="./order-photo-grid.css"></style>
