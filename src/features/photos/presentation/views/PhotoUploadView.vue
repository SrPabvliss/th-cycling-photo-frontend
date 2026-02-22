<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { NButton, NCard, NFlex, NResult } from 'naive-ui'

import AppTopBar from '@/core/layout/AppTopBar.vue'
import { useEventDetailQuery } from '@/features/events/composables/queries/use-event-detail'
import { useUploadPhotos } from '../../composables/mutations/use-upload-photos'
import { uploadBreadcrumbs } from '../../constants/photo-breadcrumbs'
import { MAX_FILES } from '../../constants/upload.constants'
import { PHOTO_ROUTE_NAMES } from '../../routes'
import UploadDropzone from '../components/UploadDropzone/UploadDropzone.vue'
import UploadFileList from '../components/UploadFileList/UploadFileList.vue'
import UploadProgressBar from '../components/UploadProgressBar/UploadProgressBar.vue'
import UploadEventCard from '../components/UploadEventCard/UploadEventCard.vue'

const route = useRoute()
const router = useRouter()

const eventId = computed(() => route.params.eventId as string)
const selectedFiles = ref<File[]>([])

const {
  data: event,
  isPending: isEventPending,
  isError: isEventError,
} = useEventDetailQuery(eventId)
const {
  mutate,
  isPending: isUploading,
  isSuccess,
  data: uploadedData,
  uploadProgress,
} = useUploadPhotos()

const breadcrumbs = computed(() =>
  uploadBreadcrumbs(eventId.value, event.value?.name ?? 'Cargando...'),
)

const canUpload = computed(() => selectedFiles.value.length > 0 && !isUploading.value)

function handleFilesSelected(files: File[]) {
  const remaining = MAX_FILES - selectedFiles.value.length
  selectedFiles.value = [...selectedFiles.value, ...files.slice(0, remaining)]
}

function handleRemoveFile(index: number) {
  selectedFiles.value = selectedFiles.value.filter((_, i) => i !== index)
}

function handleUpload() {
  if (!canUpload.value) return
  mutate({ eventId: eventId.value, files: selectedFiles.value })
}

function handleGoToGallery() {
  router.push({ name: PHOTO_ROUTE_NAMES.GALLERY, params: { eventId: eventId.value } })
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

        <NCard style="margin-top: 24px">
          <template #header>
            <div>
              <div class="upload-header__title">Seleccionar fotos</div>
              <p class="upload-header__subtitle">
                Máximo {{ MAX_FILES }} archivos por carga. JPEG, PNG o WebP.
              </p>
            </div>
          </template>

          <!-- Post-upload success -->
          <template v-if="isSuccess">
            <UploadProgressBar
              :progress="100"
              :is-complete="true"
              :uploaded-count="uploadedData?.length ?? 0"
            />
            <NFlex justify="end" style="margin-top: 16px">
              <NButton @click="handleGoToGallery">Ver Galería</NButton>
            </NFlex>
          </template>

          <!-- During upload -->
          <template v-else-if="isUploading">
            <UploadProgressBar
              :progress="uploadProgress"
              :is-complete="false"
              :uploaded-count="0"
            />
          </template>

          <!-- Pre-upload: file selection -->
          <template v-else>
            <NFlex vertical :size="16">
              <UploadDropzone
                :disabled="selectedFiles.length >= MAX_FILES"
                @files-selected="handleFilesSelected"
              />

              <UploadFileList
                :files="selectedFiles"
                :is-uploading="isUploading"
                @remove-file="handleRemoveFile"
              />
            </NFlex>

            <NFlex v-if="selectedFiles.length > 0" justify="end" style="margin-top: 16px">
              <NButton type="primary" :disabled="!canUpload" @click="handleUpload">
                Subir {{ selectedFiles.length }} foto{{ selectedFiles.length !== 1 ? 's' : '' }}
              </NButton>
            </NFlex>
          </template>
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
</style>
