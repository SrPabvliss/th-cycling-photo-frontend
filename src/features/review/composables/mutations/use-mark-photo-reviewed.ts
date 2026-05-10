import { useMutation, useQueryClient } from '@tanstack/vue-query'

import { API_ROUTES } from '@/core/api/api-routes'
import { httpClient } from '@/core/http/axios-client'
import { EVENT_QUERY_KEYS } from '@/features/events/constants/query-keys'
import { PHOTO_QUERY_KEYS } from '@/features/photos/constants/query-keys'
import { REVIEW_QUERY_KEYS } from '../../constants/query-keys'
import type { IMarkPhotoReviewedRequest } from '../../types/requests/mark-photo-reviewed.request'
import type { IMarkPhotoReviewedResponse } from '../../types/responses/mark-photo-reviewed.response'

export function useMarkPhotoReviewed() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: IMarkPhotoReviewedRequest) => {
      const { data } = await httpClient.post<IMarkPhotoReviewedResponse>(
        API_ROUTES.PHOTOS.MARK_REVIEWED(input.photoId),
        {},
      )
      return data
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: PHOTO_QUERY_KEYS.detailBySlug(variables.photoSlug),
      })
      queryClient.invalidateQueries({ queryKey: PHOTO_QUERY_KEYS.all() })
      queryClient.invalidateQueries({ queryKey: REVIEW_QUERY_KEYS.all() })
      queryClient.invalidateQueries({ queryKey: EVENT_QUERY_KEYS.all() })
    },
  })
}
