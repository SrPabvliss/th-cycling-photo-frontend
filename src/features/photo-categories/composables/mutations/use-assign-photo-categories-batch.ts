import { useMutation, useQueryClient } from '@tanstack/vue-query'

import { API_ROUTES } from '@/core/api/api-routes'
import { httpClient } from '@/core/http/axios-client'
import { PHOTO_CATEGORY_QUERY_KEYS } from '../../constants/query-keys'

interface AssignBatchParams {
  eventId: string
  categoryIds: number[]
}

export function useAssignPhotoCategoriesBatch() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ eventId, categoryIds }: AssignBatchParams) => {
      await Promise.all(
        categoryIds.map((photoCategoryId) =>
          httpClient.post(
            API_ROUTES.PHOTO_CATEGORIES.ASSIGN(eventId),
            { photoCategoryId },
            { silent: true },
          ),
        ),
      )
      return eventId
    },
    onSuccess: (eventId) => {
      queryClient.invalidateQueries({ queryKey: PHOTO_CATEGORY_QUERY_KEYS.byEvent(eventId) })
    },
  })
}
