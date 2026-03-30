import { useMutation, useQueryClient } from '@tanstack/vue-query'

import { API_ROUTES } from '@/core/api/api-routes'
import { httpClient } from '@/core/http/axios-client'
import { PHOTO_QUERY_KEYS } from '@/features/photos/constants/query-keys'
import { PHOTO_CATEGORY_QUERY_KEYS } from '../../constants/query-keys'

export function useUnassignPhotoCategory(eventId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (categoryId: string) =>
      httpClient.delete(API_ROUTES.PHOTO_CATEGORIES.UNASSIGN(eventId, categoryId)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PHOTO_CATEGORY_QUERY_KEYS.byEvent(eventId) })
      queryClient.invalidateQueries({ queryKey: PHOTO_QUERY_KEYS.all() })
    },
  })
}
