import { computed, type Ref } from 'vue'
import { keepPreviousData, useQuery } from '@tanstack/vue-query'

import { API_ROUTES } from '@/core/api/api-routes'
import { httpClient } from '@/core/http/axios-client'
import { toPagination } from '@/core/http/pagination'
import { DASHBOARD_PAGE_SIZE, DASHBOARD_STALE_TIME } from '../../constants/operator-dashboard'
import { OPERATOR_QUERY_KEYS } from '../../constants/operator-query-keys'
import { toOperatorCompletedEvent } from '../../mappers/operator-completed-event.mapper'
import type { IApiOperatorCompletedEvent } from '../../types/responses/operator-completed-event.response'

export function useOperatorCompletedEventsQuery(
  page: Ref<number>,
  limit = DASHBOARD_PAGE_SIZE.EVENTS,
) {
  return useQuery({
    queryKey: computed(() => OPERATOR_QUERY_KEYS.dashboardCompletedEvents(page.value, limit)),
    queryFn: async () => {
      const response = await httpClient.get<IApiOperatorCompletedEvent[]>(
        API_ROUTES.OPERATOR.DASHBOARD_EVENTS_COMPLETED,
        { params: { page: page.value, limit } },
      )
      const items = response.data.map(toOperatorCompletedEvent)
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
