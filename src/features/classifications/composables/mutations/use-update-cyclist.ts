import { useMutation, useQueryClient } from '@tanstack/vue-query'

import { API_ROUTES } from '@/core/api/api-routes'
import { httpClient } from '@/core/http/axios-client'
import { CLASSIFICATION_QUERY_KEYS } from '../../constants/query-keys'
import type { IUpdateCyclistRequest } from '../../types/requests/update-cyclist.request'

export function useUpdateCyclist() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (variables: {
      cyclistId: string
      photoId: string
      data: IUpdateCyclistRequest
    }) => {
      const response = await httpClient.patch<{ id: string }>(
        API_ROUTES.CLASSIFICATIONS.UPDATE_CYCLIST(variables.cyclistId),
        variables.data,
      )
      return response.data
    },
    onSuccess: (_data, { photoId }) => {
      queryClient.invalidateQueries({
        queryKey: CLASSIFICATION_QUERY_KEYS.cyclistsByPhoto(photoId),
      })
    },
  })
}
