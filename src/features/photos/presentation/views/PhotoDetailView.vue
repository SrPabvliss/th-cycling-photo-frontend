<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { NButton, NCard, NFlex, NIcon, NResult, NTag } from 'naive-ui'
import { CalendarOutline, ImageOutline, ResizeOutline } from '@vicons/ionicons5'

import { formatRelativeTime } from '@/shared/utils/date.utils'
import { formatFileSize } from '@/shared/utils/format.utils'
import PageHeader from '@/shared/components/PageHeader.vue'
import { usePhotoDetailQuery } from '../../composables/queries/use-photo-detail'
import { PHOTO_STATUS_CONFIG } from '../../constants/status-config'

const route = useRoute()
const id = computed(() => route.params.id as string)

const { data: photo, isPending, isError, refetch } = usePhotoDetailQuery(id)

const eventId = computed(() => photo.value?.eventId ?? '')
</script>

<template>
  <div class="page-view">
    <div class="page-view__content detail-content">
      <PageHeader
        :title="photo?.filename ?? 'Detalle de Foto'"
        :back-to="'/events/' + eventId + '/photos'"
      />
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

                <NFlex v-if="photo.width && photo.height" align="start" :size="12">
                  <div class="detail-info__icon">
                    <NIcon :component="ResizeOutline" :size="18" />
                  </div>
                  <div>
                    <p class="detail-info__label">Dimensiones</p>
                    <p class="detail-info__value">{{ photo.width }} x {{ photo.height }} px</p>
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

                <div v-if="photo.unclassifiedReason" class="detail-info__reason">
                  <p class="detail-info__label">Razón sin clasificar</p>
                  <p class="detail-info__value">{{ photo.unclassifiedReason }}</p>
                </div>
              </NFlex>
            </NCard>
          </NFlex>
        </div>
      </template>
    </div>
  </div>
</template>

<style scoped src="./photo-detail-view.css"></style>
