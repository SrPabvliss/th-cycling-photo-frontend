import { computed, type Ref } from 'vue'
import { useQuery } from '@tanstack/vue-query'

import { API_ROUTES } from '@/core/api/api-routes'
import { httpClient } from '@/core/http/axios-client'
import { EVENT_QUERY_KEYS } from '../../constants/query-keys'
import { toEventsStats } from '../../mappers/events-stats.mapper'
import { toEventFiltersParams } from '../../types/requests/event-filters.request'
import type { IEventFilters } from '../../types/requests/event-filters.request'
import type { IApiEventsStats } from '../../types/responses/events-stats.response'

/**
 * Takes the SAME filters as `useEventsListQuery` — the tiles and the tab counts must
 * never contradict the grid they describe. The endpoint honours `search` and
 * `organizerId`, and ignores `tab`.
 */
export function useEventsStatsQuery(filters: Ref<IEventFilters>) {
  return useQuery({
    queryKey: computed(() => EVENT_QUERY_KEYS.stats(filters.value)),
    queryFn: async () => {
      const response = await httpClient.get<IApiEventsStats>(API_ROUTES.EVENTS.STATS, {
        params: toEventFiltersParams(filters.value),
      })
      return toEventsStats(response.data)
    },
  })
}
