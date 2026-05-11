import { useQuery } from '@tanstack/vue-query'

import { API_ROUTES } from '@/core/api/api-routes'
import { httpClient } from '@/core/http/axios-client'
import { DASHBOARD_STALE_TIME } from '../../constants/operator-dashboard'
import { OPERATOR_QUERY_KEYS } from '../../constants/operator-query-keys'
import { toDashboardSummary } from '../../mappers/operator-dashboard-summary.mapper'
import type { IApiDashboardSummary } from '../../types/responses/operator-dashboard-summary.response'

export function useOperatorDashboardSummaryQuery() {
  return useQuery({
    queryKey: OPERATOR_QUERY_KEYS.dashboardSummary(),
    queryFn: async () => {
      const response = await httpClient.get<IApiDashboardSummary>(
        API_ROUTES.OPERATOR.DASHBOARD_SUMMARY,
      )
      return toDashboardSummary(response.data)
    },
    staleTime: DASHBOARD_STALE_TIME.VOLATILE,
    refetchOnWindowFocus: true,
  })
}
