import { useMutation } from '@tanstack/vue-query'

import { API_ROUTES } from '@/core/api/api-routes'
import { runPostLoginTasks } from '@/core/auth/post-login-tasks'
import { httpClient } from '@/core/http/axios-client'
import { toCurrentUser } from '@/core/auth/current-user.mapper'
import { useSessionStore } from '@/core/auth/stores/session.store'
import type { IApiCurrentUser } from '@/core/auth/current-user'
import type { IApiAuthTokens } from '../../types/responses/auth-tokens.response'
import type { ILoginRequest } from '../../types/requests/login.request'

export function useLoginMutation() {
  const authStore = useSessionStore()

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

      await runPostLoginTasks({ permissions: user.permissions })

      return user
    },
  })
}
