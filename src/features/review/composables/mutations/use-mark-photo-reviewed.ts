import { useMutation, useQueryClient } from '@tanstack/vue-query'

import { API_ROUTES } from '@/core/api/api-routes'
import { httpClient } from '@/core/http/axios-client'
import { invalidateReviewWorkspaceQueries } from '../../utils/invalidate-review-workspace-queries'
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
      invalidateReviewWorkspaceQueries(queryClient, { photoSlug: variables.photoSlug })
    },
  })
}
