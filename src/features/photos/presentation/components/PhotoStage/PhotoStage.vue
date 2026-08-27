<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { NIcon } from 'naive-ui'
import { RefreshOutline, WarningOutline } from '@vicons/ionicons5'
import { formatFileSize, formatNumber } from '@/shared/utils/format.utils'

const props = defineProps<{
  state: 'image' | 'loading' | 'error'
  imageUrl: string | null
  filename: string
  width: number | null
  height: number | null
  fileSize: number
}>()

defineEmits<{
  retry: []
}>()

const imageFailed = ref(false)

watch(
  () => props.imageUrl,
  () => {
    imageFailed.value = false
  },
)

const displayState = computed(() => (imageFailed.value ? 'error' : props.state))

const dimensions = computed(() => {
  const size = formatFileSize(props.fileSize)
  if (props.width === null || props.height === null) return size
  return `${formatNumber(props.width)} × ${formatNumber(props.height)} px · ${size}`
})
</script>

<template>
  <div class="pd-stage">
    <div v-if="displayState === 'error'" class="pd-fail" data-test="stage-error">
      <NIcon :component="WarningOutline" :size="26" />
      <b>No se pudo cargar la imagen</b>
      <span
        >El enlace de la imagen caduca a los pocos minutos. Vuelve a pedirla y aparece de nuevo; el
        archivo no se ha movido.</span
      >
      <button
        type="button"
        class="tt-btn tt-btn-ghost sm"
        data-test="stage-retry"
        @click="$emit('retry')"
      >
        <NIcon :component="RefreshOutline" :size="13" />
        Volver a cargar
      </button>
    </div>

    <div v-else-if="displayState === 'loading'" class="pd-skel-img" data-test="stage-loading">
      <span class="tt-loading"><i /><i /><i />Cargando la foto</span>
    </div>

    <img
      v-else
      class="pd-img"
      data-test="stage-image"
      :src="imageUrl ?? ''"
      :alt="filename"
      @error="imageFailed = true"
    />

    <div class="pd-stagefoot">
      <span>{{ dimensions }}</span>
      <span class="pd-dim"
        >Vista de trabajo a 1400 px. La descarga entrega el archivo original.</span
      >
    </div>
  </div>
</template>

<style scoped src="./photo-stage.css" />
