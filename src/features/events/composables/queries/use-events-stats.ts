import { useQuery } from '@tanstack/vue-query'

import { API_ROUTES } from '@/core/api/api-routes'
import { httpClient } from '@/core/http/axios-client'
import { EVENT_QUERY_KEYS } from '../../constants/query-keys'
import { toEventsStats } from '../../mappers/events-stats.mapper'
import type { IApiEventsStats } from '../../types/responses/events-stats.response'

export function useEventsStatsQuery() {
  return useQuery({
    queryKey: EVENT_QUERY_KEYS.stats(),
    queryFn: async () => {
      const response = await httpClient.get<IApiEventsStats>(API_ROUTES.EVENTS.STATS)
      return toEventsStats(response.data)
    },
  })
}
