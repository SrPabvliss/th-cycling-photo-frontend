import { useMutation, useQueryClient } from '@tanstack/vue-query'

import { API_ROUTES } from '@/core/api/api-routes'
import { httpClient } from '@/core/http/axios-client'
import { PHOTO_QUERY_KEYS } from '@/features/photos/constants/query-keys'
import { CLASSIFICATION_QUERY_KEYS } from '../../constants/query-keys'
import type { ICreateCyclistRequest } from '../../types/requests/create-cyclist.request'

export function useCreateCyclist() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ photoId, data }: { photoId: string; data: ICreateCyclistRequest }) => {
      const response = await httpClient.post<{ id: string }>(
        API_ROUTES.PHOTOS.CYCLISTS_BY_PHOTO(photoId),
        data,
      )
      return response.data
    },
    onSuccess: (_data, { photoId }) => {
      queryClient.invalidateQueries({
        queryKey: CLASSIFICATION_QUERY_KEYS.cyclistsByPhoto(photoId),
      })
      queryClient.invalidateQueries({ queryKey: PHOTO_QUERY_KEYS.detail(photoId) })
    },
  })
}
