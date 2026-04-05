import { useMutation, useQueryClient } from '@tanstack/vue-query'

import { API_ROUTES } from '@/core/api/api-routes'
import { httpClient } from '@/core/http/axios-client'
import { PHOTO_QUERY_KEYS } from '@/features/photos/constants/query-keys'
import { CLASSIFICATION_QUERY_KEYS } from '../../constants/query-keys'
import type { ICreateParticipantRequest } from '../../types/requests/create-cyclist.request'

export function useCreateParticipant() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ photoId, data }: { photoId: string; data: ICreateParticipantRequest }) => {
      const response = await httpClient.post<{ id: string }>(
        API_ROUTES.CLASSIFICATIONS.PARTICIPANTS_BY_PHOTO(photoId),
        data,
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
