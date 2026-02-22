<script setup lang="ts">
import { NFlex, NIcon, NProgress, NText } from 'naive-ui'
import { CheckmarkCircleOutline } from '@vicons/ionicons5'

defineProps<{
  progress: number
  isComplete: boolean
  uploadedCount: number
}>()
</script>

<template>
  <div class="upload-progress">
    <template v-if="!isComplete">
      <NFlex justify="space-between" align="center" style="margin-bottom: 8px">
        <span class="upload-progress__label">Subiendo fotos...</span>
        <span class="upload-progress__value">{{ progress }}%</span>
      </NFlex>
      <NProgress
        type="line"
        :percentage="progress"
        :height="8"
        :show-indicator="false"
        status="info"
      />
    </template>

    <template v-else>
      <NFlex align="center" :size="12" class="upload-progress__success">
        <NIcon :component="CheckmarkCircleOutline" :size="24" color="var(--tt-success)" />
        <div>
          <p class="upload-progress__success-title">
            {{ uploadedCount }} foto{{ uploadedCount !== 1 ? 's' : '' }} subida{{
              uploadedCount !== 1 ? 's' : ''
            }}
            correctamente
          </p>
          <NText depth="3" style="font-size: 12px"> Las fotos se procesarán automáticamente </NText>
        </div>
      </NFlex>
    </template>
  </div>
</template>

<style scoped src="./upload-progress-bar.css"></style>
