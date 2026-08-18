import { useMutation, useQueryClient } from '@tanstack/vue-query'

import { API_ROUTES } from '@/core/api/api-routes'
import { httpClient } from '@/core/http/axios-client'
import type { PaymentMethod } from '@/features/payments/types/payment-method'
import { CART_QUERY_KEYS } from '../../constants/query-keys'
import { useCartStore } from '../../stores/cart.store'
import type { ICheckoutRequest, ICheckoutOrderResult } from '../../types/requests/cart.request'

export function useCheckout() {
  const queryClient = useQueryClient()
  const cartStore = useCartStore()

  return useMutation({
    mutationFn: async (method: PaymentMethod) => {
      const items = cartStore.groups.map((group) => ({ eventId: group.eventId }))
      const response = await httpClient.post<{ orders: ICheckoutOrderResult[] }>(
        API_ROUTES.CART.CHECKOUT,
        { items, method } satisfies ICheckoutRequest,
      )
      return response.data.orders
    },
    onSuccess: () => {
      cartStore.clear()
      queryClient.invalidateQueries({ queryKey: CART_QUERY_KEYS.cart() })
    },
  })
}
