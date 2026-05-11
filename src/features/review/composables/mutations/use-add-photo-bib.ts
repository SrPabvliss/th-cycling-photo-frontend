import { useMutation, useQueryClient } from '@tanstack/vue-query'

import { API_ROUTES } from '@/core/api/api-routes'
import { httpClient } from '@/core/http/axios-client'
import { invalidateReviewWorkspaceQueries } from '../../utils/invalidate-review-workspace-queries'
import type { IAddPhotoBibRequest } from '../../types/requests/add-photo-bib.request'
import type { IAddPhotoBibResponse } from '../../types/responses/add-photo-bib.response'

export function useAddPhotoBib() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: IAddPhotoBibRequest) => {
      const { data } = await httpClient.post<IAddPhotoBibResponse>(
        API_ROUTES.PHOTOS.ADD_BIB(input.photoId),
        { digits: input.digits, status: input.status },
      )
      return data
    },
    onSuccess: (_data, variables) => {
      invalidateReviewWorkspaceQueries(queryClient, { photoSlug: variables.photoSlug })
    },
  })
}
