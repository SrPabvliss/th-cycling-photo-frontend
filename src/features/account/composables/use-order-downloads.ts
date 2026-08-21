import { computed, type Ref } from 'vue'
import { useMutation } from '@tanstack/vue-query'

import { API_ROUTES } from '@/core/api/api-routes'
import { httpClient } from '@/core/http/axios-client'
import { triggerDownload } from '@/shared/utils/download.utils'
import { toMyOrderDownloads } from '../mappers/my-order.mapper'
import type {
  IApiMyOrderDownloads,
  IApiMyOrderDownloadPhoto,
} from '../types/responses/my-order.response'

const DOWNLOAD_GAP_MS = 1000

export function useOrderDownloads(orderId: Ref<string>) {
  async function fetchDownloads(): Promise<IApiMyOrderDownloadPhoto[]> {
    const response = await httpClient.get<IApiMyOrderDownloads>(
      API_ROUTES.MY_ORDERS.DOWNLOADS(orderId.value),
    )
    return toMyOrderDownloads(response.data).photos
  }

  const downloadOneMutation = useMutation({
    mutationFn: async (photoId: string) => {
      const photos = await fetchDownloads()
      const photo = photos.find((candidate) => candidate.id === photoId)
      if (photo) triggerDownload(photo.downloadUrl)
    },
  })

  const downloadAllMutation = useMutation({
    mutationFn: async () => {
      const photos = await fetchDownloads()
      await photos.reduce(
        (chain, photo, index) =>
          chain.then(async () => {
            triggerDownload(photo.downloadUrl)
            if (index < photos.length - 1) {
              await new Promise((resolve) => setTimeout(resolve, DOWNLOAD_GAP_MS))
            }
          }),
        Promise.resolve(),
      )
    },
  })

  const downloadingPhotoId = computed(() =>
    downloadOneMutation.isPending.value ? (downloadOneMutation.variables.value ?? null) : null,
  )

  return {
    downloadOne: downloadOneMutation.mutate,
    downloadAll: downloadAllMutation.mutate,
    isDownloadingAll: downloadAllMutation.isPending,
    downloadingPhotoId,
  }
}
