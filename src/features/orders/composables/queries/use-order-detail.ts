import { computed, type Ref } from 'vue'
import { useQuery } from '@tanstack/vue-query'

import { API_ROUTES } from '@/core/api/api-routes'
import { httpClient } from '@/core/http/axios-client'
import { ORDER_QUERY_KEYS } from '../../constants/query-keys'
import { toOrderDetail } from '../../mappers/order-detail.mapper'
import type { IApiOrderDetail } from '../../types/responses/order-detail.response'

export function useOrderDetailQuery(id: Ref<string>) {
  return useQuery({
    queryKey: computed(() => ORDER_QUERY_KEYS.detail(id.value)),
    queryFn: async () => {
      const response = await httpClient.get<IApiOrderDetail>(API_ROUTES.ORDERS.GET_BY_ID(id.value))
      return toOrderDetail(response.data)
    },
    enabled: computed(() => !!id.value),
  })
}
