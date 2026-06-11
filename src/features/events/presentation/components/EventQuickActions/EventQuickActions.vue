<script setup lang="ts">
import { useRouter } from 'vue-router'
import { NCard, NIcon } from 'naive-ui'
import { BrushOutline, CheckmarkDoneOutline } from '@vicons/ionicons5'

import { REVIEW_ROUTE_NAMES } from '@/features/review/routes'
import { RETOUCH_ROUTE_NAMES } from '@/features/retouch/routes'

// import { useMessage } from 'naive-ui'
// import { CloudDownloadOutline } from '@vicons/ionicons5'
// import { useDownloadZip } from '@/features/photos/composables/mutations/use-download-zip'

const props = defineProps<{
  eventId: string
  eventSlug: string
  eventName: string
  photoCount: number
}>()

const router = useRouter()

// const message = useMessage()
// const { downloadZip, isDownloading, progress } = useDownloadZip()
//
// async function handleDownloadZip() {
//   try {
//     await downloadZip(props.eventId, props.eventName)
//     message.success('ZIP descargado correctamente')
//   } catch {
//     message.error('Error al descargar el ZIP')
//   }
// }

function goReview() {
  router.push({ name: REVIEW_ROUTE_NAMES.WORKSPACE, params: { eventSlug: props.eventSlug } })
}

function goRetouch() {
  router.push({ name: RETOUCH_ROUTE_NAMES.EVENT_QUEUE, params: { eventSlug: props.eventSlug } })
}
</script>

<template>
  <NCard title="Acciones Rápidas" size="small">
    <div class="quick-actions-grid">
      <!--
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
      -->
      <button
        class="quick-action"
        :class="{ 'quick-action--disabled': photoCount === 0 }"
        :disabled="photoCount === 0"
        @click="goReview"
      >
        <NIcon :component="CheckmarkDoneOutline" :size="24" color="var(--tt-primary)" />
        <span class="quick-action__label">Iniciar revisión</span>
      </button>
      <button
        class="quick-action"
        :class="{ 'quick-action--disabled': photoCount === 0 }"
        :disabled="photoCount === 0"
        @click="goRetouch"
      >
        <NIcon :component="BrushOutline" :size="24" color="var(--tt-primary)" />
        <span class="quick-action__label">Iniciar retoque</span>
      </button>
    </div>
  </NCard>
</template>

<style scoped src="./event-quick-actions.css" />
