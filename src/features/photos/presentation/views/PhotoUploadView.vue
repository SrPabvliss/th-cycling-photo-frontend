<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { NButton, NCard, NFlex, NFormItem, NResult, NSelect } from 'naive-ui'

import { useEventDetailQuery } from '@/shared/composables/use-event-detail'
import { usePhotoCategoriesQuery } from '@/features/photo-categories/composables/queries/use-photo-categories'
import { useUploadOrchestration } from '../../composables/use-upload-orchestration'
import { MAX_FILES } from '../../constants/upload.constants'
import { PHOTO_ROUTE_NAMES } from '../../routes'
import PageHeader from '@/shared/components/PageHeader/PageHeader.vue'
import UploadDropzone from '../components/UploadDropzone/UploadDropzone.vue'
import UploadEventCard from '../components/UploadEventCard/UploadEventCard.vue'
import UploadControls from '../components/UploadControls/UploadControls.vue'
import UploadProgressList from '../components/UploadProgressList/UploadProgressList.vue'
import UploadSummary from '../components/UploadSummary/UploadSummary.vue'

const route = useRoute()
const router = useRouter()

const slug = computed(() => route.params.slug as string)

const { data: event, isPending: isEventPending, isError: isEventError } = useEventDetailQuery(slug)

const eventId = computed(() => event.value?.id ?? '')
const { data: categories } = usePhotoCategoriesQuery(eventId)

const categoryOptions = computed(
  () => categories.value?.map((c) => ({ label: c.name, value: c.id })) ?? [],
)

const {
  store,
  selectedFiles,
  isManuallyPaused,
  isComplete,
  canAddFiles,
  isActive,
  isOnline,
  autoConfirmedCount,
  photoCategoryId,
  handleFilesSelected,
  handleFilesRejected,
  handleStartUpload,
  handlePause,
  handleResume,
  handleCancel,
  handleRemoveItem,
  handleNewUpload,
} = useUploadOrchestration(eventId)

function handleGoToGallery() {
  router.push({ name: PHOTO_ROUTE_NAMES.GALLERY, params: { slug: slug.value } })
}
</script>

<template>
  <div class="page-view">
    <div class="page-view__content upload-content">
      <PageHeader title="Subir Fotos" :back-to="'/events/' + slug" />
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
          :auto-confirmed-count="autoConfirmedCount"
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

            <NFormItem v-if="categoryOptions.length > 0" label="Categoría (opcional)">
              <NSelect
                v-model:value="photoCategoryId"
                :options="categoryOptions"
                placeholder="Sin categoría"
                clearable
              />
            </NFormItem>

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
