<script setup lang="ts">
import { NButton, NFlex, NIcon } from 'naive-ui'
import { CloseOutline, ImageOutline } from '@vicons/ionicons5'

import { formatFileSize } from '@/shared/utils/format.utils'

defineProps<{
  files: File[]
  isUploading: boolean
}>()

const emit = defineEmits<{
  'remove-file': [index: number]
}>()
</script>

<template>
  <div v-if="files.length" class="file-list">
    <div v-for="(file, index) in files" :key="file.name + index" class="file-list__item">
      <NFlex align="center" :size="12" style="flex: 1; min-width: 0">
        <div class="file-list__icon">
          <NIcon :component="ImageOutline" :size="18" />
        </div>
        <div class="file-list__info">
          <p class="file-list__name">{{ file.name }}</p>
          <span class="file-list__size">{{ formatFileSize(file.size) }}</span>
        </div>
      </NFlex>
      <NButton
        v-if="!isUploading"
        text
        type="error"
        size="small"
        @click="emit('remove-file', index)"
      >
        <template #icon><NIcon :component="CloseOutline" /></template>
      </NButton>
    </div>
  </div>
</template>

<style scoped src="./upload-file-list.css"></style>
