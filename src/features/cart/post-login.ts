import type { QueryClient } from '@tanstack/vue-query'

import { API_ROUTES } from '@/core/api/api-routes'
import { canShop } from '@/core/auth/capabilities'
import { registerPostLoginTask } from '@/core/auth/post-login-tasks'
import { httpClient } from '@/core/http/axios-client'
import { CART_QUERY_KEYS } from '@/shared/constants/cart-query-keys'
import { useCartStore } from '@/shared/stores/cart.store'

export function registerCartPostLoginMerge(queryClient: QueryClient): void {
  registerPostLoginTask(async ({ permissions }) => {
    if (!canShop(permissions)) return

    const cartStore = useCartStore()
    await httpClient.post(
      API_ROUTES.CART.MERGE,
      { sessionId: cartStore.sessionId },
      { silent: true },
    )
    queryClient.invalidateQueries({ queryKey: CART_QUERY_KEYS.cart() })
  })
}
