<script setup lang="ts">
import { computed, ref } from 'vue'

import FormAlert from '@/shared/components/form/FormAlert/FormAlert.vue'
import { ErrorState, TtSkeleton } from '@/shared/components/loading'
import DownloadAllButton from '@/shared/downloads/DownloadAllButton.vue'
import { downloadFile } from '@/shared/downloads/download-file'
import { useSequentialDownload } from '@/shared/downloads/use-sequential-download'
import { useMyOrderDownloadsQuery } from '../../../composables/queries/use-my-order-downloads'
import type {
  IApiMyOrderDownloadPhoto,
  IMyOrderDetail,
} from '../../../types/responses/my-order.response'
import PurchasedPhotoTile from '@/shared/downloads/PurchasedPhotoTile.vue'

/** Download addresses last an hour: older than this, they are asked for again first. */
const FRESH_FOR_MS = 55 * 60_000

const props = defineProps<{
  order: IMyOrderDetail
}>()

const orderId = computed(() => props.order.id)
const released = computed(() => props.order.canDownload)

// Only a released order has downloads; the others show the photos as the order brings them.
const {
  status,
  data: files,
  dataUpdatedAt,
  isFetching,
  refetch,
} = useMyOrderDownloadsQuery(orderId, released)

async function freshFiles(force: boolean): Promise<IApiMyOrderDownloadPhoto[]> {
  const stale = Date.now() - dataUpdatedAt.value > FRESH_FOR_MS
  if (!force && !stale && files.value) return files.value
  const { data } = await refetch()
  if (!data) throw new Error('No downloads')
  return data
}

// A failed refresh keeps the photos already shown: the download that needed it says it failed.
const hasNothing = computed(() => status.value === 'error' && !files.value)

const downloadingId = ref<string | null>(null)
const downloadFailed = ref(false)
async function downloadOne(photoId: string) {
  if (downloadingId.value) return
  downloadingId.value = photoId
  downloadFailed.value = false
  try {
    const photo = (await freshFiles(false)).find((each) => each.id === photoId)
    if (!photo) throw new Error('Photo not found')
    await downloadFile(photo.downloadUrl, photo.filename)
  } catch {
    downloadFailed.value = true
  } finally {
    downloadingId.value = null
  }
}

const downloadAll = useSequentialDownload({
  getFiles: async () =>
    (await freshFiles(true)).map((photo) => ({ url: photo.downloadUrl, filename: photo.filename })),
})
</script>

<template>
  <section class="order-photos" aria-label="Fotos del pedido">
    <template v-if="released">
      <div v-if="status === 'pending'" class="order-photos__grid" aria-busy="true">
        <TtSkeleton
          v-for="photo in order.photos"
          :key="photo.id"
          class="order-photos__skeleton"
          height="auto"
          radius="m"
        />
      </div>

      <ErrorState
        v-else-if="hasNothing"
        title="No pudimos cargar tus fotos"
        text="Puede ser tu conexión."
        :retrying="isFetching"
        @retry="refetch()"
      />

      <template v-else>
        <DownloadAllButton label="Descargar todas" :download="downloadAll" />
        <div class="order-photos__grid">
          <PurchasedPhotoTile
            v-for="photo in files ?? []"
            :key="photo.id"
            :thumbnail-url="photo.thumbnailUrl ?? null"
            :filename="photo.filename"
            :can-download="true"
            :busy="downloadingId === photo.id"
            @download="downloadOne(photo.id)"
          />
        </div>
        <FormAlert
          v-if="downloadFailed"
          data-test="download-problem"
          tone="bad"
          title="No pudimos descargar la foto. Intenta de nuevo."
        />
      </template>
    </template>

    <div v-else class="order-photos__grid">
      <figure v-for="photo in order.photos" :key="photo.id" class="order-photos__preview">
        <img :src="photo.galleryUrl" alt="Foto del pedido" loading="lazy" decoding="async" />
      </figure>
    </div>
  </section>
</template>

<style scoped src="./order-photo-grid.css"></style>
