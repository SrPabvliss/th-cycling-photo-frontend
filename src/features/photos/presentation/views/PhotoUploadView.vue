<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { NButton, NCard, NFlex, NResult, useMessage } from 'naive-ui'

import AppTopBar from '@/core/layout/AppTopBar.vue'
import { useEventDetailQuery } from '@/features/events/composables/queries/use-event-detail'
import { useUploadQueue } from '../../composables/use-upload-queue'
import { useUploadStore } from '../../stores/upload.store'
import { uploadBreadcrumbs } from '../../constants/photo-breadcrumbs'
import { MAX_FILES, MAX_FILE_SIZE } from '../../constants/upload.constants'
import { PHOTO_ROUTE_NAMES } from '../../routes'
import { formatFileSize } from '@/shared/utils/format.utils'
import UploadDropzone from '../components/UploadDropzone/UploadDropzone.vue'
import type { IRejectionSummary } from '../components/UploadDropzone/UploadDropzone.vue'
import UploadEventCard from '../components/UploadEventCard/UploadEventCard.vue'
import UploadControls from '../components/UploadControls/UploadControls.vue'
import UploadProgressList from '../components/UploadProgressList/UploadProgressList.vue'
import UploadSummary from '../components/UploadSummary/UploadSummary.vue'

const route = useRoute()
const router = useRouter()
const message = useMessage()

const eventId = computed(() => route.params.eventId as string)
const selectedFiles = ref<File[]>([])
const isManuallyPaused = ref(false)

const {
  data: event,
  isPending: isEventPending,
  isError: isEventError,
} = useEventDetailQuery(eventId)

const store = useUploadStore()
const { isActive, isOnline, startUpload, pauseUpload, resumeUpload, cancelUpload } =
  useUploadQueue(eventId)

const breadcrumbs = computed(() =>
  uploadBreadcrumbs(eventId.value, event.value?.name ?? 'Cargando...'),
)

const isComplete = computed(() => {
  const c = store.counts
  return c.total > 0 && c.confirmed + c.failed === c.total
})

const canAddFiles = computed(() => selectedFiles.value.length + store.counts.total < MAX_FILES)

function handleFilesSelected(files: File[]) {
  const remaining = MAX_FILES - selectedFiles.value.length - store.counts.total
  selectedFiles.value = [...selectedFiles.value, ...files.slice(0, remaining)]
}

function handleFilesRejected(summary: IRejectionSummary) {
  const parts: string[] = []
  if (summary.tooLarge > 0) {
    parts.push(`${summary.tooLarge} exceden ${formatFileSize(MAX_FILE_SIZE)}`)
  }
  if (summary.invalidType > 0) {
    parts.push(`${summary.invalidType} con formato no soportado`)
  }
  message.warning(`Archivos descartados: ${parts.join(', ')}`, { duration: 5000 })
}

function handleStartUpload() {
  if (selectedFiles.value.length === 0) return
  startUpload(selectedFiles.value)
  selectedFiles.value = []
}

function handlePause() {
  isManuallyPaused.value = true
  pauseUpload()
}

function handleResume() {
  isManuallyPaused.value = false
  resumeUpload()
}

function handleCancel() {
  isManuallyPaused.value = false
  cancelUpload()
}

function handleRemoveItem(id: string) {
  store.removeItem(id)
}

function handleGoToGallery() {
  router.push({ name: PHOTO_ROUTE_NAMES.GALLERY, params: { eventId: eventId.value } })
}

function handleNewUpload() {
  store.clear()
}
</script>

<template>
  <div class="page-view">
    <AppTopBar title="Subir Fotos" :breadcrumbs="breadcrumbs" />

    <div class="page-view__content upload-content">
      <div v-if="isEventError" class="error-container">
        <NResult
          status="error"
          title="Error al cargar evento"
          description="No se pudo obtener la información del evento."
        />
      </div>

      <template v-else-if="!isEventPending && event">
        <UploadEventCard :event="event" />

        <!-- Completion summary -->
        <UploadSummary
          v-if="isComplete"
          :confirmed-count="store.counts.confirmed"
          :failed-count="store.counts.failed"
          :total-count="store.counts.total"
          style="margin-top: 24px"
          @go-to-gallery="handleGoToGallery"
          @new-upload="handleNewUpload"
        />

        <!-- Active upload -->
        <NCard v-else-if="isActive || store.counts.total > 0" style="margin-top: 24px">
          <template #header>
            <div>
              <div class="upload-header__title">Subiendo fotos</div>
              <p class="upload-header__subtitle">
                {{ store.counts.confirmed + store.counts.uploaded }} de
                {{ store.counts.total }} completadas
              </p>
            </div>
          </template>

          <NFlex vertical :size="16">
            <UploadControls
              :total-progress="store.totalProgress"
              :counts="store.counts"
              :is-paused="isManuallyPaused"
              :is-online="isOnline"
              @pause="handlePause"
              @resume="handleResume"
              @cancel="handleCancel"
            />

            <UploadProgressList :items="store.items" @remove-item="handleRemoveItem" />
          </NFlex>
        </NCard>

        <!-- File selection (idle state) -->
        <NCard v-else style="margin-top: 24px">
          <template #header>
            <div>
              <div class="upload-header__title">Seleccionar fotos</div>
              <p class="upload-header__subtitle">
                Máximo {{ MAX_FILES }} archivos por carga. JPEG, PNG o WebP.
              </p>
            </div>
          </template>

          <NFlex vertical :size="16">
            <UploadDropzone
              :disabled="!canAddFiles"
              @files-selected="handleFilesSelected"
              @files-rejected="handleFilesRejected"
            />

            <NFlex v-if="selectedFiles.length > 0" justify="space-between" align="center">
              <span class="selected-count">
                {{ selectedFiles.length }}
                archivo{{ selectedFiles.length !== 1 ? 's' : '' }} seleccionado{{
                  selectedFiles.length !== 1 ? 's' : ''
                }}
              </span>
              <NButton type="primary" @click="handleStartUpload">
                Subir {{ selectedFiles.length }} foto{{ selectedFiles.length !== 1 ? 's' : '' }}
              </NButton>
            </NFlex>
          </NFlex>
        </NCard>
      </template>
    </div>
  </div>
</template>

<style scoped>
.upload-content {
  padding: 24px 32px;
  display: flex;
  flex-direction: column;
}

.error-container {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.upload-header__title {
  font-size: 16px;
  font-weight: 700;
  color: #0a0a0a;
}

.upload-header__subtitle {
  font-size: 13px;
  color: var(--tt-neutral-mid);
  margin: 4px 0 0;
}

.selected-count {
  font-size: 13px;
  font-weight: 600;
  color: var(--tt-neutral-mid);
}
</style>
