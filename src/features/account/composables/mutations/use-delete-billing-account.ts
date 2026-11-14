import { useMutation, useQueryClient } from '@tanstack/vue-query'

import { API_ROUTES } from '@/core/api/api-routes'
import { httpClient } from '@/core/http/axios-client'
import { ACCOUNT_QUERY_KEYS } from '../../constants/query-keys'
import { CLIENT_MUTATION } from '@/shared/constants/client-mutation'

/** Deletes one billing account. If it was the default, the api makes the newest one default. */
export function useDeleteBillingAccount() {
  const queryClient = useQueryClient()

  return useMutation({
    ...CLIENT_MUTATION,
    mutationFn: async (id: string) => {
      await httpClient.delete(API_ROUTES.BILLING_ACCOUNTS.BY_ID(id), { silent: true })
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: ACCOUNT_QUERY_KEYS.billingAccounts() })
    },
  })
}
