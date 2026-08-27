import { useMutation, useQueryClient } from '@tanstack/vue-query'

import { API_ROUTES } from '@/core/api/api-routes'
import { httpClient } from '@/core/http/axios-client'
import { toCurrentUser } from '@/features/auth/mappers/current-user.mapper'
import { useSessionStore } from '@/core/auth/stores/session.store'
import type { IApiCurrentUser } from '@/features/auth/types/responses/current-user.response'
import { ACCOUNT_QUERY_KEYS } from '../../constants/query-keys'

export function useConfirmAvatar() {
  const queryClient = useQueryClient()
  const authStore = useSessionStore()

  return useMutation({
    mutationFn: async (storageKey: string) => {
      const response = await httpClient.post<{ id: string }>(API_ROUTES.MY_PROFILE.AVATAR_CONFIRM, {
        storageKey,
      })
      return response.data
    },
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ACCOUNT_QUERY_KEYS.profile() })

      try {
        const meResponse = await httpClient.get<IApiCurrentUser>(API_ROUTES.AUTH.ME, {
          silent: true,
        })
        authStore.setSession(authStore.accessToken!, toCurrentUser(meResponse.data))
      } catch {
        return
      }
    },
  })
}
