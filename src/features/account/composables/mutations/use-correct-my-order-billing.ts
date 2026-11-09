import type { Ref } from 'vue'
import { useMutation, useQueryClient } from '@tanstack/vue-query'

import { API_ROUTES } from '@/core/api/api-routes'
import { httpClient } from '@/core/http/axios-client'
import { ACCOUNT_QUERY_KEYS } from '../../constants/query-keys'
import type { ICreateBillingAccountRequest } from '../../types/requests/billing-account.request'

export function useCorrectMyOrderBilling(orderId: Ref<string>) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: ICreateBillingAccountRequest) => {
      await httpClient.patch(API_ROUTES.MY_ORDERS.BILLING(orderId.value), payload, {
        silent: true,
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ACCOUNT_QUERY_KEYS.order(orderId.value) })
    },
  })
}
