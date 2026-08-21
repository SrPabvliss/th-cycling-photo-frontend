import { ref } from 'vue'

import { triggerDownload } from '@/shared/utils/download.utils'
import type { IDeliveryPhoto } from '../types/responses/delivery-data.response'

export function usePhotoDownload() {
  const isDownloadingAll = ref(false)
  const downloadProgress = ref(0)
  const downloadTotal = ref(0)

  function downloadSingle(photo: IDeliveryPhoto) {
    triggerDownload(photo.downloadUrl)
  }

  async function downloadAll(photos: IDeliveryPhoto[]) {
    isDownloadingAll.value = true
    downloadTotal.value = photos.length
    downloadProgress.value = 0

    for (const photo of photos) {
      downloadProgress.value++
      triggerDownload(photo.downloadUrl)
      // Delay between downloads so browser doesn't block them
      if (downloadProgress.value < photos.length) {
        await new Promise((resolve) => setTimeout(resolve, 1000))
      }
    }

    isDownloadingAll.value = false
  }

  return {
    downloadSingle,
    downloadAll,
    isDownloadingAll,
    downloadProgress,
    downloadTotal,
  }
}
