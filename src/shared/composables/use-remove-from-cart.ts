import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { useMessage } from 'naive-ui'

import { API_ROUTES } from '@/core/api/api-routes'
import { httpClient } from '@/core/http/axios-client'
import { CART_QUERY_KEYS } from '@/shared/constants/cart-query-keys'
import { useCartStore } from '@/shared/stores/cart.store'

export function useRemoveFromCart() {
  const queryClient = useQueryClient()
  const cartStore = useCartStore()
  const message = useMessage()

  return useMutation({
    mutationFn: (photoId: string) =>
      httpClient.delete(API_ROUTES.CART.REMOVE_ITEM(photoId), {
        params: { sessionId: cartStore.sessionId },
        silent: true,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CART_QUERY_KEYS.cart() })
      message.info('Foto removida del carrito', { duration: 1500 })
    },
  })
}
