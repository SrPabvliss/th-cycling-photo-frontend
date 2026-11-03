import { useQuery } from '@tanstack/vue-query'

import { API_ROUTES } from '@/core/api/api-routes'
import { httpClient } from '@/core/http/axios-client'
import { ACCOUNT_QUERY_KEYS } from '../../constants/query-keys'
import { toMyBillingAccounts } from '../../mappers/billing-account.mapper'
import type { IApiMyBillingAccounts } from '../../types/responses/billing-account.response'

export function useMyBillingAccountsQuery(options: { enabled?: () => boolean } = {}) {
  return useQuery({
    queryKey: ACCOUNT_QUERY_KEYS.billingAccounts(),
    queryFn: async () => {
      const response = await httpClient.get<IApiMyBillingAccounts>(API_ROUTES.BILLING_ACCOUNTS.BASE)
      return toMyBillingAccounts(response.data)
    },
    enabled: options.enabled,
  })
}
