import { useQuery } from '@tanstack/vue-query'

import { API_ROUTES } from '@/core/api/api-routes'
import { httpClient } from '@/core/http/axios-client'
import { PUBLIC_GALLERY_QUERY_KEYS } from '../../constants/query-keys'
import { toPublicEventListItem } from '../../mappers/public-event.mapper'
import type { IApiPublicEventListItem } from '../../types/responses/public-event-list.response'

export function usePublicEventsQuery() {
  return useQuery({
    queryKey: PUBLIC_GALLERY_QUERY_KEYS.events(),
    queryFn: async () => {
      const { data } = await httpClient.get<IApiPublicEventListItem[]>(
        API_ROUTES.PUBLIC_EVENTS.GET_ALL,
      )
      return data.map(toPublicEventListItem)
    },
  })
}
