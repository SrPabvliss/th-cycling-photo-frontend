import { useQuery } from '@tanstack/vue-query'

import { API_ROUTES } from '@/core/api/api-routes'
import { httpClient } from '@/core/http/axios-client'
import { EVENT_QUERY_KEYS } from '../../constants/query-keys'
import type { IEventCreationContextResponse } from '../../types/responses/event-creation-context.response'

export function useEventCreationContext() {
  return useQuery({
    queryKey: EVENT_QUERY_KEYS.creationContext(),
    queryFn: async () => {
      const response = await httpClient.get<IEventCreationContextResponse>(
        API_ROUTES.EVENTS.CREATION_CONTEXT,
      )
      return response.data
    },
  })
}
