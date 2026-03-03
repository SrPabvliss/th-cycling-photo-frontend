import { useQueryClient } from '@tanstack/vue-query'
import type { Ref } from 'vue'

import { API_ROUTES } from '@/core/api/api-routes'
import { httpClient } from '@/core/http/axios-client'
import { PHOTO_QUERY_KEYS } from '../constants/query-keys'
import { toPresignedUrl, type IPresignedUrl } from '../mappers/presigned-url.mapper'
import type { IGeneratePresignedUrlRequest } from '../types/requests/generate-presigned-url.request'
import type { IApiPresignedUrl } from '../types/responses/presigned-url.response'

const PRESIGNED_URL_STALE_TIME = 4 * 60 * 1000 // 4 min (URLs expire at 5 min)

/**
 * Composable that provides cached presigned URL fetching.
 *
 * Uses `queryClient.fetchQuery()` (imperative, not `useQuery`) to cache
 * presigned URLs for 4 minutes. On 403 during upload, call `invalidate()`
 * so the next `fetch()` gets a fresh URL.
 */
export function usePresignedUrlCache(eventId: Ref<string>) {
  const queryClient = useQueryClient()

  async function fetch(fileName: string, contentType: string): Promise<IPresignedUrl> {
    const data = await queryClient.fetchQuery({
      queryKey: PHOTO_QUERY_KEYS.presignedUrl(eventId.value, fileName),
      queryFn: async () => {
        const body: IGeneratePresignedUrlRequest = { fileName, contentType }
        const response = await httpClient.post<IApiPresignedUrl>(
          API_ROUTES.PHOTOS.PRESIGNED_URL(eventId.value),
          body,
        )
        return response.data
      },
      staleTime: PRESIGNED_URL_STALE_TIME,
    })

    return toPresignedUrl(data)
  }

  function invalidate(fileName: string) {
    queryClient.removeQueries({
      queryKey: PHOTO_QUERY_KEYS.presignedUrl(eventId.value, fileName),
    })
  }

  return { fetch, invalidate }
}
