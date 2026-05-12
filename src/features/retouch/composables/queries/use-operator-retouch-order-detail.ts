import { computed, ref, type Ref } from 'vue'
import { useQuery } from '@tanstack/vue-query'

import { API_ROUTES } from '@/core/api/api-routes'
import { httpClient } from '@/core/http/axios-client'
import { RETOUCH_QUERY_KEYS } from '../../constants/retouch-query-keys'
import { toOperatorRetouchOrderDetail } from '../../mappers/operator-retouch-order-detail.mapper'
import type { IApiOperatorRetouchOrderDetail } from '../../types/responses/operator-retouch-order-detail.response'

export type TRetouchDetailScope = 'pending' | 'all'

export function useOperatorRetouchOrderDetailQuery(
  orderId: Ref<string | null>,
  scope: Ref<TRetouchDetailScope> = ref('pending'),
) {
  return useQuery({
    queryKey: computed(() => [...RETOUCH_QUERY_KEYS.orderDetail(orderId.value ?? ''), scope.value]),
    queryFn: async () => {
      const response = await httpClient.get<IApiOperatorRetouchOrderDetail>(
        API_ROUTES.OPERATOR.RETOUCH_ORDER_DETAIL(orderId.value!),
        { params: { scope: scope.value } },
      )
      return toOperatorRetouchOrderDetail(response.data)
    },
    enabled: computed(() => !!orderId.value),
  })
}
