import { useMutation, useQueryClient } from '@tanstack/vue-query'

import { API_ROUTES } from '@/core/api/api-routes'
import { httpClient } from '@/core/http/axios-client'
import { EVENT_QUERY_KEYS } from '@/features/events/constants/query-keys'

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
      queryClient.invalidateQueries({ queryKey: EVENT_QUERY_KEYS.all() })
      queryClient.invalidateQueries({
        predicate: (query) =>
          typeof query.queryKey[0] === 'string' && query.queryKey[0].endsWith('/photo-categories'),
      })
    },
  })
}
