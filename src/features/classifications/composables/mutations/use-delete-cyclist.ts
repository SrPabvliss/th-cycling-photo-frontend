import { useMutation, useQueryClient } from '@tanstack/vue-query'

import { API_ROUTES } from '@/core/api/api-routes'
import { httpClient } from '@/core/http/axios-client'
import { PHOTO_QUERY_KEYS } from '@/features/photos/constants/query-keys'
import { CLASSIFICATION_QUERY_KEYS } from '../../constants/query-keys'

export function useDeleteParticipant() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ participantId }: { participantId: string; photoId: string }) => {
      const response = await httpClient.delete<{ id: string }>(
        API_ROUTES.CLASSIFICATIONS.DELETE_PARTICIPANT(participantId),
      )
      return response.data
    },
    onSuccess: (_data, { photoId }) => {
      queryClient.invalidateQueries({
        queryKey: CLASSIFICATION_QUERY_KEYS.participantsByPhoto(photoId),
      })
      queryClient.invalidateQueries({ queryKey: PHOTO_QUERY_KEYS.detail(photoId) })
    },
  })
}
