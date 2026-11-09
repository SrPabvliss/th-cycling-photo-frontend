import { useMutation, useQueryClient, type QueryClient } from '@tanstack/vue-query'

import { API_ROUTES } from '@/core/api/api-routes'
import { httpClient } from '@/core/http/axios-client'
import { RETOUCH_QUERY_KEYS } from '../../constants/retouch-query-keys'
import type { IConfirmRetouchedRequest } from '../../types/requests/confirm-retouched.request'
import type { IGenerateRetouchedUrlRequest } from '../../types/requests/generate-retouched-url.request'
import type { IOperatorRetouchOrderDetail } from '../../types/responses/operator-retouch-order-detail.response'

function removePhotoFromRetouchDetail(queryClient: QueryClient, photoId: string): void {
  queryClient.setQueriesData<IOperatorRetouchOrderDetail>(
    { queryKey: RETOUCH_QUERY_KEYS.baseAll() },
    (old) => {
      if (!old || !('photos' in old)) return old
      return { ...old, photos: old.photos.filter((p) => p.photoId !== photoId) }
    },
  )
}

interface IPresignedUrlResponse {
  isDuplicate: boolean
  url: string | null
  objectKey: string | null
  expiresIn: number | null
}

export function useUploadRetouched() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ photoId, file }: { photoId: string; file: File }) => {
      // Step 1: Generate presigned URL
      const presignedPayload: IGenerateRetouchedUrlRequest = {
        fileName: file.name,
        contentType: file.type,
      }
      const presignedResponse = await httpClient.post<IPresignedUrlResponse>(
        API_ROUTES.PHOTOS.RETOUCHED_PRESIGNED_URL(photoId),
        presignedPayload,
      )
      const { isDuplicate, url, objectKey } = presignedResponse.data

      if (isDuplicate || !url || !objectKey) {
        return { confirmed: 0, isDuplicate: true }
      }

      // Step 2: Upload to B2 via presigned URL
      await fetch(url, {
        method: 'PUT',
        headers: { 'Content-Type': file.type },
        body: file,
      })

      // Step 3: Confirm upload
      const confirmPayload: IConfirmRetouchedRequest = {
        objectKey,
        fileSize: file.size,
      }
      const confirmResponse = await httpClient.post<{ confirmed: number }>(
        API_ROUTES.PHOTOS.RETOUCHED_CONFIRM(photoId),
        confirmPayload,
      )

      return { confirmed: confirmResponse.data.confirmed, isDuplicate: false }
    },
    onSuccess: (_data, { photoId }) => {
      removePhotoFromRetouchDetail(queryClient, photoId)
      queryClient.invalidateQueries({ queryKey: [API_ROUTES.PHOTOS.BASE, 'detail', photoId] })
      queryClient.invalidateQueries({ queryKey: [API_ROUTES.PHOTOS.BASE, 'detail'] })
      queryClient.invalidateQueries({ queryKey: RETOUCH_QUERY_KEYS.baseAll() })
      queryClient.invalidateQueries({ queryKey: [API_ROUTES.OPERATOR.BASE] })
    },
  })
}
