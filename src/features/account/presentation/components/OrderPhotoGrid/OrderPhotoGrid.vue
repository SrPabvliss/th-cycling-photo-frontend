<script setup lang="ts">
import { computed, ref } from 'vue'

import { problemKind } from '@/core/http/problem-kind'
import FormAlert from '@/shared/components/form/FormAlert/FormAlert.vue'
import { ErrorState, TtSkeleton, useLoadPhase } from '@/shared/components/loading'
import DownloadAllButton from '@/shared/downloads/DownloadAllButton.vue'
import { downloadFile } from '@/shared/downloads/download-file'
import { useSequentialDownload } from '@/shared/downloads/use-sequential-download'
import { useMyOrderDownloadsQuery } from '../../../composables/queries/use-my-order-downloads'
import type {
  IApiMyOrderDownloadPhoto,
  IMyOrderDetail,
} from '../../../types/responses/my-order.response'
import PurchasedPhotoTile from '@/shared/downloads/PurchasedPhotoTile.vue'
import PhotoListViewer from '@/shared/photo-viewer/PhotoListViewer.vue'

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
  error,
  isFetching,
  refetch,
} = useMyOrderDownloadsQuery(orderId, released)
// Without network a load that did not finish waits for it, in the place of the list.
const { isPending, isWaitingForNetwork } = useLoadPhase(status)

async function freshFiles(force: boolean): Promise<IApiMyOrderDownloadPhoto[]> {
  const stale = Date.now() - dataUpdatedAt.value > FRESH_FOR_MS
  if (!force && !stale && files.value) return files.value
  const { data } = await refetch()
  if (!data) throw new Error('No downloads')
  return data
}

// A failed refresh keeps the photos already shown: the download that needed it says it failed.
const hasNothing = computed(() => status.value === 'error' && !files.value)

// Any photo opens in full screen and the rest follow by swiping: the bought ones without
// watermark, the ones of an order not yet released as the gallery shows them.
const viewingId = ref<string | null>(null)
const largeUrl = (photo: IApiMyOrderDownloadPhoto) => photo.viewUrl ?? photo.thumbnailUrl ?? null
const viewerPhotos = computed(() =>
  released.value
    ? (files.value ?? []).flatMap((photo) => {
        const src = largeUrl(photo)
        return src ? [{ id: photo.id, src, alt: 'Foto comprada' }] : []
      })
    : props.order.photos.map((photo) => ({
        id: photo.id,
        src: photo.galleryUrl,
        alt: 'Foto del pedido',
      })),
)

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
      <div v-if="isPending" class="order-photos__grid" aria-busy="true">
        <TtSkeleton
          v-for="photo in order.photos"
          :key="photo.id"
          class="order-photos__skeleton"
          height="auto"
          radius="m"
        />
      </div>

      <ErrorState
        v-else-if="hasNothing || isWaitingForNetwork"
        what="tus fotos"
        :kind="problemKind(error)"
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
            :can-view="largeUrl(photo) !== null"
            :busy="downloadingId === photo.id"
            @download="downloadOne(photo.id)"
            @view="viewingId = photo.id"
          />
        </div>
        <FormAlert
          v-if="downloadFailed"
          data-test="download-problem"
          tone="warn"
          title="No pudimos descargar la foto. Intenta de nuevo."
        />
      </template>
    </template>

    <div v-else class="order-photos__grid">
      <figure v-for="photo in order.photos" :key="photo.id" class="order-photos__preview">
        <button
          type="button"
          class="order-photos__open"
          aria-label="Ver foto en grande"
          @click="viewingId = photo.id"
        >
          <img :src="photo.galleryUrl" alt="Foto del pedido" loading="lazy" decoding="async" />
        </button>
      </figure>
    </div>

    <PhotoListViewer v-model:photo-id="viewingId" :photos="viewerPhotos" />
  </section>
</template>

<style scoped src="./order-photo-grid.css"></style>
