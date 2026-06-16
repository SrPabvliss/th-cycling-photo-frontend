import { computed, type Ref } from 'vue'
import { useQuery } from '@tanstack/vue-query'

import { API_ROUTES } from '@/core/api/api-routes'
import { httpClient } from '@/core/http/axios-client'
import { ORDER_QUERY_KEYS } from '../../constants/query-keys'
import { toOrderStats } from '../../mappers/order-stats.mapper'
import type { IApiOrderStats } from '../../types/responses/order-stats.response'

/** Order stats, optionally scoped to a single event (null = all events). */
export function useOrdersStatsQuery(eventId: Ref<string | null>) {
  return useQuery({
    queryKey: computed(() => ORDER_QUERY_KEYS.stats(eventId.value ?? undefined)),
    queryFn: async () => {
      const params = eventId.value ? { eventId: eventId.value } : undefined
      const response = await httpClient.get<IApiOrderStats>(API_ROUTES.ORDERS.STATS, { params })
      return toOrderStats(response.data)
    },
  })
}
