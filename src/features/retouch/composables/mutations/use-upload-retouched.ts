import { useMutation, useQueryClient } from '@tanstack/vue-query'

import { API_ROUTES } from '@/core/api/api-routes'
import { httpClient } from '@/core/http/axios-client'
import { PHOTO_QUERY_KEYS } from '@/features/photos/constants/query-keys'
import type { IConfirmRetouchedRequest } from '../../types/requests/confirm-retouched.request'
import type { IGenerateRetouchedUrlRequest } from '../../types/requests/generate-retouched-url.request'

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
      queryClient.invalidateQueries({ queryKey: PHOTO_QUERY_KEYS.detail(photoId) })
    },
  })
}
