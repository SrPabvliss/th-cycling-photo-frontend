import { useMutation, useQueryClient } from '@tanstack/vue-query'

import { API_ROUTES } from '@/core/api/api-routes'
import { httpClient } from '@/core/http/axios-client'
import { CART_QUERY_KEYS } from '../../constants/query-keys'
import { useCartStore } from '../../stores/cart.store'
import type { ICheckoutRequest, ICheckoutOrderResult } from '../../types/requests/cart.request'

export function useCheckout() {
  const queryClient = useQueryClient()
  const cartStore = useCartStore()

  return useMutation({
    mutationFn: async (data: ICheckoutRequest) => {
      const response = await httpClient.post<{ orders: ICheckoutOrderResult[] }>(
        API_ROUTES.CART.CHECKOUT,
        data,
      )
      return response.data.orders
    },
    onSuccess: () => {
      cartStore.clear()
      queryClient.invalidateQueries({ queryKey: CART_QUERY_KEYS.cart() })
    },
  })
}
