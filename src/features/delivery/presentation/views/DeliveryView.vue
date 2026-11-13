<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { NButton, NIcon, NSpin } from 'naive-ui'
import { DownloadOutline } from '@vicons/ionicons5'

import { useDeliveryQuery } from '../../composables/queries/use-delivery'
import { usePhotoDownload } from '../../composables/use-photo-download'
import type { IDeliveryPhoto } from '../../types/responses/delivery-data.response'
import DeliveryHeader from '../components/DeliveryHeader/DeliveryHeader.vue'
import DeliveryPhotoGrid from '../components/DeliveryPhotoGrid/DeliveryPhotoGrid.vue'
import DeliveryExpired from '../components/DeliveryExpired/DeliveryExpired.vue'
import PreviewNotFound from '@/shared/components/PreviewNotFound/PreviewNotFound.vue'

const route = useRoute()
const token = computed(() => route.params.token as string)

// Bridge to the new query until this view is rebuilt.
const { data: delivery, isPending, problem, ensureFresh } = useDeliveryQuery(token)
const isExpired = computed(() => problem.value === 'expired' || problem.value === 'access-limit')
const isNotFound = computed(() => problem.value === 'not-found')
async function ensureFreshUrls() {
  await ensureFresh()
  return delivery.value
}
const { downloadSingle, downloadAll, isDownloadingAll, downloadProgress, downloadTotal } =
  usePhotoDownload()

async function handleDownload(photo: IDeliveryPhoto) {
  const fresh = await ensureFreshUrls()
  const freshPhoto = fresh?.photos.find((candidate) => candidate.id === photo.id)
  if (freshPhoto) downloadSingle(freshPhoto)
}

async function handleDownloadAll() {
  const fresh = await ensureFreshUrls()
  if (fresh) downloadAll(fresh.photos)
}
</script>

<template>
  <div v-if="isPending" class="dv-loading">
    <NSpin size="large" />
    <p class="dv-loading__text">Cargando tus fotos...</p>
  </div>

  <DeliveryExpired v-else-if="isExpired" />

  <PreviewNotFound v-else-if="isNotFound" />

  <template v-else-if="delivery">
    <DeliveryHeader :delivery="delivery" />

    <!-- Download all bar -->
    <div class="dv-actions">
      <NButton type="primary" size="large" :loading="isDownloadingAll" @click="handleDownloadAll">
        <template #icon><NIcon :component="DownloadOutline" /></template>
        {{
          isDownloadingAll
            ? `Descargando ${downloadProgress} de ${downloadTotal}...`
            : 'Descargar todas'
        }}
      </NButton>
    </div>

    <DeliveryPhotoGrid :photos="delivery.photos" @download="handleDownload" />
  </template>
</template>

<style scoped src="./delivery-view.css" />
