import { computed, type Ref } from 'vue'
import { useQuery } from '@tanstack/vue-query'

import { API_ROUTES } from '@/core/api/api-routes'
import { httpClient } from '@/core/http/axios-client'
import { EVENT_QUERY_KEYS } from '../../constants/query-keys'
import { toEventsStats } from '../../mappers/events-stats.mapper'
import {
  toEventsStatsParams,
  type IEventFilters,
  type IEventsStatsScope,
} from '../../types/requests/event-filters.request'
import type { IApiEventsStats } from '../../types/responses/events-stats.response'

/**
 * Scoped by the filters the endpoint honours — `search` and `organizerId` — so the tiles and
 * the tab counts describe the same population as the grid. `tab` and `sort` stay out of the
 * key: the endpoint ignores them, and keying on them would refetch and blank the tiles on
 * every tab switch.
 */
export function useEventsStatsQuery(filters: Ref<IEventFilters>) {
  const scope = computed<IEventsStatsScope>(() => ({
    search: filters.value.search,
    organizerId: filters.value.organizerId,
  }))

  return useQuery({
    queryKey: computed(() => EVENT_QUERY_KEYS.stats(scope.value)),
    queryFn: async () => {
      const response = await httpClient.get<IApiEventsStats>(API_ROUTES.EVENTS.STATS, {
        params: toEventsStatsParams(scope.value),
      })
      return toEventsStats(response.data)
    },
  })
}
