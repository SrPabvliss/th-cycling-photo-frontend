import { useMutation, useQueryClient } from '@tanstack/vue-query'

import { API_ROUTES } from '@/core/api/api-routes'
import { httpClient } from '@/core/http/axios-client'

export interface IReclassifyPhotosResult {
  enqueued: number
  ignored: number
}

export function useReclassifyPhotos() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ eventId, photoIds }: { eventId: string; photoIds?: string[] }) => {
      const response = await httpClient.post<IReclassifyPhotosResult>(
        API_ROUTES.PHOTOS.RECLASSIFY(eventId),
        photoIds ? { photoIds } : {},
      )
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [API_ROUTES.PHOTOS.BASE] })
    },
  })
}
