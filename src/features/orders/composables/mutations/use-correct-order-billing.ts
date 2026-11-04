import type { Ref } from 'vue'
import { useMutation, useQueryClient } from '@tanstack/vue-query'

import { API_ROUTES } from '@/core/api/api-routes'
import { httpClient } from '@/core/http/axios-client'
import type { ICreateBillingAccountRequest } from '@/features/account/types/requests/billing-account.request'
import { ORDER_QUERY_KEYS } from '../../constants/query-keys'

export function useCorrectOrderBilling(orderId: Ref<string>) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: ICreateBillingAccountRequest) => {
      await httpClient.patch(API_ROUTES.ORDERS.BILLING(orderId.value), payload, {
        silent: true,
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ORDER_QUERY_KEYS.all() })
    },
  })
}
