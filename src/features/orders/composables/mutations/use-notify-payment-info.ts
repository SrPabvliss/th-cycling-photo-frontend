import { useMutation, useQueryClient } from '@tanstack/vue-query'

import { API_ROUTES } from '@/core/api/api-routes'
import { httpClient } from '@/core/http/axios-client'
import { ORDER_QUERY_KEYS } from '../../constants/query-keys'
import type { IApiPaymentInfoNotified } from '../../types/responses/payment-info-notified.response'

export function useNotifyPaymentInfo() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (orderId: string) => {
      const response = await httpClient.patch<IApiPaymentInfoNotified>(
        API_ROUTES.ORDERS.NOTIFY_PAYMENT_INFO(orderId),
      )
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ORDER_QUERY_KEYS.all() })
    },
  })
}
