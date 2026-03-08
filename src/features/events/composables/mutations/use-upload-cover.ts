import { useMutation, useQueryClient } from '@tanstack/vue-query'

import { API_ROUTES } from '@/core/api/api-routes'
import { httpClient } from '@/core/http/axios-client'
import { b2UploadClient } from '@/core/http/b2-upload-client'
import { EVENT_QUERY_KEYS } from '../../constants/query-keys'
import type { IApiCoverPresignedUrl } from '../../types/responses/cover-presigned-url.response'

export function useUploadCover(eventId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (file: File) => {
      const { data: presigned } = await httpClient.post<IApiCoverPresignedUrl>(
        API_ROUTES.EVENTS.COVER_PRESIGNED_URL(eventId),
        { fileName: file.name, contentType: file.type },
        { silent: true },
      )

      await b2UploadClient.put(presigned.url, file, {
        headers: { 'Content-Type': file.type },
      })

      await httpClient.post(API_ROUTES.EVENTS.COVER_CONFIRM(eventId), {
        storageKey: presigned.objectKey,
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: EVENT_QUERY_KEYS.all() })
    },
  })
}
