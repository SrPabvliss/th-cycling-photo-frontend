import { useMutation, useQueryClient } from '@tanstack/vue-query'

import { API_ROUTES } from '@/core/api/api-routes'
import { httpClient } from '@/core/http/axios-client'
import { EVENT_QUERY_KEYS } from '../../constants/query-keys'

export function useAssignOperator() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ eventId, userId }: { eventId: string; userId: string }) => {
      await httpClient.post(API_ROUTES.EVENTS.OPERATORS(eventId), { userId })
    },
    onSuccess: (_data, { eventId }) => {
      queryClient.invalidateQueries({ queryKey: EVENT_QUERY_KEYS.operators(eventId) })
    },
  })
}
