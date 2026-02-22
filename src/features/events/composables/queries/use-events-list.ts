import { computed, type Ref } from 'vue'
import { keepPreviousData, useQuery } from '@tanstack/vue-query'

import { API_ROUTES } from '@/core/api/api-routes'
import { httpClient } from '@/core/http/axios-client'
import type { IApiPagination } from '@/core/http/http-response.interface'
import { EVENT_QUERY_KEYS } from '../../constants/query-keys'
import { toEventListItems } from '../../mappers/event-list.mapper'
import type { IApiEventListItem } from '../../types/responses/event-list.response'

export function useEventsListQuery(page: Ref<number>, limit = 20) {
  return useQuery({
    queryKey: computed(() => EVENT_QUERY_KEYS.list(page.value)),
    queryFn: async () => {
      const response = await httpClient.get<IApiEventListItem[]>(API_ROUTES.EVENTS.GET_ALL, {
        params: { page: page.value, limit },
      })

      return {
        items: toEventListItems(response.data),
        pagination: response.meta.pagination as IApiPagination,
      }
    },
    placeholderData: keepPreviousData,
  })
}
