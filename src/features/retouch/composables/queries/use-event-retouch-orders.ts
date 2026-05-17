import { computed, ref, type Ref } from 'vue'
import { useQuery } from '@tanstack/vue-query'

import { API_ROUTES } from '@/core/api/api-routes'
import { httpClient } from '@/core/http/axios-client'
import { RETOUCH_QUERY_KEYS } from '../../constants/retouch-query-keys'
import { toRetouchQueueOrders } from '../../mappers/operator-retouch-queue.mapper'
import type { IApiRetouchQueue } from '../../types/responses/operator-retouch-queue.response'
import type { TRetouchOrderScope } from '../../types/responses/operator-retouch-orders.response'

export function useEventRetouchOrdersQuery(
  eventId: Ref<string>,
  scope: Ref<TRetouchOrderScope> = ref('pending'),
  enabled: Ref<boolean> = ref(true),
) {
  return useQuery({
    queryKey: computed(() => RETOUCH_QUERY_KEYS.eventOrders(eventId.value, scope.value)),
    queryFn: async () => {
      const response = await httpClient.get<IApiRetouchQueue>(
        API_ROUTES.OPERATOR.RETOUCH_QUEUE(eventId.value),
        { params: { scope: scope.value } },
      )
      return toRetouchQueueOrders(response.data.orders)
    },
    enabled: computed(() => !!eventId.value && enabled.value),
  })
}
