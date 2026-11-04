import { computed, type Ref } from 'vue'
import { useQuery } from '@tanstack/vue-query'

import { API_ROUTES } from '@/core/api/api-routes'
import { httpClient } from '@/core/http/axios-client'
import { ORGANIZER_QUERY_KEYS } from '../../constants/query-keys'
import { toOrganizersStats } from '../../mappers/organizers-stats.mapper'
import {
  toOrganizersStatsParams,
  type IOrganizerFilters,
  type IOrganizersStatsScope,
} from '../../types/requests/organizer-filters.request'
import type { IApiOrganizersStats } from '../../types/responses/organizers-stats.response'

/**
 * Scoped by the only filter the endpoint honours — `search` — so the tiles and the tab counts
 * describe the same population as the grid. `tab` and `sort` stay out of the key: the
 * endpoint ignores them, and keying on them would refetch and blank the tiles on every tab
 * switch.
 */
export function useOrganizersStatsQuery(filters: Ref<IOrganizerFilters>) {
  const scope = computed<IOrganizersStatsScope>(() => ({ search: filters.value.search }))

  return useQuery({
    queryKey: computed(() => ORGANIZER_QUERY_KEYS.stats(scope.value)),
    queryFn: async () => {
      const response = await httpClient.get<IApiOrganizersStats>(API_ROUTES.ORGANIZERS.STATS, {
        params: toOrganizersStatsParams(scope.value),
      })
      return toOrganizersStats(response.data)
    },
  })
}
