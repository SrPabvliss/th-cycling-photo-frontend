import { useQuery } from '@tanstack/vue-query'
import { httpClient } from '@/core/http/axios-client'
import { API_ROUTES } from '@/core/api/api-routes'
import { TENANT_PROFILE_QUERY_KEYS } from '../../constants/query-keys'
import type { PayoutMethodResponse } from '../../types/responses/payout-method.response'

export function usePayoutMethods() {
  return useQuery({
    queryKey: TENANT_PROFILE_QUERY_KEYS.payoutMethods(),
    queryFn: async () => {
      const response = await httpClient.get<PayoutMethodResponse[]>(
        API_ROUTES.TENANT_PROFILE.PAYOUT_METHODS,
      )
      return response.data
    },
  })
}
