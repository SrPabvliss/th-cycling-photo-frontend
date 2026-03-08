<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { NButton, NCard, NEmpty, NFlex, NGrid, NGridItem, NResult } from 'naive-ui'

import AppTopBar from '@/core/layout/AppTopBar.vue'
import { PHOTO_ROUTE_NAMES } from '@/features/photos/routes'
import { usePhotosGalleryQuery } from '@/features/photos/composables/queries/use-photos-gallery'
import PhotoCard from '@/features/photos/presentation/components/PhotoCard/PhotoCard.vue'
import { useEventDetailQuery } from '../../composables/queries/use-event-detail'
import { detailBreadcrumbs } from '../../constants/event-breadcrumbs'
import type { IEventDetail } from '../../types/responses/event-detail.response'
import EventDetailHeader from '../components/EventDetailHeader/EventDetailHeader.vue'
import EventStatCards from '../components/EventStatCards/EventStatCards.vue'
import EventDetailSkeleton from '../components/EventDetailSkeleton/EventDetailSkeleton.vue'
import EventCoverCard from '../components/EventCoverCard/EventCoverCard.vue'
import EventInfoCard from '../components/EventInfoCard/EventInfoCard.vue'

const route = useRoute()
const router = useRouter()
const id = computed(() => route.params.id as IEventDetail['id'])

const { data: event, isPending, isError, refetch } = useEventDetailQuery(id)

const recentPhotosPage = ref(1)
const recentPhotosStatus = ref(null)
const RECENT_PHOTOS_LIMIT = 4

const { data: recentPhotos } = usePhotosGalleryQuery(
  id,
  recentPhotosPage,
  recentPhotosStatus,
  RECENT_PHOTOS_LIMIT,
)

const breadcrumbs = computed(() => detailBreadcrumbs(event.value?.name ?? 'Cargando...'))

function handlePhotoClick(photoId: string) {
  router.push({ name: PHOTO_ROUTE_NAMES.DETAIL, params: { id: photoId } })
}
</script>

<template>
  <div class="page-view">
    <AppTopBar title="Detalle de Evento" :breadcrumbs="breadcrumbs" />

    <div class="page-view__content detail-content">
      <EventDetailSkeleton v-if="isPending" />

      <div v-else-if="isError" class="error-container">
        <NResult
          status="error"
          title="Error al cargar evento"
          description="No se pudo obtener el detalle del evento."
        >
          <template #footer>
            <NButton @click="refetch()">Reintentar</NButton>
          </template>
        </NResult>
      </div>

      <template v-else-if="event">
        <EventDetailHeader :event="event" :event-id="id" />

        <div class="dashboard-grid">
          <NFlex vertical :size="24">
            <EventStatCards :event="event" />

            <NCard title="Fotos Recientes" size="small">
              <template #header-extra>
                <NButton
                  text
                  type="primary"
                  size="small"
                  @click="
                    router.push({
                      name: PHOTO_ROUTE_NAMES.GALLERY,
                      params: { eventId: id },
                    })
                  "
                >
                  Ver todas
                </NButton>
              </template>
              <NGrid
                v-if="recentPhotos && recentPhotos.items.length > 0"
                :cols="4"
                :x-gap="12"
                :y-gap="12"
              >
                <NGridItem v-for="photo in recentPhotos.items" :key="photo.id">
                  <PhotoCard :photo="photo" @click="handlePhotoClick" />
                </NGridItem>
              </NGrid>
              <NEmpty
                v-else
                description="Las fotos aparecerán aquí cuando se suban al evento"
                style="padding: 48px 0"
              />
            </NCard>
          </NFlex>

          <NFlex vertical :size="24">
            <EventCoverCard :event="event" :event-id="id" />
            <EventInfoCard :event="event" />
          </NFlex>
        </div>
      </template>
    </div>
  </div>
</template>

<style scoped>
.detail-content {
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

.dashboard-grid {
  display: grid;
  grid-template-columns: 1fr 340px;
  gap: 32px;
}
</style>
