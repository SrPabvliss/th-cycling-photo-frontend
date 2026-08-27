import { useMutation, useQueryClient } from '@tanstack/vue-query'

import { API_ROUTES } from '@/core/api/api-routes'
import { httpClient } from '@/core/http/axios-client'
import type { PaymentMethod } from '@/shared/types/payment-method.types'

export interface IChoosePaymentMethodRequest {
  orderIds: string[]
  method: PaymentMethod
}

export function useChoosePaymentMethod() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: IChoosePaymentMethodRequest) => {
      const response = await httpClient.patch<{ orderIds: string[] }>(
        API_ROUTES.ORDERS.PAYMENT_METHOD,
        data,
        { silent: true },
      )
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [API_ROUTES.ORDERS.BASE] })
    },
  })
}
