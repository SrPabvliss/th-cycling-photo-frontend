import { toValue, type MaybeRefOrGetter } from 'vue'
import { useMutation, useQueryClient } from '@tanstack/vue-query'

import { API_ROUTES } from '@/core/api/api-routes'
import { httpClient } from '@/core/http/axios-client'
import { PHOTO_CATEGORY_QUERY_KEYS } from '../../constants/query-keys'

export function useAssignPhotoCategory(eventId: MaybeRefOrGetter<string>) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (photoCategoryId: number) =>
      httpClient.post(
        API_ROUTES.PHOTO_CATEGORIES.ASSIGN(toValue(eventId)),
        { photoCategoryId },
        { silent: true },
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PHOTO_CATEGORY_QUERY_KEYS.byEvent(toValue(eventId)) })
    },
  })
}
