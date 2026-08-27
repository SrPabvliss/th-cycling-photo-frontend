import { useMutation, useQueryClient } from '@tanstack/vue-query'

import { API_ROUTES } from '@/core/api/api-routes'
import { httpClient } from '@/core/http/axios-client'
import { toCurrentUser } from '@/core/auth/current-user.mapper'
import { useSessionStore } from '@/core/auth/stores/session.store'
import type { IApiCurrentUser } from '@/core/auth/current-user'
import { CONTRACT_QUERY_KEYS } from '../../constants/query-keys'

export function useAcceptContract() {
  const queryClient = useQueryClient()
  const authStore = useSessionStore()

  return useMutation({
    mutationFn: async (token: string) => {
      const response = await httpClient.post<{ tenantId: string }>(
        API_ROUTES.CONTRACTS.ACCEPT(token),
      )
      return response.data
    },
    onSuccess: async (_result, token) => {
      if (authStore.accessToken) {
        const meResponse = await httpClient.get<IApiCurrentUser>(API_ROUTES.AUTH.ME, {
          silent: true,
        })
        authStore.setSession(authStore.accessToken, toCurrentUser(meResponse.data))
      }
      queryClient.invalidateQueries({ queryKey: CONTRACT_QUERY_KEYS.byToken(token) })
    },
  })
}
