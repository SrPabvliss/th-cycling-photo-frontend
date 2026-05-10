import { computed, type Ref } from 'vue'
import { keepPreviousData, useQuery } from '@tanstack/vue-query'

import { API_ROUTES } from '@/core/api/api-routes'
import { httpClient } from '@/core/http/axios-client'
import { toPagination } from '@/core/http/pagination'
import { DASHBOARD_PAGE_SIZE, DASHBOARD_STALE_TIME } from '../../constants/operator-dashboard'
import { OPERATOR_QUERY_KEYS } from '../../constants/operator-query-keys'
import { toOperatorActiveEvent } from '../../mappers/operator-active-event.mapper'
import type { IApiOperatorActiveEvent } from '../../types/responses/operator-active-event.response'

export function useOperatorActiveEventsQuery(
  page: Ref<number>,
  limit = DASHBOARD_PAGE_SIZE.EVENTS,
) {
  return useQuery({
    queryKey: computed(() => OPERATOR_QUERY_KEYS.dashboardActiveEvents(page.value, limit)),
    queryFn: async () => {
      const response = await httpClient.get<IApiOperatorActiveEvent[]>(
        API_ROUTES.OPERATOR.DASHBOARD_EVENTS_ACTIVE,
        { params: { page: page.value, limit } },
      )
      const items = response.data.map(toOperatorActiveEvent)
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
    staleTime: DASHBOARD_STALE_TIME.STABLE,
    refetchOnWindowFocus: true,
  })
}
