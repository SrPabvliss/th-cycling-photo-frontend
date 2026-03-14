import { useMutation, useQueryClient } from '@tanstack/vue-query'

import { API_ROUTES } from '@/core/api/api-routes'
import { httpClient } from '@/core/http/axios-client'
import { EVENT_QUERY_KEYS } from '@/features/events/constants/query-keys'
import { PHOTO_QUERY_KEYS } from '@/features/photos/constants/query-keys'
import { CLASSIFICATION_QUERY_KEYS } from '../../constants/query-keys'

interface ClassifyPhotoParams {
  photoId: string
  eventId: string
}

export function useClassifyPhoto() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ photoId }: ClassifyPhotoParams) => {
      const response = await httpClient.post<{ id: string }>(API_ROUTES.PHOTOS.CLASSIFY(photoId))
      return response.data
    },
    onSuccess: (_data, { photoId, eventId }) => {
      queryClient.invalidateQueries({ queryKey: PHOTO_QUERY_KEYS.detail(photoId) })
      queryClient.invalidateQueries({ queryKey: PHOTO_QUERY_KEYS.all() })
      queryClient.invalidateQueries({ queryKey: EVENT_QUERY_KEYS.detail(eventId) })
      queryClient.invalidateQueries({ queryKey: EVENT_QUERY_KEYS.stats() })
      queryClient.invalidateQueries({ queryKey: CLASSIFICATION_QUERY_KEYS.all() })
    },
  })
}
