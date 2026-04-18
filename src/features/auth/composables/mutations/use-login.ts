import { useMutation, useQueryClient } from '@tanstack/vue-query'

import { API_ROUTES } from '@/core/api/api-routes'
import { USER_ROLES } from '@/core/auth/user-roles'
import { httpClient } from '@/core/http/axios-client'
import { CART_QUERY_KEYS } from '@/features/cart/constants/query-keys'
import { useCartStore } from '@/features/cart/stores/cart.store'
import { toCurrentUser } from '../../mappers/current-user.mapper'
import { useAuthStore } from '../../stores/auth.store'
import type { IApiCurrentUser } from '../../types/responses/current-user.response'
import type { IApiAuthTokens } from '../../types/responses/auth-tokens.response'
import type { ILoginRequest } from '../../types/requests/login.request'

export function useLoginMutation() {
  const authStore = useAuthStore()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (credentials: ILoginRequest) => {
      const loginResponse = await httpClient.post<IApiAuthTokens>(
        API_ROUTES.AUTH.LOGIN,
        credentials,
      )
      const accessToken = loginResponse.data.accessToken

      authStore.setAccessToken(accessToken)

      const meResponse = await httpClient.get<IApiCurrentUser>(API_ROUTES.AUTH.ME, {
        silent: true,
      })
      const user = toCurrentUser(meResponse.data)

      authStore.setSession(accessToken, user)

      // Merge anonymous cart into user cart on customer login
      if (user.role === USER_ROLES.CUSTOMER) {
        const cartStore = useCartStore()
        try {
          await httpClient.post(
            API_ROUTES.CART.MERGE,
            { sessionId: cartStore.sessionId },
            { silent: true },
          )
          queryClient.invalidateQueries({ queryKey: CART_QUERY_KEYS.cart() })
        } catch {
          // Cart merge is best-effort — don't block login
        }
      }

      return user
    },
  })
}
