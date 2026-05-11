<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { NButton, NCard, NFlex, NIcon, NResult, NTag } from 'naive-ui'
import { CalendarOutline, CheckmarkDoneOutline, ImageOutline } from '@vicons/ionicons5'

import { REVIEW_ROUTE_NAMES } from '@/features/review/routes'

import { formatRelativeTime } from '@/shared/utils/date.utils'
import { formatFileSize } from '@/shared/utils/format.utils'
import PageHeader from '@/shared/components/PageHeader.vue'
import { usePhotoDetailBySlugQuery } from '../../composables/queries/use-photo-detail-by-slug'
import { PHOTO_STATUS_CONFIG } from '../../constants/status-config'
import PhotoBibsGrid from '../components/PhotoBibsGrid/PhotoBibsGrid.vue'
import PhotoColorsList from '../components/PhotoColorsList/PhotoColorsList.vue'

const route = useRoute()
const router = useRouter()
const slug = computed(() => route.params.slug as string)

const { data: photo, isPending, isError, refetch } = usePhotoDetailBySlugQuery(slug)

function goToReview() {
  if (!photo.value?.eventSlug) return
  router.push({
    name: REVIEW_ROUTE_NAMES.WORKSPACE,
    params: { eventSlug: photo.value.eventSlug },
    query: { photo: photo.value.publicSlug },
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

      <!-- Content -->
      <template v-else-if="photo">
        <div class="detail-grid">
          <!-- Image -->
          <NCard class="detail-grid__image-card">
            <img :src="photo.imageUrl" :alt="photo.filename" class="detail-image" />
          </NCard>

          <!-- Info panel -->
          <NFlex vertical :size="16">
            <NCard>
              <template #header>
                <NFlex align="center" :size="8">
                  <span class="detail-info__title">{{ photo.filename }}</span>
                  <NTag :type="PHOTO_STATUS_CONFIG[photo.status].type" size="small" round>
                    {{ PHOTO_STATUS_CONFIG[photo.status].label }}
                  </NTag>
                  <NTag v-if="photo.reviewedAt" type="success" size="small" round> Revisada </NTag>
                </NFlex>
              </template>

              <NFlex vertical :size="16">
                <NFlex align="start" :size="12">
                  <div class="detail-info__icon">
                    <NIcon :component="ImageOutline" :size="18" />
                  </div>
                  <div>
                    <p class="detail-info__label">Archivo</p>
                    <p class="detail-info__value">
                      {{ photo.mimeType }} · {{ formatFileSize(photo.fileSize) }}
                    </p>
                  </div>
                </NFlex>

                <NFlex align="start" :size="12">
                  <div class="detail-info__icon">
                    <NIcon :component="CalendarOutline" :size="18" />
                  </div>
                  <div>
                    <p class="detail-info__label">Subida</p>
                    <p class="detail-info__value">{{ formatRelativeTime(photo.uploadedAt) }}</p>
                  </div>
                </NFlex>

                <NFlex v-if="photo.processedAt" align="start" :size="12">
                  <div class="detail-info__icon">
                    <NIcon :component="CalendarOutline" :size="18" />
                  </div>
                  <div>
                    <p class="detail-info__label">Procesada</p>
                    <p class="detail-info__value">{{ formatRelativeTime(photo.processedAt) }}</p>
                  </div>
                </NFlex>
              </NFlex>
            </NCard>
          </NFlex>
        </div>

        <section v-if="photo.bibs.length" class="detail-section">
          <h2 class="detail-section__title">Placas detectadas</h2>
          <PhotoBibsGrid :bibs="photo.bibs" />
        </section>

        <section v-if="photo.colors.length" class="detail-section">
          <h2 class="detail-section__title">Colores detectados</h2>
          <PhotoColorsList :colors="photo.colors" />
        </section>
      </template>
    </div>
  </div>
</template>

<style scoped src="./photo-detail-view.css"></style>
