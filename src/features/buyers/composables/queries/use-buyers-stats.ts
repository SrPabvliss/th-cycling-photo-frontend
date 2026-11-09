import { computed, type Ref } from 'vue'
import { useQuery } from '@tanstack/vue-query'

import { API_ROUTES } from '@/core/api/api-routes'
import { httpClient } from '@/core/http/axios-client'
import { BUYER_QUERY_KEYS } from '../../constants/query-keys'
import { toBuyersStats } from '../../mappers/buyers-stats.mapper'
import {
  toBuyersStatsParams,
  type IBuyerFilters,
  type IBuyersStatsScope,
} from '../../types/requests/buyer-filters.request'
import type { IApiBuyersStats } from '../../types/responses/buyers-stats.response'

/**
 * Scoped by every filter the endpoint honours, so the tiles and the tab counts describe the
 * same population as the grid. The purchase tab and the sort stay out of the key: the
 * endpoint ignores them, and keying on them would refetch and blank the tiles on every tab
 * switch.
 */
export function useBuyersStatsQuery(filters: Ref<IBuyerFilters>) {
  const scope = computed<IBuyersStatsScope>(() => {
    const { purchase: _purchase, sort: _sort, ...rest } = filters.value
    return rest
  })

  return useQuery({
    queryKey: computed(() => BUYER_QUERY_KEYS.stats(scope.value)),
    queryFn: async () => {
      const response = await httpClient.get<IApiBuyersStats>(API_ROUTES.BUYERS.STATS, {
        params: toBuyersStatsParams(scope.value),
      })
      return toBuyersStats(response.data)
    },
  })
}
