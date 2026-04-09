<script setup lang="ts">
import { NButton, NEmpty, NIcon, NResult, NSpin, NSwitch } from 'naive-ui'
import { FunnelOutline } from '@vicons/ionicons5'

import { useClassificationWorkspace } from '../../../composables/use-classification-workspace'
import WorkspaceHeader from '../WorkspaceHeader/WorkspaceHeader.vue'
import WorkspacePhotoPanel from '../WorkspacePhotoPanel/WorkspacePhotoPanel.vue'
import CyclistList from '../CyclistList/CyclistList.vue'
import PhotoActions from '../PhotoActions/PhotoActions.vue'
import WorkingGroupGallery from '../WorkingGroupGallery/WorkingGroupGallery.vue'
import SimilarPhotosPanel from '../SimilarPhotosPanel/SimilarPhotosPanel.vue'
import PhotoPreviewModal from '../PhotoPreviewModal/PhotoPreviewModal.vue'
import LabelConflictModal from '../LabelConflictModal/LabelConflictModal.vue'
import BulkClassifyForm from '../BulkClassifyForm/BulkClassifyForm.vue'

const {
  eventId,
  event,
  isLoading,
  isEventError,
  photo,
  isPhotoPending,
  currentPhotoId,
  progress,
  hasNext,
  hasPrev,
  showOnlyUnclassified,
  breadcrumbs,
  goNext,
  goPrev,
  workingGroup,
  labelConflict,
  previewStorageKey,
  previewModalPhoto,
  showPreviewModal,
  handlePreviewSimilar,
  handlePreviewAdd,
  handleAddToGroup,
  handleBulkClassifyDone,
  handleBulkClassifyCancel,
} = useClassificationWorkspace()
</script>

<template>
  <WorkspaceHeader
    :breadcrumbs="breadcrumbs"
    :progress="progress"
    :event-id="eventId"
    :classified-count="event?.classifiedCount ?? 0"
    :total-photos="event?.photoCount ?? 0"
  />

  <div v-if="isLoading" class="workspace__loading">
    <NSpin size="large" />
  </div>

  <div v-else-if="isEventError" class="workspace__error">
    <NResult
      status="error"
      title="Error al cargar"
      description="No se pudo cargar la información del evento."
    />
  </div>

  <div v-else-if="!currentPhotoId" class="workspace__empty">
    <NEmpty
      :description="
        showOnlyUnclassified
          ? 'Todas las fotos están clasificadas'
          : 'No hay fotos para clasificar en este evento'
      "
    >
      <template #extra>
        <NButton v-if="showOnlyUnclassified" @click="showOnlyUnclassified = false">
          Mostrar todas
        </NButton>
        <NButton v-else @click="$router.back()">Volver</NButton>
      </template>
    </NEmpty>
  </div>

  <div v-else class="workspace__body">
    <div class="workspace__left-panel">
      <WorkingGroupGallery
        v-if="photo"
        :current-photo="{
          id: currentPhotoId,
          storageKey: photo.storageKey,
          filename: photo.filename,
        }"
        :group-photos="workingGroup.groupPhotos.value"
        :preview-photo-id="workingGroup.previewPhotoId.value"
        @preview="workingGroup.setPreview"
        @remove="workingGroup.removeFromGroup"
      />

      <div class="workspace__left-divider" />

      <SimilarPhotosPanel
        :photo-id="currentPhotoId"
        :group-photo-ids="workingGroup.allPhotoIds.value"
        @add="handleAddToGroup"
        @preview="handlePreviewSimilar"
      />
    </div>

    <div class="workspace__photo">
      <WorkspacePhotoPanel
        v-if="photo"
        :photo="photo"
        :has-next="hasNext"
        :has-prev="hasPrev"
        :preview-storage-key="previewStorageKey"
        @next="goNext"
        @prev="goPrev"
      />
      <div v-if="isPhotoPending" class="workspace__photo-overlay">
        <NSpin size="large" />
      </div>
    </div>

    <div class="workspace__sidebar">
      <div class="workspace__filter">
        <NIcon :component="FunnelOutline" :size="14" />
        <span>Solo no clasificadas</span>
        <NSwitch v-model:value="showOnlyUnclassified" size="small" />
      </div>

      <template v-if="workingGroup.hasGroup.value">
        <BulkClassifyForm
          :photo-ids="workingGroup.allPhotoIds.value"
          :event-id="eventId"
          :initial-labels="labelConflict.inheritedLabels.value"
          @done="handleBulkClassifyDone"
          @cancel="handleBulkClassifyCancel"
        />
      </template>

      <template v-else>
        <CyclistList :photo-id="currentPhotoId" />

        <PhotoActions
          v-if="photo"
          :photo-id="currentPhotoId"
          :event-id="eventId"
          :is-classified="!!photo.classifiedAt"
          :has-next="hasNext"
          :cyclist-count="photo.detectedParticipants.length"
          :group-size="workingGroup.groupSize.value"
          @next="goNext"
        />
      </template>
    </div>
  </div>

  <!-- Modals -->
  <PhotoPreviewModal
    v-model:show="showPreviewModal"
    :photo="previewModalPhoto"
    @add="handlePreviewAdd"
    @close="showPreviewModal = false"
  />

  <LabelConflictModal
    :show="labelConflict.showInheritModal.value"
    mode="inherit"
    :incoming-labels="labelConflict.incomingLabels.value"
    :existing-labels="null"
    :photo-filename="labelConflict.pendingPhoto.value?.filename"
    @update:show="labelConflict.showInheritModal.value = $event"
    @inherit="(accept) => labelConflict.resolveInherit(accept, workingGroup.addToGroup)"
  />

  <LabelConflictModal
    :show="labelConflict.showConflictModal.value"
    mode="conflict"
    :incoming-labels="labelConflict.incomingLabels.value"
    :existing-labels="labelConflict.existingLabels.value"
    @update:show="labelConflict.showConflictModal.value = $event"
    @conflict="(winner) => labelConflict.resolveConflict(winner, workingGroup.addToGroup)"
  />
</template>
