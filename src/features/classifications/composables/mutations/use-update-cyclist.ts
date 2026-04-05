import { useMutation, useQueryClient } from '@tanstack/vue-query'

import { API_ROUTES } from '@/core/api/api-routes'
import { httpClient } from '@/core/http/axios-client'
import { CLASSIFICATION_QUERY_KEYS } from '../../constants/query-keys'
import type { IUpdateParticipantRequest } from '../../types/requests/update-cyclist.request'

export function useUpdateParticipant() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (variables: {
      participantId: string
      photoId: string
      data: IUpdateParticipantRequest
    }) => {
      const response = await httpClient.patch<{ id: string }>(
        API_ROUTES.CLASSIFICATIONS.UPDATE_PARTICIPANT(variables.participantId),
        variables.data,
      )
      return response.data
    },
    onSuccess: (_data, { photoId }) => {
      queryClient.invalidateQueries({
        queryKey: CLASSIFICATION_QUERY_KEYS.participantsByPhoto(photoId),
      })
    },
  })
}
