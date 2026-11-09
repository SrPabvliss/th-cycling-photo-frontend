import { useMutation } from '@tanstack/vue-query'

import { API_ROUTES } from '@/core/api/api-routes'
import { httpClient } from '@/core/http/axios-client'
import { toCurrentUser } from '@/core/auth/current-user.mapper'
import { useSessionStore } from '@/core/auth/stores/session.store'
import type { IApiCurrentUser } from '@/core/auth/current-user'
import type { IApiAuthTokens } from '../../types/responses/auth-tokens.response'
import type { IRegisterRequest } from '../../types/requests/register.request'

export function useRegisterMutation() {
  const authStore = useSessionStore()

  return useMutation({
    mutationFn: async (data: IRegisterRequest) => {
      const registerResponse = await httpClient.post<IApiAuthTokens>(API_ROUTES.AUTH.REGISTER, data)
      const accessToken = registerResponse.data.accessToken

      authStore.setAccessToken(accessToken)

      const meResponse = await httpClient.get<IApiCurrentUser>(API_ROUTES.AUTH.ME, {
        silent: true,
      })
      const user = toCurrentUser(meResponse.data)

      authStore.setSession(accessToken, user)

      return user
    },
  })
}
