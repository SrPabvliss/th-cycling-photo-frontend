import { computed, ref, type Ref } from 'vue'
import { useQuery } from '@tanstack/vue-query'

import { API_ROUTES } from '@/core/api/api-routes'
import { httpClient } from '@/core/http/axios-client'
import { OPERATOR_QUERY_KEYS } from '../../constants/operator-query-keys'
import { toRetouchQueueOrders } from '../../mappers/operator-retouch-queue.mapper'
import type { IApiRetouchQueue } from '../../types/responses/operator-retouch-queue.response'

export function useRetouchQueueQuery(eventId: Ref<string>, enabled: Ref<boolean> = ref(true)) {
  return useQuery({
    queryKey: computed(() => OPERATOR_QUERY_KEYS.retouchQueue(eventId.value)),
    queryFn: async () => {
      const response = await httpClient.get<IApiRetouchQueue>(
        API_ROUTES.OPERATOR.RETOUCH_QUEUE(eventId.value),
      )
      return toRetouchQueueOrders(response.data.orders)
    },
    enabled: computed(() => !!eventId.value && enabled.value),
  })
}
