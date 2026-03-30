<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { NButton, NCard, NEmpty, NFlex, NGrid, NGridItem, NIcon, NResult } from 'naive-ui'
import { TimeOutline } from '@vicons/ionicons5'

import CollapsibleCard from '@/shared/components/CollapsibleCard.vue'

import { PHOTO_ROUTE_NAMES } from '@/features/photos/routes'
import { usePhotosGalleryQuery } from '@/features/photos/composables/queries/use-photos-gallery'
import PhotoCard from '@/features/photos/presentation/components/PhotoCard/PhotoCard.vue'
import { useEventDetailQuery } from '../../composables/queries/use-event-detail'
import type { IEventDetail } from '../../types/responses/event-detail.response'
import EventDetailHeader from '../components/EventDetailHeader/EventDetailHeader.vue'
import EventStatCards from '../components/EventStatCards/EventStatCards.vue'
import EventDetailSkeleton from '../components/EventDetailSkeleton/EventDetailSkeleton.vue'
import EventCoverCard from '../components/EventCoverCard/EventCoverCard.vue'
import EventInfoCard from '../components/EventInfoCard/EventInfoCard.vue'
import EventQuickSearch from '../components/EventQuickSearch/EventQuickSearch.vue'
import EventQuickActions from '../components/EventQuickActions/EventQuickActions.vue'
import PhotoCategoryManager from '@/features/photo-categories/presentation/components/PhotoCategoryManager/PhotoCategoryManager.vue'

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

function handlePhotoClick(photoId: string) {
  router.push({ name: PHOTO_ROUTE_NAMES.DETAIL, params: { id: photoId } })
}

function navigateToGallery() {
  router.push({ name: PHOTO_ROUTE_NAMES.GALLERY, params: { eventId: id.value } })
}
</script>

<template>
  <div class="page-view">
    <div class="page-view__content detail-content">
      <EventDetailSkeleton v-if="isPending" />

      <div v-else-if="isError" class="error-container">
        <NResult
          status="error"
          title="Error al cargar evento"
          description="No se pudo obtener el detalle del evento."
        >
          <template #footer><NButton @click="refetch()">Reintentar</NButton></template>
        </NResult>
      </div>

      <template v-else-if="event">
        <EventDetailHeader :event="event" :event-id="id" />

        <div class="dashboard-grid">
          <NFlex vertical :size="24">
            <EventQuickSearch :event-id="id" />
            <EventStatCards :event="event" />

            <NCard title="Fotos Recientes" size="small">
              <template #header-extra>
                <NButton text type="primary" size="small" @click="navigateToGallery"
                  >Ver todas</NButton
                >
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

            <NCard title="Actividad Reciente" size="small">
              <NFlex vertical align="center" :size="8" style="padding: 32px 0">
                <NIcon :component="TimeOutline" :size="28" color="var(--tt-neutral-light)" />
                <span class="placeholder-text">Próximamente</span>
              </NFlex>
            </NCard>
          </NFlex>

          <NFlex vertical :size="24">
            <EventQuickActions
              :event-id="id"
              :event-name="event.name"
              :photo-count="event.photoCount"
            />
            <EventInfoCard :event="event" />
            <PhotoCategoryManager :event-id="id" />
            <EventCoverCard :event="event" :event-id="id" />

            <CollapsibleCard
              title="Clasificador Asignado"
              subtitle="Persona encargada del retoque"
              :default-expanded="false"
            >
              <NFlex vertical align="center" :size="8" style="padding: 16px 0">
                <span class="placeholder-text">Próximamente</span>
              </NFlex>
            </CollapsibleCard>
          </NFlex>
        </div>
      </template>
    </div>
  </div>
</template>

<style scoped src="./event-detail-view.css" />
