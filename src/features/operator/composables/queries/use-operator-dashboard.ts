import { useQuery } from '@tanstack/vue-query'

import { API_ROUTES } from '@/core/api/api-routes'
import { httpClient } from '@/core/http/axios-client'
import { OPERATOR_QUERY_KEYS } from '../../constants/query-keys'
import { toOperatorDashboard } from '../../mappers/operator-dashboard.mapper'
import type { IApiOperatorDashboard } from '../../types/responses/operator-dashboard.response'

export function useOperatorDashboardQuery() {
  return useQuery({
    queryKey: OPERATOR_QUERY_KEYS.dashboard(),
    queryFn: async () => {
      const response = await httpClient.get<IApiOperatorDashboard>(API_ROUTES.OPERATOR.DASHBOARD)
      return toOperatorDashboard(response.data)
    },
  })
}
