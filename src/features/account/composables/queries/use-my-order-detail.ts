import { computed, type Ref } from 'vue'
import { useQuery } from '@tanstack/vue-query'

import { API_ROUTES } from '@/core/api/api-routes'
import { httpClient } from '@/core/http/axios-client'
import { ACCOUNT_QUERY_KEYS } from '../../constants/query-keys'
import { toMyOrderDetail } from '../../mappers/my-order.mapper'
import type { IApiMyOrderDetail } from '../../types/responses/my-order.response'

export function useMyOrderDetailQuery(orderId: Ref<string>) {
  return useQuery({
    queryKey: computed(() => ACCOUNT_QUERY_KEYS.order(orderId.value)),
    queryFn: async () => {
      const response = await httpClient.get<IApiMyOrderDetail>(
        API_ROUTES.MY_ORDERS.GET_BY_ID(orderId.value),
      )
      return toMyOrderDetail(response.data)
    },
    enabled: computed(() => orderId.value.length > 0),
  })
}
