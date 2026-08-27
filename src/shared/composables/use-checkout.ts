import { useMutation, useQueryClient } from '@tanstack/vue-query'

import { API_ROUTES } from '@/core/api/api-routes'
import { httpClient } from '@/core/http/axios-client'
import { CART_QUERY_KEYS } from '@/shared/constants/cart-query-keys'
import { useCartStore } from '@/shared/stores/cart.store'
import type { ICheckoutOrderResult } from '@/shared/types/cart.types'
import type { PaymentMethod } from '@/shared/types/payment-method.types'

export function useCheckout() {
  const queryClient = useQueryClient()
  const cartStore = useCartStore()

  return useMutation({
    mutationFn: async ({ eventId, method }: { eventId: string; method: PaymentMethod }) => {
      const response = await httpClient.post<{ orders: ICheckoutOrderResult[] }>(
        API_ROUTES.CART.CHECKOUT,
        { items: [{ eventId }], method },
      )
      return response.data.orders
    },
    onSuccess: () => {
      cartStore.clear()
      queryClient.invalidateQueries({ queryKey: CART_QUERY_KEYS.cart() })
    },
  })
}
