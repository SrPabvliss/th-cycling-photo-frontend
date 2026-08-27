import { computed, type Ref } from 'vue'
import { useQuery } from '@tanstack/vue-query'

import { API_ROUTES } from '@/core/api/api-routes'
import { httpClient } from '@/core/http/axios-client'
import { BUYER_QUERY_KEYS } from '../../constants/query-keys'
import { toBuyersStats } from '../../mappers/buyers-stats.mapper'
import { toBuyerFiltersParams } from '../../types/requests/buyer-filters.request'
import type { IBuyerFilters } from '../../types/requests/buyer-filters.request'
import type { IApiBuyersStats } from '../../types/responses/buyers-stats.response'

/**
 * Takes the SAME filters as `useBuyersListQuery` — the tiles and the tab counts must never
 * contradict the grid they describe.
 */
export function useBuyersStatsQuery(filters: Ref<IBuyerFilters>) {
  return useQuery({
    queryKey: computed(() => BUYER_QUERY_KEYS.stats(filters.value)),
    queryFn: async () => {
      const response = await httpClient.get<IApiBuyersStats>(API_ROUTES.BUYERS.STATS, {
        params: toBuyerFiltersParams(filters.value),
      })
      return toBuyersStats(response.data)
    },
  })
}
