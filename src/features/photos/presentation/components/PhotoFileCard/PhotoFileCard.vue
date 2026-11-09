<script setup lang="ts">
import { computed } from 'vue'
import { formatFileSize } from '@/shared/utils/format.utils'
import { formatRelativeTime } from '@/shared/utils/date.utils'

const props = defineProps<{
  filename: string
  mimeType: string
  width: number | null
  height: number | null
  fileSize: number
  uploadedAt: Date
  processedAt: Date | null
  reviewedAt: Date | null
}>()

function count(value: number): string {
  return value.toLocaleString('es-EC')
}

const sizeLine = computed(() => {
  const size = formatFileSize(props.fileSize)
  if (props.width === null || props.height === null) return size
  return `${count(props.width)} × ${count(props.height)} px · ${size}`
})

const processedLine = computed(() =>
  props.processedAt ? formatRelativeTime(props.processedAt) : 'Pendiente',
)

const reviewedLine = computed(() =>
  props.reviewedAt ? formatRelativeTime(props.reviewedAt) : 'Pendiente',
)
</script>

<template>
  <section class="pd-card">
    <div class="pd-card-h">
      <h4>El archivo</h4>
    </div>
    <div class="pd-kvs">
      <div class="pd-kv">
        <span>Nombre</span>
        <b class="mono">{{ filename }}</b>
      </div>
      <div class="pd-kv">
        <span>Tipo</span>
        <b class="mono">{{ mimeType }}</b>
      </div>
      <div class="pd-kv">
        <span>Tamaño</span>
        <b>{{ sizeLine }}</b>
      </div>
      <div class="pd-kv">
        <span>Subida</span>
        <b>{{ formatRelativeTime(uploadedAt) }}</b>
      </div>
      <div class="pd-kv">
        <span>Procesada</span>
        <b>{{ processedLine }}</b>
      </div>
      <div class="pd-kv">
        <span>Revisada</span>
        <b>{{ reviewedLine }}</b>
      </div>
    </div>
    <p class="pd-note">
      La cámara no guardó hora de captura en ninguna foto de la plataforma: la referencia de
      tiempo es la subida.
    </p>
  </section>
</template>

<style scoped src="./photo-file-card.css" />
