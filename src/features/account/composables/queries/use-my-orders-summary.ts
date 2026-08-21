import { useQuery } from '@tanstack/vue-query'

import { API_ROUTES } from '@/core/api/api-routes'
import { httpClient } from '@/core/http/axios-client'
import { ACCOUNT_QUERY_KEYS } from '../../constants/query-keys'
import { toMyOrdersSummary } from '../../mappers/my-order.mapper'
import type { IApiMyOrdersSummary } from '../../types/responses/my-order.response'

export function useMyOrdersSummaryQuery() {
  return useQuery({
    queryKey: ACCOUNT_QUERY_KEYS.ordersSummary(),
    queryFn: async () => {
      const response = await httpClient.get<IApiMyOrdersSummary>(API_ROUTES.MY_ORDERS.SUMMARY)
      return toMyOrdersSummary(response.data)
    },
  })
}
