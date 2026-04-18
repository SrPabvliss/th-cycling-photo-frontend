<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { NButton, NIcon, NSpin } from 'naive-ui'
import { DownloadOutline } from '@vicons/ionicons5'

import PublicLayout from '@/core/layout/public/PublicLayout.vue'
import { useDeliveryQuery } from '../../composables/queries/use-delivery'
import { usePhotoDownload } from '../../composables/use-photo-download'
import type { IDeliveryPhoto } from '../../types/responses/delivery-data.response'
import DeliveryHeader from '../components/DeliveryHeader/DeliveryHeader.vue'
import DeliveryPhotoGrid from '../components/DeliveryPhotoGrid/DeliveryPhotoGrid.vue'
import DeliveryExpired from '../components/DeliveryExpired/DeliveryExpired.vue'
import PreviewNotFound from '@/features/client-gallery/presentation/components/PreviewNotFound/PreviewNotFound.vue'

const route = useRoute()
const token = computed(() => route.params.token as string)

const { data: delivery, isPending, isExpired, isNotFound } = useDeliveryQuery(token)
const { downloadSingle, downloadAll, isDownloadingAll, downloadProgress, downloadTotal } =
  usePhotoDownload()

function handleDownload(photo: IDeliveryPhoto) {
  downloadSingle(photo)
}

function handleDownloadAll() {
  if (delivery.value) downloadAll(delivery.value.photos)
}
</script>

<template>
  <PublicLayout>
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
  </PublicLayout>
</template>

<style scoped src="./delivery-view.css" />
