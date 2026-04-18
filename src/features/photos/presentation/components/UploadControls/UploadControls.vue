<script setup lang="ts">
import { NButton, NFlex, NIcon, NProgress, NTag } from 'naive-ui'
import { PauseOutline, PlayOutline, StopOutline, CloudOfflineOutline } from '@vicons/ionicons5'

import type { UploadStatus } from '../../../types/upload-status'

defineProps<{
  totalProgress: number
  counts: Record<UploadStatus, number> & { total: number }
  isPaused: boolean
  isOnline: boolean
}>()

const emit = defineEmits<{
  pause: []
  resume: []
  cancel: []
}>()
</script>

<template>
  <div class="upload-controls">
    <!-- Progress bar -->
    <div class="upload-controls__progress">
      <NFlex justify="space-between" align="center" style="margin-bottom: 6px">
        <span class="upload-controls__percent"> {{ Math.round(totalProgress * 100) }}% </span>
        <NFlex :size="8" align="center">
          <NTag v-if="!isOnline" size="tiny" type="warning" round>
            <template #icon>
              <NIcon :component="CloudOfflineOutline" :size="14" />
            </template>
            Sin conexión
          </NTag>
          <NTag v-if="isPaused && isOnline" size="tiny" type="warning" round> Pausado </NTag>
        </NFlex>
      </NFlex>
      <NProgress
        type="line"
        :percentage="Math.round(totalProgress * 100)"
        :height="8"
        :show-indicator="false"
        :status="isPaused || !isOnline ? 'warning' : 'info'"
      />
    </div>

    <!-- Count summary + actions -->
    <NFlex justify="space-between" align="center" style="margin-top: 12px">
      <NFlex :size="12" class="upload-controls__counts">
        <span v-if="counts.uploading > 0"> {{ counts.uploading }} subiendo </span>
        <span v-if="counts.queued + counts.pending > 0">
          {{ counts.queued + counts.pending }} en cola
        </span>
        <span v-if="counts.confirmed > 0" class="upload-controls__count--success">
          {{ counts.confirmed }} confirmadas
        </span>
        <span v-if="counts.failed > 0" class="upload-controls__count--error">
          {{ counts.failed }} fallidas
        </span>
      </NFlex>

      <NFlex :size="8">
        <NButton v-if="!isPaused" size="small" @click="emit('pause')">
          <template #icon><NIcon :component="PauseOutline" /></template>
          Pausar
        </NButton>
        <NButton v-else size="small" type="primary" :disabled="!isOnline" @click="emit('resume')">
          <template #icon><NIcon :component="PlayOutline" /></template>
          Reanudar
        </NButton>
        <NButton size="small" type="error" secondary @click="emit('cancel')">
          <template #icon><NIcon :component="StopOutline" /></template>
          Cancelar
        </NButton>
      </NFlex>
    </NFlex>
  </div>
</template>

<style scoped src="./upload-controls.css"></style>
