import { computed, type Ref } from 'vue'
import { keepPreviousData, useQuery } from '@tanstack/vue-query'

import { API_ROUTES } from '@/core/api/api-routes'
import { httpClient } from '@/core/http/axios-client'
import { toPagination } from '@/core/http/pagination'
import { ORGANIZER_QUERY_KEYS } from '../../constants/query-keys'
import { toOrganizerEvents } from '../../mappers/organizer-event.mapper'
import type { IApiOrganizerEvent } from '../../types/responses/organizer-event.response'

export function useOrganizerEventsQuery(id: Ref<string>, page: Ref<number>, limit = 20) {
  return useQuery({
    queryKey: computed(() => ORGANIZER_QUERY_KEYS.events(id.value, page.value)),
    queryFn: async () => {
      const response = await httpClient.get<IApiOrganizerEvent[]>(
        API_ROUTES.ORGANIZERS.EVENTS(id.value),
        { params: { page: page.value, limit } },
      )

      const items = toOrganizerEvents(response.data)
      return {
        items,
        pagination: toPagination(response.meta.pagination, {
          page: page.value,
          limit,
          itemsCount: items.length,
        }),
      }
    },
    placeholderData: keepPreviousData,
    enabled: computed(() => !!id.value),
  })
}
