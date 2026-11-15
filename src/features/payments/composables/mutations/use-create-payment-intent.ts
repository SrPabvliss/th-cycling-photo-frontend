import { useMutation } from '@tanstack/vue-query'

import { API_ROUTES } from '@/core/api/api-routes'
import { httpClient } from '@/core/http/axios-client'
import type { IPaymentIntent } from '@/features/payments/types/responses/payment-intent.response'
import { CLIENT_MUTATION } from '@/shared/constants/client-mutation'

export function useCreatePaymentIntent() {
  return useMutation({
    ...CLIENT_MUTATION,
    mutationFn: async (orderIds: string[]) => {
      const response = await httpClient.post<IPaymentIntent>(
        API_ROUTES.PAYMENTS.CREATE_INTENT,
        { orderIds },
        { silent: true },
      )
      return response.data
    },
  })
}
