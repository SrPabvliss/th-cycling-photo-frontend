import { useQuery } from '@tanstack/vue-query'

import { API_ROUTES } from '@/core/api/api-routes'
import { httpClient } from '@/core/http/axios-client'
import type { IPublicEventFilterOptions } from './public-event.types'
import { PUBLIC_EVENTS_QUERY_KEYS } from './query-keys'

const FIVE_MINUTES = 5 * 60_000

/** Event types to filter the events list by. Silent: without them the list still works. */
export function usePublicEventFiltersQuery() {
  return useQuery({
    queryKey: PUBLIC_EVENTS_QUERY_KEYS.filters(),
    queryFn: async (): Promise<IPublicEventFilterOptions> => {
      const response = await httpClient.get<IPublicEventFilterOptions>(
        API_ROUTES.PUBLIC_EVENTS.FILTERS,
        { silent: true },
      )
      return { eventTypes: response.data.eventTypes }
    },
    staleTime: FIVE_MINUTES,
  })
}
