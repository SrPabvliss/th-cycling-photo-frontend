<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { NButton, NCard, NFlex, NIcon, NResult, NTag, useDialog } from 'naive-ui'
import {
  CalendarOutline,
  CheckmarkDoneOutline,
  ImageOutline,
  TrashOutline,
} from '@vicons/ionicons5'

import { REVIEW_ROUTE_NAMES } from '@/features/review/routes'

import { formatRelativeTime } from '@/shared/utils/date.utils'
import { formatFileSize } from '@/shared/utils/format.utils'
import PageHeader from '@/shared/components/PageHeader.vue'
import { useDeletePhoto } from '../../composables/mutations/use-delete-photo'
import { usePhotoDetailBySlugQuery } from '../../composables/queries/use-photo-detail-by-slug'
import { PHOTO_ROUTE_NAMES } from '../../routes'
import { PHOTO_STATUS_CONFIG } from '../../constants/status-config'
import PhotoBibsGrid from '../components/PhotoBibsGrid/PhotoBibsGrid.vue'
import PhotoColorsList from '../components/PhotoColorsList/PhotoColorsList.vue'

const route = useRoute()
const router = useRouter()
const dialog = useDialog()
const slug = computed(() => route.params.slug as string)

const { data: photo, isPending, isError, refetch } = usePhotoDetailBySlugQuery(slug)
const { mutate: deletePhoto, isPending: isDeleting } = useDeletePhoto()

function handleDelete() {
  if (!photo.value) return
  const id = photo.value.id
  const eventSlug = photo.value.eventSlug
  dialog.warning({
    title: 'Eliminar foto',
    content: '¿Eliminar esta foto? Esta acción no se puede deshacer.',
    positiveText: 'Eliminar',
    negativeText: 'Cancelar',
    positiveButtonProps: { type: 'error' },
    onPositiveClick: () => {
      deletePhoto(
        { id },
        {
          onSuccess: () =>
            router.push({ name: PHOTO_ROUTE_NAMES.GALLERY, params: { slug: eventSlug } }),
        },
      )
    },
  })
}

function goToReview() {
  if (!photo.value?.eventSlug) return
  router.push({
    name: REVIEW_ROUTE_NAMES.WORKSPACE,
    params: { eventSlug: photo.value.eventSlug },
    query: { photo: photo.value.publicSlug },
  })
}

function handleEditReview() {
  router.push({
    name: REVIEW_ROUTE_NAMES.SINGLE_PHOTO,
    params: { photoSlug: slug.value },
  })
}
</script>

<template>
  <div class="page-view">
    <div class="page-view__content detail-content">
      <PageHeader
        :title="photo?.filename ?? 'Detalle de Foto'"
        :back-to="'/events/' + (photo?.eventSlug ?? '') + '/photos'"
      >
        <NButton type="primary" @click="handleEditReview">Editar revisión</NButton>
        <NButton v-if="photo?.eventSlug" type="primary" @click="goToReview">
          <template #icon><NIcon :component="CheckmarkDoneOutline" /></template>
          Revisar este evento
        </NButton>
      </PageHeader>
      <!-- Loading -->
      <div v-if="isPending" class="detail-loading">
        <NCard>
          <NFlex justify="center" style="padding: 64px 0">
            <span style="color: var(--tt-neutral-mid)">Cargando foto...</span>
          </NFlex>
        </NCard>
      </div>

      <!-- Error -->
      <div v-else-if="isError" class="error-container">
        <NResult
          status="error"
          title="Error al cargar foto"
          description="No se pudo obtener el detalle de la foto."
        >
          <template #footer>
            <NButton @click="refetch()">Reintentar</NButton>
          </template>
        </NResult>
      </div>

      <!-- 3-col layout: info | photo | detections (like review workspace) -->
      <template v-else-if="photo">
        <div class="detail-layout">
          <aside class="detail-layout__info">
            <NFlex align="center" :size="6" wrap class="detail-info__tags">
              <NTag :type="PHOTO_STATUS_CONFIG[photo.status].type" size="small" round>
                {{ PHOTO_STATUS_CONFIG[photo.status].label }}
              </NTag>
              <NTag v-if="photo.reviewedAt" type="success" size="small" round>Revisada</NTag>
            </NFlex>

            <h3 class="detail-side__title">Información</h3>

            <NFlex vertical :size="12">
              <NFlex align="start" :size="10">
                <div class="detail-info__icon">
                  <NIcon :component="ImageOutline" :size="16" />
                </div>
                <div>
                  <p class="detail-info__label">Archivo</p>
                  <p class="detail-info__value">
                    {{ photo.mimeType }} · {{ formatFileSize(photo.fileSize) }}
                  </p>
                </div>
              </NFlex>

              <NFlex align="start" :size="10">
                <div class="detail-info__icon">
                  <NIcon :component="CalendarOutline" :size="16" />
                </div>
                <div>
                  <p class="detail-info__label">Subida</p>
                  <p class="detail-info__value">{{ formatRelativeTime(photo.uploadedAt) }}</p>
                </div>
              </NFlex>

              <NFlex v-if="photo.processedAt" align="start" :size="10">
                <div class="detail-info__icon">
                  <NIcon :component="CalendarOutline" :size="16" />
                </div>
                <div>
                  <p class="detail-info__label">Procesada</p>
                  <p class="detail-info__value">{{ formatRelativeTime(photo.processedAt) }}</p>
                </div>
              </NFlex>
            </NFlex>

            <div class="detail-info__danger">
              <NButton
                quaternary
                type="error"
                size="small"
                :loading="isDeleting"
                @click="handleDelete"
              >
                <template #icon><NIcon :component="TrashOutline" /></template>
                Eliminar foto
              </NButton>
            </div>
          </aside>

          <section class="detail-layout__photo">
            <img :src="photo.imageUrl" :alt="photo.filename" class="detail-image" />
          </section>

          <aside class="detail-layout__detections">
            <section class="detail-detections__section">
              <h3 class="detail-side__title">Placas detectadas</h3>
              <PhotoBibsGrid v-if="photo.bibs.length" :bibs="photo.bibs" />
              <p v-else class="detail-side__empty">Sin placas detectadas.</p>
            </section>

            <section class="detail-detections__section">
              <h3 class="detail-side__title">Colores detectados</h3>
              <PhotoColorsList v-if="photo.colors.length" :colors="photo.colors" />
              <p v-else class="detail-side__empty">Sin colores detectados.</p>
            </section>
          </aside>
        </div>
      </template>
    </div>
  </div>
</template>

<style scoped src="./photo-detail-view.css"></style>
