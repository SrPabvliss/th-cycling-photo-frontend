import { useMutation, useQueryClient } from '@tanstack/vue-query'

import { API_ROUTES } from '@/core/api/api-routes'
import { httpClient } from '@/core/http/axios-client'
import { PHOTO_CATEGORY_QUERY_KEYS } from '../../constants/query-keys'

interface UnassignBatchParams {
  eventId: string
  categoryIds: number[]
}

export function useUnassignPhotoCategoriesBatch() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ eventId, categoryIds }: UnassignBatchParams) => {
      await Promise.all(
        categoryIds.map((categoryId) =>
          httpClient.delete(API_ROUTES.PHOTO_CATEGORIES.UNASSIGN(eventId, String(categoryId)), {
            silent: true,
          }),
        ),
      )
      return eventId
    },
    onSuccess: (eventId) => {
      queryClient.invalidateQueries({ queryKey: PHOTO_CATEGORY_QUERY_KEYS.byEvent(eventId) })
      queryClient.invalidateQueries({ queryKey: [API_ROUTES.PHOTOS.BASE] })
    },
  })
}
