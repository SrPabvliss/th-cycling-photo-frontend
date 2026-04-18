import { computed, type Ref } from 'vue'
import { useQuery } from '@tanstack/vue-query'

import { API_ROUTES } from '@/core/api/api-routes'
import { httpClient } from '@/core/http/axios-client'
import { EVENT_QUERY_KEYS } from '../../constants/query-keys'
import { toEventOperators } from '../../mappers/event-operator.mapper'
import type { IApiEventOperator } from '../../types/responses/event-operator.response'

export function useEventOperatorsQuery(eventId: Ref<string>) {
  return useQuery({
    queryKey: computed(() => EVENT_QUERY_KEYS.operators(eventId.value)),
    queryFn: async () => {
      const response = await httpClient.get<IApiEventOperator[]>(
        API_ROUTES.EVENTS.OPERATORS(eventId.value),
      )
      return toEventOperators(response.data)
    },
    enabled: computed(() => !!eventId.value),
  })
}
