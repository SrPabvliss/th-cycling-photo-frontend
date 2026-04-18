import { useMutation, useQueryClient } from '@tanstack/vue-query'

import { API_ROUTES } from '@/core/api/api-routes'
import { httpClient } from '@/core/http/axios-client'
import { ORDER_QUERY_KEYS } from '../../constants/query-keys'

export function useConfirmPayment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (orderId: string) => {
      const response = await httpClient.patch<{ id: string }>(
        API_ROUTES.ORDERS.CONFIRM_PAYMENT(orderId),
      )
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ORDER_QUERY_KEYS.all() })
    },
  })
}
