import { useMutation, useQueryClient } from '@tanstack/vue-query'

import { API_ROUTES } from '@/core/api/api-routes'
import { httpClient } from '@/core/http/axios-client'
import { removePhotoFromReviewQueueCache } from './utils/remove-photo-from-review-queue'

export interface IMarkPhotoReviewedVariables {
  photoId: string
  photoSlug?: string
  eventSlug?: string
}

export function useMarkPhotoReviewed() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ photoId }: IMarkPhotoReviewedVariables) => {
      const { data } = await httpClient.post(API_ROUTES.PHOTOS.MARK_REVIEWED(photoId), {})
      return data
    },
    onSuccess: (_data, variables) => {
      if (variables.photoSlug) {
        removePhotoFromReviewQueueCache(queryClient, variables.photoSlug)
      }

      const operatorBase = API_ROUTES.OPERATOR.BASE
      queryClient.invalidateQueries({ queryKey: [operatorBase, 'dashboard', 'summary'] })
      queryClient.invalidateQueries({ queryKey: [operatorBase, 'dashboard', 'events', 'active'] })
      queryClient.invalidateQueries({ queryKey: [operatorBase, 'dashboard', 'recent-activity'] })
      queryClient.invalidateQueries({ queryKey: [operatorBase, 'dashboard', 'review-queue'] })

      // Per-event review queues (same shape as REVIEW_QUERY_KEYS, via API_ROUTES only)
      if (variables.eventSlug) {
        queryClient.invalidateQueries({
          queryKey: [API_ROUTES.EVENTS.BASE, 'review', 'queue', variables.eventSlug],
        })
      } else {
        queryClient.invalidateQueries({ queryKey: [API_ROUTES.EVENTS.BASE, 'review'] })
      }

      if (variables.photoSlug) {
        queryClient.invalidateQueries({
          queryKey: [API_ROUTES.PHOTOS.BASE, 'detail', variables.photoSlug],
        })
      }
      queryClient.invalidateQueries({ queryKey: [API_ROUTES.PHOTOS.BASE] })
    },
  })
}
