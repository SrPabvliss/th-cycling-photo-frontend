import { computed, type Ref } from 'vue'
import { useQuery } from '@tanstack/vue-query'

import { API_ROUTES } from '@/core/api/api-routes'
import { httpClient } from '@/core/http/axios-client'
import { OPERATOR_QUERY_KEYS } from '../../constants/query-keys'
import { toRetouchQueueOrders } from '../../mappers/retouch-queue.mapper'
import type { IApiRetouchQueue } from '../../types/responses/retouch-queue.response'

export function useRetouchQueueQuery(eventId: Ref<string>) {
  return useQuery({
    queryKey: computed(() => OPERATOR_QUERY_KEYS.retouchQueue(eventId.value)),
    queryFn: async () => {
      const response = await httpClient.get<IApiRetouchQueue>(
        API_ROUTES.OPERATOR.RETOUCH_QUEUE(eventId.value),
      )
      return toRetouchQueueOrders(response.data.orders)
    },
    enabled: computed(() => !!eventId.value),
  })
}
