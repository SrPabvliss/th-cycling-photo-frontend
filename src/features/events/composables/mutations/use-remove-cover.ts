import { useMutation, useQueryClient } from '@tanstack/vue-query'

import { API_ROUTES } from '@/core/api/api-routes'
import { httpClient } from '@/core/http/axios-client'
import { EVENT_QUERY_KEYS } from '../../constants/query-keys'

export function useRemoveCover(eventId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => httpClient.delete(API_ROUTES.EVENTS.COVER_REMOVE(eventId)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: EVENT_QUERY_KEYS.all() })
    },
  })
}
