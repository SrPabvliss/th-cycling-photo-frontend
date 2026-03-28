<script setup lang="ts">
import { NIcon, NButton } from 'naive-ui'
import { DownloadOutline } from '@vicons/ionicons5'

import { formatFileSize } from '@/shared/utils/format.utils'
import type { IDeliveryPhoto } from '../../../types/responses/delivery-data.response'

defineProps<{
  photos: IDeliveryPhoto[]
}>()

const emit = defineEmits<{
  download: [photo: IDeliveryPhoto]
}>()
</script>

<template>
  <div class="dpg">
    <div v-for="photo in photos" :key="photo.id" class="dpg__card">
      <div class="dpg__img-wrap">
        <img :src="photo.downloadUrl" :alt="photo.filename" class="dpg__img" loading="lazy" />
      </div>
      <div class="dpg__footer">
        <div class="dpg__info">
          <span class="dpg__name">{{ photo.filename }}</span>
          <span class="dpg__size">{{ formatFileSize(photo.fileSize) }}</span>
        </div>
        <NButton size="small" type="primary" secondary @click="emit('download', photo)">
          <template #icon><NIcon :component="DownloadOutline" /></template>
          Descargar
        </NButton>
      </div>
    </div>
  </div>
</template>

<style scoped src="./delivery-photo-grid.css" />
