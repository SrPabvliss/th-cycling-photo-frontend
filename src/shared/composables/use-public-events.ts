import { useQuery } from '@tanstack/vue-query'

import { API_ROUTES } from '@/core/api/api-routes'
import { httpClient } from '@/core/http/axios-client'
import { toPublicEventListItem } from '@/shared/mappers/public-event.mapper'
import type { IApiPublicEventListItem } from '@/shared/types/public-event.types'

export function usePublicEventsQuery() {
  return useQuery({
    queryKey: [API_ROUTES.PUBLIC_EVENTS.GET_ALL],
    queryFn: async () => {
      const { data } = await httpClient.get<IApiPublicEventListItem[]>(
        API_ROUTES.PUBLIC_EVENTS.GET_ALL,
      )
      return data.map(toPublicEventListItem)
    },
  })
}
