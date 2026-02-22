<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { NButton, NEmpty, NGrid, NGridItem, NResult } from 'naive-ui'

import AppTopBar from '@/core/layout/AppTopBar.vue'
import { useEventDetailQuery } from '@/features/events/composables/queries/use-event-detail'
import { usePhotosGalleryQuery } from '../../composables/queries/use-photos-gallery'
import { galleryBreadcrumbs } from '../../constants/photo-breadcrumbs'
import { PHOTO_ROUTE_NAMES } from '../../routes'
import type { PhotoStatus } from '../../types/responses/photo-list.response'
import PhotoGalleryHeader from '../components/PhotoGalleryHeader/PhotoGalleryHeader.vue'
import PhotoFilterBar from '../components/PhotoFilterBar/PhotoFilterBar.vue'
import PhotoCard from '../components/PhotoCard/PhotoCard.vue'
import PhotoGallerySkeleton from '../components/PhotoGallerySkeleton/PhotoGallerySkeleton.vue'

const route = useRoute()
const router = useRouter()

const eventId = computed(() => route.params.eventId as string)
const page = ref(1)
const status = ref<PhotoStatus | null>(null)

const PHOTOS_PER_PAGE = 20

const { data: event } = useEventDetailQuery(eventId)
const {
  data: photosData,
  isPending,
  isError,
  refetch,
} = usePhotosGalleryQuery(eventId, page, status, PHOTOS_PER_PAGE)

const breadcrumbs = computed(() =>
  galleryBreadcrumbs(eventId.value, event.value?.name ?? 'Cargando...'),
)

function handleStatusChange(newStatus: PhotoStatus | null) {
  status.value = newStatus
  page.value = 1
}

function handlePhotoClick(id: string) {
  router.push({ name: PHOTO_ROUTE_NAMES.DETAIL, params: { id } })
}
</script>

<template>
  <div class="page-view">
    <AppTopBar title="Galería de Fotos" :breadcrumbs="breadcrumbs" />

    <div class="page-view__content gallery-content">
      <PhotoGallerySkeleton v-if="isPending && !photosData" />

      <div v-else-if="isError" class="error-container">
        <NResult
          status="error"
          title="Error al cargar fotos"
          description="No se pudo obtener la galería de fotos."
        >
          <template #footer>
            <NButton @click="refetch()">Reintentar</NButton>
          </template>
        </NResult>
      </div>

      <template v-else-if="event">
        <PhotoGalleryHeader :event="event" :event-id="eventId" />

        <PhotoFilterBar
          :page="page"
          :page-count="photosData?.pagination?.totalPages ?? 0"
          :active-status="status"
          @update:page="(p: number) => (page = p)"
          @update:status="handleStatusChange"
        />

        <div v-if="photosData && photosData.items.length === 0" class="empty-container">
          <NEmpty description="No hay fotos en este evento" />
        </div>

        <NGrid v-else :cols="4" :x-gap="16" :y-gap="16">
          <NGridItem v-for="photo in photosData?.items" :key="photo.id">
            <PhotoCard :photo="photo" @click="handlePhotoClick" />
          </NGridItem>
        </NGrid>
      </template>
    </div>
  </div>
</template>

<style scoped>
.gallery-content {
  padding: 24px 32px;
  display: flex;
  flex-direction: column;
}

.error-container,
.empty-container {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
