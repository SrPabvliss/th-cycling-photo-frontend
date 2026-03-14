<script setup lang="ts">
import { NButton, NEmpty, NIcon, NResult, NSpin, NSwitch } from 'naive-ui'
import { FunnelOutline } from '@vicons/ionicons5'

import { useClassificationWorkspace } from '../../composables/use-classification-workspace'
import WorkspaceHeader from '../components/WorkspaceHeader/WorkspaceHeader.vue'
import WorkspacePhotoPanel from '../components/WorkspacePhotoPanel/WorkspacePhotoPanel.vue'
import CyclistList from '../components/CyclistList/CyclistList.vue'
import PhotoActions from '../components/PhotoActions/PhotoActions.vue'

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
} = useClassificationWorkspace()
</script>

<template>
  <div class="workspace">
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
      <div class="workspace__photo">
        <WorkspacePhotoPanel
          v-if="photo"
          :photo="photo"
          :has-next="hasNext"
          :has-prev="hasPrev"
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

        <CyclistList :photo-id="currentPhotoId" />

        <PhotoActions
          v-if="photo"
          :photo-id="currentPhotoId"
          :event-id="eventId"
          :is-classified="!!photo.classifiedAt"
          :has-next="hasNext"
          :cyclist-count="photo.detectedCyclists.length"
          @next="goNext"
        />
      </div>
    </div>
  </div>
</template>

<style scoped src="./classification-workspace-view.css" />
