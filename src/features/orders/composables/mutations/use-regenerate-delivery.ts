import { useMutation, useQueryClient } from '@tanstack/vue-query'

import { API_ROUTES } from '@/core/api/api-routes'
import { httpClient } from '@/core/http/axios-client'
import { ORDER_QUERY_KEYS } from '../../constants/query-keys'
import { toOrderPaymentConfirmed } from '../../mappers/order-payment-confirmed.mapper'
import type { IApiOrderPaymentConfirmed } from '../../types/responses/order-payment-confirmed.response'

export function useRegenerateDelivery() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (orderId: string) => {
      const response = await httpClient.post<IApiOrderPaymentConfirmed>(
        API_ROUTES.ORDERS.REGENERATE_DELIVERY(orderId),
      )
      return toOrderPaymentConfirmed(response.data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ORDER_QUERY_KEYS.all() })
    },
  })
}
