import { toValue, type MaybeRefOrGetter } from 'vue'
import { useMutation, useQueryClient } from '@tanstack/vue-query'

import { API_ROUTES } from '@/core/api/api-routes'
import { httpClient } from '@/core/http/axios-client'
import { PHOTO_CATEGORY_QUERY_KEYS } from '../../constants/query-keys'

export function useUnassignPhotoCategory(eventId: MaybeRefOrGetter<string>) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (categoryId: number) =>
      httpClient.delete(API_ROUTES.PHOTO_CATEGORIES.UNASSIGN(toValue(eventId), String(categoryId))),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PHOTO_CATEGORY_QUERY_KEYS.byEvent(toValue(eventId)) })
      queryClient.invalidateQueries({ queryKey: [API_ROUTES.PHOTOS.BASE] })
    },
  })
}
