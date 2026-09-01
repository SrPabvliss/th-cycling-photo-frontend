import { useMutation, useQueryClient } from '@tanstack/vue-query'

import { API_ROUTES } from '@/core/api/api-routes'
import { httpClient } from '@/core/http/axios-client'
import { isRetryableHttpError } from '@/core/http/retry-policy'
import type { IConfirmPaymentRequest } from '@/features/payments/types/requests/payment.request'
import type { IPaymentResult } from '@/features/payments/types/responses/payment-intent.response'
import { CART_QUERY_KEYS } from '@/shared/constants/cart-query-keys'
import { useCartStore } from '@/shared/stores/cart.store'

export function useConfirmPayment() {
  const queryClient = useQueryClient()
  const cartStore = useCartStore()

  return useMutation({
    mutationFn: async (data: IConfirmPaymentRequest) => {
      const response = await httpClient.post<IPaymentResult>(API_ROUTES.PAYMENTS.CONFIRM, data, {
        silent: true,
      })
      return response.data
    },
    // Card payments empty the cart server-side here, not at checkout: without this the buyer
    // returns from the gateway to a cart still holding the photos they just paid for.
    onSuccess: (result: IPaymentResult) => {
      if (!result.approved || !result.settled) return
      cartStore.clear()
      queryClient.invalidateQueries({ queryKey: CART_QUERY_KEYS.cart() })
    },
    retry: (failureCount, error) => failureCount < 2 && isRetryableHttpError(error),
    retryDelay: 3000,
  })
}
