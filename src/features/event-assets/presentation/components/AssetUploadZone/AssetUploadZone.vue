<script setup lang="ts">
import { NButton, NFlex, NIcon, NSpin } from 'naive-ui'
import { CameraOutline, CloseCircleOutline, ImageOutline } from '@vicons/ionicons5'

import { ASSET_TYPE_CONFIG } from '../../../constants/asset-config'
import type { EventAssetType } from '../../../types/asset-type'
import { useFileDropZone } from '../../../composables/use-file-drop-zone'

const props = defineProps<{
  assetType: EventAssetType
  currentUrl?: string | null
  isUploading?: boolean
  isRemoving?: boolean
}>()

const emit = defineEmits<{
  upload: [file: File]
  remove: []
}>()

const config = ASSET_TYPE_CONFIG[props.assetType]

const {
  isDragging,
  fileInput,
  triggerFileInput,
  handleFileChange,
  handleDrop,
  handleDragOver,
  handleDragLeave,
} = useFileDropZone(config.acceptTypes, (file) => emit('upload', file))
</script>

<template>
  <div class="asset-zone">
    <div class="asset-zone__header">
      <span class="asset-zone__label">{{ config.label }}</span>
      <span class="asset-zone__hint">{{ config.hint }}</span>
    </div>

    <NSpin :show="isUploading || isRemoving">
      <div
        class="asset-zone__droparea"
        :class="{ 'asset-zone__droparea--dragging': isDragging }"
        :style="{ aspectRatio: config.aspectRatio }"
        @click="triggerFileInput"
        @drop.prevent="handleDrop"
        @dragover="handleDragOver"
        @dragleave="handleDragLeave"
      >
        <template v-if="currentUrl">
          <img :src="currentUrl" :alt="config.label" class="asset-zone__preview" />
          <div class="asset-zone__overlay">
            <NButton circle ghost size="small" style="color: white; border-color: white">
              <template #icon><NIcon :component="CameraOutline" /></template>
            </NButton>
          </div>
        </template>
        <div v-else class="asset-zone__placeholder">
          <NFlex vertical align="center" :size="4">
            <NIcon :component="ImageOutline" :size="24" color="var(--tt-neutral-light)" />
            <span class="asset-zone__placeholder-text">
              <NIcon :component="CameraOutline" :size="14" />
              Seleccionar imagen
            </span>
          </NFlex>
        </div>
      </div>
    </NSpin>

    <NFlex v-if="currentUrl" :size="4" class="asset-zone__actions">
      <NButton
        text
        type="error"
        size="tiny"
        :loading="isRemoving"
        :disabled="isUploading"
        @click.stop="emit('remove')"
      >
        <template #icon><NIcon :component="CloseCircleOutline" /></template>
        Eliminar
      </NButton>
    </NFlex>

    <input
      ref="fileInput"
      type="file"
      :accept="config.acceptTypes"
      style="display: none"
      @change="handleFileChange"
    />
  </div>
</template>

<style scoped src="./asset-upload-zone.css"></style>
