import { useMutation } from '@tanstack/vue-query'

import { API_ROUTES } from '@/core/api/api-routes'
import { httpClient } from '@/core/http/axios-client'
import { isRetryableHttpError } from '@/core/http/retry-policy'
import type { IConfirmPaymentRequest } from '@/features/payments/types/requests/payment.request'
import type { IPaymentResult } from '@/features/payments/types/responses/payment-intent.response'

export function useConfirmPayment() {
  return useMutation({
    mutationFn: async (data: IConfirmPaymentRequest) => {
      const response = await httpClient.post<IPaymentResult>(API_ROUTES.PAYMENTS.CONFIRM, data, {
        silent: true,
      })
      return response.data
    },
    retry: (failureCount, error) => failureCount < 2 && isRetryableHttpError(error),
    retryDelay: 3000,
  })
}
