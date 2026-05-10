import { useMutation, useQueryClient } from '@tanstack/vue-query'

import { API_ROUTES } from '@/core/api/api-routes'
import { httpClient } from '@/core/http/axios-client'
import { PHOTO_QUERY_KEYS } from '@/features/photos/constants/query-keys'
import { REVIEW_QUERY_KEYS } from '../../constants/query-keys'
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
      queryClient.invalidateQueries({
        queryKey: PHOTO_QUERY_KEYS.detailBySlug(variables.photoSlug),
      })
      queryClient.invalidateQueries({ queryKey: REVIEW_QUERY_KEYS.all() })
    },
  })
}
