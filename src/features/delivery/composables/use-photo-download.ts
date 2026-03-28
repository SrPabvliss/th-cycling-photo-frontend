import { ref } from 'vue'

import type { IDeliveryPhoto } from '../types/responses/delivery-data.response'

/**
 * Triggers a browser download by navigating to the presigned URL.
 * The backend sets Content-Disposition: attachment, so the browser downloads instead of displaying.
 * Uses an iframe to avoid navigating away from the page.
 */
function triggerDownload(url: string): void {
  const iframe = document.createElement('iframe')
  iframe.style.display = 'none'
  iframe.src = url
  document.body.appendChild(iframe)
  // Clean up after download starts
  setTimeout(() => document.body.removeChild(iframe), 10_000)
}

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
