import { useMutation } from '@tanstack/vue-query'

import { API_ROUTES } from '@/core/api/api-routes'
import { httpClient } from '@/core/http/axios-client'
import type { IChoosePaymentMethodRequest } from '@/features/payments/types/requests/payment.request'

export function useChoosePaymentMethod() {
  return useMutation({
    mutationFn: async (data: IChoosePaymentMethodRequest) => {
      const response = await httpClient.patch<{ orderIds: string[] }>(
        API_ROUTES.ORDERS.PAYMENT_METHOD,
        data,
        { silent: true },
      )
      return response.data
    },
  })
}
