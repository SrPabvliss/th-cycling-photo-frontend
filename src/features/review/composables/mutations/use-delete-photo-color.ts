import { useMutation, useQueryClient } from '@tanstack/vue-query'

import { API_ROUTES } from '@/core/api/api-routes'
import { httpClient } from '@/core/http/axios-client'
import { invalidateReviewWorkspaceQueries } from '../../utils/invalidate-review-workspace-queries'
import type { IDeletePhotoColorRequest } from '../../types/requests/delete-photo-color.request'

export function useDeletePhotoColor() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: IDeletePhotoColorRequest) => {
      await httpClient.delete(API_ROUTES.PHOTOS.DELETE_COLOR(input.photoId, input.colorId))
    },
    onSuccess: (_data, variables) => {
      invalidateReviewWorkspaceQueries(queryClient, { photoSlug: variables.photoSlug })
    },
  })
}
