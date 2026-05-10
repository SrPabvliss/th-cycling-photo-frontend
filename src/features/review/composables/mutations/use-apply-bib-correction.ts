import { useMutation, useQueryClient } from '@tanstack/vue-query'

import { API_ROUTES } from '@/core/api/api-routes'
import { httpClient } from '@/core/http/axios-client'
import { PHOTO_QUERY_KEYS } from '@/features/photos/constants/query-keys'
import { REVIEW_QUERY_KEYS } from '../../constants/query-keys'
import type { IApplyBibCorrectionRequest } from '../../types/requests/apply-bib-correction.request'
import type { ICorrectionResultResponse } from '../../types/responses/correction-result.response'

export function useApplyBibCorrection() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: IApplyBibCorrectionRequest) => {
      const { data } = await httpClient.post<ICorrectionResultResponse>(
        API_ROUTES.PHOTOS.BIB_CORRECTIONS(input.photoId, input.bibId),
        { newValue: input.newValue },
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
