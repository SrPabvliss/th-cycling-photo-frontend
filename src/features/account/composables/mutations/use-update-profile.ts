import { useMutation, useQueryClient } from '@tanstack/vue-query'

import { API_ROUTES } from '@/core/api/api-routes'
import { httpClient } from '@/core/http/axios-client'
import { toCurrentUser } from '@/features/auth/mappers/current-user.mapper'
import { useSessionStore } from '@/core/auth/stores/session.store'
import type { IApiCurrentUser } from '@/features/auth/types/responses/current-user.response'
import { ACCOUNT_QUERY_KEYS } from '../../constants/query-keys'
import type { IUpdateProfileRequest } from '../../types/requests/update-profile.request'

export function useUpdateProfile() {
  const queryClient = useQueryClient()
  const authStore = useSessionStore()

  return useMutation({
    mutationFn: async (payload: IUpdateProfileRequest) => {
      const response = await httpClient.patch<{ id: string }>(API_ROUTES.MY_PROFILE.BASE, payload)
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
