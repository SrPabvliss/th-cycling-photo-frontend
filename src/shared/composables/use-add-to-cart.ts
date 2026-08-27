import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { useMessage } from 'naive-ui'

import { API_ROUTES } from '@/core/api/api-routes'
import { httpClient } from '@/core/http/axios-client'
import { CART_QUERY_KEYS } from '@/shared/constants/cart-query-keys'
import { useCartStore } from '@/shared/stores/cart.store'

export function useAddToCart() {
  const queryClient = useQueryClient()
  const cartStore = useCartStore()
  const message = useMessage()

  return useMutation({
    mutationFn: (photoId: string) =>
      httpClient.post(
        API_ROUTES.CART.ADD_ITEM,
        { photoId, sessionId: cartStore.sessionId },
        { silent: true },
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CART_QUERY_KEYS.cart() })
      message.success('Foto agregada al carrito', { duration: 1500 })
    },
  })
}
