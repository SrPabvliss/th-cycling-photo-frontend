import { useMutation } from '@tanstack/vue-query'

import { API_ROUTES } from '@/core/api/api-routes'
import { useSessionStore } from '@/core/auth/stores/session.store'
import { httpClient } from '@/core/http/axios-client'
import type { IChangePasswordRequest } from '../../types/requests/change-password.request'

export function useChangePassword() {
  const authStore = useSessionStore()

  return useMutation({
    mutationFn: async (payload: IChangePasswordRequest) => {
      const response = await httpClient.post<{ accessToken?: string } | null>(
        API_ROUTES.AUTH.CHANGE_PASSWORD,
        payload,
      )
      return response.data
    },
    onSuccess: (data) => {
      if (data?.accessToken) authStore.setAccessToken(data.accessToken)
    },
  })
}
