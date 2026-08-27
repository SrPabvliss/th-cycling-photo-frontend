import { useMutation, useQueryClient } from '@tanstack/vue-query'

import { API_ROUTES } from '@/core/api/api-routes'
import { httpClient } from '@/core/http/axios-client'
import { toCurrentUser } from '@/core/auth/current-user.mapper'
import { useSessionStore } from '@/core/auth/stores/session.store'
import type { IApiCurrentUser } from '@/core/auth/current-user'
import { ACCOUNT_QUERY_KEYS } from '../../constants/query-keys'
import type { IConfirmEmailVerificationRequest } from '../../types/requests/confirm-email-verification.request'

export function useConfirmEmailVerification() {
  const queryClient = useQueryClient()
  const authStore = useSessionStore()

  return useMutation({
    mutationFn: async (payload: IConfirmEmailVerificationRequest) => {
      await httpClient.post(API_ROUTES.AUTH.EMAIL_VERIFICATION.CONFIRM, payload)
    },
    onSuccess: async () => {
      if (!authStore.accessToken) return
      const meResponse = await httpClient.get<IApiCurrentUser>(API_ROUTES.AUTH.ME, {
        silent: true,
      })
      authStore.setSession(authStore.accessToken, toCurrentUser(meResponse.data))
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ACCOUNT_QUERY_KEYS.emailVerification() })
    },
  })
}
