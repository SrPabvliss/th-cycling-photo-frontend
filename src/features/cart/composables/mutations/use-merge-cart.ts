import { useMutation, useQueryClient } from '@tanstack/vue-query'

import { API_ROUTES } from '@/core/api/api-routes'
import { httpClient } from '@/core/http/axios-client'
import { CART_QUERY_KEYS } from '../../constants/query-keys'
import { useCartStore } from '../../stores/cart.store'

export function useMergeCart() {
  const queryClient = useQueryClient()
  const cartStore = useCartStore()

  return useMutation({
    mutationFn: () =>
      httpClient.post(API_ROUTES.CART.MERGE, { sessionId: cartStore.sessionId }, { silent: true }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CART_QUERY_KEYS.cart() })
    },
  })
}
