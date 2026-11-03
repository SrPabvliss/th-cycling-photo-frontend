import { useMutation, useQueryClient } from '@tanstack/vue-query'

import { API_ROUTES } from '@/core/api/api-routes'
import { httpClient } from '@/core/http/axios-client'
import { ACCOUNT_QUERY_KEYS } from '../../constants/query-keys'
import type { ICreateBillingAccountRequest } from '../../types/requests/billing-account.request'

export function useCreateBillingAccount() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: ICreateBillingAccountRequest) => {
      const response = await httpClient.post<{ id: string }>(
        API_ROUTES.BILLING_ACCOUNTS.BASE,
        payload,
        { silent: true },
      )
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ACCOUNT_QUERY_KEYS.billingAccounts() })
    },
  })
}
