import { useQuery } from '@tanstack/vue-query'

import { API_ROUTES } from '@/core/api/api-routes'
import { httpClient } from '@/core/http/axios-client'
import { EVENT_TYPE_QUERY_KEYS } from '../../constants/query-keys'
import { toEventTypes } from '../../mappers/event-type.mapper'
import type { IApiEventType } from '../../types/responses/event-type.response'

export function useEventTypesQuery() {
  return useQuery({
    queryKey: EVENT_TYPE_QUERY_KEYS.all(),
    queryFn: async () => {
      const { data } = await httpClient.get<IApiEventType[]>(API_ROUTES.EVENT_TYPES.GET_ALL)
      return toEventTypes(data)
    },
    staleTime: 5 * 60 * 1000, // 5 min — event types rarely change
  })
}
