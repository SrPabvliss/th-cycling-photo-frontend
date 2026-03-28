import { useQuery } from '@tanstack/vue-query'

import { API_ROUTES } from '@/core/api/api-routes'
import { httpClient } from '@/core/http/axios-client'
import { ORDER_QUERY_KEYS } from '../../constants/query-keys'
import { toOrderStats } from '../../mappers/order-stats.mapper'
import type { IApiOrderStats } from '../../types/responses/order-stats.response'

export function useOrdersStatsQuery() {
  return useQuery({
    queryKey: ORDER_QUERY_KEYS.stats(),
    queryFn: async () => {
      const response = await httpClient.get<IApiOrderStats>(API_ROUTES.ORDERS.STATS)
      return toOrderStats(response.data)
    },
  })
}
