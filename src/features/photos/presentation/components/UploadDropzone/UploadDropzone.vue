<script setup lang="ts">
import { ref } from 'vue'
import { NIcon, NText } from 'naive-ui'
import { CloudUploadOutline } from '@vicons/ionicons5'

import {
  ACCEPTED_EXTENSIONS,
  ACCEPTED_MIME_TYPES,
  MAX_FILE_SIZE,
} from '../../../constants/upload.constants'
import { formatFileSize } from '@/shared/utils/format.utils'

defineProps<{
  disabled?: boolean
}>()

export interface IRejectionSummary {
  invalidType: number
  tooLarge: number
}

const emit = defineEmits<{
  'files-selected': [files: File[]]
  'files-rejected': [summary: IRejectionSummary]
}>()

const isDragging = ref(false)
const fileInput = ref<HTMLInputElement>()

function validateFiles(fileList: FileList): File[] {
  const valid: File[] = []
  const rejected: IRejectionSummary = { invalidType: 0, tooLarge: 0 }

  for (const file of fileList) {
    if (!(ACCEPTED_MIME_TYPES as readonly string[]).includes(file.type)) {
      rejected.invalidType++
      continue
    }
    if (file.size > MAX_FILE_SIZE) {
      rejected.tooLarge++
      continue
    }
    valid.push(file)
  }

  if (rejected.invalidType > 0 || rejected.tooLarge > 0) {
    emit('files-rejected', rejected)
  }

  return valid
}

function handleDrop(e: DragEvent) {
  isDragging.value = false
  if (!e.dataTransfer?.files.length) return
  const valid = validateFiles(e.dataTransfer.files)
  if (valid.length) emit('files-selected', valid)
}

function handleFileInput(e: Event) {
  const input = e.target as HTMLInputElement
  if (!input.files?.length) return
  const valid = validateFiles(input.files)
  if (valid.length) emit('files-selected', valid)
  input.value = ''
}

function openFileDialog() {
  fileInput.value?.click()
}
</script>

<template>
  <div
    :class="['dropzone', { 'dropzone--active': isDragging, 'dropzone--disabled': disabled }]"
    @dragenter.prevent="isDragging = true"
    @dragover.prevent="isDragging = true"
    @dragleave.prevent="isDragging = false"
    @drop.prevent="handleDrop"
    @click="openFileDialog"
  >
    <input
      ref="fileInput"
      type="file"
      :accept="ACCEPTED_EXTENSIONS"
      multiple
      hidden
      @change="handleFileInput"
    />

    <div class="dropzone__content">
      <div class="dropzone__icon">
        <NIcon :component="CloudUploadOutline" :size="32" />
      </div>
      <p class="dropzone__title">
        Arrastra tus fotos aquí o <span class="dropzone__link">selecciona archivos</span>
      </p>
      <NText depth="3" style="font-size: 12px">
        JPEG, PNG o WebP · Máximo {{ formatFileSize(MAX_FILE_SIZE) }} por archivo
      </NText>
    </div>
  </div>
</template>

<style scoped src="./upload-dropzone.css"></style>
