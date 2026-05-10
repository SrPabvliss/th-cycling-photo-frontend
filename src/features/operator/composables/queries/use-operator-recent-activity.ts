import { computed, type Ref } from 'vue'
import { keepPreviousData, useQuery } from '@tanstack/vue-query'

import { API_ROUTES } from '@/core/api/api-routes'
import { httpClient } from '@/core/http/axios-client'
import { toPagination } from '@/core/http/pagination'
import { DASHBOARD_PAGE_SIZE, DASHBOARD_STALE_TIME } from '../../constants/operator-dashboard'
import { OPERATOR_QUERY_KEYS } from '../../constants/operator-query-keys'
import { toRecentActivity } from '../../mappers/operator-recent-activity.mapper'
import type { IApiRecentActivity } from '../../types/responses/operator-recent-activity.response'

export function useOperatorRecentActivityQuery(
  page: Ref<number>,
  limit = DASHBOARD_PAGE_SIZE.ACTIVITY,
) {
  return useQuery({
    queryKey: computed(() => OPERATOR_QUERY_KEYS.dashboardRecentActivity(page.value, limit)),
    queryFn: async () => {
      const response = await httpClient.get<IApiRecentActivity[]>(
        API_ROUTES.OPERATOR.DASHBOARD_RECENT_ACTIVITY,
        { params: { page: page.value, limit } },
      )
      const items = response.data.map(toRecentActivity)
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
    staleTime: DASHBOARD_STALE_TIME.VOLATILE,
    refetchOnWindowFocus: true,
  })
}
