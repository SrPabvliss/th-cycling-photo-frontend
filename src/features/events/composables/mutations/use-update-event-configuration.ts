import { useMutation, useQueryClient } from '@tanstack/vue-query'

import { API_ROUTES } from '@/core/api/api-routes'
import { httpClient } from '@/core/http/axios-client'
import { EVENT_QUERY_KEYS } from '../../constants/query-keys'
import type { IEventConfigurationSelectionRequest } from '../../types/requests/event-configuration.request'

export function useUpdateEventConfiguration(eventId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: IEventConfigurationSelectionRequest) => {
      await httpClient.patch(API_ROUTES.EVENTS.CONFIGURATION(eventId), payload)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: EVENT_QUERY_KEYS.configuration(eventId) })
    },
  })
}
