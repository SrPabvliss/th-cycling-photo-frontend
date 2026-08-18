import { useMutation } from '@tanstack/vue-query'

import { API_ROUTES } from '@/core/api/api-routes'
import { httpClient } from '@/core/http/axios-client'
import type { IPaymentIntent } from '@/features/payments/types/responses/payment-intent.response'

export function useCreatePaymentIntent() {
  return useMutation({
    mutationFn: async (orderId: string) => {
      const response = await httpClient.post<IPaymentIntent>(
        API_ROUTES.PAYMENTS.CREATE_INTENT(orderId),
        undefined,
        { silent: true },
      )
      return response.data
    },
  })
}
