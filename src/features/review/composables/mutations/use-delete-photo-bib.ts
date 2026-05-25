import { useMutation, useQueryClient } from '@tanstack/vue-query'

import { API_ROUTES } from '@/core/api/api-routes'
import { httpClient } from '@/core/http/axios-client'
import { invalidateReviewWorkspaceQueries } from '../../utils/invalidate-review-workspace-queries'
import type { IDeletePhotoBibRequest } from '../../types/requests/delete-photo-bib.request'

export function useDeletePhotoBib() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: IDeletePhotoBibRequest) => {
      await httpClient.delete(API_ROUTES.PHOTOS.DELETE_BIB(input.photoId, input.bibId))
    },
    onSuccess: (_data, variables) => {
      invalidateReviewWorkspaceQueries(queryClient, { photoSlug: variables.photoSlug })
    },
  })
}
