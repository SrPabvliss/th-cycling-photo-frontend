<script setup lang="ts">
import { NButton, NFlex, NIcon, NText } from 'naive-ui'
import { CheckmarkCircleOutline, AlertCircleOutline } from '@vicons/ionicons5'

withDefaults(
  defineProps<{
    confirmedCount: number
    failedCount: number
    totalCount: number
    autoConfirmedCount?: number
  }>(),
  { autoConfirmedCount: 0 },
)

const emit = defineEmits<{
  'go-to-gallery': []
  'new-upload': []
}>()
</script>

<template>
  <div class="upload-summary">
    <!-- Success section -->
    <NFlex align="center" :size="12" class="upload-summary__main">
      <div class="upload-summary__icon upload-summary__icon--success">
        <NIcon :component="CheckmarkCircleOutline" :size="28" />
      </div>
      <div>
        <p class="upload-summary__title">Carga completada</p>
        <div>
          <NText depth="3" style="font-size: 13px">
            {{ confirmedCount }} de {{ totalCount }} foto{{ totalCount !== 1 ? 's' : '' }} subida{{
              totalCount !== 1 ? 's' : ''
            }}
            correctamente
          </NText>
          <NText
            v-if="autoConfirmedCount > 0"
            depth="3"
            style="font-size: 12px; display: block; margin-top: 2px"
          >
            ({{ autoConfirmedCount }} ya
            {{ autoConfirmedCount !== 1 ? 'existían' : 'existía' }} previamente)
          </NText>
        </div>
      </div>
    </NFlex>

    <!-- Failures section -->
    <NFlex v-if="failedCount > 0" align="center" :size="12" class="upload-summary__failures">
      <div class="upload-summary__icon upload-summary__icon--error">
        <NIcon :component="AlertCircleOutline" :size="20" />
      </div>
      <NText depth="3" style="font-size: 13px">
        {{ failedCount }} archivo{{ failedCount !== 1 ? 's' : '' }} no se pudo{{
          failedCount !== 1 ? 'ieron' : ''
        }}
        subir
      </NText>
    </NFlex>

    <!-- Actions -->
    <NFlex :size="12" justify="end" style="margin-top: 20px">
      <NButton @click="emit('new-upload')"> Nueva carga </NButton>
      <NButton type="primary" @click="emit('go-to-gallery')"> Ver Galería </NButton>
    </NFlex>
  </div>
</template>

<style scoped src="./upload-summary.css"></style>
