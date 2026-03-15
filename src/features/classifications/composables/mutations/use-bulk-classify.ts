import { useMutation, useQueryClient } from '@tanstack/vue-query'

import { API_ROUTES } from '@/core/api/api-routes'
import { httpClient } from '@/core/http/axios-client'
import { EVENT_QUERY_KEYS } from '@/features/events/constants/query-keys'
import { PHOTO_QUERY_KEYS } from '@/features/photos/constants/query-keys'
import type { IBulkClassifyRequest } from '../../types/requests/bulk-classify.request'
import type { IBulkClassifyResponse } from '../../types/responses/bulk-classify.response'
import { CLASSIFICATION_QUERY_KEYS } from '../../constants/query-keys'

interface BulkClassifyParams {
  data: IBulkClassifyRequest
  eventId: string
}

export function useBulkClassify() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ data }: BulkClassifyParams) => {
      const response = await httpClient.post<IBulkClassifyResponse>(
        API_ROUTES.PHOTOS.BULK_CLASSIFY,
        data,
      )
      return response.data
    },
    onSuccess: (_data, { eventId }) => {
      queryClient.invalidateQueries({ queryKey: PHOTO_QUERY_KEYS.all() })
      queryClient.invalidateQueries({ queryKey: EVENT_QUERY_KEYS.detail(eventId) })
      queryClient.invalidateQueries({ queryKey: EVENT_QUERY_KEYS.stats() })
      queryClient.invalidateQueries({ queryKey: CLASSIFICATION_QUERY_KEYS.all() })
    },
  })
}
