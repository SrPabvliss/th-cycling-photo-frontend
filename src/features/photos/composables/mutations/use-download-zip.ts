import { ref } from 'vue'
import JSZip from 'jszip'

import { API_ROUTES } from '@/core/api/api-routes'
import { httpClient } from '@/core/http/axios-client'
import type { IApiDownloadManifest } from '../../types/responses/download-manifest.response'

export function useDownloadZip() {
  const isDownloading = ref(false)
  const progress = ref(0)
  const downloadedCount = ref(0)
  const totalCount = ref(0)

  async function downloadZip(eventId: string, eventName: string) {
    isDownloading.value = true
    progress.value = 0
    downloadedCount.value = 0

    try {
      const response = await httpClient.get<IApiDownloadManifest>(
        API_ROUTES.PHOTOS.DOWNLOAD_MANIFEST(eventId),
      )
      const manifest = response.data
      totalCount.value = manifest.items.length

      if (manifest.items.length === 0) return

      const zip = new JSZip()

      for (const item of manifest.items) {
        const fileResponse = await fetch(item.downloadUrl)
        if (!fileResponse.ok) {
          console.warn(`Failed to download ${item.filename}, skipping`)
          downloadedCount.value++
          progress.value = Math.round((downloadedCount.value / totalCount.value) * 100)
          continue
        }

        const blob = await fileResponse.blob()
        zip.file(item.filename, blob)

        downloadedCount.value++
        progress.value = Math.round((downloadedCount.value / totalCount.value) * 100)
      }

      const zipBlob = await zip.generateAsync({ type: 'blob' })

      const safeName = eventName.replace(/[^a-zA-Z0-9áéíóúñÁÉÍÓÚÑ\s-]/g, '').trim()
      const link = document.createElement('a')
      link.href = URL.createObjectURL(zipBlob)
      link.download = `${safeName}-fotos.zip`
      link.click()
      URL.revokeObjectURL(link.href)
    } finally {
      isDownloading.value = false
    }
  }

  return {
    downloadZip,
    isDownloading,
    progress,
    downloadedCount,
    totalCount,
  }
}
