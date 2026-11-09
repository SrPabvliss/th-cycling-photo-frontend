import { useMutation, useQueryClient } from '@tanstack/vue-query'

import { API_ROUTES } from '@/core/api/api-routes'
import { httpClient } from '@/core/http/axios-client'
import { EVENT_QUERY_KEYS } from '../../constants/query-keys'

export function useArchiveEvent(id: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => httpClient.patch<{ id: string }>(API_ROUTES.EVENTS.ARCHIVE(id)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: EVENT_QUERY_KEYS.all() })
    },
  })
}
