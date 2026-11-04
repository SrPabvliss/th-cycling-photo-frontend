import { useMutation, useQueryClient } from '@tanstack/vue-query'

import { API_ROUTES } from '@/core/api/api-routes'
import { httpClient } from '@/core/http/axios-client'
import { ACCOUNT_QUERY_KEYS } from '../../constants/query-keys'

export function useSetDefaultBillingAccount() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (billingAccountId: string) => {
      await httpClient.patch(API_ROUTES.BILLING_ACCOUNTS.DEFAULT(billingAccountId), undefined, {
        silent: true,
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ACCOUNT_QUERY_KEYS.billingAccounts() })
    },
  })
}
