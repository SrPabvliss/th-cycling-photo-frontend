import { useMutation, useQueryClient } from '@tanstack/vue-query'

import { API_ROUTES } from '@/core/api/api-routes'
import { httpClient } from '@/core/http/axios-client'
import { invalidateReviewWorkspaceQueries } from '../../utils/invalidate-review-workspace-queries'
import type { IAddPhotoColorRequest } from '../../types/requests/add-photo-color.request'
import type { IAddPhotoColorResponse } from '../../types/responses/add-photo-color.response'

export function useAddPhotoColor() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: IAddPhotoColorRequest) => {
      const { data } = await httpClient.post<IAddPhotoColorResponse>(
        API_ROUTES.PHOTOS.ADD_COLOR(input.photoId),
        {
          region: input.region,
          primaryColor: input.primaryColor,
          secondaryColor: input.secondaryColor ?? null,
        },
      )
      return data
    },
    onSuccess: (_data, variables) => {
      invalidateReviewWorkspaceQueries(queryClient, { photoSlug: variables.photoSlug })
    },
  })
}
