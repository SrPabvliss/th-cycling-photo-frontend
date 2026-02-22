import { computed, type Ref } from 'vue'
import { useQuery } from '@tanstack/vue-query'

import { API_ROUTES } from '@/core/api/api-routes'
import { httpClient } from '@/core/http/axios-client'
import { EVENT_QUERY_KEYS } from '../../constants/query-keys'
import { toEventDetail } from '../../mappers/event-detail.mapper'
import type { IApiEventDetail, IEventDetail } from '../../types/responses/event-detail.response'

export function useEventDetailQuery(id: Ref<IEventDetail['id']>) {
  return useQuery({
    queryKey: computed(() => EVENT_QUERY_KEYS.detail(id.value)),
    queryFn: async () => {
      const response = await httpClient.get<IApiEventDetail>(API_ROUTES.EVENTS.GET_BY_ID(id.value))
      return toEventDetail(response.data)
    },
    enabled: computed(() => !!id.value),
  })
}
