import { useMutation, useQueryClient } from '@tanstack/vue-query'

import { API_ROUTES } from '@/core/api/api-routes'
import { httpClient } from '@/core/http/axios-client'
import { ACCOUNT_QUERY_KEYS } from '../../constants/query-keys'

export function useCancelMyOrder() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (orderId: string) => {
      await httpClient.patch(API_ROUTES.MY_ORDERS.CANCEL(orderId))
    },
    onSuccess: (_data, orderId) => {
      queryClient.invalidateQueries({ queryKey: ACCOUNT_QUERY_KEYS.orders() })
      queryClient.invalidateQueries({ queryKey: ACCOUNT_QUERY_KEYS.order(orderId) })
    },
  })
}
