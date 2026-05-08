<script setup lang="ts">
import { useRouter } from 'vue-router'
import { NCard, NIcon, NTooltip, useMessage } from 'naive-ui'
import { CloudDownloadOutline, EyeOutline, GiftOutline } from '@vicons/ionicons5'

import { PHOTO_ROUTE_NAMES } from '@/features/photos/routes'
import { useDownloadZip } from '@/features/photos/composables/mutations/use-download-zip'

const props = defineProps<{
  eventId: string
  eventSlug: string
  eventName: string
  photoCount: number
}>()

const router = useRouter()
const message = useMessage()
const { downloadZip, isDownloading, progress } = useDownloadZip()

async function handleDownloadZip() {
  try {
    await downloadZip(props.eventId, props.eventName)
    message.success('ZIP descargado correctamente')
  } catch {
    message.error('Error al descargar el ZIP')
  }
}
</script>

<template>
  <NCard title="Acciones Rápidas" size="small">
    <div class="quick-actions-grid">
      <button
        class="quick-action"
        :class="{ 'quick-action--disabled': photoCount === 0 || isDownloading }"
        :disabled="photoCount === 0 || isDownloading"
        @click="handleDownloadZip"
      >
        <NIcon :component="CloudDownloadOutline" :size="24" color="var(--tt-primary)" />
        <span class="quick-action__label">
          {{ isDownloading ? `ZIP ${progress}%` : 'Descargar ZIP' }}
        </span>
      </button>
      <button
        class="quick-action"
        @click="router.push({ name: PHOTO_ROUTE_NAMES.GALLERY, params: { slug: props.eventSlug } })"
      >
        <NIcon :component="EyeOutline" :size="24" color="var(--tt-primary)" />
        <span class="quick-action__label">Generar Previews</span>
      </button>
      <NTooltip>
        <template #trigger>
          <button class="quick-action quick-action--disabled" disabled>
            <NIcon :component="GiftOutline" :size="24" color="var(--tt-neutral-light)" />
            <span class="quick-action__label">Paquetes de Entrega</span>
          </button>
        </template>
        Próximamente
      </NTooltip>
    </div>
  </NCard>
</template>

<style scoped src="./event-quick-actions.css" />
