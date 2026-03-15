<script setup lang="ts">
import { computed, ref } from 'vue'
import { NButton, NIcon, NTag, useMessage } from 'naive-ui'
import {
  ArrowBackOutline,
  ArrowForwardOutline,
  DownloadOutline,
  CloudUploadOutline,
} from '@vicons/ionicons5'

import type { IPhotoDetail } from '@/features/photos/types/responses/photo-detail.response'
import { getTransformedPhotoUrl } from '@/shared/utils/cdn.utils'
import { usePhotoDownloadUrl } from '../../../composables/queries/use-photo-download-url'
import { useUploadRetouched } from '../../../composables/mutations/use-upload-retouched'
import { useImageZoom } from '../../../composables/use-image-zoom'
import ImageComparisonSlider from '../ImageComparisonSlider/ImageComparisonSlider.vue'

const props = defineProps<{
  photo: IPhotoDetail
  hasNext: boolean
  hasPrev: boolean
  previewStorageKey?: string | null
}>()

defineEmits<{
  next: []
  prev: []
}>()

const message = useMessage()
const { getDownloadUrl } = usePhotoDownloadUrl()
const uploadRetouched = useUploadRetouched()
const fileInput = ref<HTMLInputElement>()
const isDownloading = ref(false)
const showComparison = ref(false)

const imageContainer = ref<HTMLElement>()
const photoId = computed(() => props.photo.id)
const {
  scale,
  translateX,
  translateY,
  isPanning,
  handleWheel,
  handleMouseDown,
  handleMouseMove,
  handleMouseUp,
  resetZoom,
} = useImageZoom(imageContainer, photoId)

const imageTransform = computed(() =>
  scale.value > 1
    ? `translate(${translateX.value}px, ${translateY.value}px) scale(${scale.value})`
    : undefined,
)

async function handleDownload() {
  isDownloading.value = true
  try {
    const url = await getDownloadUrl(props.photo.id)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = props.photo.filename
    anchor.target = '_blank'
    anchor.rel = 'noopener noreferrer'
    document.body.appendChild(anchor)
    anchor.click()
    document.body.removeChild(anchor)
  } catch {
    message.error('Error al descargar la imagen')
  } finally {
    isDownloading.value = false
  }
}

function triggerUpload() {
  fileInput.value?.click()
}

async function handleFileSelected(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return

  try {
    await uploadRetouched.mutateAsync({ photoId: props.photo.id, file })
    message.success('Imagen retocada subida correctamente')
  } catch {
    message.error('Error al subir la imagen retocada')
  }

  input.value = ''
}

const workspaceImageUrl = (storageKey: string) => getTransformedPhotoUrl(storageKey, 'workspace')
const displayStorageKey = computed(() => props.previewStorageKey ?? props.photo.storageKey)
</script>

<template>
  <div class="workspace-photo-panel">
    <div
      ref="imageContainer"
      class="workspace-photo-panel__image-container"
      :class="{ 'workspace-photo-panel__image-container--zoomed': scale > 1 }"
      @wheel="handleWheel"
      @mousedown="handleMouseDown"
      @mousemove="handleMouseMove"
      @mouseup="handleMouseUp"
      @mouseleave="handleMouseUp"
    >
      <ImageComparisonSlider
        v-if="showComparison && photo.retouchedImageUrl && !previewStorageKey"
        :original-src="workspaceImageUrl(photo.storageKey)"
        :retouched-src="photo.retouchedImageUrl"
        :alt="photo.filename"
      />
      <img
        v-else
        :key="displayStorageKey"
        :src="workspaceImageUrl(displayStorageKey)"
        :alt="photo.filename"
        class="workspace-photo-panel__image"
        :class="{ 'workspace-photo-panel__image--no-transition': isPanning }"
        :style="imageTransform ? { transform: imageTransform } : undefined"
        @load="($event.target as HTMLImageElement).dataset.loaded = 'true'"
      />
    </div>

    <p class="workspace-photo-panel__filename">
      {{ photo.filename }}
      <NTag v-if="photo.classifiedAt" size="tiny" type="success" :bordered="false">
        Clasificada
      </NTag>
      <NTag v-if="photo.retouchedImageUrl" size="tiny" type="info" :bordered="false">
        Retocada
      </NTag>
    </p>

    <div class="workspace-photo-panel__toolbar">
      <div class="workspace-photo-panel__file-actions">
        <NButton size="small" :loading="isDownloading" @click="handleDownload">
          <template #icon><NIcon :component="DownloadOutline" /></template>
          Descargar
        </NButton>
        <NButton size="small" :loading="uploadRetouched.isPending.value" @click="triggerUpload">
          <template #icon><NIcon :component="CloudUploadOutline" /></template>
          Subir retocada
        </NButton>
        <NButton
          v-if="photo.retouchedImageUrl"
          size="small"
          :type="showComparison ? 'primary' : 'default'"
          @click="showComparison = !showComparison"
        >
          {{ showComparison ? 'Vista normal' : 'Comparar' }}
        </NButton>
        <NButton v-if="scale > 1" size="small" @click="resetZoom">
          {{ Math.round(scale * 100) }}% — Reset
        </NButton>
        <input
          ref="fileInput"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          style="display: none"
          @change="handleFileSelected"
        />
      </div>

      <div class="workspace-photo-panel__nav">
        <NButton size="small" :disabled="!hasPrev" @click="$emit('prev')">
          <template #icon><NIcon :component="ArrowBackOutline" /></template>
        </NButton>
        <NButton size="small" :disabled="!hasNext" @click="$emit('next')">
          <template #icon><NIcon :component="ArrowForwardOutline" /></template>
        </NButton>
      </div>
    </div>
  </div>
</template>

<style scoped src="./workspace-photo-panel.css" />
