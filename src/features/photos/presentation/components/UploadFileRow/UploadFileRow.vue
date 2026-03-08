<script setup lang="ts">
import { type Component as VueComponent } from 'vue'
import { NButton, NIcon, NProgress, NTag } from 'naive-ui'
import {
  TimeOutline,
  CloudUploadOutline,
  CheckmarkOutline,
  CheckmarkDoneOutline,
  AlertCircleOutline,
  RefreshOutline,
  CloseOutline,
} from '@vicons/ionicons5'

import { formatFileSize } from '@/shared/utils/format.utils'
import type { IUploadItem, UploadStatus } from '../../../types/upload-status'
import { UPLOAD_STATUS_CONFIG } from '../../../constants/upload-status-config'

defineProps<{
  item: IUploadItem
}>()

const emit = defineEmits<{
  remove: [id: string]
}>()

const STATUS_ICONS: Record<UploadStatus, VueComponent> = {
  pending: TimeOutline,
  queued: TimeOutline,
  uploading: CloudUploadOutline,
  uploaded: CheckmarkOutline,
  confirmed: CheckmarkDoneOutline,
  failed: AlertCircleOutline,
  retrying: RefreshOutline,
}
</script>

<template>
  <div class="file-row-wrapper">
    <div class="file-row">
      <div :class="['file-row__icon', `file-row__icon--${UPLOAD_STATUS_CONFIG[item.status].type}`]">
        <NIcon :component="STATUS_ICONS[item.status]" :size="16" />
      </div>

      <div class="file-row__info">
        <p class="file-row__name">{{ item.fileName }}</p>
        <span class="file-row__size">{{ formatFileSize(item.fileSize) }}</span>
      </div>

      <div class="file-row__status">
        <NProgress
          v-if="item.status === 'uploading'"
          type="line"
          :percentage="Math.round(item.progress * 100)"
          :height="6"
          :show-indicator="false"
          status="info"
          style="width: 80px"
        />
        <NTag v-else :type="UPLOAD_STATUS_CONFIG[item.status].type" size="tiny" round>
          {{ UPLOAD_STATUS_CONFIG[item.status].label }}
        </NTag>
      </div>

      <NButton
        v-if="item.status === 'failed'"
        text
        type="error"
        size="tiny"
        @click="emit('remove', item.id)"
      >
        <template #icon><NIcon :component="CloseOutline" /></template>
      </NButton>
    </div>

    <div v-if="item.status === 'failed' && item.error" class="file-row__error">
      {{ item.error }}
    </div>
  </div>
</template>

<style scoped src="./upload-file-row.css"></style>
