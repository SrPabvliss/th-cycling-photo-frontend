import { useMutation, useQueryClient } from '@tanstack/vue-query'

import { API_ROUTES } from '@/core/api/api-routes'
import { httpClient } from '@/core/http/axios-client'
export function useDeletePhoto() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id }: { id: string }) => {
      await httpClient.delete(API_ROUTES.PHOTOS.DELETE(id))
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        predicate: (query) =>
          query.queryKey[0] === API_ROUTES.PHOTOS.BASE && query.queryKey[1] !== 'detail',
      })
      queryClient.invalidateQueries({ queryKey: [API_ROUTES.EVENTS.BASE] })
      queryClient.invalidateQueries({
        predicate: (query) =>
          typeof query.queryKey[0] === 'string' && query.queryKey[0].endsWith('/photo-categories'),
      })
    },
  })
}
