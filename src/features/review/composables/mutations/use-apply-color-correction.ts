import { useMutation, useQueryClient } from '@tanstack/vue-query'

import { API_ROUTES } from '@/core/api/api-routes'
import { httpClient } from '@/core/http/axios-client'
import { invalidateReviewWorkspaceQueries } from '../../utils/invalidate-review-workspace-queries'
import type { IApplyColorCorrectionRequest } from '../../types/requests/apply-color-correction.request'
import type { ICorrectionResultResponse } from '../../types/responses/correction-result.response'

export function useApplyColorCorrection() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: IApplyColorCorrectionRequest) => {
      const { data } = await httpClient.post<ICorrectionResultResponse>(
        API_ROUTES.PHOTOS.COLOR_CORRECTIONS(input.photoId, input.colorId),
        { field: input.field, newValue: input.newValue },
      )
      return data
    },
    onSuccess: (_data, variables) => {
      invalidateReviewWorkspaceQueries(queryClient, { photoSlug: variables.photoSlug })
    },
  })
}
